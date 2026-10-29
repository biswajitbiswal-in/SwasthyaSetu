# Swasthya Setu — REST API Contract & Interface Specifications

**Document:** `architecture/api-design.md`  
**Project:** Swasthya Setu — Low-Network Telemedicine  
**Track:** Innovate Odisha 3.0  
**Role:** Senior Software Architect & Healthcare Technology Engineer  
**Status:** Approved Architectural Blueprint  
**Version:** 1.0  

---

This document establishes the initial REST API contract for Swasthya Setu. It defines endpoints, HTTP methods, required roles, payload schemas, response structures, and error definitions.

---

## 1. Global API Standards & Security Rules

1. **Base URL:** `/api/v1`
2. **Data Format:** All requests and responses use `application/json; charset=utf-8`.
3. **Session Verification:** Authentication is enforced via an `HttpOnly`, `Secure`, `SameSite=Strict` cookie (`ss_session`). The backend parses and verifies the signed cookie on every protected request.
4. **Server-Side Authorization:** Roles (`ASHA`, `DOCTOR`, `ADMIN`) are extracted solely from the validated session cookie. Any `user_id` or `role` injected into request bodies or query parameters by the client is strictly ignored.
5. **Standard Error Envelope:**
   ```json
   {
     "error": {
       "code": "RESOURCE_NOT_FOUND",
       "message": "The requested patient record could not be found.",
       "details": []
     }
   }
   ```
6. **Common HTTP Status Codes:**
   - `200 OK`: Request succeeded.
   - `201 Created`: Resource successfully created.
   - `400 Bad Request`: Payload validation error (Zod schema failure).
   - `401 Unauthorized`: Session missing, invalid, or expired.
   - `403 Forbidden`: Authenticated user lacks permission for the resource.
   - `404 Not Found`: Resource does not exist.
   - `409 Conflict`: Version mismatch or state transition conflict.
   - `500 Internal Server Error`: Unhandled backend exception.

---

## 2. Authentication & Session Endpoints

### 2.1 User Login
* **Method & Path:** `POST /api/v1/auth/login`
* **Purpose:** Authenticates user credentials, sets secure `HttpOnly` session cookie, and returns user profile.
* **Required Role:** Public (Unauthenticated)
* **Request Example:**
  ```json
  {
    "username": "sunita_asha",
    "password": "SecurePassword123!"
  }
  ```
* **Response Example (200 OK):**
  ```json
  {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "username": "sunita_asha",
      "fullName": "Sunita Behera",
      "role": "ASHA",
      "facilityName": "Nuapada Sub-Center",
      "preferredLanguage": "or"
    }
  }
  ```
* **Error Responses:**
  - `400 Bad Request`: Missing username or password.
  - `401 Unauthorized`: `{"error": {"code": "INVALID_CREDENTIALS", "message": "Invalid username or password"}}`
  - `429 Too Many Requests`: Rate limit exceeded (5 attempts per 15 minutes).

---

### 2.2 Get Current User / Session Verification
* **Method & Path:** `GET /api/v1/auth/me`
* **Purpose:** Validates the active session and returns authenticated identity. Used during app initialization.
* **Required Role:** Authenticated (`ASHA`, `DOCTOR`, `ADMIN`)
* **Request Example:** None (Session cookie transmitted automatically by browser)
* **Response Example (200 OK):**
  ```json
  {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "username": "sunita_asha",
      "fullName": "Sunita Behera",
      "role": "ASHA",
      "facilityName": "Nuapada Sub-Center",
      "preferredLanguage": "or"
    }
  }
  ```
* **Error Responses:**
  - `401 Unauthorized`: Session expired or invalid.

---

### 2.3 User Logout
* **Method & Path:** `POST /api/v1/auth/logout`
* **Purpose:** Invalidates session cookie and logs audit event.
* **Required Role:** Authenticated (`ASHA`, `DOCTOR`, `ADMIN`)
* **Request Example:** None
* **Response Example (200 OK):**
  ```json
  {
    "message": "Successfully logged out."
  }
  ```

---

## 3. Patient Management Endpoints

### 3.1 List / Search Patients
* **Method & Path:** `GET /api/v1/patients`
* **Purpose:** Retrieves a paginated list of synthetic patients with optional village or search filters.
* **Required Role:** `ASHA`, `DOCTOR`
* **Query Parameters:**
  - `query` (optional string): Name or patient code match.
  - `village` (optional string): Filter by village name.
  - `page` (optional number, default 1).
  - `limit` (optional number, default 20).
* **Response Example (200 OK):**
  ```json
  {
    "patients": [
      {
        "id": "7b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "patientCode": "OD-P-10042",
        "fullName": "Gitanjali Majhi",
        "ageYears": 28,
        "gender": "FEMALE",
        "villageName": "Nuapada",
        "chronicConditions": ["Mild Anemia"],
        "updatedAt": "2026-10-28T09:30:00Z"
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 1 }
  }
  ```
