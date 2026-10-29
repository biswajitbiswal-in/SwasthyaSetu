# Swasthya Setu --- Feature Specification

**Project:** Swasthya Setu --- Low-Network Telemedicine\
**Challenge track:** Innovate Odisha 3.0 --- Swasthya Setu\
**Document:** `feature.md`\
**Status:** Initial product specification --- for planning before
implementation\
**Version:** 1.0

------------------------------------------------------------------------

## 1. Product Overview

Swasthya Setu is a proposed telemedicine web application designed to
help rural patients and frontline healthcare workers maintain a more
reliable healthcare workflow when internet connectivity is weak or
intermittent.

The application will combine: - Adaptive audio/video consultation. -
Offline access to previously downloaded, authorised patient
information. - Locally saved consultation notes and queued messages. -
Reconnection support. - Safe synchronisation when connectivity
returns. - Odia and English interface and messaging. - Role-based
interfaces for healthcare workers, doctors, and administrators.

**Core promise:** Keep essential healthcare tasks and permitted
information available during connectivity interruptions, and recover
safely when the connection returns.

This document describes intended functionality. It does not claim that
the system has already been built, clinically validated, or integrated
with government healthcare platforms.

## 2. Problem Statement

People in remote and rural areas may experience unreliable internet
access. This can make video consultations difficult, prevent access to
records stored only online, interrupt messages, and complicate recovery
after a dropped call.

Swasthya Setu will address these workflow problems. It cannot create
connectivity where none exists: a live remote consultation requires an
available communication channel, and offline access is limited to
information that was previously saved on the device.

## 3. Target Users and Roles

### 3.1 Healthcare Worker / ASHA Worker

-   Register or locate a patient, subject to permissions.
-   View authorised, previously downloaded patient information.
-   Prepare a consultation request.
-   Save permitted visit notes offline.
-   Queue messages and updates for synchronisation.
-   View sync status and pending follow-up tasks.

### 3.2 Doctor

-   View assigned consultation requests.
-   Access patient information authorised for that consultation.
-   Conduct an audio/video consultation when connectivity allows.
-   Record consultation notes and next steps.
-   Review messages and consultation status.

### 3.3 Administrator

-   Manage authorised user accounts and roles.
-   Review operational status and audit events.
-   Configure approved application settings.
-   Avoid unnecessary access to clinical details; access should follow
    least-privilege rules.

### 3.4 Patient

The initial prototype may represent patients through the
healthcare-worker workflow rather than requiring patients to create
their own accounts. A patient-facing account can be considered later.

## 4. Core Features

### F1 --- Adaptive Video-to-Audio Consultation

**Problem:** Video may become unusable when bandwidth is limited.

**Expected behaviour:** 1. Start a video consultation when supported by
the connection and the users' devices. 2. Monitor WebRTC connection
statistics and state. 3. Reduce video quality or frame rate when
conditions deteriorate. 4. Switch to audio-only mode when video cannot
be sustained reliably. 5. Offer or perform a return to video when the
connection improves, with clear status feedback. 6. Show the current
connection state to both users.

**Implementation notes:** - Use WebRTC for real-time media. - Provide a
signalling service for call setup and session coordination. - Configure
STUN/TURN infrastructure as needed for real-world networks. - Choose
thresholds through testing; do not assume one threshold works for every
network. - Provide a manual audio-only option. - Never imply that a call
continues when no communication path exists.

**Acceptance criteria:** - Users can start and end a test call on a
supported network. - Simulated deterioration triggers the expected
quality adaptation or audio fallback. - The UI clearly identifies video,
audio-only, reconnecting, and disconnected states. - Users can manually
choose audio-only mode.

### F2 --- Offline Patient Records

**Problem:** Online-only records are inaccessible when a device has no
connection.

**Expected behaviour:** 1. An authorised user can explicitly download or
cache the minimum necessary patient information while online. 2.
Previously saved records remain viewable offline by an authorised user.
3. The user can draft permitted notes offline. 4. Unsynchronised changes
are visibly marked as pending. 5. Records that were never downloaded are
not falsely shown as available offline.

