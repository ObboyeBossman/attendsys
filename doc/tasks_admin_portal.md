# Attendsys — Phase 2: Admin Portal Tasks
## Complete Task List (2.1 – 2.33)

> **Phase:** Phase 2 — Admin Portal
> **Status:** In progress
> **Scope:** All admin portal UI rebuilds and SFR feature implementations, in chronological build order.
>
> Tasks are ordered so that each one builds cleanly on what came before.
> Do not reorder or skip tasks — dependencies run top to bottom.

---

## UI Rebuild Tasks (2.1 – 2.13)

These tasks rebuild the existing admin portal pages to match the design system defined in `.agents/AGENTS.md`.

---

### 2.1 — Admin UI rebuild — dashboard

**Target route:** `/admin/dashboard`

**What this means**
Rebuild the admin dashboard page to match the design system. The dashboard is the first screen the admin sees after login. It must immediately communicate system health, live activity, and anything requiring attention.

**What to build**
- Live sessions panel (real-time via Supabase Realtime): shows all open `class_sessions`, course name, group, lecturer, elapsed time, check-in count vs group size
- System health cards: active semester, current academic year, total active students, total active lecturers, sessions today, pending disputes
- Recent audit events: last 10 rows from `audit_log`
- Alerts: semesters that should have opened, sessions running longer than 4 hours

**Done when**
The dashboard renders all four sections correctly. Live sessions update without a page refresh. Alerts surface the correct conditions. The page passes design system audit (typography, spacing, colour, states).

---

### 2.2 — Admin UI rebuild — institution pages

**Target routes:** `/admin/institution/faculties`, `/departments`, `/programmes`, `/qualification-types`, `/levels`

**What this means**
Rebuild the institution skeleton management pages. These pages handle the hierarchy: faculty → department → programme → qualification type → level.

**What to build**
Full CRUD UI for each entity in the hierarchy. Each page follows the same pattern: list view, create form, edit form, delete with RESTRICT guard. Levels page must make `sort_order` visually prominent — it drives the student promotion sequence.

**Done when**
All five institution pages render and operate correctly. Create, edit, and delete work for each entity. Delete is blocked with a plain-English message when child records exist. Design system audit passes.

---

### 2.3 — Admin UI rebuild — academic years and semesters

**Target routes:** `/admin/academic-years`, `/admin/academic-years/[yearId]`, `/admin/semesters`

**What this means**
Rebuild the academic years and semesters management pages. These pages control the institution's time structure.

**What to build**
- Academic years list with current year badge. Create/edit form. "Set as Current" button calling `open_academic_year()` server action.
- Year detail page: semesters for this year, groups for this year, link to promotion flow.
- Semesters list with open/close controls calling `open_semester()` and `close_semester()` server actions. Auto-open toggle.

**Done when**
Academic year and semester pages render and operate correctly. RPC calls are server-side only. Semester status is clearly communicated. Design system audit passes.

---

### 2.4 — Admin UI rebuild — groups

**Target routes:** `/admin/groups`, `/admin/groups/[groupId]`

**What this means**
Rebuild the groups management pages. Groups are the core organisational unit — they link students, courses, reps, and attendance sessions.

**What to build**
- Groups list: filterable by academic year, level, qualification type. Shows student count, active rep.
- Group detail: student roster, course list, rep assignment, archive controls. Group password reset via server action.
- Student removal: `UPDATE group_memberships.status = 'removed'` — never DELETE.
- Rep assignment: single-select from active students in the group. Clears existing rep first.

**Done when**
Group list and detail pages are functional. Rep assignment, student removal, course management, and archive controls work correctly. Design system audit passes.

---

### 2.5 — Admin UI rebuild — users

**Target routes:** `/admin/users/students`, `/admin/users/lecturers`

**What this means**
Rebuild the users management pages. The admin manages all student and lecturer accounts from here.

**What to build**
- Students list: search, filter by group. Show index number, name, email, group, active status.
- Lecturers list: show name, staff ID, email, course count, active status. Create, edit, deactivate, reactivate, reset password.
- Lecturer creation is a two-step server action (Auth admin API + INSERT `lecturers`) with cleanup on partial failure.

**Done when**
Both user pages render and operate correctly. Lecturer create/edit/deactivate/reactivate/reset-password flows all work. Partial failure on lecturer creation is handled with cleanup. Design system audit passes.

---

### 2.6 — Admin UI rebuild — courses

