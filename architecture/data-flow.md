# Swasthya Setu — End-to-End Data Flow Specifications

**Document:** `architecture/data-flow.md`  
**Project:** Swasthya Setu — Low-Network Telemedicine  
**Track:** Innovate Odisha 3.0  
**Role:** Senior Software Architect & Healthcare Technology Engineer  
**Status:** Approved Architectural Blueprint  
**Version:** 1.0  

---

This document specifies the exact technical data flows across the Swasthya Setu ecosystem. Ten critical workflows are documented end-to-end, defining the precise trigger, participating components, data movement, success criteria, failure modes, recovery behaviors, and security protections.

---

## Workflow 1: User Login & Session Establishment

### 1.1 Trigger
A user (Healthcare Worker, Doctor, or Administrator) launches the application and submits their username and password via the login interface.

### 1.2 Components Involved
* **Client UI:** React Login Screen (`/login`)
* **Client Storage:** Dexie.js (`session_cache` store in IndexedDB)
* **Backend API:** `POST /api/v1/auth/login`
* **Database:** `users` table and `audit_events` table

### 1.3 Data Movement
1. The user enters credentials; the frontend validates form syntax.
2. The client transmits `POST /api/v1/auth/login` containing `{ username, password }` over HTTPS.
3. The backend extracts `username`, executes `SELECT id, password_hash, role, facility_id FROM users WHERE username = $1 AND is_active = true`.
4. `bcrypt.compare(password, password_hash)` evaluates the hash.
5. If valid, the server creates a cryptographically signed session token containing `{ userId, role, facilityId, expiresAt }`.
6. The server sets an `HttpOnly`, `Secure`, `SameSite=Strict` cookie named `ss_session` and returns HTTP 200 with `{ user: { id, username, fullName, role, facilityId } }`.
7. The client writes the non-sensitive user metadata and expiration timestamp to IndexedDB (`session_cache`), initializing the authenticated app state.

### 1.4 Success State
* Browser holds a secure `HttpOnly` cookie.
* Client memory and IndexedDB hold the authenticated user profile.
* User is redirected to their role-specific dashboard (e.g., ASHA Home or Doctor Consultation Portal).

### 1.5 Failure Scenarios & Recovery
* **Invalid Credentials:** Backend returns HTTP 401 Unauthorized; client displays "Invalid username or password"; audit event recorded.
* **Network Unavailable at Login:** If completely offline without an existing session, login fails gracefully with "Network unavailable. An initial online login is required to authenticate this device."
* **Account Locked / Inactive:** Backend returns HTTP 403 Forbidden with `{ error: "ACCOUNT_DEACTIVATED" }`.

### 1.6 Security Considerations
* Passwords hashed using bcrypt (cost factor $\ge 12$).
* Session cookie cannot be read by client-side JavaScript (`HttpOnly`), completely shielding against XSS session hijacking.
* Rate limiting enforced on the backend (maximum 5 failed attempts per 15-minute window per IP) to mitigate brute-force attacks.

---

## Workflow 2: Viewing Previously Synchronized Patient Records Offline

### 2.1 Trigger
An ASHA worker arrives at a remote rural household without cellular coverage and selects a patient from their local list to review medical history.

### 2.2 Components Involved
* **Client UI:** Patient Detail View (`/patients/:id`)
* **Client Local Store:** Dexie.js `patients_store` and `consultations_store`
* **Network Monitor:** Network Sentinel (`isOnline: false`)

### 2.3 Data Movement
1. The UI router dispatches a load request for `patient_id: P-101`.
2. The data controller checks the local IndexedDB `patients_store.get(id)`.
3. Dexie returns the locally cached record containing demographics, chronic conditions, allergies, and prior consultation summaries.
4. The UI renders the patient details with an explicit offline badge: *"Offline Mode — Record cached on 28-Oct-2026 14:30"*.
5. If the record was **never** downloaded to this device, IndexedDB returns `undefined`; the UI immediately displays: *"Record Not Available Offline. This patient's history was not cached prior to losing connectivity."*

### 2.4 Success State
* Authorized patient summary is rendered cleanly without firing any network requests.
* Freshness timestamp is clearly visible to prevent clinicians from mistaking stale data for real-time information.

### 2.5 Failure Scenarios & Recovery
* **Missing Local Record:** If the user attempts to open an uncached patient record while offline, the UI shows a clear empty state rather than an unhandled exception or infinite loading spinner.
* **Corrupted IndexedDB:** If local database access throws an error, the client logs an internal diagnostic event and informs the user to re-cache records once online.

