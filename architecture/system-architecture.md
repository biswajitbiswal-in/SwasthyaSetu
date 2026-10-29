# Swasthya Setu — System Architecture Document

**Document:** `architecture/system-architecture.md`  
**Project:** Swasthya Setu — Low-Network Telemedicine  
**Track:** Innovate Odisha 3.0  
**Role:** Senior Software Architect & Healthcare Technology Engineer  
**Status:** Approved Architectural Blueprint  
**Version:** 1.0  

---

## 1. Project Overview

**Swasthya Setu** ("Bridge of Health") is an offline-first, connectivity-adaptive telemedicine and healthcare workflow platform engineered specifically for rural and resource-constrained environments (such as rural Odisha and broader underserved geographies). The primary users are **Accredited Social Health Activists (ASHA workers)** / frontline healthcare workers, **primary care and specialist doctors**, and **healthcare facility administrators**.

In rural areas, cellular connectivity (2G/3G/intermittent 4G) fluctuates wildly or drops entirely during home visits, monsoons, or remote travel. Conventional telemedicine applications depend on continuous, high-speed broadband and online-only centralized APIs; when the network drops, video calls freeze, patient records become inaccessible, unsaved clinical notes are wiped, and retried requests produce duplicate medical entries.

Swasthya Setu bridges this gap through a resilient architecture that:
1. Operates as an **offline-first Progressive Web Application (PWA)** caching application shells and explicitly authorized patient records in browser-native storage (IndexedDB).
2. Maintains a local **Pending Sync Queue** with deterministic idempotency keys and append-only versioning to guarantee that clinical notes, consultation requests, and messages drafted offline are never lost or duplicated.
3. Features an **adaptive real-time audio/video engine (WebRTC)** that dynamically throttles video bitrate or gracefully falls back to audio-only mode as bandwidth degrades, while explicitly informing users when a live call cannot be sustained.
4. Provides a localized **Odia and English** user interface to ensure high usability for grassroots healthcare workers.
5. Operates on a **clean, low-complexity monolithic architecture** suitable for rapid hackathon execution and straightforward deployment, while strictly avoiding over-engineered distributed microservices.

---

## 2. Problem Being Solved

Rural telemedicine deployments encounter four critical failure modes:

| Failure Mode | Manifestation in Traditional Systems | Swasthya Setu Architectural Solution |
| :--- | :--- | :--- |
| **Complete Network Outage** | Application crashes or shows blank "No Internet" screen; patient history is inaccessible during physical visits. | PWA Service Worker serves cached App Shell; IndexedDB serves explicitly downloaded patient summaries and past consultations offline. |
| **Data Loss During Interruption** | Field worker drafts consultation notes; network drops; page refresh wipes input fields. | Real-time reactive persistence to local IndexedDB draft storage on every keystroke/blur; auto-queued upon submission. |
| **Duplicate/Conflicting Sync** | User presses "Submit" multiple times during spotty network; server creates duplicate consultations or silently overwrites clinical records. | Client-generated UUID idempotency keys (`operation_id`), append-only clinical notes model, and atomic database transactions. |
| **Brittle Video Calling** | WebRTC video freezes at <150 kbps or high packet loss (>15%), creating a broken call experience. | Dynamic WebRTC telemetry monitoring (`RTCPeerConnection.getStats()`); automatic fallback to audio-only mode; explicit status feedback. |

---

## 3. Architectural Goals

1. **Deterministic Offline Operation:** Frontline healthcare workers must be able to view cached patient records, search local patient indices, and compose consultation notes without an active network connection.
2. **Zero Clinical Data Loss:** No clinical note, triage observation, or message drafted offline shall ever be discarded due to network interruption, browser refresh, or tab closure.
3. **Idempotent & Safe Synchronization:** Synchronization retries must guarantee exactly-once semantic processing on the server, preventing duplicate prescriptions, notes, or patient records.
4. **Bandwidth Adaptability:** The real-time consultation module must function across varying link qualities (from stable 4G down to constrained 2G/EDGE), downgrading from 720p/360p video to low-bitrate Opus audio (~16–24 kbps).
5. **Honest System State:** The application must never present unconfirmed offline actions as delivered to the server, nor simulate a live audio/video connection during a complete blackout.
6. **Least Privilege & Role-Based Security:** Backend-enforced authorization ensuring ASHA workers, doctors, and administrators can only read and write data within their operational scope.
7. **Simplicity & Maintainability:** A unified TypeScript stack (Vite + React frontend, Express.js backend, PostgreSQL database) minimizing operational complexity for hackathon validation.

