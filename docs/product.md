# FocusTouch — Product Specification

**Version:** 1.0  
**Status:** Draft  
**Last updated:** 2026-07-23  
**Owner:** Product

---

## 1. Product Vision

**FocusTouch is the single, calm place where your day lives.**

People today juggle Calendar for time, Reminders for nudges, Todoist for tasks, Notion for notes, and sticky notes for fleeting thoughts — then switch between them constantly. Context is lost. Friction kills focus. FocusTouch collapses that stack into one fast, minimal app: capture anything in seconds, see what matters now, and finish work without leaving the flow.

### Vision statement

> FocusTouch helps ambitious individuals and small teams plan their time, capture ideas, and complete work — with the clarity of Apple Calendar, the reliability of Apple Reminders, the structure of Todoist, and the flexibility of Notion — without the complexity of any of them.

### Product principles

| Principle | Meaning |
|-----------|---------|
| **Speed first** | Capture and act in under 3 seconds. Keyboard-first. No waiting. |
| **One surface** | Calendar, tasks, notes, and focus tools share one mental model. |
| **Minimal by default** | Show only what is needed for the current intent. Progressive disclosure over feature sprawl. |
| **Trustworthy** | Reminders fire. Sync works. Nothing important is lost. |
| **Focus-aware** | The product actively protects attention (Pomodoro, quiet modes, clear “now”). |

### Positioning

- **Not** another all-in-one work OS.  
- **Not** a heavy project-management suite.  
- **Yes** a personal productivity OS that feels lightweight, opinionated, and fast.

### Inspiration (what we borrow)

| Product | What we take |
|---------|----------------|
| Apple Reminders | Natural capture, lists, due dates, reliable alerts |
| Apple Calendar | Day/week clarity, time as a first-class object |
| Notion | Flexible notes, lightweight structure, blocks when needed |
| Todoist | Clean task UX, priorities, quick add, completion dopamine |

---

## 2. User Personas

### Persona A — Alex, the Deep Worker (Primary)

| Attribute | Detail |
|-----------|--------|
| **Age / role** | 28–40 · Independent contributor, designer, engineer, writer, or freelancer |
| **Goals** | Protect deep-work blocks; finish tasks without tool-switching; keep ideas from vanishing |
| **Pain points** | Calendar in one app, todos in another, notes scattered; notifications interrupt flow; overbuilt tools feel slow |
| **Behaviors** | Plans the morning, works in 25–50 min focus sessions, captures ideas mid-task, reviews evening |
| **Needs from FocusTouch** | Fast capture, calendar + tasks on one day view, Pomodoro, sticky notes for ephemeral thoughts, quiet notifications during focus |
| **Success looks like** | “I planned my day in 5 minutes and stayed in one app until evening.” |

### Persona B — Jordan, the Coordinating Manager (Secondary)

| Attribute | Detail |
|-----------|--------|
| **Age / role** | 32–45 · Team lead or founder of a small team |
| **Goals** | See what’s due, remember follow-ups, keep meeting notes next to action items |
| **Pain points** | Action items from meetings get lost; reminders are inconsistent; calendar is crowded |
| **Behaviors** | Heavy meeting days; converts notes → tasks; relies on notifications between meetings |
| **Needs from FocusTouch** | Linked notes & todos, reminders with reliable delivery, day overview, profile for work/personal separation later |
| **Success looks like** | “Every meeting ends with clear next steps that actually get done.” |

### Persona C — Sam, the Student / Side-Hustler (Growth)

| Attribute | Detail |
|-----------|--------|
| **Age / role** | 18–28 · Student or early-career with side projects |
| **Goals** | Deadlines, study blocks, assignment checklists, quick notes |
| **Pain points** | Cheap/free tools are fragmented; paid suites are overkill; mobile capture matters |
| **Behaviors** | Mobile-first capture; short focus sessions; sticky notes for exam facts / ideas |
| **Needs from FocusTouch** | Free/simple MVP, Pomodoro, reminders, todos, light notes |
| **Success looks like** | “I never miss a deadline and I actually study when I planned to.” |