**Target route:** `/admin/courses`, `/admin/courses/[courseId]`

**What this means**
Rebuild the courses management pages. The admin has a system-wide view of all courses and can assign or reassign lecturers.

**What to build**
- Courses list: filterable by group, semester, lecturer, academic year. Shows name, code, group, semester, lecturer, session count, average attendance rate.
- Course detail: lecturer assignment/reassignment. No create or delete from this view.

**Done when**
Courses list and detail render correctly. Lecturer assignment works. Filters function. Design system audit passes.

---

### 2.7 — Admin UI rebuild — audit log

**Target route:** `/admin/audit`

**What this means**
Rebuild the audit log viewer. This is a read-only table of every significant action taken in the system.

**What to build**
- Paginated table (50 rows/page) of `audit_log` rows, ordered by `created_at DESC`.
- Columns: timestamp, actor (email from `user_profiles`), action, table name, record ID, old/new data diff.
- Filters: action type, actor, table name, date range.
- JSONB old/new data rendered as a formatted diff with changed keys highlighted.
- No write access to the audit log — read-only for everyone.

**Done when**
Audit log renders with pagination and all filters working. JSONB diff is readable. No write path exists. Design system audit passes.

---

### 2.8 — Admin UI rebuild — settings

**Target route:** `/admin/settings`

**What this means**
Rebuild the system settings page. The admin can view and edit all `system_settings` key-value pairs from here.

**What to build**
- List all settings rows: key, value, description, last updated.
- Inline edit: click a value to edit it in place. Save triggers a server action.
- Input validation per setting type (positive integers, domain format).
- Warning for `institution_email_domain` change.

**Done when**
Settings page renders all rows. Inline edit works. Validation fires before save. Warning for domain change is shown. Design system audit passes.

---

### 2.9 — Admin UI rebuild — profile

**Target route:** `/admin/profile`

**What this means**
Rebuild the admin's own profile page.

**What to build**
- Display name and email (from `super_admins` and `user_profiles`).
- Editable: name field (`super_admins.name`).
- Change password form.
- No phone or avatar — the super admin identity is minimal by design.

**Done when**
Profile page renders. Name edit and password change both work. Design system audit passes.

---

### 2.10 — Admin portal: active session management

**Target route:** `/admin/settings` → Security tab

**What this means**
The admin needs visibility and control over all active sessions on their own account — especially if they log in from multiple devices.

**What to build**
Inside Account Settings → Security tab, render an active sessions panel:
- List all active sessions: device/browser name, last-seen timestamp, IP address
- Revoke button per session (ends that session immediately)
- "Sign out all other devices" button at the bottom
- Current session is labelled and cannot be revoked from this screen

**Done when**
Sessions panel renders under Security tab. Revoke and sign-out-all actions work via server actions. Current session is clearly labelled and protected. Design system audit passes.

**Implementation notes**
- Use `supabase.auth.admin.listUserSessions()` to retrieve sessions
- Implement alongside the admin settings UI rebuild (task 2.8)

---

### 2.11 — Admin portal: account unlock UI

**Target route:** `/admin/users`

**What this means**
The database already tracks failed login attempts and locks accounts after 10 consecutive failures for 30 minutes. This task surfaces locked accounts in the UI and gives the admin a one-click way to unlock them.

**What to build**
- Visual flag (badge or warning) on user cards where `locked_until IS NOT NULL AND locked_until > now()`
- Unlock button that calls a server action: `SET failed_login_count = 0, locked_until = NULL`
- Confirmation dialog before unlock

**Done when**
Locked accounts are visually flagged on student and lecturer user pages. The admin can unlock with a single confirmed action. The unlocked account regains portal access immediately. Design system audit passes.

---

### 2.12 — Admin portal: remove bottom navigation bar

**Target:** Admin portal layout

**What this means**
The admin portal is a desktop-first management interface. The floating pill bottom nav is a mobile pattern designed for the student and rep portals — it does not belong in the admin layout.

**What to build**
Remove the `BottomNav` component from the admin layout entirely. The admin navigates exclusively via the desktop sidebar.

**Done when**
No bottom navigation bar renders in any admin portal route. Sidebar is the sole navigation mechanism. No layout shift or spacing issues after removal. Design system audit passes.

---

### 2.13 — Admin portal: restructure sidebar navigation

**Target:** Admin sidebar component

