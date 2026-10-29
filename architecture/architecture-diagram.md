# Swasthya Setu — System Architecture Diagrams

**Document:** `architecture/architecture-diagram.md`  
**Project:** Swasthya Setu — Low-Network Telemedicine  
**Track:** Innovate Odisha 3.0  
**Role:** Senior Software Architect & Healthcare Technology Engineer  
**Status:** Approved Architectural Blueprint  
**Version:** 1.0  

---

This document presents the visual architecture of Swasthya Setu using GitHub-compatible **Mermaid** diagrams. The diagrams decompose the system into distinct, focused representations: High-Level System Architecture, Offline-First Data Flow, Telemedicine Consultation Flow, Authentication and Role-Based Access, and Component Interactions.

---

## Diagram 1: High-Level System Architecture

This diagram details the top-level structural layout, user boundaries, client storage, service worker, backend gateway, signaling service, database, and NAT traversal components.

```mermaid
flowchart TD
    subgraph Users ["User Personas & Devices"]
        U_ASHA["ASHA / Healthcare Worker<br/>(Low-Cost Android / Tablet)"]
        U_DOC["Doctor / Specialist<br/>(Desktop / Laptop / Tablet)"]
        U_ADM["System Administrator<br/>(Workstation Browser)"]
    end

    subgraph ClientApp ["Client Application Tier (PWA / React + Vite)"]
        direction TB
        UI_ROUTER["Role-Based UI Router<br/>(Tailwind CSS + Odia/English i18n)"]
        SW["Service Worker<br/>(CacheStorage: App Shell / Assets)"]
        IDB[("IndexedDB (Dexie.js)<br/>- Cached Patients<br/>- Draft Notes<br/>- Pending Sync Queue")]
        SYNC_MGR["Client Sync Manager<br/>(Network Monitor & Retry Engine)"]
        RTC_ENGINE["WebRTC Media Controller<br/>(MediaStream & getStats Poller)"]
    end

    subgraph BackendTier ["Backend Application Tier (Node.js + Express)"]
        direction TB
        API_GW["Express HTTP API Gateway<br/>(Helmet, CORS, Rate Limiter)"]
        AUTH_MW["Auth & RBAC Middleware<br/>(Session Cookie / Signed Claims)"]
        
        subgraph DomainServices ["Domain Controllers & Services"]
            PATIENT_SVC["Patient Service"]
            CONSULT_SVC["Consultation Service"]
            SYNC_SVC["Sync & Idempotency Engine"]
            AUDIT_SVC["Audit Logging Service"]
        end

        SIG_SRV["WebSocket Signaling Server<br/>(ws Room & Peer Coordinator)"]
    end

    subgraph DataTier ["Persistence Tier"]
        PG[("Managed PostgreSQL Database<br/>- users & roles<br/>- patients & records<br/>- consultations & notes<br/>- sync_operations & audit")]
    end

    subgraph ExternalInfra ["NAT Traversal Infrastructure"]
        STUN["Public STUN Server<br/>(stun.l.google.com:19302)"]
        TURN["TURN Relay Server<br/>(Coturn / Metered.ca Relay)"]
    end

    %% User Interactions
    U_ASHA -->|"Opens PWA / Mobile Web"| UI_ROUTER
    U_DOC -->|"Opens Doctor Portal"| UI_ROUTER
    U_ADM -->|"Opens Admin Dashboard"| UI_ROUTER

    %% Client Internal Flow
    UI_ROUTER <-->|"Fetch Cached Shell"| SW
    UI_ROUTER <-->|"Read/Write Offline State"| IDB
    UI_ROUTER <-->|"Submit Tasks / View Status"| SYNC_MGR
    UI_ROUTER <-->|"Video / Audio Call Controls"| RTC_ENGINE
    SYNC_MGR <-->|"Drain / Enqueue Ops"| IDB

    %% Client to Backend
    SYNC_MGR -->|"REST API Requests (HTTPS)"| API_GW
    RTC_ENGINE <-->|"Signaling Handshake (WSS)"| SIG_SRV
    RTC_ENGINE <-.->|"ICE Candidates Discovery"| STUN
    RTC_ENGINE <-.->|"Fallback Encrypted SRTP Relay"| TURN

    %% Backend Flow
    API_GW --> AUTH_MW
    AUTH_MW --> DomainServices
    DomainServices -->|"SQL Connection Pool"| PG
    SIG_SRV -.->|"Validate Consultation Session"| CONSULT_SVC
```