### Anti-personas (explicitly not primary)

- Enterprise PMs needing Gantt charts, resource allocation, and complex permissions  
- Users seeking a full CRM or document wiki as the primary product  
- Users who only want a pure habit tracker with streaks as the core loop  

---

## 3. Core Features

These are the enduring product pillars — the permanent product shape of FocusTouch.

### 3.1 Calendar
- Day, week, and month views  
- Events with time, duration, location (optional), and notes link  
- Drag-to-reschedule; create event from empty time slot  
- Tasks with due dates can appear on the calendar (optional overlay)

### 3.2 Reminders
- Time-based and date-based reminders  
- Optional location / “when I arrive” style (post-MVP)  
- Recurring reminders  
- Mark done / snooze / reschedule from notification

### 3.3 Todos
- Inbox + custom lists / projects  
- Due date, time, priority, tags  
- Subtasks  
- Quick add (global shortcut / FAB)  
- Complete, postpone, move between lists

### 3.4 Notes
- Lightweight documents: title + body (rich text or blocks in later phases)  
- Link notes to tasks, events, or lists  
- Search across notes  
- Templates (post-MVP)

### 3.5 Sticky Notes
- Ephemeral, visual notes on a board / desktop canvas  
- Color variants; pin / archive / convert to todo or note  
- Designed for fleeting thoughts — not long documents

### 3.6 Pomodoro Timer
- Start focus session (25/5 default; customizable)  
- Optional task linking (“focusing on X”)  
- Session history and daily focus time  
- Do-not-disturb / reduced notifications during focus (where platform allows)

### 3.7 Notifications
- Local and push notifications for reminders, due tasks, events, Pomodoro ends  
- Snooze and quick actions  
- Notification preferences per type and quiet hours

### 3.8 User Profile
- Account identity (email / OAuth)  
- Preferences: theme, default views, Pomodoro lengths, week start, time format  
- Sync status and connected devices  
- Privacy & data controls (export / delete)

### Cross-cutting capabilities
- **Unified search** across events, todos, notes, stickies, reminders  
- **Today** home: agenda + due tasks + active stickies + focus status  
- **Capture everywhere**: quick add that can become event, reminder, todo, note, or sticky  

---

## 4. MVP Features

**MVP goal:** A single user can plan a day, capture work, get reminded, take notes, focus with a timer, and trust that data syncs — with a minimal UI and sub-3-second capture.

### In scope (MVP)

| Area | MVP scope |
|------|-----------|
| **Auth & profile** | Sign up / sign in (email + one OAuth), basic profile, theme (light/dark), timezone |
| **Today view** | Combined agenda: timed events + due todos + upcoming reminders |
| **Calendar** | Day + week views; create/edit/delete events |
| **Todos** | Inbox + lists; due date/time; priority (3 levels); complete; quick add |
| **Reminders** | Time-based reminders; recurring (daily/weekly); snooze |
| **Notes** | Plain/rich text notes; create, edit, delete; basic search |
| **Sticky notes** | Create stickies with color; edit; delete; convert sticky → todo |
| **Pomodoro** | Start/stop timer; 25/5 defaults; link to a todo; basic session log for today |
| **Notifications** | Reminders, event start, todo due, Pomodoro complete; in-app + OS notifications |
| **Search** | Global search for todos, notes, events, stickies |
| **Sync** | Cloud sync for a single user across web + one mobile platform (or PWA) |
| **UX** | Minimal chrome, keyboard shortcuts for capture and navigation, responsive layout |

### Explicitly out of MVP

- Teams / sharing / comments  
- Location-based reminders  
- Advanced Notion-style databases / wikis  
- Integrations (Google Calendar, Slack, email, etc.)  
- AI writing / auto-scheduling  
- Habit tracking as a separate module  
- Offline-first with complex conflict UI (basic offline cache OK if feasible)  
- Desktop sticky overlay (OS-level)  

### MVP success criteria (qualitative)