**What this means**
As the admin portal grows, the sidebar needs to be structured to accommodate all sections cleanly — including the new sections being added in tasks 2.14–2.33.

**What to build**
Reorganise the sidebar into logical grouped sections with section labels:
- **Overview:** Dashboard
- **Academic:** Academic Years, Semesters, Groups, Courses, Timetable, Calendar
- **Users:** Students, Lecturers
- **Attendance:** Attendance Records, Live Monitor, Eligibility
- **Reports:** Attendance Reports, Compliance, Export Centre
- **Communications:** Notifications, Announcements, Notice Board
- **System:** Error Logs, Storage, Backup, Settings
- **Account:** Profile, Security

**Done when**
Sidebar renders all grouped sections with section labels. All existing routes are reachable. Active state is correct for each route. Sidebar collapses correctly on mobile. Design system audit passes.

---

## SFR Feature Tasks (2.14 – 2.33)

These tasks implement selected Suggested Future Requirements for the admin portal.
They are ordered so that each feature builds on the infrastructure laid down by the tasks before it.

---

### 2.14 — Admin portal: roles and permissions management

**Target route:** `/admin/settings/access`
**SFR reference:** SFR-ADMIN-10
**Priority:** High

**What this means**
Right now, what each role can see and do in the system is hardcoded in the application logic. There is no way for an admin to adjust permissions without a developer making a code change and redeploying. This task builds a permissions management UI so that the super admin can view and configure role-based access controls directly from the portal.

**Problem it solves**
Institutions differ in how they want to structure access. One institution may want course reps to view attendance reports; another may not. Without a configurable permissions layer, every such customisation requires a code change. This task removes that dependency.

**Done when**
A dedicated Access Control page exists under Admin → Settings. It lists all roles (super_admin, admin, lecturer, rep, student) and their associated permission toggles per feature area. The super admin can enable or disable specific capabilities per role and save changes. Permission changes take effect without a deployment. All permission changes are recorded in the audit log.

---

### 2.15 — Admin portal: academic calendar management

**Target route:** `/admin/calendar`
**SFR reference:** SFR-ADMIN-08
**Priority:** Medium

**What this means**
The system currently has no concept of an academic calendar. There is no way to define when semesters start and end, when public holidays fall, or when exam periods are active. This task adds that foundation so that the rest of the system can operate within defined academic boundaries.

**Problem it solves**
Without a calendar, features like the timetable, the graduation eligibility checker, and session scheduling have no reference point for what is a valid teaching day, a holiday, or an exam period. Admins have to manage this mentally rather than letting the system enforce it.

**Done when**
A dedicated Academic Calendar page exists under Admin → Calendar. Admins can create and edit semesters with start and end dates, mark public holidays, define exam periods, and set semester breaks. All defined periods are stored in the database and exposed to other features (timetable, eligibility checker) as a readable data source. Changes are reflected immediately across the system.

---

### 2.16 — Admin portal: timetable management

**Target route:** `/admin/timetable`
**SFR reference:** SFR-ADMIN-01
**Priority:** High
**Depends on:** 2.15 (academic calendar)

**What this means**
Course reps can already view the timetable in their portal, but nothing in the system currently writes timetable data from a UI. Timetable entries have to be inserted directly into the database. This task builds the admin-side UI to create, edit, and delete timetable slots for groups and courses.

**Problem it solves**
Without a timetable management UI, every schedule change requires a direct database operation, which is error-prone and inaccessible to non-technical admins. Reps see stale or missing data when the timetable is not kept up to date.

**Done when**
A Timetable page exists under Admin → Timetable. Admins can create new timetable slots by selecting a group, course, day of week, start time, and end time. Existing slots can be edited or deleted. All changes are immediately reflected in the course rep timetable view. Slot dates are validated against defined semester periods from the academic calendar (task 2.15).

---

### 2.17 — Admin portal: bulk operations

**Target route:** `/admin/users` (bulk actions panel)
**SFR reference:** SFR-ADMIN-11
**Priority:** Medium

**What this means**
Currently, students and users can only be added to the system one at a time. At the start of each semester, admins need to onboard potentially hundreds of new students, assign them to groups, and set initial passwords. Doing this individually is not practical at scale.

**Problem it solves**
Manual one-by-one user creation creates a significant bottleneck at semester start. Admins spend hours on data entry that should take minutes. Without bulk group assignment, newly created students also have to be assigned to their groups individually.