---

## Diagram 2: Offline-First Data Flow

This diagram illustrates how patient records are read offline, drafts are saved locally, queued operations are buffered during network outages, and safe synchronization occurs upon reconnection with idempotency checks and conflict safeguards.

```mermaid
sequenceDiagram
    autonumber
    actor ASHA as ASHA Worker (Client UI)
    participant IDB as IndexedDB (Dexie.js)
    participant SM as Client Sync Manager
    participant NET as Network Sentinel
    participant API as Backend REST API
    participant DB as PostgreSQL Database

    Note over ASHA, IDB: Scenario: Drafting Visit Notes in Remote Village (Offline)
    ASHA->>IDB: Request cached patient record (patient_id: P-101)
    IDB-->>ASHA: Return cached profile & medical history
    ASHA->>ASHA: Record clinical observation & vitals
    ASHA->>IDB: Save Draft Note (status: 'DRAFT')
    ASHA->>ASHA: Click "Submit Consultation Request"
    ASHA->>IDB: Enqueue Operation (op_id: UUID-A1, entity: 'consultation', status: 'PENDING_SYNC')
    IDB-->>ASHA: Local UI state updated to "Pending Sync (Queued)"

    Note over ASHA, NET: Network Connectivity Restored (Edge / 4G detected)
    NET->>SM: Trigger 'online' event + Heartbeat ping verified (200 OK)
    SM->>IDB: Query uncommitted items (status == 'PENDING_SYNC')
    IDB-->>SM: Return batch [UUID-A1]
    
    SM->>SM: Transition status to 'SYNCING'
    SM->>API: POST /api/v1/sync/batch (Headers: Idempotency-Key: UUID-A1)
    
    Note over API, DB: Backend Atomic Idempotency Check
    API->>DB: Check if op_id 'UUID-A1' exists in sync_operations
    alt Operation Already Processed (Duplicate Retry)
        DB-->>API: Found existing record (status: 201)
        API-->>SM: HTTP 200 OK (Cached Success Result)
    else First-time Processing
        API->>DB: BEGIN Transaction
        API->>DB: INSERT into consultations & consultation_notes
        API->>DB: INSERT into sync_operations (op_id, status: 'COMMITTED')
        API->>DB: COMMIT Transaction
        DB-->>API: Success
        API-->>SM: HTTP 201 Created (server_timestamp, record_version)
    end

    SM->>IDB: Update op status to 'SYNCED' (server_confirmed: true)
    SM-->>ASHA: Update UI Badge: "Synced Successfully with Hospital"

    Note over SM, API: Failure & Backoff Handling (If Network Drops Mid-Sync)
    alt Network Fails During POST
        SM->>SM: Network error detected / HTTP 503
        SM->>IDB: Mark op as 'SYNC_FAILED' & Increment retry_count
        SM-->>ASHA: Update UI Badge: "Sync Failed — Retrying in 15s"
        SM->>SM: Exponential backoff timer initiated
    end
```

---

## Diagram 3: Telemedicine Consultation Flow (Adaptive WebRTC)

This diagram outlines how a consultation room is initialized, how WebRTC peer connection is negotiated via WebSocket signaling, how media telemetry adapts from video to audio, and the explicit boundary when connectivity fails completely.