* **Error Responses:**
  - `401 Unauthorized`
  - `403 Forbidden` (if accessed by Administrator).

---

### 3.2 Get Patient Clinical Summary
* **Method & Path:** `GET /api/v1/patients/:id`
* **Purpose:** Retrieves detailed patient profile, allergies, chronic conditions, and past consultation history.
* **Required Role:** `ASHA`, `DOCTOR`
* **Response Example (200 OK):**
  ```json
  {
    "patient": {
      "id": "7b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "patientCode": "OD-P-10042",
      "fullName": "Gitanjali Majhi",
      "dateOfBirth": "1998-04-12",
      "ageYears": 28,
      "gender": "FEMALE",
      "villageName": "Nuapada",
      "contactPhone": "+91-9876543210",
      "bloodGroup": "O+",
      "knownAllergies": ["Penicillin"],
      "chronicConditions": ["Mild Anemia"],
      "recentConsultations": [
        {
          "consultationId": "9c2a3b4c-5d6e-7f8a-9b0c-1d2e3f4a5b6c",
          "date": "2026-09-15T11:00:00Z",
          "doctorName": "Dr. A. Patnaik",
          "chiefComplaint": "Routine antenatal assessment",
          "status": "COMPLETED"
        }
      ]
    }
  }
  ```
* **Error Responses:**
  - `404 Not Found`: Patient ID does not exist.

---

### 3.3 Register New Patient
* **Method & Path:** `POST /api/v1/patients`
* **Purpose:** Registers a new patient. Client can supply canonical UUID or let server assign one.
* **Required Role:** `ASHA`
* **Request Example:**
  ```json
  {
    "id": "7b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "fullName": "Gitanjali Majhi",
    "ageYears": 28,
    "gender": "FEMALE",
    "villageName": "Nuapada",
    "contactPhone": "+91-9876543210",
    "bloodGroup": "O+",
    "knownAllergies": ["Penicillin"],
    "chronicConditions": ["Mild Anemia"]
  }
  ```
* **Response Example (201 Created):**
  ```json
  {
    "patient": {
      "id": "7b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "patientCode": "OD-P-10042",
      "fullName": "Gitanjali Majhi",
      "registeredBy": "550e8400-e29b-41d4-a716-446655440000",
      "createdAt": "2026-10-29T10:00:00Z"
    }
  }
  ```

---

## 4. Consultation Endpoints

### 4.1 Request a Consultation
* **Method & Path:** `POST /api/v1/consultations`
* **Purpose:** Submits a new consultation request on behalf of a patient.
* **Required Role:** `ASHA`
* **Request Example:**
  ```json
  {
    "id": "9c2a3b4c-5d6e-7f8a-9b0c-1d2e3f4a5b6c",
    "patientId": "7b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "priority": "NORMAL",
    "chiefComplaint": "Patient reports high fever for 3 days with shivering and joint pain."
  }
  ```
* **Response Example (201 Created):**
  ```json
  {
    "consultation": {
      "id": "9c2a3b4c-5d6e-7f8a-9b0c-1d2e3f4a5b6c",
      "patientId": "7b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "status": "REQUESTED",
      "priority": "NORMAL",
      "requestedBy": "550e8400-e29b-41d4-a716-446655440000",
      "createdAt": "2026-10-29T10:15:00Z"
    }
  }
  ```

---

### 4.2 List Consultations
* **Method & Path:** `GET /api/v1/consultations`
* **Purpose:** Lists active and historical consultations filtered by role.
* **Required Role:** `ASHA`, `DOCTOR`
* **Query Parameters:**
  - `status` (optional: `REQUESTED`, `ACCEPTED`, `IN_PROGRESS`, `COMPLETED`).
* **Response Example (200 OK):**
  ```json
  {
    "consultations": [
      {
        "id": "9c2a3b4c-5d6e-7f8a-9b0c-1d2e3f4a5b6c",
        "patientName": "Gitanjali Majhi",
        "village": "Nuapada",
        "priority": "NORMAL",
        "status": "REQUESTED",
        "chiefComplaint": "High fever with shivering",
        "createdAt": "2026-10-29T10:15:00Z"
      }
    ]
  }
  ```

---

### 4.3 Update Consultation Status
* **Method & Path:** `PATCH /api/v1/consultations/:id/status`
* **Purpose:** Updates consultation state (e.g., Doctor accepts request, or marks call completed).
* **Required Role:** `ASHA`, `DOCTOR`
* **Request Example:**
  ```json
  {
    "status": "ACCEPTED",
    "assignedDoctorId": "660e8400-e29b-41d4-a716-446655440001"
  }
  ```