- New user reaches “first completed todo” within 2 minutes of signup  
- User can plan tomorrow’s calendar + 3 tasks in under 5 minutes  
- Reminder notification arrives within the defined SLA (see NFR)  
- User can run a full Pomodoro linked to a task without leaving the app  

---

## 5. Future Features

Prioritized themes for post-MVP. Order may change based on metrics and feedback.

### Phase 2 — Depth & reliability
- Month calendar view and calendar overlays (tasks on calendar)  
- Subtasks, tags, filters, and smart lists (“Today”, “Upcoming”, “Priority”)  
- Recurring todos and richer reminder rules  
- Note ↔ task ↔ event bidirectional linking  
- Sticky board with positions; convert sticky → note  
- Quiet hours and Focus Mode integration  
- Data export (Markdown / JSON / ICS)

### Phase 3 — Connectivity
- Two-way Google Calendar / Apple Calendar sync  
- Import from Todoist / Apple Reminders  
- Email-to-task / share sheet capture  
- Webhooks / basic API for power users  
- Widgets (home screen / desktop) and menu-bar timer  

### Phase 4 — Collaboration (careful, optional)
- Shared lists and shared calendars (small teams)  
- Assign todos; comment threads on tasks  
- Shared note pages with simple permissions  
- Guest / view-only links  

### Phase 5 — Intelligence & polish
- Natural language capture (“Tomorrow 3pm dentist”)  
- AI suggest schedule / break down tasks (opt-in)  
- Auto-tagging and duplicate detection  
- Templates for notes and weekly planning  
- Analytics: focus hours, completion rate, review insights  
- Multi-device presence and conflict resolution UI  

### Ideas parking lot
- Whiteboard / spatial canvas beyond stickies  
- Voice capture  
- Public publishing of notes  
- Marketplace of templates  

---

## 6. User Journey

### Journey 1 — First-day activation (Alex)

1. **Discover** — Lands on FocusTouch, sees a calm promise: plan, capture, focus — one place.  
2. **Sign up** — Creates account in under 60 seconds (email or OAuth).  
3. **Empty state** — Guided to “Add your first task” and optionally “Block focus time today.”  
4. **Capture** — Adds 3 todos via quick add; creates one calendar block for deep work.  
5. **Note** — Opens a note for a project idea; pins a sticky for a random thought.  
6. **Focus** — Starts Pomodoro linked to top todo; notifications quiet during session.  
7. **Complete** — Marks todo done when timer ends; sees Today update.  
8. **Remind** — Sets a reminder for evening review.  
9. **Return** — Next morning, opens Today and trusts the agenda.

**Emotional arc:** Overwhelm → clarity → momentum → trust.

### Journey 2 — Meeting → action (Jordan)

1. Opens calendar for the meeting.  
2. During/after meeting, creates a note attached to the event.  
3. Extracts 2 action items as todos with due dates and reminders.  
4. Gets notified next morning; completes or snoozes from notification.  
5. Reviews week view to rebalance workload.

### Journey 3 — Mobile capture on the go (Sam)

1. Thinks of a deadline while commuting.  
2. Opens quick add; creates todo with due date + reminder.  
3. Later, converts a sticky into a study checklist.  
4. Runs Pomodoro during a study block shown on calendar.  
5. Completes checklist; feels “caught up.”

### Journey map (summary)

```text
Awareness → Signup → First capture → Today habit → Focus sessions
    → Reliable reminders → Daily review → Retention / advocacy
```

Critical path for retention: **Today view + reliable notifications + fast capture.**

---

## 7. Functional Requirements

Requirements use MoSCoW for MVP vs later. IDs are stable for engineering tracking.

### 7.1 Account & profile

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-ACC-01 | Users can register with email/password | Must (MVP) |
| FR-ACC-02 | Users can sign in with at least one OAuth provider | Must (MVP) |
| FR-ACC-03 | Users can update display name, email, password | Must (MVP) |
| FR-ACC-04 | Users can set theme, timezone, time format, week start day | Must (MVP) |
| FR-ACC-05 | Users can set Pomodoro work/break durations | Must (MVP) |
| FR-ACC-06 | Users can export or delete their account data | Should (Phase 2) |
| FR-ACC-07 | Users can manage notification preferences per category | Must (MVP) |

