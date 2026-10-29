# Swasthya Setu — Requirements Traceability & Architecture Quality Review

**Document:** `architecture/requirements-traceability.md`  
**Project:** Swasthya Setu — Low-Network Telemedicine  
**Track:** Innovate Odisha 3.0  
**Role:** Senior Software Architect & Healthcare Technology Engineer  
**Status:** Approved Architectural Blueprint  
**Version:** 1.0  

---

This document performs an exhaustive quality review of the Swasthya Setu architecture against the problem statement (`docs/ps.md`) and feature specification (`docs/feature.md`). It provides a complete **Requirements Traceability Matrix (RTM)** and an architectural evaluation identifying trade-offs, potential risks, and explicit project assumptions.

---

## 1. Requirements Traceability Matrix (RTM)

| Req ID | Requirement Description (from `feature.md`) | Architecture Component | Relevant Document | Implementation Phase | Acceptance Test |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **F1** | **Adaptive Video-to-Audio Consultation:** Real-time call with WebRTC, stats monitoring, bitrate throttling, and audio fallback. | WebRTC Controller, MediaStream Track Manager, Signaling Server | `webrtc-design.md`, `system-architecture.md` | Phase 9, Phase 10 | Simulated packet loss ($>15\%$) triggers automated video track disablement and audio-only mode. |
| **F2** | **Offline Patient Records:** View previously cached records without network; clear empty state for uncached items. | IndexedDB `patients` store (Dexie.js), Service Worker Cache | `offline-sync-design.md`, `database-design.md` | Phase 5 | Disconnect network in DevTools; verify previously downloaded record loads cleanly; uncached record shows warning. |
| **F3** | **Local Notes & Safe Synchronization:** Save drafts locally, queue updates, idempotent batch sync, conflict detection. | Dexie `notes` and `sync_queue`, Backend `sync_operations` Idempotency Gate | `offline-sync-design.md`, `data-flow.md`, `api-design.md` | Phase 6, Phase 7 | Record note offline, reload page to verify persistence, reconnect and verify idempotent ingestion without duplication. |
| **F4** | **Reconnection & Consultation Recovery:** Detect call disconnection, display honest status, bounded retries, ICE restart. | WebRTC Reconnection Watchdog, ICE Restart Controller | `webrtc-design.md`, `data-flow.md` | Phase 10 | Drop network mid-call; verify UI displays "Attempting to reconnect"; verify call terminates gracefully after 30s. |
| **F5** | **Odia & English Interface & Messaging:** Bilingual UI selector, offline queued messaging, delivery confirmation states. | i18n Localization Engine, Dexie `messages` store | `system-architecture.md`, `implementation-roadmap.md` | Phase 11 | Switch language to Odia; verify all labels update; create message offline and verify "Pending" badge until server confirms. |
| **F6** | **Role-Based Dashboards & Auth:** ASHA, Doctor, Admin separation; backend authorization enforcement; audit trail. | Express RBAC Middleware, `users` table, `audit_events` | `security-and-privacy.md`, `api-design.md` | Phase 3 | Submit request to doctor endpoint with ASHA session cookie; verify backend returns HTTP 403 Forbidden. |
| **F7** | **Synchronization Status Dashboard:** Show pending count, last sync time, itemized sync state, safe manual retry. | Client Sync Manager, Reactive Header Banner, Sync Modal | `data-flow.md`, `offline-sync-design.md` | Phase 8 | Queue 3 items offline; verify header shows "3 Pending"; verify pending count decrements to 0 upon reconnection. |
| **F8** | **Consultation Workflow:** End-to-end lifecycle (Requested $\rightarrow$ Accepted $\rightarrow$ In Progress $\rightarrow$ Completed). | Express Consultation Router, `consultations` table | `database-design.md`, `api-design.md` | Phase 4, Phase 7 | Execute complete lifecycle from ASHA request to Doctor completion; verify status changes in database. |
| **NFR-1**| **Security & Privacy:** Least privilege, HTTP-only cookies, password hashing, synthetic patient data only. | bcrypt, Express Auth Middleware, Data Minimization Policy | `security-and-privacy.md` | Phase 3, Phase 12 | Verify no plaintext passwords or session tokens in localStorage or client JS bundles. |
| **NFR-2**| **Reliability & Idempotency:** Zero data loss, exponential backoff with jitter, retry idempotency. | Client Exponential Backoff, PostgreSQL `sync_operations` unique index | `offline-sync-design.md`, `database-design.md` | Phase 7 | Resubmit identical batch payload twice; verify single database row created and HTTP 200 returned. |
| **NFR-3**| **Accessibility & Usability:** Mobile-first responsive design, large touch targets, color-independent status badges. | Tailwind CSS Mobile Framework, Accessible Status Chips | `system-architecture.md`, `implementation-roadmap.md` | Phase 2, Phase 8 | Inspect viewport at 360x640; verify all touch targets $\ge 44\text{px}$ and status uses text labels alongside icons. |
| **NFR-4**| **Performance & Low Footprint:** Lightweight app shell ($<200\text{ KB}$ baseline), no unnecessary dependencies. | Vite + React + Tailwind CSS Tree-Shaking | `system-architecture.md` | Phase 1, Phase 5 | Run Lighthouse audit; verify PWA App Shell initial bundle size $<250\text{ KB}$ gzipped. |