### 2.6 Security Considerations
* The local IndexedDB is scoped strictly to the origin domain under the browser's Same-Origin Policy.
* Only synthetic or explicitly authorized records are saved to the device.
* Records contain only necessary clinical summaries, omitting superfluous personally identifying attributes.

---

## Workflow 3: Creating a Consultation Note While Offline

### 3.1 Trigger
An ASHA worker conducts an in-person health assessment during a field visit with zero connectivity and inputs observations, vital signs, and symptoms into the application.

### 3.2 Components Involved
* **Client UI:** Consultation Note Editor Form
* **Client Local Store:** Dexie.js `notes_store` (draft persistence)
* **Client Identifier Generator:** `crypto.randomUUID()`

### 3.3 Data Movement
1. The worker types observations into the note form.
2. An input debounce handler (every 500ms) triggers local draft autosave:
   ```typescript
   dexie.notes_store.put({
     note_id: draftNoteId || crypto.randomUUID(),
     patient_id: "P-101",
     author_id: currentUser.id,
     vitals: { bp: "120/80", pulse: 72, temp: 98.6 },
     symptoms: "Fever for 2 days, mild cough",
     status: "DRAFT",
     updated_at: new Date().toISOString()
   });
   ```
3. The UI renders an active confirmation badge: *"Draft Saved Locally at [Time]"*.
4. Even if the browser crashes, the device restarts, or the tab is closed, navigating back to this patient restores the draft note completely from IndexedDB.

### 3.4 Success State
* The clinical draft note is committed to local persistent storage.
* Zero data is lost on unexpected navigation or browser reload.

### 3.5 Failure Scenarios & Recovery
* **Storage Quota Exceeded:** IndexedDB throws `QuotaExceededError`. The client alerts the user: *"Device storage full. Please remove old synchronized drafts."*
* **Form Validation Failure:** If required fields (e.g., patient identifier) are missing, the UI prevents submission and highlights invalid fields.

### 3.6 Security Considerations
* Note draft is stored unencrypted in browser origin storage; hence devices must enforce device-level PIN/screen lock.
* Author identifier is stamped directly from the authenticated session context, preventing impersonation.

---

## Workflow 4: Saving Changes in a Local Sync Queue

### 4.1 Trigger
The ASHA worker completes drafting the consultation note and clicks **"Queue for Doctor Consultation / Sync"**.

### 4.2 Components Involved
* **Client UI:** Consultation Note Action Bar
* **Client Sync Store:** Dexie.js `sync_queue` table
* **Sync Manager:** Client Queue Ingestion

### 4.3 Data Movement
1. The UI captures the finalized form payload.
2. The client assigns a canonical client UUID `op_id = crypto.randomUUID()`.
3. Within an atomic Dexie transaction:
   - The note status in `notes_store` is transitioned from `'DRAFT'` to `'PENDING_SYNC'`.
   - A new record is inserted into `sync_queue`:
     ```json
     {
       "operation_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
       "entity_type": "CONSULTATION_NOTE",
       "action": "CREATE",
       "payload": {
         "note_id": "e4b2d3c1-0a2b-4c3d-8e4f-5a6b7c8d9e0f",
         "patient_id": "P-101",
         "consultation_id": "C-202",
         "vitals": { "bp": "120/80", "pulse": 72 },
         "clinical_notes": "Patient presents with persistent cough."
       },
       "status": "PENDING_SYNC",
       "retry_count": 0,
       "created_at": "2026-10-29T10:15:00Z"
     }
     ```
4. The UI immediately reflects: *"Status: Queued (Waiting for Network)"*.

### 4.4 Success State
* The operation is permanently scheduled in the local FIFO queue.
* The local consultation dashboard reflects the pending note with a distinct yellow/orange "Pending Sync" chip.

### 4.5 Failure Scenarios & Recovery
* If the Dexie transaction fails, an error modal informs the worker: *"Could not queue note locally. Please retry."* The raw text remains in the draft form so nothing is erased.

### 4.6 Security Considerations
* Payloads contain only authorized medical summaries.
* Operation records are strictly compartmentalized by the current `user_id`.

---

## Workflow 5: Reconnecting and Synchronizing Queued Changes

### 5.1 Trigger
The healthcare worker returns to a community health center or cellular coverage area; the browser fires an `online` event or an active API heartbeat succeeds.