### 7.2 Today & navigation

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-TOD-01 | Today shows timed events for the current day | Must (MVP) |
| FR-TOD-02 | Today shows todos due today (and overdue) | Must (MVP) |
| FR-TOD-03 | Today shows upcoming reminders for the day | Must (MVP) |
| FR-TOD-04 | User can navigate Day / Week calendar views | Must (MVP) |
| FR-TOD-05 | Global search returns todos, notes, events, stickies | Must (MVP) |
| FR-TOD-06 | Global quick-add can create todo, event, reminder, note, or sticky | Must (MVP) |

### 7.3 Calendar

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-CAL-01 | Create, edit, delete calendar events | Must (MVP) |
| FR-CAL-02 | Events support title, start, end, all-day flag, optional description | Must (MVP) |
| FR-CAL-03 | Day and week views render without overlap bugs for typical density | Must (MVP) |
| FR-CAL-04 | Drag to change event time on day/week view | Should (Phase 2) |
| FR-CAL-05 | Month view | Should (Phase 2) |
| FR-CAL-06 | Show todos with due times on calendar | Could (Phase 2) |
| FR-CAL-07 | External calendar sync | Could (Phase 3) |

### 7.4 Todos

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-TSK-01 | Create, edit, delete todos | Must (MVP) |
| FR-TSK-02 | Organize todos into lists (including Inbox) | Must (MVP) |
| FR-TSK-03 | Set due date and optional due time | Must (MVP) |
| FR-TSK-04 | Set priority (at least 3 levels) | Must (MVP) |
| FR-TSK-05 | Mark complete / incomplete | Must (MVP) |
| FR-TSK-06 | Subtasks | Should (Phase 2) |
| FR-TSK-07 | Tags and filters / smart lists | Should (Phase 2) |
| FR-TSK-08 | Recurring todos | Should (Phase 2) |
| FR-TSK-09 | Convert sticky or note excerpt into todo | Must (MVP sticky→todo) |

### 7.5 Reminders

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-REM-01 | Create time-based reminders | Must (MVP) |
| FR-REM-02 | Recurring reminders (daily, weekly) | Must (MVP) |
| FR-REM-03 | Snooze reminder from notification / UI | Must (MVP) |
| FR-REM-04 | Mark reminder complete / dismiss | Must (MVP) |
| FR-REM-05 | Location-based reminders | Won’t (MVP) / Could (later) |
| FR-REM-06 | Attach reminder to a todo or event | Should (Phase 2) |

### 7.6 Notes

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-NOT-01 | Create, edit, delete notes with title and body | Must (MVP) |
| FR-NOT-02 | Basic rich text (bold, lists, links) | Must (MVP) |
| FR-NOT-03 | Search notes by title and body | Must (MVP) |
| FR-NOT-04 | Link note to todo or event | Should (Phase 2) |
| FR-NOT-05 | Note templates and databases | Won’t (MVP) / Could (later) |

### 7.7 Sticky notes

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-STK-01 | Create sticky with text and color | Must (MVP) |
| FR-STK-02 | Edit and delete stickies | Must (MVP) |
| FR-STK-03 | Convert sticky to todo | Must (MVP) |
| FR-STK-04 | Board layout with positions | Should (Phase 2) |
| FR-STK-05 | Convert sticky to full note | Should (Phase 2) |

### 7.8 Pomodoro

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-POM-01 | Start, pause, resume, stop focus timer | Must (MVP) |
| FR-POM-02 | Default 25 min work / 5 min break; user-configurable | Must (MVP) |
| FR-POM-03 | Optionally link timer to a todo | Must (MVP) |
| FR-POM-04 | Notify when session ends | Must (MVP) |
| FR-POM-05 | Log completed sessions for the day | Must (MVP) |
| FR-POM-06 | Suppress or reduce non-critical notifications during focus | Should (Phase 2) |