---

## 2. Architectural Gap & Risk Analysis

### 2.1 Missing Requirements & Addressed Omissions
* **Handling Expired Sessions While Offline:** If an ASHA worker's session expires while drafting notes in the field, traditional applications wipe local storage on 401 Unauthorized.  
  *Resolution in Architecture:* The architecture strictly enforces **non-destructive session recovery** (`offline-sync-design.md` Section 9). Unsynced drafts are preserved in IndexedDB, and the UI presents an inline re-authentication modal when connectivity returns.
* **Carrier-Grade NAT (CGNAT) Reality:** Rural mobile networks in India (Jio/Airtel) block direct P2P hole punching.  
  *Resolution in Architecture:* TURN relay configuration over standard ports (UDP 3478 and TLS 443) is explicitly included in `webrtc-design.md`.

### 2.2 Over-Engineering Avoidance Review
* **No Microservices:** A single modular Express.js monolith replaces distributed service meshes, saving hours of configuration and eliminating cross-service network failure modes.
* **No Distributed Message Queues (Kafka / RabbitMQ):** Queueing is handled natively in client IndexedDB and processed by PostgreSQL ACID transactions.
* **No Distributed Cache (Redis):** Session state is cryptographically signed and stateless (`HttpOnly` cookie), and rate-limiting is handled by an in-memory sliding window cache.

### 2.3 WebRTC Limitations Acknowledgment
* **Absolute Connectivity Boundary:** A WebRTC call requires an active, bidirectional transport channel. Audio-only mode reduces bandwidth consumption from ~500 kbps to ~24 kbps, which helps sustain calls on weak signals, but **cannot function during a complete cellular blackout.** This boundary is explicitly documented and visually indicated in the UI.

---

## 3. Explicit Architectural Assumptions

The following assumptions have been made in this architecture and are submitted for stakeholder awareness:

1. **Patient Account Model in MVP:** As outlined in `feature.md` Section 3.4, patients in the MVP do not register their own individual login accounts. Instead, patients are registered and represented through the ASHA worker's workflow. (Patient-facing self-service portals are deferred to post-hackathon roadmaps).
2. **Clinical Notes are Append-Only:** To prevent data loss without implementing complex Operational Transformation (OT) or Conflict-Free Replicated Data Types (CRDTs), clinical observations and notes are modeled as immutable, append-only entries. Edits create new versions referencing the parent note.
3. **Synthetic Data Exclusivity:** No integration with live state or central government healthcare databases (e.g., ABDM / Ayushman Bharat Digital Mission) is attempted for the hackathon MVP, as third-party API sandbox approvals cannot be guaranteed within the competition timeframe.
4. **Foreground Synchronization Priority:** The system relies primarily on an application-level Foreground Sync Manager (active when the PWA is open) rather than relying exclusively on the W3C Background Sync API, which remains unsupported on iOS and throttled on Android.
