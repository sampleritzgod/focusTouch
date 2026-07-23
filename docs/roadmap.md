# FocusTouch Implementation Roadmap

**Source:** `docs/product.md`  
**Status:** Draft  
**Last updated:** 2026-07-23  
**Owner:** Engineering

---

## Buildability Standard

Every phase must leave the repository in a releasable state:

- The application builds from a clean checkout.
- Automated tests for touched areas pass.
- Existing user flows from earlier phases still work.
- New functionality is feature-complete for its phase or hidden behind a feature flag.
- Database/schema changes are forward-compatible and covered by migration tests.
- Deployment configuration remains valid for preview and production-like environments.

Because the repository currently contains product documentation only, file paths below describe the expected implementation layout. Final paths may change once the technical stack is selected, but each phase should preserve the same ownership boundaries.

---

## Phase 0

### Product-to-Engineering Foundation

Convert the product specification into an executable engineering baseline: stack choice, repository scaffold, CI, environments, domain model, and deployment pipeline.

### Deliverables

- Web-first MVP architecture decision record.
- Application scaffold with client, API, shared types, and test harnesses.
- CI pipeline for install, lint, typecheck, unit tests, integration tests, and build.
- Preview deployment for every pull request.
- Initial domain model for users, preferences, events, todos, reminders, notes, stickies, focus sessions, and notifications.
- Feature flag mechanism for incomplete surfaces.

### Files

- `docs/architecture.md`
- `docs/decisions/0001-technical-stack.md`
- `docs/roadmap.md`
- `apps/web/`
- `apps/api/`
- `packages/domain/`
- `packages/ui/`
- `packages/config/`
- `infra/`
- `.github/workflows/ci.yml`

### Tests

- CI smoke test.
- Build test for web and API apps.
- Unit test sample in each package.
- Migration dry-run test against an empty database.
- Health-check test for preview deployment.

### Acceptance Criteria

- A new developer can install dependencies, run tests, and start the app from documented commands.
- CI blocks merges when lint, typecheck, tests, or builds fail.
- Preview deployment exposes a working health check and empty application shell.
- Domain entities map to MVP requirements in `docs/product.md`.
- No user-facing feature is implemented outside a feature flag or routed shell.

---

## Phase 1

### Authentication and User Profile

Build the trusted identity layer required before any personal productivity data is stored.

### Deliverables

- Email/password registration and sign-in.
- One OAuth provider.
- Secure session persistence and logout.
- Basic profile settings: display name, theme, timezone, time format, week start, Pomodoro defaults, notification preferences.
- Authenticated route protection.
- Empty Today route after signup.

### Files

- `apps/web/src/routes/auth/`
- `apps/web/src/routes/settings/profile/`
- `apps/web/src/lib/auth/`
- `apps/api/src/modules/auth/`
- `apps/api/src/modules/users/`
- `packages/domain/src/user.ts`
- `packages/domain/src/preferences.ts`
- `infra/migrations/*users*`
- `infra/migrations/*sessions*`

### Tests

- Unit tests for validation, password rules, session expiry, and preference defaults.
- Integration tests for signup, login, OAuth callback, logout, and session refresh.
- Authorization tests for protected API routes.
- E2E test for signup to empty Today.

### Acceptance Criteria

- A new user can sign up and land on Today within the activation flow.
- Returning users remain signed in securely across browser sessions.
- Logout invalidates the active session.
- Profile and preference changes persist across reloads.
- User data is isolated by account.

---

## Phase 2

### App Shell, Today View, and Capture Foundation

Create the primary workspace where the day lives, even before all entity types are fully rich.

### Deliverables

- Responsive app shell with navigation for Today, Calendar, Todos, Notes, Stickies, Pomodoro, Search, and Settings.
- Empty states aligned to first-day activation.
- Today view data contract for agenda, due todos, reminders, stickies, and focus status.
- Global quick-add modal framework with keyboard shortcut.
- Shared command menu/search shell with placeholder providers.
- Design system primitives for layout, forms, buttons, dialogs, lists, cards, and toasts.

### Files