### 7.9 Notifications

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-NTF-01 | Deliver notifications for reminders at scheduled time | Must (MVP) |
| FR-NTF-02 | Deliver notifications for event start (configurable lead time) | Must (MVP) |
| FR-NTF-03 | Deliver notifications for todo due time | Must (MVP) |
| FR-NTF-04 | Deliver Pomodoro completion notifications | Must (MVP) |
| FR-NTF-05 | Quick actions: complete, snooze (where OS supports) | Should (MVP+) |
| FR-NTF-06 | Quiet hours | Should (Phase 2) |

### 7.10 Data & sync

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-SYN-01 | Authenticated user data persists in the cloud | Must (MVP) |
| FR-SYN-02 | Changes sync across sessions/devices for the same user | Must (MVP) |
| FR-SYN-03 | User remains signed in across browser sessions securely | Must (MVP) |

---

## 8. Non-Functional Requirements

### 8.1 Performance

| ID | Requirement |
|----|-------------|
| NFR-PERF-01 | Time to interactive for Today view ≤ 2s on mid-range broadband (p95) |
| NFR-PERF-02 | Quick-add open and first keystroke ready ≤ 100ms after trigger (client) |
| NFR-PERF-03 | Creating a todo/note feels instant; local optimistic UI ≤ 50ms to reflect |
| NFR-PERF-04 | Calendar week view remains usable with ≥ 50 events/week without jank |
| NFR-PERF-05 | Search results for typical library (≤ 5k items) return ≤ 300ms client-side or ≤ 500ms server |

### 8.2 Reliability

| ID | Requirement |
|----|-------------|
| NFR-REL-01 | Reminder/event notifications delivered within ±30 seconds of scheduled time (p95), when device/permissions allow |
| NFR-REL-02 | Monthly uptime for core API ≥ 99.9% |
| NFR-REL-03 | No silent data loss; failed syncs surface retry state |
| NFR-REL-04 | Pomodoro timer accuracy within ±1 second per 25-minute session while app is foregrounded |

### 8.3 Usability & UX

| ID | Requirement |
|----|-------------|
| NFR-UX-01 | Primary actions reachable within 2 taps/clicks from Today |
| NFR-UX-02 | Keyboard shortcuts for quick add, search, navigate Today/Calendar |
| NFR-UX-03 | UI density is minimal: avoid cards-within-cards; progressive disclosure |
| NFR-UX-04 | WCAG 2.1 AA for core flows (contrast, focus states, labels) |
| NFR-UX-05 | Responsive: usable on mobile viewport ≥ 375px width |

### 8.4 Security & privacy

| ID | Requirement |
|----|-------------|
| NFR-SEC-01 | All traffic over HTTPS/TLS |
| NFR-SEC-02 | Passwords hashed with modern algorithm (e.g., Argon2/bcrypt); OAuth tokens stored securely |
| NFR-SEC-03 | Session tokens expire / rotatable; logout invalidates session |
| NFR-SEC-04 | User data isolated by account (no cross-tenant leakage) |
| NFR-SEC-05 | PII minimized in logs; secrets never logged |
| NFR-SEC-06 | Clear privacy policy; GDPR-style delete/export path (Phase 2 at latest) |

### 8.5 Scalability

| ID | Requirement |
|----|-------------|
| NFR-SCL-01 | Architecture supports ≥ 100k MAU without redesign of core data model |
| NFR-SCL-02 | Per-user libraries of ≥ 10k entities (todos+notes+events) remain performant |

### 8.6 Compatibility

| ID | Requirement |
|----|-------------|
| NFR-CMP-01 | Support latest 2 major versions of Chrome, Safari, Firefox, Edge |
| NFR-CMP-02 | Mobile web usable; native apps optional post-MVP |
| NFR-CMP-03 | OS notification permission flows handled gracefully when denied |

### 8.7 Maintainability & quality

| ID | Requirement |
|----|-------------|
| NFR-QA-01 | Automated tests for auth, CRUD of core entities, reminder scheduling |
| NFR-QA-02 | Observability: error tracking, latency metrics, notification delivery metrics |
| NFR-QA-03 | Feature flags for risky post-MVP launches |

