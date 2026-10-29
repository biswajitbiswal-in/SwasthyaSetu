# Swasthya Setu — Security, Privacy & Data Protection Architecture

**Document:** `architecture/security-and-privacy.md`  
**Project:** Swasthya Setu — Low-Network Telemedicine  
**Track:** Innovate Odisha 3.0  
**Role:** Senior Software Architect & Healthcare Technology Engineer  
**Status:** Approved Architectural Blueprint  
**Version:** 1.0  

---

This document establishes the security, authentication, role-based authorization, data privacy, and threat mitigation models for Swasthya Setu. It addresses both server-side protections and the unique risks of caching sensitive clinical summaries on client mobile devices in rural community environments.

---

## 1. Threat Model & Security Posture

### 1.1 Operating Environment Realities
In rural healthcare deployments:
1. **Shared Devices:** A tablet or smartphone may be shared among multiple ASHA workers or used by family members in a household.
2. **Physical Device Theft or Loss:** Mobile devices used during field visits can be lost, damaged, or stolen.
3. **Public / Insecure Networks:** Cellular data connections and village Wi-Fi hotspots may be unencrypted or subject to packet interception.
4. **Shared Screens:** Patients or bystanders may glance at screens during consultations.

### 1.2 Core Security Tenets
* **Never Trust the Client:** Client-side role claims, user identifiers, and permissions are treated as untrusted hints. Every API endpoint must enforce authorization on the backend.
* **Data Minimization at Rest:** The application downloads only records explicitly required for scheduled field visits and prevents downloading the entire patient registry.
* **Zero Real Patient Data in Demonstrations:** All development, automated testing, and hackathon demonstrations use strictly synthetic data.

---

## 2. Authentication & Credential Security

```
+-----------------------------------------------------------------------------------+
|                            AUTHENTICATION FLOW ARCHITECTURE                       |
+-----------------------------------------------------------------------------------+

 [ Browser Client ]                                     [ Express Monolith ]
         |                                                       |
         | 1. POST /api/v1/auth/login                            |
         |    { username, password }                             |
         +------------------------------------------------------>|
         |                                                       | 2. Fetch User & Hash
         |                                                       |    from DB
         |                                                       | 3. bcrypt.compare()
         |                                                       | 4. Generate Signed
         |                                                       |    Session Token
         | 5. HTTP 200 OK                                        |
         |    Set-Cookie: ss_session=<signed_token>;             |
         |    HttpOnly; Secure; SameSite=Strict; Path=/          |
         |<------------------------------------------------------+
```

1. **Password Hashing:** Passwords are hashed using **bcrypt** with a minimum work factor (salt rounds) of **12**. Plaintext passwords are never logged, cached, or persisted.
2. **Session / Token Protection:**
   - Sessions are signed using a 256-bit cryptographically secure secret (`SESSION_SECRET`).
   - The session token is transmitted solely via an `HttpOnly`, `Secure`, `SameSite=Strict` cookie (`ss_session`).
   - `HttpOnly` completely shields the session from extraction via Cross-Site Scripting (XSS).
   - `SameSite=Strict` prevents Cross-Site Request Forgery (CSRF).
   - Cookies are served with `Path=/; Max-Age=28800` (8 hours).
3. **Rate Limiting on Authentication:**
   - The login endpoint (`/api/v1/auth/login`) is protected by an in-memory IP and username rate limiter (maximum 5 failed attempts per 15-minute window).
   - Exceeding the threshold yields `HTTP 429 Too Many Requests` and records an audit log event.

---

## 3. Server-Side Role-Based Authorization (RBAC)

The system defines three distinct roles following the principle of **least privilege**:

```
+-------------------------------------------------------------------------------------+
|                                ROLE PERMISSION MATRIX                               |
+--------------------------+-------------------+------------------+-------------------+
| Operation / Endpoint     | ASHA Worker       | Doctor           | Administrator     |
+--------------------------+-------------------+------------------+-------------------+
| Register Patient         | ALLOWED           | DENIED           | DENIED            |
| Read Patient Summary     | ALLOWED (Assigned)| ALLOWED (Assigned| DENIED (No PHI)   |
| Create Consult Request   | ALLOWED           | DENIED           | DENIED            |
| Accept Consultation      | DENIED            | ALLOWED          | DENIED            |
| Append Clinical Notes    | ALLOWED (Triage)  | ALLOWED (Dx/Rx)  | DENIED            |
| Prescribe Medication     | DENIED            | ALLOWED          | DENIED            |
| WebRTC Signaling Room    | ALLOWED (Assigned)| ALLOWED (Assigned| DENIED            |
| Manage User Accounts     | DENIED            | DENIED           | ALLOWED           |
| View Security Audit Logs | DENIED            | DENIED           | ALLOWED           |
+--------------------------+-------------------+------------------+-------------------+
```