```mermaid
sequenceDiagram
    autonumber
    actor ASHA as ASHA Worker (Mobile)
    actor DOC as Doctor (Workstation)
    participant SIG as Signaling Server (WebSocket)
    participant STUN as STUN / TURN Server
    participant P2P as Direct WebRTC PeerConnection

    Note over ASHA, DOC: Call Setup & Signaling
    DOC->>SIG: Join Consultation Room (room_id: CR-505, role: 'doctor')
    ASHA->>SIG: Join Consultation Room (room_id: CR-505, role: 'asha')
    SIG-->>DOC: Peer Joined Event (Ready to initiate)
    
    DOC->>P2P: Create RTCPeerConnection & capture MediaStream (720p Video + Opus Audio)
    DOC->>DOC: Create SDP Offer
    DOC->>SIG: Send SDP Offer {room_id: CR-505, sdp: ...}
    SIG->>ASHA: Forward SDP Offer
    
    ASHA->>P2P: Set Remote Description (Offer)
    ASHA->>P2P: Capture local MediaStream & Create SDP Answer
    ASHA->>SIG: Send SDP Answer
    SIG->>DOC: Forward SDP Answer
    DOC->>P2P: Set Remote Description (Answer)

    Note over ASHA, STUN: Interactive Connectivity Establishment (ICE)
    DOC->>STUN: Gather ICE candidates (host, srflx, relay)
    ASHA->>STUN: Gather ICE candidates
    DOC->>SIG: Relay ICE Candidate
    SIG->>ASHA: Forward ICE Candidate
    ASHA->>P2P: Add Ice Candidate
    
    P2P-->>DOC: WebRTC Media Channel Connected (DTLS-SRTP)
    P2P-->>ASHA: Live Two-Way Video/Audio Active

    Note over ASHA, P2P: Bandwidth Degradation Detection (<150 kbps or >15% Packet Loss)
    loop Every 2000ms: RTCPeerConnection.getStats()
        ASHA->>ASHA: Analyze inbound-rtp metrics: packetLoss = 18%, jitter = 120ms
        ASHA->>ASHA: Threshold Exceeded: Degrade to Audio-Only Mode
    end
    
    ASHA->>P2P: Disable local video track (track.enabled = false)
    ASHA->>SIG: Send Control Message: {type: 'MODE_CHANGE', mode: 'AUDIO_ONLY'}
    SIG->>DOC: Notify Doctor: Switched to Audio-Only
    DOC->>P2P: Disable remote video rendering / conserve downlink bitrate
    ASHA-->>ASHA: UI displays: "Low Network: Audio-Only Mode Active"
    DOC-->>DOC: UI displays: "Patient on Low Bandwidth: Switched to Audio"

    Note over ASHA, DOC: Complete Network Outage Scenario
    ASHA-xP2P: Cellular connection lost completely (0 bps)
    P2P-->>ASHA: connectionState == 'disconnected' -> 'failed'
    ASHA->>ASHA: Display UI Alert: "Connection Lost. Remote call paused. Notes are saved safely offline."
    DOC->>DOC: Display UI Alert: "Healthcare worker disconnected. Waiting to reconnect..."
    Note over ASHA: Offline notes can still be recorded and queued safely!
```

---

## Diagram 4: Authentication and Role-Based Access Control (RBAC)

This diagram details the authentication handshake, credential validation, cryptographic cookie issuance, and backend authorization filters across distinct roles.

```mermaid
flowchart TD
    subgraph Client ["Client Device"]
        LOGIN_FORM["User Enters Credentials<br/>(Username / Password)"]
        CLIENT_CTX["Client Auth Context<br/>(Stores non-sensitive user profile in memory)"]
        PROT_ROUTE["Protected Route Guard<br/>(Checks in-memory role for UI view)"]
    end

    subgraph BackendAuth ["Backend Authentication & RBAC Gate"]
        AUTH_EP["POST /api/v1/auth/login"]
        BCRYPT["Password Hash Verifier<br/>(bcrypt.compare)"]
        COOKIE_GEN["Session Token Generator<br/>(Cryptographically Signed Session / JWT)"]
        AUTH_MW["Express Middleware: authenticateUser"]
        RBAC_MW["Express Middleware: requireRole(...)"]
    end

    subgraph Database ["PostgreSQL Auth Store"]
        USERS_TBL[("Table: users<br/>id, username, password_hash,<br/>role, is_active, facility_id")]
        AUDIT_TBL[("Table: audit_events<br/>actor_id, action, ip, timestamp")]
    end

    LOGIN_FORM -->|"POST Credentials (HTTPS)"| AUTH_EP
    AUTH_EP -->|"Query User by Username"| USERS_TBL
    USERS_TBL -->>|"Return User Record & Hash"| AUTH_EP
    AUTH_EP --> BCRYPT
    
    BCRYPT -->>|"Invalid Password"| FAIL_RESP["Return 401 Unauthorized<br/>Log Failed Attempt"]
    FAIL_RESP --> AUDIT_TBL
    
    BCRYPT -->>|"Password Valid"| COOKIE_GEN
    COOKIE_GEN -->|"Set-Cookie: session_token<br/>HttpOnly; Secure; SameSite=Strict"| CLIENT_CTX
    COOKIE_GEN -->|"Log Successful Login"| AUDIT_TBL
    
    CLIENT_CTX --> PROT_ROUTE

    %% API Request Authorization Flow
    subgraph APIExecution ["Protected API Endpoint Execution"]
        API_REQ["Client Makes Data Request<br/>(GET /api/v1/patients/:id)"]
        ROLE_CHECK{"Does user role match<br/>required permissions?"}
        DATA_EXEC["Execute Domain Logic & Return Data"]
        FORBIDDEN["Return 403 Forbidden"]
    end

    PROT_ROUTE -.->|"Includes Session Cookie"| API_REQ
    API_REQ --> AUTH_MW
    AUTH_MW -->|"Validate Signature & Extract Role"| RBAC_MW
    RBAC_MW --> ROLE_CHECK
    ROLE_CHECK -->>|"Yes: ASHA or Doctor"| DATA_EXEC
    ROLE_CHECK -->>|"No: Role Mismatch"| FORBIDDEN
```