- `apps/web/src/routes/app/`
- `apps/web/src/routes/today/`
- `apps/web/src/components/layout/`
- `apps/web/src/components/quick-add/`
- `apps/web/src/components/command-menu/`
- `packages/ui/src/`
- `packages/domain/src/today.ts`
- `apps/api/src/modules/today/`

### Tests

- Component tests for navigation, responsive shell, dialogs, and empty states.
- Keyboard shortcut tests for quick-add and search.
- API contract tests for Today aggregation with empty datasets.
- Accessibility tests for focus order, labels, and dialog behavior.

### Acceptance Criteria

- Authenticated users can navigate the app without dead routes.
- Today renders a useful empty state in under the performance target.
- Quick-add opens within the target interaction budget and can route draft submissions by type.
- The app is usable at mobile width and desktop width.
- No placeholder action causes data loss or uncaught errors.

---

## Phase 3

### Todos and Lists

Ship the first complete daily work loop: capture, organize, prioritize, complete, and review todos.

### Deliverables

- Inbox and custom lists.
- Todo create, edit, delete, complete, incomplete, postpone, and move between lists.
- Due date, optional due time, and three priority levels.
- Todo quick-add path.
- Today integration for due and overdue todos.
- Optimistic UI with failed-sync retry state.

### Files

- `apps/web/src/routes/todos/`
- `apps/web/src/components/todos/`
- `apps/api/src/modules/todos/`
- `apps/api/src/modules/lists/`
- `packages/domain/src/todo.ts`
- `packages/domain/src/list.ts`
- `infra/migrations/*todos*`
- `infra/migrations/*lists*`

### Tests

- Unit tests for todo state transitions, due-date logic, and priority ordering.
- Integration tests for todo and list CRUD.
- Today aggregation tests for due, overdue, and completed todos.
- E2E tests for quick-add todo, complete todo, and move todo between lists.

### Acceptance Criteria

- Quick-add defaults new todos into Inbox.
- Due and overdue active todos appear on Today; completed todos leave active Today.
- Users can recover from failed saves without losing typed content.
- Todo CRUD remains scoped to the authenticated user.
- The repository builds and all prior auth/app-shell flows still pass.

---

## Phase 4

### Calendar Day and Week

Add time as a first-class planning surface and integrate events with Today.

### Deliverables

- Day and week calendar views.
- Event create, edit, delete.
- Event fields: title, start, end, all-day flag, optional description.
- Create event from empty time slot.
- Today agenda integration for current-day events.
- Calendar layout handling for typical overlapping events.

### Files

- `apps/web/src/routes/calendar/`
- `apps/web/src/components/calendar/`
- `apps/api/src/modules/events/`
- `packages/domain/src/event.ts`
- `packages/domain/src/time.ts`
- `infra/migrations/*events*`

### Tests

- Unit tests for timezone conversion, all-day events, and overlap layout.
- Integration tests for event CRUD.
- Today aggregation tests for event ordering.
- E2E tests for creating an event from day view and editing it from week view.

### Acceptance Criteria

- Events render on the correct day and time for the user's timezone.
- Day and week views remain usable with normal weekly density.
- Event changes update Today without a full browser refresh.
- Invalid event ranges are rejected with clear validation.
- The application remains buildable with todos and auth enabled.

---

## Phase 5

### Reminders and Notification Scheduling

Deliver the first trust-critical notification loop for reminders and due work.

### Deliverables

- Time-based reminders.
- Daily and weekly recurring reminders.
- Snooze and complete/dismiss actions in the UI.
- Notification permission flow.
- In-app notifications for reminders, todo due times, event starts, and Pomodoro completion hooks.
- Server-side or scheduled worker foundation for reliable delivery.
- Notification preference enforcement.

### Files

- `apps/web/src/routes/reminders/`
- `apps/web/src/components/notifications/`
- `apps/web/src/lib/notifications/`
- `apps/api/src/modules/reminders/`
- `apps/api/src/modules/notifications/`
- `apps/api/src/workers/notification-scheduler/`
- `packages/domain/src/reminder.ts`
- `packages/domain/src/notification.ts`
- `infra/migrations/*reminders*`
- `infra/migrations/*notifications*`

### Tests