### Express Middleware Enforcement Example
```typescript
export function requireRole(allowedRoles: Array<'ASHA' | 'DOCTOR' | 'ADMIN'>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.authenticatedUser;
    if (!user) {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    }
    if (!allowedRoles.includes(user.role)) {
      // Audit security violation
      logAuditEvent({
        actorId: user.id,
        action: 'RBAC_VIOLATION_BLOCKED',
        resourceType: req.baseUrl,
        details: { attemptedRole: user.role, requiredRoles }
      });
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Access denied for your role' } });
    }
    next();
  };
}
```

---

## 4. Local Browser Storage Risks & Mitigations

IndexedDB provides offline persistence but resides on the physical client hardware. This introduces unique risks:

| Risk | Description | Architectural Mitigation |
| :--- | :--- | :--- |
| **Shared Device Snooping** | A family member opens the browser on an ASHA worker's shared phone. | Non-persistent memory for sensitive clinical UI states; session timeout; explicit "Clear Local Cache" button; device lock recommendations. |
| **Physical Device Theft** | A phone is stolen with cached patient data in IndexedDB. | Only minimum clinical summaries for active scheduled visits are cached; explicit retention limit (7 days); zero full-database synchronization. |
| **Cross-Site Scripting (XSS)** | Malicious third-party script reads local IndexedDB records. | Strict Content Security Policy (CSP); all scripts served locally via Vite bundle; no external CDN `<script>` tags; session cookie protected by `HttpOnly`. |
| **Storage Eviction** | Browser deletes IndexedDB during disk cleanup. | `navigator.storage.persist()` requested upon initialization to mark storage persistent against silent OS eviction. |

---

## 5. Controlled Local Data Cleanup & Logout Protocols

To maintain patient privacy on shared community devices:
1. **Explicit Cache Purging:**
   - Healthcare workers can click **"Clear Downloaded Records"** from the settings menu.
   - The app verifies that `sync_queue` has 0 pending items.
   - IndexedDB `patients` and `notes` stores are truncated:
     ```typescript
     await db.transaction('rw', db.patients, db.notes, async () => {
       await db.patients.clear();
       await db.notes.clear();
     });
     ```
2. **Safe Logout Protocol:**
   - If the user clicks **"Logout"** while `pending_sync` items exist:
     - The application interrupts the logout flow with an explicit modal:  
       > **Warning: Unsynchronized Data Present**  
       > *You have 3 consultation notes that have not reached the hospital server. Logging out now will remove your local access to these notes until you reconnect. Are you sure?*
   - If confirmed, the session cookie is invalidated via `POST /api/v1/auth/logout` and local session state is reset.

---

## 6. Audit Logging & Security Accountability

All security-sensitive operations and clinical data accesses emit immutable records into the `audit_events` table:

```typescript
export async function recordAuditEvent(event: {
  actorId?: string;
  action: 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'PATIENT_READ' | 'NOTE_CREATED' | 'SYNC_EXECUTED' | 'RBAC_DENIED';
  resourceType: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
}) {
  await dbPool.query(
    `INSERT INTO audit_events (actor_id, action, resource_type, resource_id, ip_address, user_agent, details)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [event.actorId, event.action, event.resourceType, event.resourceId, event.ipAddress, event.userAgent, JSON.stringify(event.details || {})]
  );
}
```

* Administrators can inspect the audit trail via the Admin Operations portal.
* Administrators cannot modify or delete audit log records.

---

## 7. Secret Management & Transport Security

1. **Environment Variables:**
   - All backend secrets (`DATABASE_URL`, `SESSION_SECRET`, `TURN_USERNAME`, `TURN_CREDENTIAL`) are loaded from environment variables (`process.env`).
   - `.env` files are strictly added to `.gitignore`.
2. **Frontend Zero-Secrets Guarantee:**
   - No private keys, database credentials, or administrative tokens are present in client-side Vite bundles.
   - The client only receives public configuration: the STUN server hostname, WebSocket signaling endpoint URL, and application version.
3. **Transport Security:**
   - Deployed environments strictly mandate **HTTPS** and **WSS** with TLS 1.3.
   - HTTP requests are redirected to HTTPS via reverse proxy headers (`Strict-Transport-Security: max-age=31536000; includeSubDomains`).
   - WebRTC media is encrypted by default using **DTLS-SRTP** (Datagram Transport Layer Security / Secure Real-Time Transport Protocol).

---

## 8. Synthetic Patient Data for Hackathon Demonstrations

To ensure absolute adherence to ethical standards:
* **No real patient identifiable information (PII) or protected health information (PHI) shall ever be entered into the platform during testing or demonstration.**
* Synthetic patient generators populate realistic names, fictional villages, and simulated vital signs for demonstration purposes.
* All demonstration records carry an internal metadata flag: `"is_synthetic": true`.

---

## 9. Regulatory & Compliance Disclaimer

> **Important Architectural Notice:**  
> Swasthya Setu is engineered as an educational and hackathon prototype under the *Innovate Odisha 3.0* challenge. While this architecture incorporates healthcare security best practices (least-privilege access, audit trails, secure session storage, data minimization, and end-to-end media encryption), **it does not claim formal certification or legal compliance** with the Digital Personal Data Protection Act (DPDPA), HIPAA, DISHA, or ISO 27799 without an independent third-party clinical and regulatory audit.