**Suggested data for the prototype:** - Internal patient identifier. -
Basic profile details needed for care. - Relevant medical history. -
Allergies and medications recorded by a clinician. - Previous
consultation summaries. - Referral and follow-up status.

**Implementation notes:** - Use IndexedDB for structured offline data. -
A service worker may cache the application shell, but it does not itself
provide offline server access or live calls. - Minimise data stored on
devices. - Protect local data and restrict access on shared devices. -
Plan for session expiry, device loss, record expiry, and access
revocation. - Use synthetic patient data during development and
demonstrations.

**Acceptance criteria:** - A previously downloaded test record opens
after the device goes offline. - A record not downloaded earlier is
clearly unavailable offline. - Unauthorised users cannot open protected
records. - The UI distinguishes saved records from unsynchronised edits.

### F3 --- Local Notes and Safe Synchronisation

**Problem:** Notes may be lost or duplicated when a connection drops or
a retry occurs.

**Expected behaviour:** 1. Save drafts locally as the user works. 2.
Queue permitted updates while offline. 3. Synchronise queued updates
when connectivity returns. 4. Show pending, syncing, synced, and failed
states. 5. Retry transient failures safely. 6. Detect conflicts rather
than silently overwriting newer clinical information. 7. Avoid duplicate
records when an operation is retried.

**Implementation notes:** - Use unique operation IDs or idempotency
keys. - Store timestamps and record versions where appropriate. - Define
a conflict-resolution policy; clinical notes should not be silently
merged or overwritten. - Keep a visible error and retry path for failed
synchronisation.

**Acceptance criteria:** - A draft remains after refreshing or reopening
the application, within supported browser storage limits. - A queued
update synchronises after reconnection. - Repeating the same sync
request does not create duplicate records. - Failed synchronisation is
visible and can be retried.

### F4 --- Reconnection and Consultation Recovery

**Problem:** Temporary network loss interrupts a live consultation.

**Expected behaviour:** 1. Detect a failed or disconnected media
connection. 2. Display a clear status, such as "Connection lost ---
trying to reconnect." 3. Retry connection setup with bounded retries and
increasing delays. 4. Preserve locally saved notes and unsent messages.
5. Allow manual retry or ending the session. 6. Resume media only after
the connection is genuinely restored.

**Limitations:** - A live conversation cannot continue during a complete
loss of all communication channels. - Reconnection is best-effort and
cannot be guaranteed. - Resuming an old session may require a fresh
signalling exchange or a new call session.

**Acceptance criteria:** - The UI reflects disconnected and reconnecting
states correctly. - The system does not display a false "connected"
status. - Saved drafts survive a temporary disconnect. - A user can
manually retry or end the call.

### F5 --- Odia and English Interface and Messaging

**Problem:** Some users prefer Odia, and messages can be interrupted by
poor connectivity.

**Expected behaviour:** 1. Provide an Odia/English language selector for
supported UI text. 2. Allow users to compose messages in either
language. 3. Save queued messages locally while offline. 4. Send queued
messages when connectivity returns. 5. Show accurate pending, sent, and
delivered states. 6. Keep the original text visible if translation is
added in a future version.

**Safety requirements:** - Do not represent a queued message as
delivered. - Do not use unreviewed machine translation as a clinically
authoritative instruction. - Make clear that messaging is not an
emergency service and may not be read immediately.

**Acceptance criteria:** - Users can switch between Odia and English for
implemented screens. - A message created offline remains queued after
navigating away or refreshing, within browser storage limits. - The
message is marked delivered only after delivery is confirmed by the
server or recipient workflow.

### F6 --- Role-Based Dashboards and Authentication

**Problem:** Different users need different actions and must not access
information beyond their role.

**Expected behaviour:** - Healthcare workers can manage permitted
patient and visit workflows. - Doctors can access assigned consultation
requests and authorised records. - Administrators can manage accounts
and operational settings. - Unauthenticated users cannot access
protected screens or APIs. - Role permissions are enforced on the
backend, not only by hiding frontend buttons. - Sensitive actions are
logged in an audit trail.