- Unit tests for recurrence generation, snooze rules, preference filtering, and scheduled delivery windows.
- Integration tests for reminder CRUD and scheduler enqueue/dequeue.
- Worker tests using controlled time.
- E2E tests for reminder creation, snooze, and completion.

### Acceptance Criteria

- Reminders fire within the defined SLA when permissions and platform state allow.
- Recurring reminders create the next occurrence according to their rule.
- Snoozed reminders reappear at the selected time.
- Disabled notification categories do not send notifications.
- Delivery failures are observable and retryable.

---

## Phase 6

### Notes and Sticky Notes

Add lightweight knowledge capture and ephemeral visual capture.

### Deliverables

- Notes with title and plain/rich text body.
- Basic note search by title and body.
- Sticky notes with text and color.
- Sticky edit and delete.
- Sticky-to-todo conversion.
- Today integration for active stickies.

### Files

- `apps/web/src/routes/notes/`
- `apps/web/src/routes/stickies/`
- `apps/web/src/components/editor/`
- `apps/web/src/components/stickies/`
- `apps/api/src/modules/notes/`
- `apps/api/src/modules/stickies/`
- `packages/domain/src/note.ts`
- `packages/domain/src/sticky.ts`
- `infra/migrations/*notes*`
- `infra/migrations/*stickies*`

### Tests

- Unit tests for note sanitization, editor serialization, sticky colors, and sticky-to-todo mapping.
- Integration tests for notes and stickies CRUD.
- Search tests for note title/body matches.
- E2E tests for creating a note, finding it, creating a sticky, and converting it to a todo.

### Acceptance Criteria

- Users can create, edit, delete, and search notes.
- Users can create, edit, delete, and color-code stickies.
- Converting a sticky creates a todo with the expected text and ownership.
- Active stickies appear on Today without overwhelming the agenda.
- Rich text is stored safely and rendered without script execution.

---

## Phase 7

### Pomodoro Focus Sessions

Build the focus loop and connect it to todos and daily progress.

### Deliverables

- Start, pause, resume, and stop timer.
- Default 25-minute work and 5-minute break configuration.
- User-configurable durations from profile settings.
- Optional todo linking.
- Pomodoro completion notification.
- Today focus status and daily focus minutes.
- Session history for the current day.

### Files

- `apps/web/src/routes/pomodoro/`
- `apps/web/src/components/pomodoro/`
- `apps/web/src/lib/timer/`
- `apps/api/src/modules/focus-sessions/`
- `packages/domain/src/focus-session.ts`
- `infra/migrations/*focus_sessions*`

### Tests

- Unit tests for timer state transitions and duration calculations.
- Unit tests for session logging and daily focus totals.
- Integration tests for creating and completing focus sessions.
- E2E test for running a shortened test-mode Pomodoro linked to a todo.

### Acceptance Criteria

- The timer stays accurate within the product requirement while foregrounded.
- Completed sessions are logged and visible in today's focus total.
- Linked todos remain visible during a session.
- Pomodoro completion can trigger a notification when notifications are enabled.
- Stopping or refreshing does not create duplicate completed sessions.

---

## Phase 8

### Global Search and Unified Quick Add

Make capture and retrieval work across all MVP entities.

### Deliverables

- Global search across todos, notes, events, stickies, and reminders.
- Keyboard-first search result navigation.
- Unified quick-add parser for creating todo, event, reminder, note, or sticky.
- Recent searches or recent entities where helpful.
- Performance safeguards for typical libraries up to the MVP target.

### Files

- `apps/web/src/routes/search/`
- `apps/web/src/components/search/`
- `apps/web/src/components/quick-add/`
- `apps/api/src/modules/search/`
- `apps/api/src/modules/capture/`
- `packages/domain/src/search.ts`
- `packages/domain/src/capture.ts`

### Tests

- Unit tests for quick-add type routing and validation.
- Search ranking and filtering tests.
- Integration tests for cross-entity search permissions.
- E2E tests for creating each supported entity from quick-add and opening results from search.
- Performance test for representative search volume.

### Acceptance Criteria

- Search returns only the authenticated user's data.
- Result selection opens the correct entity.
- Quick-add can create every MVP entity type.
- Capture remains fast enough to satisfy the product's speed-first principle.
- Search meets the documented p95 target for a representative dataset.