**Done when**
The Users page has a bulk import option that accepts a CSV file with student name, ID, email, and programme. The system validates the CSV, previews the rows to be created, and imports on confirmation. A bulk group assignment UI allows selecting multiple students and assigning them to a group in one action. A bulk password reset option sends reset emails to a selection of users simultaneously. Import errors (duplicate IDs, missing fields) are reported clearly per row.

---

### 2.18 — Admin portal: account deactivation workflows

**Target route:** `/admin/users` → user profile page
**SFR reference:** SFR-ADMIN-14
**Priority:** Medium

**What this means**
When a student withdraws or a lecturer's contract ends, their account needs to be deactivated in a clean, auditable way — not just deleted. Right now there is no structured workflow for this.

**Problem it solves**
Without a deactivation workflow, departed users may retain portal access longer than they should. Historical records (attendance, sessions) should be preserved even after an account is deactivated. There is also no audit trail showing who deactivated an account and when.

**Done when**
An admin can trigger a deactivation workflow from any user's profile page. The workflow shows a confirmation dialog summarising what will happen: access revoked, account marked inactive, records archived but not deleted. The action is logged in the audit trail with admin identity, timestamp, and optional reason. Deactivated users cannot log in. Historical data remains visible in reports.

---

### 2.19 — Admin portal: student ID card generation

**Target route:** `/admin/users/students/[studentId]`
**SFR reference:** SFR-ADMIN-12
**Priority:** Low

**What this means**
Admins currently have no way to produce a student ID card from within the system. Cards have to be created separately using external tools.

**Problem it solves**
Generating ID cards outside the system means manually copying student data into another tool, which is slow and error-prone. Having this built into the system means any admin can produce a card on demand without leaving the portal.

**Done when**
A "Generate ID Card" button exists on each student's profile page. Clicking it generates a downloadable PDF containing the student's name, student ID number, programme, and group. The card is formatted to a standard ID card layout and can be printed directly or saved. No external tool or manual data entry is required.

---

### 2.20 — Admin portal: excused absence status

**Target route:** `/admin/attendance`
**SFR reference:** SFR-ADMIN-06
**Priority:** Medium

**What this means**
Attendance records currently support three statuses: present, late, and absent. There is no way to mark a student as excused for legitimate reasons such as medical appointments or official university commitments.

**Problem it solves**
Without an excused status, a student who misses class for a legitimate reason is recorded the same way as one who skipped without cause. This distorts attendance reports and can unfairly affect a student's graduation eligibility. Institutions require this distinction for accurate and fair record-keeping.

**Done when**
Attendance records in the admin portal have an "Excused" status option alongside present, late, and absent. An admin can update any absent record to excused, providing a reason (medical, official university activity, bereavement, other). The reason is stored with the record. Excused absences are treated separately from unexcused absences in reports and in the graduation eligibility checker (task 2.21). The change is recorded in the audit log.

---

### 2.21 — Admin portal: graduation eligibility checker

**Target route:** `/admin/reports/eligibility`
**SFR reference:** SFR-ADMIN-09
**Priority:** Medium
**Depends on:** 2.15 (academic calendar), 2.20 (excused absence status)

**What this means**
There is currently no automated way to identify students who are at risk of failing to meet the minimum attendance required to sit exams or graduate. Admins have to manually check records course by course and student by student.

**Problem it solves**
Catching students who are below the attendance threshold late in the semester means there is little time to intervene. An automated checker gives admins and students early warning so corrective action can be taken in time.

**Done when**
An Eligibility Checker page exists under Admin → Reports. It lists all students with their current attendance percentage per course and a clear indicator (green/red) of whether they meet the minimum threshold. Students below the threshold are flagged. The checker accounts for excused absences (task 2.20) — excused absences do not count against attendance percentage. The report is filterable by group, course, and semester. Data comes from the academic calendar (task 2.15) to determine which sessions fall within the active semester.

---

### 2.22 — Admin portal: live session monitor

**Target route:** `/admin/dashboard` (Live tab or section)
**SFR reference:** SFR-ADMIN-35
**Priority:** High

**What this means**
Admins currently have no real-time visibility into what is happening across the institution while attendance sessions are running. They cannot see which lecturers have opened sessions, how many students have checked in, or whether any group has an unusually low check-in rate.

**Problem it solves**
Without live visibility, admins only find out about problems after the fact — a session that ran with no check-ins, a group never marked, a lecturer who forgot to open a session. A live monitor allows admins to catch and intervene in real time.