---

## 4. Key Design Principles

* **Offline-First, Not Offline-Afterthought:** All data reads first check local IndexedDB; writes are committed locally before attempting network synchronization.
* **Append-Only Clinical Audit Trails:** Medical records and consultation notes are never mutated in place. Revisions are created as distinct versioned events to prevent silent data overwrites during multi-device synchronization.
* **Separation of Media and State:** Audio/video media streams (ephemeral WebRTC) are completely decoupled from clinical state and consultation documentation (persistent REST + IndexedDB). An interrupted call never invalidates the notes drafted during that call.
* **Explicit Synchronization Lifecycle:** Every local mutation progresses through deterministic states: `DRAFT` $\rightarrow$ `PENDING_SYNC` $\rightarrow$ `SYNCING` $\rightarrow$ `SYNCED` (or `SYNC_FAILED` / `CONFLICT`).
* **Client-Generated Canonical Identifiers:** Entities created offline receive client-generated UUIDv4 identifiers, allowing cross-referencing and parent-child relational integrity prior to server synchronization.
* **No Autonomous Clinical Diagnosis:** The platform serves strictly as a communication, documentation, and coordination bridge. It does not provide automated diagnosis or replace licensed clinical practitioners.

---

## 5. High-Level System Architecture

The system follows a **Layered Client-Server Architecture** featuring a single monolithic backend and an offline-first Single Page Application (SPA) / Progressive Web Application (PWA).

```
+-----------------------------------------------------------------------------------+
|                              CLIENT TIER (Browser / PWA)                          |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |                     React + TypeScript UI (Tailwind CSS)                    |  |
|  |  +---------------------+ +----------------------+ +----------------------+  |  |
|  |  | ASHA Worker View    | | Doctor Consultation  | | Admin Operations     |  |  |
|  |  | (Odia / English)    | | (Odia / English)     | | Dashboard            |  |  |
|  |  +---------------------+ +----------------------+ +----------------------+  |  |
|  +-----------------------------------------------------------------------------+  |
|  | State & Workflow Controllers (React Query / Custom Context Stores)          |  |
|  +-----------------------------------+-----------------------------------------+  |
|                                      |                                            |
|          +---------------------------+---------------------------+                |
|          | Local Persistence Layer                               | Media Engine   |
|  +-------v-------------------------+                     +-------v-------------+  |
|  | IndexedDB (Dexie.js)            |                     | WebRTC Client Engine|  |
|  | - Cached Patient Records        |                     | - MediaStream Track |  |
|  | - Consultation Drafts           |                     |   Management        |  |
|  | - Sync Queue (Pending Ops)      |                     | - Stats Poller      |  |
|  | - User Profile & Session Meta   |                     |   (getStats)        |  |
|  +-------+-------------------------+                     | - Audio Fallback    |  |
|          |                                               +-------+-------------+  |
|  +-------v-------------------------+                             |                |
|  | Sync Manager & Network Monitor  |                             |                |
|  | - Online/Offline Detection      |                             |                |
|  | - Idempotent Batch Processor    |                             |                |
|  | - Exponential Backoff Engine    |                             |                |
|  +-------+-------------------------+                             |                |
|          | HTTP REST API Calls                                   | Signaling      |
+----------|-------------------------------------------------------|----------------+
           | (HTTPS / JSON)                                        | (WSS)
           v                                                       v
+-----------------------------------------------------------------------------------+
|                        APPLICATION BACKEND TIER (Node.js + Express)                |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  | Express HTTP API Router & WebSocket Server (Single Deployable Monolith)    |  |
|  +-------------------------------------+---------------------------------------+  |
|                                        |                                          |
|  +-------------------------------------v---------------------------------------+  |
|  | Middleware Pipeline                                                         |  |
|  | - Security Headers (Helmet, CORS)                                           |  |
|  | - Session / JWT Cookie Authentication                                       |  |
|  | - Role-Based Access Control (RBAC: ASHA, Doctor, Admin)                     |  |
|  | - Rate Limiter & Request Sanitizer                                          |  |
|  +-------------------------------------+---------------------------------------+  |
|                                        |                                          |
|  +--------------------+  +-------------v------+  +-----------------------------+  |
|  | Domain Services    |  | Sync Engine        |  | Real-Time Signaling         |  |
|  | - Patient Service  |  | - Idempotency Gate |  | - Room Session Registry     |  |
|  | - Consult Service  |  | - Conflict Resolver|  | - SDP Offer/Answer Relay    |  |
|  | - Audit Service    |  | - Batch Ingestion  |  | - ICE Candidate Relay       |  |
|  +---------+----------+  +-------------+------+  +-----------------------------+  |
|            |                           |                                          |
|  +---------v---------------------------v---------------------------------------+  |
|  | Data Access Layer (pg / Knex / Prisma ORM)                                  |  |
|  +-------------------------------------+---------------------------------------+  |
+----------------------------------------|------------------------------------------+
                                         | SQL (Connection Pool)
                                         v
+-----------------------------------------------------------------------------------+
|                        PERSISTENCE TIER (Managed PostgreSQL)                      |
|                                                                                   |
|  - Users & Roles              - Consultations & Status Transitions                |
|  - Patients & Medical Records  - Consultation Notes (Append-Only)                 |
|  - Sync Operations Log         - Audit Trail Events                               |
+-----------------------------------------------------------------------------------+
                                         ^
                                         | STUN / TURN
+----------------------------------------+------------------------------------------+
|                     EXTERNAL NAT TRAVERSAL INFRASTRUCTURE                         |
|  - Public Google STUN (stun.l.google.com:19302)                                  |
|  - Managed Coturn / Metered TURN Relay Server (UDP/TCP/TLS 3478/443)             |
+-----------------------------------------------------------------------------------+
```