### 5.2 Components Involved
* **Network Sentinel:** Monitors `window.addEventListener('online')` + performs `HEAD /api/v1/health`
* **Client Sync Manager:** Reads and processes `sync_queue`
* **Backend API:** `POST /api/v1/sync/batch`
* **Database:** `sync_operations`, `consultations`, `consultation_notes` within a PostgreSQL transaction

### 5.3 Data Movement
1. Network Sentinel confirms active connectivity via a successful lightweight ping.
2. Sync Manager queries Dexie for all operations where `status == 'PENDING_SYNC'` ordered by `created_at ASC`.
3. Sync Manager marks the selected batch as `SYNCING` and issues:
   `POST /api/v1/sync/batch` with headers: `Content-Type: application/json`, `X-Client-Version: 1.0.0`.
4. The Backend Sync Controller receives the batch:
   - Validates the user's session cookie.
   - Begins a PostgreSQL database transaction (`BEGIN`).
   - For each operation:
     - Checks `sync_operations` for existing `operation_id`.
     - If absent: executes domain insert, records audit log, and inserts into `sync_operations` with status `'COMMITTED'`.
   - Commits transaction (`COMMIT`).
5. Backend responds with HTTP 200 OK:
   ```json
   {
     "processed": [
       { "operation_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d", "status": "SYNCED", "server_id": "e4b2d3c1..." }
     ],
     "server_time": "2026-10-29T10:30:15Z"
   }
   ```
6. Sync Manager updates the local Dexie store: sets operation status to `'SYNCED'`, updates note status to `'SYNCED'`, and removes stale items from the pending list.
7. UI renders a green badge: *"All changes successfully synced with server"*.

### 5.4 Success State
* PostgreSQL database contains the authoritative clinical records.
* Client IndexedDB reflects synchronized state with zero pending items.
* UI displays server-confirmed status.

### 5.5 Failure Scenarios & Recovery
* **Network Drops Mid-Transmission:** The HTTP request fails with a network error. The Sync Manager marks the operation as `'SYNC_FAILED'`, increments `retry_count`, and schedules an exponential backoff retry (e.g., retry in 5s, 15s, 45s).
* **Expired Session (HTTP 401):** Sync stops immediately. The queue is preserved! A modal prompts the user to re-enter their credentials. Once re-authenticated, the queue resumes automatically.

### 5.6 Security Considerations
* Authorization checked per operation item on the server against the authenticated user.
* Session cookie prevents unauthorized batch submissions.

---

## Workflow 6: Handling Duplicate Submissions and Conflicting Updates

### 6.1 Trigger
A user clicks "Sync Now" repeatedly during high latency, or network drops after the server commits the transaction but before the client receives the HTTP response.

### 6.2 Components Involved
* **Client Sync Manager:** Outbound batch retry
* **Backend Idempotency Gate:** PostgreSQL `sync_operations` table unique constraint (`operation_id`)
* **Clinical Conflict Resolver:** Append-only version checks

### 6.3 Data Movement
1. The client re-sends the same payload containing `operation_id = "9b1deb4d-..."`.
2. The Backend Idempotency Gate queries:
   `SELECT status, response_payload FROM sync_operations WHERE operation_id = $1`.
3. An existing record is found (`status = 'COMMITTED'`).
4. The server **does not re-execute the insert**. It skips domain mutations and immediately returns the previously committed result with HTTP 200 OK.
5. If two users (e.g., ASHA worker and Doctor) submit notes for the same consultation concurrently:
   - Because notes are **append-only**, both notes are inserted as distinct sibling records (`version: 1` and `version: 2`) with distinct author IDs.
   - If a consultation status update has a version conflict (e.g., trying to move from `ACCEPTED` to `IN_PROGRESS` when the server already set it to `CANCELLED`):
     - The server rejects the status transition with HTTP 409 Conflict.
     - The client receives the conflict payload, preserves the user's clinical text locally, and alerts the user: *"Status conflict: This consultation was marked Cancelled by the doctor. Your notes have been preserved as a separate visit record."*

### 6.4 Success State
* Zero duplicate clinical entities created.
* Conflicting concurrent notes are preserved without overwriting existing clinical observations.

### 6.5 Failure Scenarios & Recovery
* In an unresolvable data conflict, the item is marked `'CONFLICT'` in the local sync queue; it is highlighted in the Sync Dashboard for explicit clinician review rather than discarded.

### 6.6 Security Considerations
* Idempotency table enforces strict row-level uniqueness, preventing race conditions or replay attacks.