**Done when**
The admin dashboard has a Live tab or section showing all currently active attendance sessions across the institution. Each entry shows: lecturer name, course and group, session open time, and check-in count vs total expected. Sessions with unusually low check-in rates are visually highlighted. The view updates automatically without a page refresh (Supabase Realtime). Admins can click into a session for more detail. Ended sessions move to history and do not appear in the live view.

---

### 2.23 — Admin portal: attendance reports and export

**Target route:** `/admin/reports`
**SFR reference:** SFR-ADMIN-02
**Priority:** Medium
**Depends on:** 2.20 (excused absence status)

**What this means**
Attendance data is captured and stored but there is no way to get it out in a usable format. Admins cannot produce a report for a department head or faculty board without manually exporting raw data and formatting it externally.

**Problem it solves**
Institutional reporting requires attendance summaries at regular intervals — end of semester, mid-semester reviews, accreditation audits. Without a built-in report generator, every report requires manual work and is prone to errors.

**Done when**
An Attendance Reports page exists under Admin → Reports. Admins can filter by group, course, and semester to generate an attendance summary. The report shows each student's attendance count (present, late, absent, excused) and overall attendance percentage. The report can be downloaded as CSV or PDF. The generated PDF is formatted cleanly for institutional submission.

---

### 2.24 — Admin portal: data export centre

**Target route:** `/admin/exports`
**SFR reference:** SFR-ADMIN-33
**Priority:** Medium
**Depends on:** 2.23 (attendance reports)

**What this means**
Task 2.23 adds attendance report exports. This task generalises that capability into a central Data Export Centre where admins can export any major dataset — not just attendance — from one place.

**Problem it solves**
Without a central export centre, admins who need data for external tools have to find exports scattered across different pages. A single export hub reduces friction and makes the system self-sufficient for data access needs.

**Done when**
A Data Export Centre page exists under Admin → Exports. It lists all available exportable datasets: students, lecturers, groups, courses, attendance records, sessions, and audit logs. Each dataset shows available format options (CSV, Excel, PDF where applicable). Admins can apply filters (date range, group, course, semester) before exporting. Exports are generated server-side and downloaded directly. Large exports display a progress indicator. All export actions are logged in the audit trail.

---

### 2.25 — Admin portal: error and activity logs

**Target route:** `/admin/system/logs`
**SFR reference:** SFR-ADMIN-21
**Priority:** Medium

**What this means**
The existing audit log records user actions. This task adds a different kind of log — system-level errors, failed jobs, and background activity. When something goes wrong under the hood (a failed email send, a broken cron job, an unhandled API error), there is currently nowhere in the portal to see it.

**Problem it solves**
Without a system log, diagnosing production problems requires accessing server logs or third-party monitoring tools that a non-technical admin would not have access to. Surfacing system-level errors in the portal means issues can be spotted and escalated without developer involvement.

**Done when**
An Error and Activity Logs page exists under Admin → System. It shows a chronological list of system events: unhandled errors, failed background jobs, slow queries, and internal warnings. Each entry includes timestamp, error type, affected component, and a short description. Logs are filterable by severity (error, warning, info) and by date range. Admins can clear resolved entries. This log is separate from the user-facing audit log.

---

### 2.26 — Admin portal: data retention policies

**Target route:** `/admin/system/settings` (Retention section)
**SFR reference:** SFR-ADMIN-22
**Priority:** Medium
**Depends on:** 2.25 (error and activity logs)

**What this means**
The system currently retains all data indefinitely. There is no policy governing how long attendance records, audit logs, session data, or selfie photos are kept. Over time this leads to uncontrolled database and storage growth, and may conflict with the institution's data governance requirements.

**Problem it solves**
Institutions are typically required to define and enforce data retention policies. Without a built-in retention configuration, complying with these policies requires manual database operations.

**Done when**
A Data Retention settings section exists under Admin → System → Settings. Admins can define retention periods for each data category: attendance records, audit logs, system logs, session selfies, and exported files. Options are expressed in months or years. A scheduled background job runs nightly to archive or delete data that has exceeded its retention period. The admin can view what is scheduled for deletion and manually trigger a retention sweep. All retention rule changes are logged in the audit trail.

---

### 2.27 — Admin portal: storage management

**Target route:** `/admin/system/storage`
**SFR reference:** SFR-ADMIN-28
**Priority:** Medium