---

## Phase 9

### Sync, Offline Tolerance, and Data Reliability

Harden persistence so the app earns user trust across sessions and devices.

### Deliverables

- Cloud sync for all MVP entities.
- Optimistic writes with visible retry state.
- Basic offline cache for recent user data.
- Sync status indicator.
- Conflict strategy for simple last-write or field-level resolution.
- Account data export and delete foundation if not already shipped.
- Backup and restore runbook.

### Files

- `apps/web/src/lib/sync/`
- `apps/web/src/components/sync-status/`
- `apps/api/src/modules/sync/`
- `apps/api/src/modules/export/`
- `packages/domain/src/sync.ts`
- `infra/migrations/*sync*`
- `infra/runbooks/backup-restore.md`

### Tests

- Integration tests for cross-session sync.
- Offline/online transition tests.
- Conflict resolution tests.
- Data export/delete tests.
- Load tests for per-user libraries at representative scale.

### Acceptance Criteria

- Creating data in one session appears in another after the sync interval.
- Failed syncs never disappear silently.
- Recently loaded data remains visible during short offline periods.
- Export produces complete user-owned data.
- Delete removes user-owned data according to privacy requirements.

---

## Phase 10

### Quality, Observability, Accessibility, and Security Hardening

Prepare the MVP for real users by closing reliability, security, and usability gaps.

### Deliverables

- Error tracking and structured logging.
- Latency, build, sync, and notification delivery metrics.
- Security review of auth, data isolation, secrets, logging, and notification payloads.
- WCAG 2.1 AA audit for core flows.
- Browser compatibility pass for supported browsers.
- Performance budget enforcement.
- Incident response and support playbooks.

### Files

- `apps/web/src/lib/observability/`
- `apps/api/src/lib/observability/`
- `apps/api/src/lib/security/`
- `infra/monitoring/`
- `infra/runbooks/incident-response.md`
- `docs/security.md`
- `docs/accessibility.md`
- `docs/support.md`

### Tests

- Accessibility automation for core routes.
- Security regression tests for auth and authorization.
- Browser compatibility smoke tests.
- Performance tests for Today, quick-add, calendar week, and search.
- Synthetic notification delivery checks.

### Acceptance Criteria

- Core flows meet accessibility requirements.
- No known high-severity security issue remains open.
- Observability dashboards expose API health, client errors, sync failures, and notification delivery.
- Performance budgets match non-functional requirements.
- On-call/support can diagnose missed reminders, sync failures, and auth issues.

---

## Phase 11

### Beta, Launch, and Production Deployment

Ship FocusTouch to beta users, then promote the MVP to production with measured rollout controls.

### Deliverables

- Production environment and deployment workflow.
- Beta cohort management.
- Launch checklist and rollback plan.
- Product analytics for activation, engagement, retention, reliability, and quality metrics.
- Privacy policy and terms links in-product.
- User feedback channel.
- Post-launch triage board.

### Files

- `infra/environments/production/`
- `infra/deploy/`
- `docs/launch-checklist.md`
- `docs/rollback-plan.md`
- `docs/analytics.md`
- `docs/privacy.md`
- `docs/terms.md`
- `docs/beta-feedback.md`

### Tests

- Production smoke test.
- Deployment rollback drill.
- Analytics event validation.
- End-to-end activation test from signup to first completed todo.
- Notification delivery test in production-like conditions.
- Backup restore drill.

### Acceptance Criteria

- A beta user can sign up, create todos, plan calendar time, receive reminders, write notes, create stickies, complete a Pomodoro, search, and sync across sessions.
- Deployment can be rolled back without data loss.
- Product metrics are visible within the first day of beta usage.
- Support and incident workflows are documented.
- MVP launch criteria from `docs/product.md` are satisfied or explicitly waived by product and engineering owners.

---

## Post-MVP Phase 12

### Depth and Reliability

Expand the MVP with the highest-value Phase 2 product scope.

### Deliverables