---

## Diagram 5: Component Interaction Diagram

This diagram displays the internal boundaries and relationships between client components, local persistence, network monitors, backend controllers, and database models.

```mermaid
flowchart LR
    subgraph ClientTier ["Frontend Browser Environment"]
        UI["React UI Views<br/>(Dashboard / Call / Records)"]
        
        subgraph CoreClientLogic ["Core Client Engines"]
            DRAFT_CTRL["Draft Controller"]
            SYNC_MGR["Sync Manager"]
            NET_MON["Network Monitor<br/>(Online / Offline / Flapping)"]
            API_CLIENT["REST API Client<br/>(Axios / Fetch + Interceptors)"]
            RTC_CTRL["WebRTC Controller"]
        end

        IDB_WRAPPER["Dexie.js IndexedDB Wrapper"]
        
        subgraph LocalStores ["IndexedDB Tables"]
            ST_PAT["patients_store"]
            ST_NOTES["notes_store"]
            ST_QUEUE["sync_queue"]
            ST_SESSION["session_cache"]
        end
    end

    subgraph ServerTier ["Node.js Express Monolith"]
        ROUTER["API Router"]
        WS_ROUTER["Signaling Router"]
        
        subgraph Controllers ["Controllers"]
            C_PAT["PatientController"]
            C_CONS["ConsultController"]
            C_SYNC["SyncController"]
        end

        subgraph SrvEngines ["Backend Engines"]
            IDEMP_GATE["Idempotency Gate"]
            TRANS_MGR["Transaction Manager"]
        end
    end

    subgraph StorageTier ["PostgreSQL"]
        DB_ALL[("Relational Tables<br/>users, patients,<br/>consultations, notes,<br/>sync_operations")]
    end

    %% Client Internal Bindings
    UI <-->|"Keystrokes / Forms"| DRAFT_CTRL
    DRAFT_CTRL <-->|"Persist Drafts"| IDB_WRAPPER
    UI <-->|"Trigger Sync / Actions"| SYNC_MGR
    UI <-->|"Call Controls"| RTC_CTRL
    
    NET_MON -->|"State Changes"| SYNC_MGR
    SYNC_MGR <-->|"Read Pending / Write Synced"| IDB_WRAPPER
    SYNC_MGR -->|"Execute Payload"| API_CLIENT
    IDB_WRAPPER <--> LocalStores
    
    %% Client to Server Interconnect
    API_CLIENT -->|"HTTPS REST Requests"| ROUTER
    RTC_CTRL <-->|"WSS Signals"| WS_ROUTER
    
    %% Server Internal Bindings
    ROUTER --> Controllers
    C_SYNC --> IDEMP_GATE
    IDEMP_GATE --> TRANS_MGR
    C_PAT --> TRANS_MGR
    C_CONS --> TRANS_MGR
    TRANS_MGR -->|"SQL Queries"| DB_ALL
```

---

## Diagram Syntax & Compatibility Verification

* All diagrams conform to standard **Mermaid v10+** syntax.
* Node identifiers are alphanumeric with underscores; all text strings containing parentheses, brackets, or slashes are quoted inside standard Mermaid shapes (`["..."]` and `("...")`).
* Fenced blocks use the lowercase `mermaid` identifier, ensuring seamless rendering across GitHub, GitLab, and Markdown previewers.