* **Response Example (200 OK):**
  ```json
  {
    "consultationId": "9c2a3b4c-5d6e-7f8a-9b0c-1d2e3f4a5b6c",
    "status": "ACCEPTED",
    "assignedDoctorId": "660e8400-e29b-41d4-a716-446655440001",
    "updatedAt": "2026-10-29T10:20:00Z"
  }
  ```
* **Error Responses:**
  - `409 Conflict`: Invalid state transition (e.g., attempting to accept a cancelled consultation).

---

## 5. Consultation Notes Endpoints

### 5.1 Append Clinical Note
* **Method & Path:** `POST /api/v1/consultations/:id/notes`
* **Purpose:** Submits an append-only clinical observation, vitals record, diagnosis, or prescription.
* **Required Role:** `ASHA`, `DOCTOR`
* **Request Example:**
  ```json
  {
    "id": "e4b2d3c1-0a2b-4c3d-8e4f-5a6b7c8d9e0f",
    "vitals": {
      "bp": "120/80",
      "pulse": 76,
      "spo2": 98,
      "tempF": 101.4
    },
    "clinicalObservations": "Patient flushed, reports chills. No respiratory distress.",
    "diagnosisSummary": "Suspected viral fever vs uncomplicated malaria.",
    "prescription": [
      {
        "drug": "Paracetamol 500mg",
        "dosage": "1 tablet",
        "duration": "3 days",
        "instructions": "Take after meals every 8 hours if fever > 100 F"
      }
    ],
    "referralFacility": "Nuapada Community Health Center",
    "followUpDate": "2026-11-01"
  }
  ```
* **Response Example (201 Created):**
  ```json
  {
    "note": {
      "id": "e4b2d3c1-0a2b-4c3d-8e4f-5a6b7c8d9e0f",
      "consultationId": "9c2a3b4c-5d6e-7f8a-9b0c-1d2e3f4a5b6c",
      "authorId": "660e8400-e29b-41d4-a716-446655440001",
      "authorRole": "DOCTOR",
      "version": 1,
      "createdAt": "2026-10-29T10:35:00Z"
    }
  }
  ```

---

## 6. Offline Synchronization Endpoints

### 6.1 Batch Sync Operations
* **Method & Path:** `POST /api/v1/sync/batch`
* **Purpose:** Flushes client pending sync queue in an atomic batch with idempotency protection.
* **Required Role:** `ASHA`, `DOCTOR`
* **Request Example:**
  ```json
  {
    "operations": [
      {
        "operationId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "entityType": "CONSULTATION_NOTE",
        "action": "CREATE",
        "payload": {
          "id": "e4b2d3c1-0a2b-4c3d-8e4f-5a6b7c8d9e0f",
          "consultationId": "9c2a3b4c-5d6e-7f8a-9b0c-1d2e3f4a5b6c",
          "patientId": "7b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
          "vitals": { "bp": "120/80", "pulse": 76 },
          "clinicalObservations": "Drafted offline in field visit."
        }
      }
    ]
  }
  ```
* **Response Example (200 OK):**
  ```json
  {
    "results": [
      {
        "operationId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "status": "COMMITTED",
        "entityType": "CONSULTATION_NOTE",
        "entityId": "e4b2d3c1-0a2b-4c3d-8e4f-5a6b7c8d9e0f"
      }
    ],
    "serverTimestamp": "2026-10-29T10:40:00Z"
  }
  ```
* **Error Handling within Batch:** If individual operations conflict (e.g. status conflict), the response returns itemized statuses (`COMMITTED`, `DUPLICATE_ACKNOWLEDGED`, `CONFLICT`) without aborting non-conflicting peer operations.

---

## 7. Operational & Health Check Endpoints

### 7.1 Health & Connectivity Heartbeat
* **Method & Path:** `GET /api/v1/health`
* **Purpose:** Ultra-lightweight endpoint used by client Network Sentinel to verify true HTTP internet connectivity.
* **Required Role:** Public
* **Request Example:** None (or HTTP `HEAD` request)
* **Response Example (200 OK):**
  ```json
  {
    "status": "healthy",
    "timestamp": "2026-10-29T10:45:00Z"
  }
  ```

---

## 8. Payload Validation Schema Implementation Example (Zod)

```typescript
import { z } from 'zod';

export const NoteSubmissionSchema = z.object({
  id: z.string().uuid(),
  vitals: z.object({
    bp: z.string().regex(/^\d{2,3}\/\d{2,3}$/).optional(),
    pulse: z.number().min(30).max(250).optional(),
    spo2: z.number().min(50).max(100).optional(),
    tempF: z.number().min(90).max(110).optional(),
  }).default({}),
  clinicalObservations: z.string().min(3, "Observations must be at least 3 characters"),
  diagnosisSummary: z.string().optional(),
  prescription: z.array(z.object({
    drug: z.string().min(1),
    dosage: z.string().min(1),
    duration: z.string().min(1),
    instructions: z.string().min(1),
  })).default([]),
  referralFacility: z.string().optional(),
  followUpDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
});
```
