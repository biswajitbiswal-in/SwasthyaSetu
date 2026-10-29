# Swasthya Setu — System Architecture & Engineering Documentation

**Project:** Swasthya Setu — Low-Network Telemedicine  
**Track:** Innovate Odisha 3.0  
**Role:** Senior Software Architect & Healthcare Technology Engineer  
**Status:** Approved Architectural Blueprint  
**Version:** 1.0  

---

## Welcome to the Swasthya Setu Architecture Suite

This directory contains the complete, implementation-ready architectural specifications for **Swasthya Setu**, an offline-first, connectivity-adaptive telemedicine and healthcare workflow platform engineered for rural and resource-constrained environments.

The architecture was designed by analyzing the core problem statement (`docs/ps.md`) and feature specification (`docs/feature.md`), prioritizing zero clinical data loss, honest system states, bandwidth adaptability, and implementation simplicity for a student hackathon team.

---

## Document Index & Summary

| File Name | Purpose & Content |
| :--- | :--- |
| **[`system-architecture.md`](./system-architecture.md)** | **Foundational Blueprint:** High-level system architecture, problem analysis, architectural goals, technology evaluations and justifications, component responsibilities, connected vs. disconnected matrix, and Architectural Decision Records (ADRs). |
| **[`architecture-diagram.md`](./architecture-diagram.md)** | **Visual Specifications (Mermaid):** High-level component diagram, offline-first data flow, WebRTC telemedicine consultation flow, role-based access control (RBAC), and internal component interaction diagrams. |
| **[`data-flow.md`](./data-flow.md)** | **End-to-End Workflows:** Step-by-step specifications for 10 critical workflows (login, offline record viewing, offline note drafting, queue buffering, batch sync, duplicate prevention, WebRTC call initiation, adaptive audio fallback, sync dashboards, and recovery). |
| **[`database-design.md`](./database-design.md)** | **Data Architecture:** Complete PostgreSQL relational schema (tables, columns, UUIDs, foreign keys, constraints, and indexes) and client-side Dexie.js (IndexedDB) object store definitions with TypeScript interfaces. |
| **[`api-design.md`](./api-design.md)** | **REST API Contract:** Comprehensive endpoint definitions for authentication, synthetic patient management, consultations, clinical notes, idempotent batch sync, and health checks, including request/response examples and Zod validation schemas. |
| **[`offline-sync-design.md`](./offline-sync-design.md)** | **Offline Synchronization Engine:** The technical core of the platform: data classification (cacheable vs. prohibited), autosave drafts, pending sync queue, UUID idempotency keys, exponential backoff with jitter, conflict resolution, and non-destructive expired session recovery. |
| **[`webrtc-design.md`](./webrtc-design.md)** | **Real-Time Media Engine:** WebRTC peer connection management, WebSocket signaling protocol, STUN and TURN NAT traversal in Indian cellular networks (CGNAT), dynamic `getStats()` bandwidth monitoring, automated video-to-audio fallback, and honest connectivity limits. |
| **[`security-and-privacy.md`](./security-and-privacy.md)** | **Security & Privacy Framework:** Least-privilege server-side RBAC, bcrypt password hashing, `HttpOnly` session cookie protection, shared mobile device risks, local IndexedDB cache cleanup protocols, audit trails, and synthetic data policies. |
| **[`implementation-roadmap.md`](./implementation-roadmap.md)** | **Execution Plan & Test Matrix:** 12 sequential, testable development phases with dependencies, concrete deliverables, acceptance criteria, test cases, and explicit targets for hackathon judging demonstrations. |
| **[`requirements-traceability.md`](./requirements-traceability.md)** | **Traceability & Architecture Audit:** Complete matrix mapping every functional and non-functional requirement to architecture components, plus an evaluation of risks, non-over-engineered decisions, and project assumptions. |

---

## Recommended Reading Order

For engineers, reviewers, and hackathon judges, the recommended reading order is:

1. **Start with the Core Blueprint:** Read [`system-architecture.md`](./system-architecture.md) to understand the high-level paradigm, component boundaries, and technology trade-offs.
2. **Review the Visual Diagrams:** Open [`architecture-diagram.md`](./architecture-diagram.md) to visually trace the interactions between the PWA client, IndexedDB, Node.js backend, PostgreSQL, and WebRTC components.
3. **Understand the Offline Engine:** Read [`offline-sync-design.md`](./offline-sync-design.md) and [`data-flow.md`](./data-flow.md) to inspect how the system guarantees zero data loss and safe synchronization during network outages.
4. **Inspect the Data & API Contracts:** Review [`database-design.md`](./database-design.md) and [`api-design.md`](./api-design.md) for the exact relational schema and REST endpoints.
5. **Review the Real-Time Media Strategy:** Read [`webrtc-design.md`](./webrtc-design.md) to understand bandwidth adaptation, STUN/TURN traversal, and the rationale for implementing WebRTC as a milestone after offline records.
6. **Evaluate Security & Privacy:** Read [`security-and-privacy.md`](./security-and-privacy.md) for RBAC, session protection, and client device risk mitigation.
7. **Examine the Roadmap & Traceability:** Review [`implementation-roadmap.md`](./implementation-roadmap.md) and [`requirements-traceability.md`](./requirements-traceability.md) to verify that every requirement in `ps.md` and `feature.md` is addressed in a testable sequence.