---

## 6. Component Responsibilities

### 6.1 Frontend (Browser / PWA)
* **App Shell Caching:** Service Worker intercepts static requests and serves compiled JS/CSS/HTML and local Odia/English translation dictionaries directly from CacheStorage.
* **Local Data Store:** Dexie.js encapsulates IndexedDB transactions, maintaining structured object stores for patients, consultations, notes, drafts, and the outbound synchronization queue.
* **Sync Manager:** Monitors browser connectivity (`navigator.onLine` + active heartbeat pings). When online, flushes queued operations in sequential FIFO batches with retry backoff.
* **Adaptive WebRTC Controller:** Captures local user media, manages peer connection lifecycle, polls WebRTC performance statistics (`bytesReceived`, `packetsLost`, `jitter`), and dynamically negotiates audio-only mode when packet loss exceeds threshold limits.
* **Bilingual UI Layer:** React components rendered with Tailwind CSS, supporting one-click toggling between Odia (`or`) and English (`en`).

### 6.2 Application Backend (Node.js + Express)
* **API Routing & Validation:** Validates incoming payloads using Zod / Joi schemas before handing off to business controllers.
* **Authentication & RBAC:** Verifies HTTP-only signed session cookies / tokens; evaluates user role claims against requested resources before executing domain logic.
* **Sync Ingestion Engine:** Evaluates client `operation_id` against database idempotency logs. If previously processed, returns cached response; if fresh, commits operations within database transactions.
* **Real-time WebRTC Signaling:** Minimalist WebSocket handler that authenticates socket handshakes, pairs doctor and healthcare worker into isolated consultation rooms, and relays SDP offers, answers, and ICE candidates without inspecting or storing media.
* **Audit Logging:** Emits immutable log records for clinical record reads, updates, and authentication events into the database.

### 6.3 Persistence Tier (PostgreSQL)
* **Relational Integrity:** Enforces foreign keys between patients, consultations, notes, and providers.
* **ACID Transactions:** Wraps batch sync operations in atomic database transactions (`BEGIN ... COMMIT`) to ensure partial sync payloads never corrupt records.
* **Idempotency Registry:** Tracks all completed client operation UUIDs with resulting HTTP status codes and responses.

### 6.4 NAT Traversal (STUN / TURN)
* **STUN (Session Traversal Utilities for NAT):** Allows peers behind non-symmetric NATs to discover their public IP and port bindings.
* **TURN (Traversal Using Relays around NAT):** Relays encrypted SRTP media packets when symmetric NATs or strict mobile cellular firewalls (carrier-grade NAT / CGNAT common in rural India) block direct peer-to-peer transmission.

---

## 7. Technology Stack Evaluation & Justification

