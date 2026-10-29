# Swasthya Setu --- Problem Statement

**Project:** Swasthya Setu --- Low-Network Telemedicine\
**Challenge:** Innovate Odisha 3.0 --- Swasthya Setu\
**Document:** `ps.md`\
**Status:** Initial problem statement for product planning\
**Version:** 1.0

------------------------------------------------------------------------

## 1. Problem Statement

Patients in rural and remote communities may face difficulty accessing
timely medical consultations because healthcare facilities and
specialists can be far away and internet connectivity may be weak,
intermittent, or unavailable. When telemedicine relies on a stable
connection, video calls can freeze or disconnect. Patient information
stored only online may be inaccessible during outages, and consultation
notes or messages may be lost, delayed, or duplicated when users
reconnect.

These interruptions can make remote consultations harder to complete and
complicate continuity of care for patients and frontline healthcare
workers.

Swasthya Setu proposes an **offline-first, connectivity-adaptive
telemedicine platform** designed to support essential healthcare
workflows under unreliable network conditions. It will adapt media
quality and, when needed, switch from video to audio; make previously
downloaded, authorised patient information available offline; preserve
permitted draft notes and queued messages; and synchronise updates
safely when connectivity returns.

The platform will clearly distinguish offline work from server-confirmed
actions. It will not claim to maintain live communication during a
complete network outage, diagnose patients autonomously, or replace
qualified healthcare professionals.

## 2. Who Experiences the Problem?

-   **Rural patients:** May have difficulty maintaining a remote
    consultation when connectivity is weak.
-   **ASHA and frontline healthcare workers:** May need access to
    previously recorded patient information while visiting communities
    with unreliable internet.
-   **Doctors:** May experience interrupted calls and incomplete or
    delayed information.
-   **Healthcare facilities:** Need reliable records, clear consultation
    status, and safe handling of updates created during outages.

These are target-user assumptions to validate through interviews and
field research, not claims that every rural user experiences the same
barriers.

## 3. Why Existing Approaches May Leave a Gap

Telemedicine platforms and offline health-data tools already exist. The
problem this project will investigate is whether the workflow between
communication, locally available records, unsent updates, and
reconnection can be made simpler and more reliable for its intended
users.

Swasthya Setu should not claim that audio calls, offline storage, or
telemedicine are individually new. Its proposed value is the integration
of these capabilities into a clear, offline-first workflow adapted to
rural healthcare settings.

Before making comparative or novelty claims, the team should review
existing solutions, interview target users, and test the proposed
workflow.

## 4. Proposed Solution

Swasthya Setu will provide:

1.  **Adaptive consultation:** Reduce video quality or switch to
    audio-only mode when network conditions deteriorate.
2.  **Offline patient information:** Make only previously saved,
    authorised records available without a connection.
3.  **Local drafts and queued messages:** Preserve permitted notes and
    messages while offline.
4.  **Reconnection support:** Attempt to restore the call when
    communication becomes available again.
5.  **Safe synchronisation:** Upload queued changes with duplicate
    prevention, error reporting, and conflict handling.
6.  **Odia and English support:** Provide a language choice for core
    screens and messaging.
7.  **Role-based access:** Give healthcare workers, doctors, and
    administrators only the access they need.
8.  **Clear status indicators:** Show whether calls, messages, and
    updates are disconnected, pending, sent, or confirmed.

## 5. Project Objectives

-   Make remote consultations more usable under weak but available
    connectivity.
-   Preserve access to selected patient information that was saved for
    offline use.
-   Reduce loss of locally drafted notes and messages during
    interruptions.
-   Make synchronisation status understandable to users.
-   Support Odia and English in essential workflows.
-   Evaluate reliability using repeatable network tests and usability
    tasks.

## 6. Scope of the Initial Prototype

The initial prototype will use synthetic patient data and demonstrate:

-   Healthcare-worker and doctor interfaces.
-   Basic authentication and role-based permissions.
-   Patient records and consultation requests.
-   Offline access to previously downloaded records.
-   Locally saved notes and queued updates.
-   Visible synchronisation and connection states.
-   An end-to-end consultation workflow.
-   Network-interruption tests.

Real WebRTC audio/video, automatic video-to-audio fallback, and robust
reconnection will be implemented as dedicated milestones. If they are
not ready for the first demo, the team must label any simulated
behaviour clearly rather than presenting it as a working live call.

## 7. Expected Impact

The project aims to:

-   Improve continuity of remote consultation workflows under unstable
    connectivity.
-   Help frontline workers access selected saved information during
    network outages.
-   Reduce unintended loss or duplication of queued information.
-   Make the state of consultations and synchronisation more
    transparent.
-   Improve accessibility for users who prefer Odia.

These are intended outcomes, not proven results. The team will measure
actual call recovery, successful synchronisation, duplicate/conflict
rates, task completion, and user feedback. The project will not claim
reductions in mortality or improvements in diagnostic accuracy without
suitable clinical evidence.

## 8. Constraints and Safety Considerations

-   A live remote call requires a working communication channel.
-   Offline users can access only data previously saved on their device
    and permitted for offline use.
-   Medical data must be protected with appropriate access controls,
    secure transmission, local-data minimisation, and retention rules.
-   Messaging must not be presented as an emergency service or imply
    that a clinician has read a message before confirmation.
-   Clinical decisions must remain with qualified healthcare
    professionals.
-   Any integration with government or third-party health platforms
    requires verified technical access and permission.
-   A real deployment requires appropriate clinical, privacy, consent,
    security, and regulatory review.

## 9. Problem Validation Plan

Before or during development, the team should:

1.  Interview ASHA workers, clinicians, and intended users where access
    and consent are available.
2.  Ask what happens when video calls fail or records are unavailable
    offline.
3.  Understand which patient information frontline workers legitimately
    need during a visit.
4.  Review existing telemedicine and offline health applications.
5.  Test a prototype under throttled bandwidth, packet loss, and
    temporary disconnection.
6.  Record measured results and user feedback.
7.  Refine the MVP based on evidence.

## 10. One-Sentence Summary

**Swasthya Setu is an offline-first telemedicine platform designed to
help rural patients and frontline healthcare workers maintain essential
consultation workflows when internet connectivity is weak or
intermittent, while preserving permitted information and synchronising
updates safely when the connection returns.**