**What this means**
The system stores files in Cloudflare R2 — primarily selfie photos captured during student check-ins, plus generated exports and backups. There is currently no visibility into how much storage is being used, how it breaks down by category, or whether there are orphaned files.

**Problem it solves**
Unchecked file storage grows silently and can lead to unexpected costs or service disruption. Orphaned files from old sessions or deactivated accounts consume storage without serving any purpose.

**Done when**
A Storage Management page exists under Admin → System. It shows total storage used broken down by category: selfie photos, generated exports, and backups. Files can be browsed with file size, creation date, and associated record. The system flags orphaned files — those with no associated database record. Admins can delete individual files or run a bulk cleanup of all orphaned files.

---

### 2.28 — Admin portal: database backup and restore

**Target route:** `/admin/system/backup`
**SFR reference:** SFR-ADMIN-19
**Priority:** High

**What this means**
There is currently no admin-facing interface for database backups. If data is lost or corrupted, recovery would require direct Supabase access or developer intervention. This task adds a backup and restore UI so admins can manage database snapshots without needing technical access.

**Problem it solves**
For a system handling academic records, data loss is a serious risk. Relying entirely on Supabase's automatic backups without any admin visibility or control means that in a recovery scenario, the admin has no self-service option.

**Done when**
A Backup and Restore page exists under Admin → System. It shows a list of existing database snapshots with date, size, and status. Admins can trigger a manual backup on demand and configure scheduled automatic backups. A snapshot can be downloaded. A restore flow allows selecting a snapshot and initiating a restore, with a clear warning and confirmation step before any data is overwritten. Uses the Supabase Management API. All backup and restore actions are logged in the audit trail.

---

### 2.29 — Admin portal: backup and disaster recovery runbooks

**Target:** `docs/runbooks/` in the repository
**SFR reference:** SFR-ADMIN-03
**Priority:** Low
**Depends on:** 2.28 (database backup and restore)

**What this means**
This is a documentation task, not a UI task. Even with a backup and restore system in place, there needs to be a written runbook describing exactly what to do in an emergency — who is responsible, what the steps are, how long recovery should take, and how to verify that a restore was successful.

**Problem it solves**
In a real disaster scenario, people are under pressure and may not remember steps they have never practised. A runbook ensures that recovery is predictable and does not depend on any single person's knowledge.

**Done when**
Runbooks are written and stored in `docs/runbooks/`. They cover at minimum: (1) how to trigger and verify a manual database backup; (2) how to restore from a snapshot, including pre-restore checks and post-restore verification; (3) how to recover from accidental data deletion; (4) escalation path (who to contact and in what order). Written in plain language, not developer jargon. Linked from the Backup and Restore page in the admin portal (task 2.28).

---

### 2.30 — Admin portal: email and SMS gateway configuration

**Target route:** `/admin/settings/communications`
**SFR reference:** SFR-ADMIN-17
**Priority:** Medium

**What this means**
System notifications — password reset emails, dispute alerts, broadcast messages — currently rely on hardcoded or environment-variable-configured email settings. There is no admin UI to change the email provider, update credentials, or switch to a different SMS gateway without touching code.

**Problem it solves**
Hardcoded communication settings mean that any change to the institution's email or SMS provider requires a developer to update environment variables and redeploy. The admin should be able to configure and test communication settings themselves.

**Done when**
A Communications settings section exists under Admin → Settings. Admins can configure the outbound email provider (SMTP or transactional API key such as Resend or Sendgrid) and SMS gateway credentials. A "Send test message" button verifies the configuration before saving. Settings are stored securely with credentials encrypted at rest. This must be completed before announcements (task 2.32) and the notifications centre (task 2.31), as both depend on a working delivery layer.

---

### 2.31 — Admin portal: notifications centre

**Target route:** `/admin/notifications`
**SFR reference:** SFR-ADMIN-16
**Priority:** High
**Depends on:** 2.30 (email and SMS gateway)

**What this means**
There is currently no central place in the admin portal where the admin can see everything that needs their attention. Disputes, system alerts, login anomalies, and flagged attendance issues all happen in different parts of the system with no unified inbox.

**Problem it solves**
Important events go unnoticed because there is no way to surface them in one place. Critical issues — like a suspicious login pattern or an unresolved dispute backlog — can be missed entirely.