---

## 9. User Stories

Format: *As a … I want … so that …*  
Acceptance criteria are summarized; engineering may expand in tickets.

### Epic: Onboarding & profile

1. **US-001** — As a new user, I want to sign up quickly so that I can start capturing work immediately.  
   - *AC:* Signup succeeds; redirected to Today with empty-state guidance.

2. **US-002** — As a user, I want to set my timezone and theme so that my schedule and UI match my preferences.  
   - *AC:* Changes persist and apply across sessions.

3. **US-003** — As a user, I want to configure notification preferences so that I only get alerts I care about.  
   - *AC:* Toggling a category stops/starts that notification type.

### Epic: Today & capture

4. **US-010** — As a busy professional, I want a Today view that combines events, due todos, and reminders so that I know what matters without switching apps.  
   - *AC:* Items appear in chronological / priority-sensible order; overdue is visible.

5. **US-011** — As a user, I want a global quick-add so that I can capture a todo, event, reminder, note, or sticky in seconds.  
   - *AC:* Type selectable; item appears in the correct place after save.

6. **US-012** — As a user, I want to search everything so that I can find an old note or task instantly.  
   - *AC:* Query matches titles/bodies; results open the correct entity.

### Epic: Calendar

7. **US-020** — As a planner, I want to create events on a day/week calendar so that I can block time for work and meetings.  
   - *AC:* Event shows on correct day/time; editable/deletable.

8. **US-021** — As a planner, I want to see my week at a glance so that I can avoid overbooking.  
   - *AC:* Week view shows all events for the week without layout break for normal load.

### Epic: Todos

9. **US-030** — As a user, I want to create todos in lists with due dates and priority so that I can organize work clearly.  
   - *AC:* List, due, priority saved; visible in list and Today when due.

10. **US-031** — As a user, I want to complete a todo so that I can track progress and clear my day.  
    - *AC:* Completed items leave active Today; can be restored if undone.

11. **US-032** — As a user, I want an Inbox for unsorted tasks so that capture stays frictionless.  
    - *AC:* Quick-add defaults to Inbox; movable to lists later.

### Epic: Reminders

12. **US-040** — As a user, I want time-based reminders so that I don’t forget important follow-ups.  
    - *AC:* Notification fires at scheduled time (within SLA).

13. **US-041** — As a user, I want to snooze a reminder so that I can defer without losing it.  
    - *AC:* Snooze options reschedule and re-notify.

14. **US-042** — As a user, I want recurring reminders so that routines stick without re-entry.  
    - *AC:* Daily/weekly recurrence creates next occurrence after completion/fire per rules.

### Epic: Notes & stickies

15. **US-050** — As a knowledge worker, I want lightweight notes so that I can write without a heavy doc tool.  
    - *AC:* Create/edit with rich text basics; searchable.

16. **US-051** — As a creative thinker, I want sticky notes so that I can park fleeting ideas visually.  
    - *AC:* Color + text; editable; list/board visible.

17. **US-052** — As a user, I want to convert a sticky into a todo so that ideas become actionable.  
    - *AC:* New todo created with sticky text; sticky optionally removed or archived.

### Epic: Pomodoro

18. **US-060** — As a deep worker, I want to run a Pomodoro timer so that I can focus in short, disciplined bursts.  
    - *AC:* Timer runs accurately; end notification; start/pause/stop work.

19. **US-061** — As a deep worker, I want to link a Pomodoro to a todo so that focus time maps to real work.  
    - *AC:* Linked todo shown during session; session logged against it.

20. **US-062** — As a user, I want to see today’s focus minutes so that I feel progress beyond task completion.  
    - *AC:* Sum of completed work sessions visible on Today or timer panel.

### Epic: Notifications & trust

21. **US-070** — As a user, I want OS notifications for due items and events so that FocusTouch works even when the tab is closed (within platform limits).  
    - *AC:* Permission requested; notifications delivered when allowed.

22. **US-071** — As a user, I want my data synced across devices so that I can capture on phone and plan on desktop.  
    - *AC:* Create on device A appears on device B after sync interval.