---

## Workflow 7: Initiating a Telemedicine Consultation

### 7.1 Trigger
A healthcare worker and an assigned doctor agree to initiate a remote teleconsultation for an active patient case while both are online.

### 7.2 Components Involved
* **Client UI:** Video Consultation Room (`/consultation/:id/call`)
* **WebRTC Media Engine:** `RTCPeerConnection`, `navigator.mediaDevices.getUserMedia`
* **Signaling Server:** WebSocket server (`/ws/signaling`)
* **NAT Traversal:** STUN / TURN servers

### 7.3 Data Movement
1. The ASHA worker clicks "Start Consultation Call".
2. The client requests microphone and camera permissions via `getUserMedia({ video: { width: 640, height: 480 }, audio: true })`.
3. The client connects to the signaling server via `WSS://<host>/ws/signaling?consultationId=C-202`.
4. The signaling server validates the user's consultation authorization and registers the peer in room `C-202`.
5. The initiating peer creates an `RTCPeerConnection`, binds local audio/video tracks, generates an SDP Offer, sets it as LocalDescription, and transmits:
   `{ type: 'OFFER', sdp: peerOffer, room: 'C-202' }` via WebSocket.
6. The Doctor's client receives the offer, sets RemoteDescription, creates an SDP Answer, sets LocalDescription, and transmits the answer via WebSocket.
7. Both clients exchange ICE candidates via the signaling server.
8. STUN discovers public reflexive IP/port bindings; if direct P2P is blocked by symmetric NAT/CGNAT, the TURN relay server allocates an encrypted relay port.
9. WebRTC completes DTLS handshake; SRTP audio/video begins flowing bidirectionally.

### 7.4 Success State
* Peer-to-peer or TURN-relayed two-way encrypted audio and video established.
* Call status transitions to `IN_PROGRESS`.

### 7.5 Failure Scenarios & Recovery
* **Permission Denied:** User denies camera/microphone permissions. UI alerts: *"Microphone and camera access required. You can choose audio-only mode."*
* **Signaling Disconnection:** If WebSocket closes during call setup, the client retries WebSocket connection up to 3 times before displaying a retry button.

### 7.6 Security Considerations
* Media streams are end-to-end encrypted using DTLS-SRTP.
* The signaling server verifies room tokens, preventing unauthorized eavesdropping on consultation rooms.

---

## Workflow 8: Switching from Video to Audio When Bandwidth Deteriorates

### 8.1 Trigger
During a live consultation, the cellular link quality drops: bandwidth falls below 150 kbps, or packet loss exceeds 15% over a 4-second observation window.

### 8.2 Components Involved
* **Client Telemetry Monitor:** Periodic `RTCPeerConnection.getStats()` poller (every 2000ms)
* **WebRTC Media Engine:** Track sender controls (`RTCRtpSender.track.enabled`)
* **Signaling Server:** Media control message relay
* **Client UI:** Call Mode Indicator

### 8.3 Data Movement
1. The client WebRTC poller reads inbound RTP statistics:
   $$\text{Packet Loss Rate} = \frac{\Delta \text{packetsLost}}{\Delta \text{packetsLost} + \Delta \text{packetsReceived}}$$
2. If packet loss $> 15\%$ or downlink bitrate $< 150 \text{ kbps}$ for two consecutive intervals:
3. The client automatically disables its local video sender track (`videoTrack.enabled = false`).
4. The client transmits an in-band or WebSocket control message:
   `{ type: 'MEDIA_ADAPTATION', mode: 'AUDIO_ONLY', reason: 'POOR_BANDWIDTH' }`.
5. The receiving client disables rendering of incoming video elements, conserving CPU decoding cycles and downlink bandwidth.
6. The audio track (Opus codec) remains active, dynamically throttling its target bitrate to ~16–24 kbps.
7. The UI on both ends updates instantly:
   - Healthcare Worker: *"Low Bandwidth Detected. Switched to Audio-Only Mode to preserve conversation."*
   - Doctor: *"Remote peer switched to Audio-Only (Low Network)."*
8. A manual toggle "Switch Back to Video" appears if packet loss subsequently stabilizes below 5% for $> 10$ seconds.

### 8.4 Success State
* Clear, continuous voice communication maintained over constrained link.
* Video transmission paused, reducing bandwidth consumption by 85–90%.

### 8.5 Failure Scenarios & Recovery
* If user network drops below 15 kbps (insufficient even for Opus audio), audio drops and the connection transitions to the Interrupted workflow (Workflow 10).