**Acceptance criteria:** - Login and logout work. - Protected pages
require authentication. - Backend endpoints reject unauthorised roles. -
A user cannot gain privileges by changing client-side state or request
parameters.

### F7 --- Synchronisation Status Dashboard

**Problem:** Users need to know whether offline changes have reached the
server.

**Expected behaviour:** - Show the number of pending operations. -
Display the last successful sync time. - Show syncing, synced, and
failed states. - Provide a safe retry option for failed items. - Explain
when an item cannot be synchronised. - Avoid displaying unnecessary
patient details on a shared or unlocked screen.

**Acceptance criteria:** - Pending items are visible while offline. -
The status updates after a successful or failed sync attempt. - Retry
does not create duplicate records.

### F8 --- Consultation Workflow

**Expected behaviour:** 1. A healthcare worker selects a patient. 2. The
application displays available saved information and its freshness. 3.
The worker requests or schedules a consultation. 4. The doctor accepts
the request when available. 5. The call starts if a communication
channel is available. 6. Notes and the outcome are saved. 7. Follow-up
or referral information can be recorded. 8. The consultation status is
updated and synchronised.

**Suggested statuses:** Draft, Requested, Accepted, In Progress,
Interrupted, Completed, Cancelled.

Do not mark a consultation completed merely because the browser closed
or a call disconnected.

## 5. Primary User Journey

1.  A healthcare worker signs in.
2.  The worker opens a patient record previously saved for authorised
    offline access.
3.  The worker prepares the consultation request and records any
    permitted notes.
4.  When online, the worker connects the patient to an available doctor.
5.  The application starts video if conditions support it.
6.  If bandwidth degrades, the application reduces video quality or
    switches to audio-only mode.
7.  If the connection is lost, the UI shows the interruption and locally
    saved notes remain available.
8.  The application attempts reconnection when possible.
9.  Queued notes and messages synchronise after connectivity returns.
10. The worker checks the final sync and consultation status.

## 6. MVP Scope

### Include in the first usable prototype

-   Responsive healthcare-worker and doctor interfaces.
-   Login and basic role-based access.
-   Synthetic patient profiles and consultation history.
-   Explicitly saved offline records.
-   Locally saved draft notes.
-   Sync queue and clear status indicators.
-   Odia/English UI for core screens.
-   A working end-to-end consultation workflow.
-   Poor-network testing, initially using simulated connection states if
    real WebRTC is not ready.

### Add after the foundation works

-   Real WebRTC calls.
-   Automatic video-quality adaptation and audio fallback.
-   Robust reconnection and TURN configuration.
-   Secure production-grade offline storage and device-management
    controls.
-   Notifications for follow-up tasks.
-   Integrations with external health systems, only if authorised APIs
    and permissions are available.

### Out of scope for the initial MVP

-   Autonomous AI diagnosis.
-   Replacing clinicians or approved clinical protocols.
-   Inventing or claiming a new diagnostic test.
-   Claiming government-system integration without verified access.
-   Guaranteeing calls will continue without any network connection.
-   Using real patient data in a public demo.

## 7. Non-Functional Requirements

### Security and privacy

-   Use HTTPS in deployed environments.
-   Enforce authentication and authorisation on the server.
-   Apply least-privilege access.
-   Minimise offline patient data and define retention/expiry rules.
-   Protect sensitive data at rest and in transit.
-   Avoid storing secrets in frontend code.
-   Keep appropriate audit logs.
-   Use synthetic data for development and public demonstrations.
-   Review applicable Indian healthcare, privacy, consent, and
    data-retention requirements before any real deployment.

### Reliability

-   Save drafts frequently.
-   Make sync retries safe and idempotent.
-   Display errors clearly.
-   Do not silently discard unsynchronised information.
-   Handle expired sessions and limited browser storage gracefully.

### Accessibility and usability

-   Design mobile-first for low-cost smartphones.
-   Use clear, readable text and large touch targets.
-   Make connection and sync states easy to understand.
-   Support Odia and English in core workflows.
-   Avoid relying on colour alone to convey status.

### Performance