---

## 10. Success Metrics

Metrics are framed for MVP launch and the first 90 days. Targets are directional; refine after baseline instrumentation.

### North Star Metric

**Weekly Active Planners (WAP):** Users who in a given week perform at least **two** of: (1) create/complete a todo, (2) create/view calendar event for planning, (3) complete a Pomodoro, (4) create a note or sticky.

*Why:* Reflects multi-surface use — the product’s core differentiation — not vanity logins.

### Activation metrics

| Metric | Definition | MVP target |
|--------|------------|------------|
| **Signup → first capture** | % of signups who create ≥1 entity within 24h | ≥ 70% |
| **Time to first value** | Median time from signup to first completed todo or saved event | ≤ 3 minutes |
| **Day-1 Today return** | % who open Today again within 24h of signup | ≥ 40% |

### Engagement metrics

| Metric | Definition | 90-day target |
|--------|------------|---------------|
| **D7 retention** | % of new users active on day 7 | ≥ 25% |
| **D30 retention** | % of new users active on day 30 | ≥ 15% |
| **WAP / MAU** | Weekly Active Planners ÷ Monthly Active Users | ≥ 45% |
| **Capture frequency** | Median captures (quick-add creates) per WAU per week | ≥ 8 |
| **Pomodoro adoption** | % of WAU who complete ≥1 Pomodoro/week | ≥ 20% |
| **Multi-surface usage** | % of WAP using ≥3 feature areas in a week | ≥ 50% |

### Reliability & quality metrics

| Metric | Definition | Target |
|--------|------------|--------|
| **Notification delivery success** | Scheduled reminders that fire within SLA | ≥ 99% (when permissions granted) |
| **Sync conflict / error rate** | Failed syncs per 1k operations | ≤ 1 |
| **Crash-free sessions** | Sessions without fatal client error | ≥ 99.5% |
| **p95 Today load** | Time to interactive Today | ≤ 2s |

### Satisfaction & qualitative

| Metric | Definition | Target |
|--------|------------|--------|
| **CSAT / in-app pulse** | Post-week “How easy was planning?” (1–5) | ≥ 4.2 |
| **NPS** (post-MVP) | Net Promoter Score | ≥ 30 in first 6 months |
| **Support burden** | Tickets per 1k MAU related to “lost data” or “missed reminder” | Trending down month over month |

### Business / product health (as applicable)

| Metric | Definition | Note |
|--------|------------|------|
| **Activation of paid** (if freemium later) | Trial → paid | Defer until monetization |
| **Organic invite / share rate** | Invites or shares per WAU | Proxy for advocacy |
| **Feature stickiness** | Retention of users who used Pomodoro + Todos + Calendar in week 1 | Should exceed overall D30 |

### Guardrail metrics (do not sacrifice)

- Notification opt-out rate spike after aggressive alerts  
- Time-to-capture regression (>3s feel) after feature additions  
- UI complexity score (internal): new chrome without removing old  

---

## Appendix A — MVP scope checklist

- [ ] Auth + profile preferences  
- [ ] Today combined agenda  
- [ ] Calendar day + week  
- [ ] Todos + lists + priority + due  
- [ ] Time reminders + recurrence + snooze  
- [ ] Notes (basic rich text) + search  
- [ ] Stickies + convert to todo  
- [ ] Pomodoro + link to todo + daily log  
- [ ] Notifications (reminder, event, due, Pomodoro)  
- [ ] Cloud sync (single user)  
- [ ] Global quick-add + search  
- [ ] Minimal, responsive UI + core keyboard shortcuts  

## Appendix B — Open product questions

1. Web-first vs. native iOS/Android for MVP notifications reliability?  
2. Freemium vs. free forever for individuals at launch?  
3. How aggressive should “tasks on calendar” be in the default Today UX?  
4. Rich-text ceiling for notes in MVP (Markdown vs. limited WYSIWYG)?  
5. Single “Inbox” philosophy vs. forced list on every capture?

---

*End of document — FocusTouch Product Specification v1.0*