### 8.6 Security Considerations
* Adaptation messages travel through authenticated signaling or DTLS data channels; no sensitive clinical content is transmitted in control signals.

---

## Workflow 9: Displaying Connection and Synchronization Status

### 9.1 Trigger
Continuous background execution: user interacts with screens, network conditions fluctuate, or sync operations transition states.

### 9.2 Components Involved
* **Global Network Sentinel:** Browser events + Heartbeat worker
* **Sync Status Store:** Reactive state store tracking pending count and last sync timestamp
* **UI Status Banner:** Global header status indicator

### 9.3 Data Movement
1. The Network Sentinel evaluates physical connection (`navigator.onLine`) and verifies application-layer HTTP reachability via periodic 30-second ping.
2. The Sync Manager counts uncommitted records in Dexie `sync_queue`:
   - `pendingCount = await db.sync_queue.where('status').equals('PENDING_SYNC').count()`
3. The reactive UI banner binds to these states and renders:

| Network State | Queue State | Rendered UI Badge | Color / Icon |
| :--- | :--- | :--- | :--- |
| Connected | 0 Pending | **Connected • All Synced** | Green Dot / Check |
| Connected | >0 Pending | **Syncing (3 items)...** | Blue Pulse Spinner |
| Connected | Sync Errored | **Sync Error • 1 Item Failed [Retry]** | Red Warning Triangle |
| Disconnected | 0 Pending | **Offline Mode • Records Cached** | Slate Cloud Offline |
| Disconnected | >0 Pending | **Offline Mode • 2 Changes Queued** | Amber Clock Badge |

### 9.4 Success State
* Users always possess 100% transparency regarding whether their data is local, in-flight, failed, or server-confirmed.

### 9.5 Failure Scenarios & Recovery
* If the browser status reports false positive online (e.g., hotel/captive portal), the heartbeat ping fails, correctly toggling the UI to "Offline / Limited Connectivity".

### 9.6 Security Considerations
* Status banners show numerical counts and statuses only; no patient names or sensitive clinical summaries are displayed on global headers.

---

## Workflow 10: Handling Failed Synchronization or Interrupted Consultation

### 10.1 Trigger
A live consultation is abruptly terminated by cellular tower handover failure, or a batch sync request times out.

### 10.2 Components Involved
* **WebRTC Connection State Listener:** `peerConnection.onconnectionstatechange`
* **Sync Retry Engine:** Exponential backoff controller
* **Client UI Alerts:** Consultation Recovery Screen

### 10.3 Data Movement (Interrupted Consultation)
1. WebRTC fires `connectionStateChange` with value `'disconnected'`.
2. The UI immediately displays an overlay:
   *"Connection Lost. Attempting to reconnect (Attempt 1/3)... Your drafted notes are preserved safely."*
3. The media engine initiates ICE restart (`peerConnection.createOffer({ iceRestart: true })`) via signaling.
4. If connection fails to re-establish within 30 seconds:
   - The connection state transitions to `'failed'`.
   - The call interface cleanly terminates media tracks to save battery.
   - The UI presents two distinct actions: **[Retry Call Now]** or **[Save Offline Notes & Exit]**.
   - Consultation status in local storage is recorded as `'INTERRUPTED'`.

### 10.4 Data Movement (Failed Synchronization)
1. Batch sync request returns HTTP 500, HTTP 504, or network timeout.
2. The Sync Manager increments the `retry_count` for each failed operation in Dexie `sync_queue`.
3. If `retry_count < 5`:
   $$\text{Delay} = \min(60000, 1000 \times 2^{\text{retry\_count}}) \pm \text{jitter}$$
   The operation is scheduled for automatic background retry.
4. If `retry_count >= 5`:
   - Operation status is set to `'SYNC_FAILED'`.
   - A persistent notification is displayed in the Sync Dashboard with an explicit **[Manual Retry]** button and a human-readable diagnostic message (e.g., *"Server unreachable. Your data is safe locally."*).

### 10.5 Success State
* The user's work is never lost; drafts and clinical observations remain accessible in IndexedDB.
* The system recovers automatically as soon as a stable connection returns without requiring user panic or duplicate form submissions.

### 10.6 Security Considerations
* Interrupted calls release hardware camera and microphone resources immediately to protect user privacy.
* Failed sync payloads remain strictly in local IndexedDB until safely retransmitted over HTTPS.