-   Keep the initial application shell lightweight.
-   Avoid downloading large files unnecessarily.
-   Let users know when a record is stale or unavailable offline.
-   Measure behaviour under throttled bandwidth and packet loss.

## 8. Suggested Data Entities

The backend may use entities such as: - `User`: identity, role, account
status. - `Patient`: internal ID and minimum required profile
information. - `PatientRecord`: authorised medical summary and
version. - `Consultation`: patient, assigned clinician, status,
timestamps. - `ConsultationNote`: author, content, creation time,
sync/version metadata. - `Message`: sender, recipient, language,
delivery state. - `SyncOperation`: unique operation ID, type, status,
retry count, timestamps. - `Referral`: destination, reason as entered by
an authorised clinician, status, follow-up date. - `AuditEvent`: actor,
action, timestamp, and relevant non-sensitive metadata.

Final schemas must be designed with appropriate access controls and
data-minimisation rules.

## 9. Testing and Impact Measurement

Test using synthetic data and controlled network conditions.

  -----------------------------------------------------------------------
  Test area                           Measure
  ----------------------------------- -----------------------------------
  Video/audio                         Whether media starts and the
                                      selected mode works

  Weak bandwidth                      Whether video quality adapts or
                                      audio fallback works

  Packet loss                         Whether the application responds
                                      appropriately

  Temporary disconnect                Time and success rate of
                                      reconnection attempts

  Offline access                      Whether previously downloaded
                                      records remain available

  Synchronisation                     Successful sync rate and
                                      duplicate/conflict count

  Messaging                           Correct pending, sent, and
                                      delivered states

  Language                            Completion and error rates for Odia
                                      and English tasks

  Security                            Unauthorised access attempts
                                      rejected by the backend
  -----------------------------------------------------------------------

Record actual results. Do not claim reduced mortality, improved
diagnostic accuracy, or specific performance percentages without
appropriate evidence.

## 10. Risks and Mitigations

  -----------------------------------------------------------------------
  Risk                                Mitigation
  ----------------------------------- -----------------------------------
  Complete network outage             Preserve permitted offline work;
                                      clearly state live communication is
                                      unavailable

  Sensitive data on a lost device     Minimise cached data, protect
                                      device access, define expiry and
                                      revocation procedures

  Duplicate sync requests             Use unique operation IDs and
                                      idempotent APIs

  Conflicting clinical notes          Preserve versions and require
                                      explicit conflict resolution

  Incorrect delivery status           Confirm status from the server or
                                      recipient workflow

  Poor translation                    Keep original text and require
                                      review for clinical instructions

  False sense of clinical urgency     Clearly state messaging is not an
  handling                            emergency service

  External platform integration       Keep the prototype independent
  unavailable                         until authorised integration access
                                      is confirmed
  -----------------------------------------------------------------------

## 11. Definition of Done for the First Demonstration

The first end-to-end demonstration is ready when: - A user can sign in
with a defined role. - A synthetic patient record can be saved for
offline access. - The saved record remains viewable after disconnecting
the network. - A draft note can be saved while offline. - The
application visibly queues a permitted update. - After reconnection, the
update synchronises without unintended duplication. - The UI accurately
reports sync and connection status. - The team can demonstrate the
workflow under controlled network conditions.

Real audio/video fallback should be considered a separate milestone if
it is not yet implemented.

## 12. Recommended Build Order

1.  Finalise user flows and mobile-first screen design.
2.  Build the React application shell and role-specific dashboards.
3.  Add authentication and backend authorisation.
4.  Add synthetic patient records and consultation workflow.
5.  Add offline records and local draft notes.
6.  Add the sync queue, idempotency, and conflict handling.
7.  Add Odia/English interface and queued messaging.
8.  Implement WebRTC signalling and real audio/video.
9.  Add quality adaptation, audio fallback, and reconnection.
10. Test security, poor-network scenarios, data integrity, and
    usability.

------------------------------------------------------------------------

**Product principle:** Offline-first does not mean "everything works
offline." It means the application clearly separates what can be done
locally, what requires a connection, what is waiting to sync, and what
has been confirmed by the server.