- Month calendar view.
- Calendar overlay for timed todos.
- Subtasks, tags, filters, and smart lists.
- Recurring todos.
- Bidirectional note links to tasks and events.
- Sticky board positions and sticky-to-note conversion.
- Quiet hours and focus-mode notification reductions.
- Markdown, JSON, and ICS exports.

### Files

- `apps/web/src/routes/calendar/month/`
- `apps/web/src/components/smart-lists/`
- `apps/web/src/components/sticky-board/`
- `apps/api/src/modules/recurrence/`
- `apps/api/src/modules/links/`
- `packages/domain/src/recurrence.ts`
- `packages/domain/src/link.ts`

### Tests

- Regression tests for recurring todos and reminders.
- Calendar overlay layout tests.
- Link integrity tests.
- Export format tests.
- E2E tests for smart lists and sticky board positioning.

### Acceptance Criteria

- Users can manage more complex task libraries without degrading Today.
- Linked notes, tasks, and events navigate consistently in both directions.
- Export formats are complete and documented.
- Quiet hours suppress non-critical notifications according to preference.
- Phase 12 changes do not regress MVP reliability metrics.

---

## Post-MVP Phase 13

### Connectivity

Connect FocusTouch to external systems without compromising speed or trust.

### Deliverables

- Two-way Google Calendar or Apple Calendar sync.
- Import from Todoist and Apple Reminders.
- Email-to-task or share-sheet capture.
- Basic API or webhook support for power users.
- Widgets and menu-bar timer exploration.

### Files

- `apps/api/src/modules/integrations/`
- `apps/api/src/modules/imports/`
- `apps/api/src/modules/webhooks/`
- `apps/web/src/routes/settings/integrations/`
- `packages/domain/src/integration.ts`
- `docs/integrations.md`

### Tests

- Contract tests against mocked provider APIs.
- Import mapping tests.
- Sync conflict tests for external calendar changes.
- Security tests for provider tokens and webhook signatures.
- E2E tests for connecting and disconnecting an integration.

### Acceptance Criteria

- Users can connect and disconnect supported integrations safely.
- External data syncs without duplicate storms or silent overwrites.
- Imported data is clearly attributed and reversible where feasible.
- Integration failures surface actionable retry or reconnect states.
- Provider credentials are stored and rotated securely.

---

## Post-MVP Phase 14

### Collaboration and Intelligence

Introduce team workflows and opt-in assistance only after the personal productivity loop is stable.

### Deliverables

- Shared lists and calendars for small teams.
- Todo assignment and comments.
- Shared notes with simple permissions.
- Guest or view-only links.
- Natural language capture.
- Opt-in task breakdown or schedule suggestions.
- Templates and planning insights.

### Files

- `apps/api/src/modules/collaboration/`
- `apps/api/src/modules/permissions/`
- `apps/api/src/modules/intelligence/`
- `apps/web/src/routes/shared/`
- `apps/web/src/components/collaboration/`
- `packages/domain/src/permission.ts`
- `packages/domain/src/share.ts`
- `docs/collaboration.md`
- `docs/intelligence.md`

### Tests

- Permission matrix tests.
- Shared entity isolation tests.
- Comment and assignment integration tests.
- Natural language parsing tests.
- AI safety, privacy, and opt-in tests.
- E2E tests for sharing a list and revoking access.

### Acceptance Criteria

- Shared data is visible only to authorized users.
- Personal workflows remain fast and uncluttered when collaboration is unused.
- Intelligence features are opt-in and explainable.
- Team features do not undermine the product's minimal-by-default principle.
- Collaboration can be disabled without affecting single-player MVP flows.

---

## Deployment Definition of Done

The project is ready for deployment when:

- Phase 0 through Phase 11 acceptance criteria are complete.
- MVP scope checklist in `docs/product.md` is satisfied.
- All critical and high-severity defects are closed or explicitly waived.
- Core user journeys pass in production-like conditions:
  - Signup to first completed todo.
  - Morning planning with Today, todos, calendar, and reminders.
  - Meeting note to action item.
  - Sticky capture to todo.
  - Pomodoro linked to todo.
  - Search and reopen prior work.
  - Cross-session sync.
- Rollback, backup, restore, incident response, and support playbooks are tested.
- Product, engineering, design, security, and support owners sign off on launch readiness.