| Technology Layer | Selected Tool | Evaluation & Justification | Discarded Alternatives & Rationale |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | **React + TypeScript + Vite** | Instant cold start, robust ecosystem, strict type safety between client and server models, tiny bundle size (~140 KB baseline). | **Next.js SSR:** Adds server execution overhead and complex hydration bugs in completely offline environments. |
| **Styling** | **Tailwind CSS** | Compiles to zero-runtime static CSS; mobile-first utilities allow rapid, consistent UI development for low-end Android devices. | **Chakra UI / Material UI:** Heavy runtime style calculation and large JavaScript bundle footprint. |
| **Client Storage** | **IndexedDB via Dexie.js** | Native browser storage with 50MB+ quota (up to gigabytes); supports multi-index querying and transactions; Dexie provides elegant promise APIs. | **LocalStorage:** Synchronous, blocking main thread, limited to 5MB, string-only storage incapable of complex entity queries. |
| **PWA & Offline Shell** | **Service Worker (Workbox)** | Standard browser mechanism to intercept HTTP requests and serve static assets offline; works reliably across modern Android Chrome and desktop browsers. | **Native Android App (Kotlin/Flutter):** High distribution friction; requires Play Store downloads; PWA installs immediately from URL. |
| **Backend Runtime** | **Node.js + Express (TypeScript)** | Single language (TypeScript) across full stack; lightweight event-driven I/O; low memory footprint suitable for free-tier cloud instances; vast ecosystem. | **Python FastAPI / Django:** Splitting languages increases hackathon cognitive load and prevents sharing TypeScript interface types. |
| **Database** | **PostgreSQL (Relational)** | Strict relational constraints, row-level ACID safety, native UUID support, JSONB columns for semi-structured medical summaries. | **MongoDB:** Weak multi-entity relational constraints; eventual consistency risks duplicate medical records during sync retries. |
| **Real-Time Video** | **WebRTC (Peer-to-Peer)** | Open web standard; sub-500ms latency; native browser hardware-accelerated video codecs (VP8/H.264) and audio (Opus); end-to-end encrypted (DTLS-SRTP). | **Twilio / Agora SDKs:** Proprietary third-party billing, external vendor lock-in, unsuitable for offline self-contained architectures. |
| **Signaling** | **WebSocket (`ws`)** | Built into same Node.js HTTP server process; minimal memory footprint; duplex low-latency signaling for room management and SDP exchange. | **Socket.io with Redis adapter:** Unnecessary infrastructure overhead for 1-to-1 doctor-patient hackathon consultation rooms. |
| **Authentication** | **Secure HTTP-Only Session Cookie / Signed Token** | Protects against XSS token extraction; immune to localStorage credential theft; works transparently across online and offline states. | **Raw JWT in localStorage:** Vulnerable to client-side XSS attacks; cannot be invalidated on demand without complex blacklists. |

---

## 8. Connected vs. Disconnected Operations Matrix

The platform architecture strictly defines what is supported under each connectivity state:

```
+-----------------------------------------------------------------------------------------+
|                                    CONNECTIVITY STATE MATRIX                            |
+--------------------------+-----------------------------+--------------------------------+
| Capability               | Online / Connected          | Offline / Disconnected         |
+--------------------------+-----------------------------+--------------------------------+
| App Shell Loading        | Served from Cache / Network | Served 100% from Service Worker|
| Patient Lookup           | Server API + Local Cache    | IndexedDB Local Index Only     |
| Record Download          | Explicit Download Button    | Disabled (Shows cached stamp)  |
| Consultation Note Draft  | Autosaved to IndexedDB      | Autosaved to IndexedDB         |
| Consultation Request     | Sent to API + Synced        | Placed into Pending Sync Queue |
| Outbound Messaging       | Delivered to Backend        | Queued with "Pending" Badge    |
| Sync Dashboard           | Real-time Auto-Sync         | Shows Pending Count & Retry    |
| WebRTC Consultation      | Active (Video / Audio)      | DISABLED (Explicit Status UI)  |
| Bandwidth Adaptation     | Active (Dynamic Throttling) | N/A                            |
+--------------------------+-----------------------------+--------------------------------+
```

---

## 9. Security and Privacy Boundaries

```
[ Client Device: Shared Tablet / Mobile ]
  |-- Service Worker Cache (Sanitized Assets Only)
  |-- IndexedDB (Encrypted at OS level, Minimal Synced Synthetic Records)
  |-- Active Session Memory (Ephemeral Auth Claims)
  ========================= BOUNDARY 1: Local Device =========================
  | (HTTPS / WSS Transport Security, TLS 1.3)
  ========================= BOUNDARY 2: Network Transport ====================
[ Node.js Monolith API Gateway ]
  |-- Helmet / CORS Guard (Origin Validation)
  |-- Session Validation Middleware (Signed Cookie verification)
  |-- RBAC Gatekeeper (Healthcare Worker vs Doctor vs Admin)
  |-- Input Validation & Sanitization (Zod Schema Validation)
  ========================= BOUNDARY 3: Server Application ===================
  | (PostgreSQL TCP with SSL / Connection Pool)
  ========================= BOUNDARY 4: Database Storage =====================
[ Managed PostgreSQL Database ]
  |-- Parameterized SQL Statements (SQLi Immune)
  |-- Role Separation, Foreign Key Constraints, Append-Only Audit Trail
```