**Done when**
A Notifications page exists under Admin. It shows a chronological feed of all items requiring admin attention, grouped by category: disputes (unresolved or escalated), security alerts (failed login spikes, suspicious activity), system alerts (errors from task 2.25, storage warnings from task 2.27), and attendance anomalies (sessions with zero check-ins, students flagged by eligibility checker). Each notification is clickable and links to the relevant page. Notifications can be marked as read or dismissed. Unread notifications show a badge count in the sidebar. Delivery depends on the gateway configured in task 2.30.

---

### 2.32 — Admin portal: announcements and broadcasts

**Target route:** `/admin/communications`
**SFR reference:** SFR-ADMIN-15
**Priority:** Medium
**Depends on:** 2.30 (email and SMS gateway)

**What this means**
Admins currently have no way to send a message to users through the system. If there is a schedule change, an important notice, or an emergency, communication has to happen through external channels (WhatsApp, email outside the system).

**Problem it solves**
Using external channels for institutional communication is uncontrolled and untracked. Messages may not reach all recipients, there is no record of what was sent, and users may miss important information.

**Done when**
An Announcements page exists under Admin → Communications. Admins can compose a message, select the target audience (all users, specific role, specific group, or individual), and send it. The message is delivered as an in-app notification in the relevant users' portals and optionally as email or SMS if the gateway (task 2.30) is configured. A history of all sent announcements is retained showing message, target audience, sender, and timestamp.

---

### 2.33 — Admin portal: notice board

**Target route:** All portals (admin-managed, displayed system-wide)
**SFR reference:** SFR-ADMIN-18
**Priority:** Low

**What this means**
Broadcasts (task 2.32) are one-time messages. A notice board is different — it is a set of pinned notices that remain visible across all portals until the admin removes them. Useful for information that needs to stay visible for days or weeks, such as exam schedules, policy changes, or maintenance windows.

**Problem it solves**
One-time broadcasts can be missed. For information that needs to stay visible persistently, repeated broadcasts are noisy and ineffective. A permanent notice board solves this cleanly.

**Done when**
Admins can create, edit, and delete notice board entries from the admin portal. Each entry has a title, message body, and optional expiry date. Active notices are displayed prominently on the dashboard or home screen of all portals (admin, lecturer, rep, student) until they expire or are manually removed. Notices are ordered by creation date, most recent first. Expired notices are automatically hidden from user-facing portals but remain visible to admins in the notice board management page for record-keeping.

---

## Summary Table

| Task | Feature | Priority | Depends on |
|------|---------|----------|------------|
| 2.1 | Dashboard UI rebuild | Medium | — |
| 2.2 | Institution pages UI rebuild | Medium | — |
| 2.3 | Academic years & semesters UI rebuild | Medium | — |
| 2.4 | Groups UI rebuild | Medium | — |
| 2.5 | Users UI rebuild | Medium | — |
| 2.6 | Courses UI rebuild | Medium | — |
| 2.7 | Audit log UI rebuild | Medium | — |
| 2.8 | Settings UI rebuild | Medium | — |
| 2.9 | Profile UI rebuild | Medium | — |
| 2.10 | Active session management | Medium | 2.8 |
| 2.11 | Account unlock UI | Medium | 2.5 |
| 2.12 | Remove bottom navigation bar | High | — |
| 2.13 | Restructure sidebar navigation | High | — |
| 2.14 | Roles and permissions management | High | — |
| 2.15 | Academic calendar management | Medium | — |
| 2.16 | Timetable management | High | 2.15 |
| 2.17 | Bulk operations | Medium | — |
| 2.18 | Account deactivation workflows | Medium | — |
| 2.19 | Student ID card generation | Low | — |
| 2.20 | Excused absence status | Medium | — |
| 2.21 | Graduation eligibility checker | Medium | 2.15, 2.20 |
| 2.22 | Live session monitor | High | — |
| 2.23 | Attendance reports and export | Medium | 2.20 |
| 2.24 | Data export centre | Medium | 2.23 |
| 2.25 | Error and activity logs | Medium | — |
| 2.26 | Data retention policies | Medium | 2.25 |
| 2.27 | Storage management | Medium | — |
| 2.28 | Database backup and restore | High | — |
| 2.29 | Backup and DR runbooks | Low | 2.28 |
| 2.30 | Email and SMS gateway configuration | Medium | — |
| 2.31 | Notifications centre | High | 2.30 |
| 2.32 | Announcements and broadcasts | Medium | 2.30 |
| 2.33 | Notice board | Low | — |