1. **Client Boundary:** Shared device risks are mitigated by session timeouts, explicit local cache purging upon logout, and restricting cached records to only those explicitly downloaded by the healthcare worker for scheduled visits.
2. **Transport Boundary:** All communication is strictly TLS 1.3 encrypted over HTTPS and secure WebSockets (WSS). WebRTC audio/video is end-to-end encrypted using DTLS-SRTP.
3. **Server Boundary:** Every request passes through authentication and RBAC middlewares. No client-supplied user identity or role in request bodies is ever trusted.
4. **Data Privacy:** Synthetic data is strictly utilized for development and hackathon demonstrations. No Personally Identifiable Information (PII) of actual patients is ingested.

---

## 10. Deployment Architecture

For the hackathon demonstration and initial pilot deployment, a lightweight, free-tier/low-cost deployment architecture is selected:

```
[ DNS & CDN: Cloudflare / Vercel Edge ]
                  |
         +--------+--------+
         |                 | (Static Assets)
         v                 v
[ Managed Backend ]   [ Frontend Hosting ]
- Render / Railway    - Vercel / Netlify / Cloudflare Pages
- Node.js + Express   - React + Vite SPA
- Port: 5000          - PWA Service Worker
- Handles REST + WSS  - Odia/English Localization Bundles
         |
         v (Encrypted DB Connection)
[ Managed Database ]
- Neon / Supabase / Railway
- PostgreSQL 15+
- Automated Backups & Connection Pooling
```

* **Frontend:** Deployed to Vercel or Cloudflare Pages with automatic HTTPS, Brotli compression, and immutable cache headers for hashed Vite assets.
* **Backend:** Single containerized Node.js service running on Render, Railway, or Fly.io. Exposes port 5000 for both HTTPS REST endpoints and WSS signaling upgrades.
* **Database:** Managed PostgreSQL instance on Neon or Supabase with SSL enforcement and connection pooling.
* **NAT Traversal:** Public Google STUN (`stun:stun.l.google.com:19302`) coupled with a free-tier Metered.ca or Coturn relay for TURN fallback.

---

## 11. Architectural Decisions & Trade-Offs (ADR Summary)

### ADR 1: Monolithic Backend vs. Microservices
* **Decision:** Build a single Express.js monolithic backend combining REST endpoints and WebSocket signaling.
* **Rationale:** A microservices architecture (e.g., auth service, sync service, media service, record service) introduces network latency, distributed transaction complexity, service discovery overhead, and Docker orchestration burdens completely unjustified for a 1-to-1 rural telemedicine hackathon MVP.
* **Trade-off:** Independent horizontal scaling of the signaling server is deferred. Acceptable because signaling messages represent negligible bandwidth compared to media streams (which travel peer-to-peer or via TURN).

### ADR 2: Append-Only Consultation Notes vs. In-Place Mutations
* **Decision:** Clinical notes are modeled as immutable, append-only entries tied to a consultation. Edits create a new note record referencing a `parent_note_id` with an incremented version number.
* **Rationale:** Eliminates complex multi-master merge conflicts (e.g., operational transformation or CRDTs) when an ASHA worker and a doctor both add observations while disconnected.
* **Trade-off:** Requires slightly more storage space in PostgreSQL and client IndexedDB. Minimal impact given text note payloads are tiny (<2 KB).

### ADR 3: Foreground Sync Manager vs. Background Sync API
* **Decision:** Implement a deterministic application-level Foreground Sync Manager (with exponential backoff) rather than relying solely on the Service Worker `SyncManager` API.
* **Rationale:** The W3C Background Sync API is unsupported on iOS Safari and unreliable across battery-saver modes on low-cost Android smartphones.
* **Trade-off:** The user must have the application open or reopened in the browser for synchronization to complete. This is clearly communicated via the UI Sync Status Dashboard.

---

## 12. Conclusion & Architectural Integrity

The Swasthya Setu architecture directly solves the real-world operational challenges of rural telemedicine: connectivity loss, data erasure, duplicate submissions, and brittle media calling. By grounding the platform in an offline-first foundation with honest state reporting, the system remains practical, robust, and immediately implementable.
