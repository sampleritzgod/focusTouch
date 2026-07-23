# FocusTouch - Architecture

**Version:** 1.0  
**Status:** Draft  
**Last updated:** 2026-07-23  
**Owner:** Engineering Architecture

---

## 1. Architecture Goals

FocusTouch is a mobile-first personal productivity system combining calendar, todos, reminders, notes, sticky notes, Pomodoro, search, notifications, and profile settings in one calm experience.

The architecture optimizes for:

- Fast capture in under 3 seconds.
- Reliable reminders and push notifications.
- Offline-safe creation and editing.
- Clear module ownership as features grow.
- Strong user data isolation through Clerk authentication.
- Simple operational model for an MVP, with room for later collaboration and integrations.

## 2. Tech Stack

| Layer | Technology | Responsibility |
|---|---|---|
| Mobile app | React Native, Expo, TypeScript | User interface, offline cache, optimistic mutations, push token registration |
| API | Node.js, Express, TypeScript | Authenticated REST API, validation, business use cases, sync endpoints |
| Database | PostgreSQL | Source of truth for user data, notification schedules, sync change log |
| ORM | Prisma | Type-safe persistence, migrations, query composition |
| Authentication | Clerk | Sign up, sign in, sessions, JWT verification, user lifecycle webhooks |
| Notifications | Expo Push Notifications | Device push delivery for reminders, events, todos, and Pomodoro |

---

## 3. Folder Structure

Recommended monorepo layout:

```text
focustouch/
  apps/
    mobile/
      app/
        _layout.tsx
        (auth)/
        (tabs)/
        modal/
      src/
        core/
          api/
          auth/
          config/
          errors/
          navigation/
          notifications/
          offline/
          storage/
          sync/
          theme/
          time/
        features/
          today/
          capture/
          calendar/
          todos/
          reminders/
          notes/
          stickies/
          pomodoro/
          search/
          profile/
        shared/
          components/
          hooks/
          icons/
          layouts/
          primitives/
          utils/
        test/
      assets/
      app.config.ts
      package.json
      tsconfig.json

    api/
      prisma/
        schema.prisma
        migrations/
        seed.ts
      src/
        app.ts
        server.ts
        core/
          auth/
          config/
          database/
          errors/
          http/
          jobs/
          logging/
          validation/
        modules/
          users/
          devices/
          today/
          capture/
          calendar/
          todos/
          reminders/
          notes/
          stickies/
          pomodoro/
          search/
          notifications/
          sync/
        shared/
          domain/
          events/
          types/
          utils/
        test/
      package.json
      tsconfig.json

  packages/
    shared/
      src/
        contracts/
        dto/
        enums/
        validation/
    config/
      eslint/
      typescript/

  docs/
    product.md
    architecture.md
```

Feature module structure should be consistent across frontend and backend:

```text
feature-name/
  domain/
  application/
  data/
  presentation/     mobile only
  http/             api only
  tests/
  index.ts
```

---

## 4. Clean Architecture

FocusTouch uses Clean Architecture at two levels: within the mobile app and within the API.

### 4.1 Frontend layers

| Layer | Contains | Rules |
|---|---|---|
| Presentation | Screens, components, navigation routes, form views | Calls hooks or use cases; does not call storage or HTTP directly |
| Application | Use cases, feature orchestration, optimistic mutation handlers | Coordinates domain logic, repositories, sync queue, and analytics |
| Domain | Entities, value objects, pure rules, type guards | No React, Expo, HTTP, storage, or framework imports |
| Data | API clients, local repositories, cache adapters, mappers | Implements repository interfaces from application/domain |
| Infrastructure | Clerk, Expo Notifications, secure storage, SQLite/AsyncStorage | Wrapped by core adapters so features are not vendor-coupled |

### 4.2 Backend layers

| Layer | Contains | Rules |
|---|---|---|
| HTTP | Express routes, controllers, request parsing | No business decisions beyond input normalization |
| Application | Use cases, transactions, authorization checks, scheduling commands | Owns workflow and consistency boundaries |
| Domain | Entity rules, recurrence rules, reminder state machine, sync conflict policy | Pure TypeScript where practical |
| Data | Prisma repositories and query builders | Hides Prisma from application services |
| Infrastructure | Clerk verification, Expo push client, job runner, logger | Exposed through interfaces |

### 4.3 Boundary rules

- Dependencies point inward toward domain rules.
- Modules communicate through application services or domain events, not direct table access from other modules.
- Shared contracts live in `packages/shared`; feature internals do not.
- Database models are not API response models.
- Clerk user IDs are external identity references, not the app's only user model.

---

## 5. Feature Modules

| Module | Frontend responsibility | Backend responsibility |
|---|---|---|
| Auth/Profile | Clerk session UI, profile preferences, timezone, theme | User shadow record, profile persistence, Clerk webhook handling |
| Today | Combined agenda view, current focus state, overdue grouping | Aggregated query across events, todos, reminders, Pomodoro |
| Capture | Quick-add parser UI, type selection, optimistic creation | Dispatch capture payload into todo/event/reminder/note/sticky use cases |
| Calendar | Day/week views, event forms, local event cache | Event CRUD, time range queries, notification scheduling |
| Todos | Inbox/lists, due dates, priority, completion | Todo/list CRUD, due notifications, Today visibility |
| Reminders | Reminder forms, snooze/complete actions | Reminder CRUD, recurrence, snooze, scheduler feed |
| Notes | Editor, note list, local search cache | Note CRUD, full text search indexing |
| Stickies | Sticky board/list, colors, convert to todo | Sticky CRUD, conversion workflow |
| Pomodoro | Timer state, task linking, local completion alert | Session log, linked todo updates, completion notification |
| Search | Unified search UI and recent results | Search across user-owned entities |
| Notifications | Permission flow, token registration, in-app notification handling | Token registry, notification jobs, delivery audit |
| Sync | Outbox, pull/push lifecycle, conflict UI hooks | Change log, revision tokens, idempotent mutation handling |

---

## 6. Dependency Flow

```text
Mobile UI
  -> Feature application use cases
    -> Domain rules
    -> Repository interfaces
      -> Local cache adapter
      -> API adapter
        -> Express route
          -> Backend application use case
            -> Domain rules
            -> Repository interface
              -> Prisma repository
                -> PostgreSQL
```

Cross-cutting dependencies:

```text
Clerk SDK -> Auth adapter -> API auth middleware -> user context
Expo Notifications -> Notification adapter -> API token registry -> Expo push service
Offline storage -> Sync outbox -> Sync API -> PostgreSQL change log
```

Dependency constraints:

- `features/*/presentation` may depend on `features/*/application` and `core`.
- `features/*/application` may depend on domain contracts and repository interfaces.
- `features/*/domain` has no framework imports.
- `core` may depend on vendors, but vendors must not leak into feature domain types.
- Backend modules may publish domain events such as `ReminderScheduled` or `TodoCompleted`; subscribers perform side effects like notification scheduling.

---

## 7. API Architecture

### 7.1 API style

Use REST over HTTPS for MVP. Keep endpoints resource-oriented, predictable, and easy to cache locally. Use JSON request and response bodies.

Base path:

```text
/api/v1
```

Request requirements:

- `Authorization: Bearer <Clerk JWT>` for all user data routes.
- `Idempotency-Key` for create/update/delete mutations initiated by the offline outbox.
- `X-Client-Version` for compatibility checks.
- `X-Device-Id` for sync and notification diagnostics.

Response envelope:

```text
{
  "data": {},
  "meta": {
    "requestId": "...",
    "serverTime": "...",
    "revision": 123
  }
}
```

Error envelope:

```text
{
  "error": {
    "code": "TODO_NOT_FOUND",
    "message": "Todo was not found.",
    "details": {},
    "requestId": "..."
  }
}
```

### 7.2 Endpoint groups

| Area | Endpoints |
|---|---|
| Health | `GET /health`, `GET /ready` |
| Users | `GET /me`, `PATCH /me`, `DELETE /me` |
| Devices | `POST /devices`, `PATCH /devices/:id`, `DELETE /devices/:id` |
| Today | `GET /today?date=YYYY-MM-DD&timezone=...` |
| Capture | `POST /capture` |
| Calendar | `GET /events`, `POST /events`, `GET /events/:id`, `PATCH /events/:id`, `DELETE /events/:id` |
| Todo lists | `GET /todo-lists`, `POST /todo-lists`, `PATCH /todo-lists/:id`, `DELETE /todo-lists/:id` |
| Todos | `GET /todos`, `POST /todos`, `PATCH /todos/:id`, `DELETE /todos/:id`, `POST /todos/:id/complete`, `POST /todos/:id/reopen` |
| Reminders | `GET /reminders`, `POST /reminders`, `PATCH /reminders/:id`, `DELETE /reminders/:id`, `POST /reminders/:id/snooze`, `POST /reminders/:id/complete` |
| Notes | `GET /notes`, `POST /notes`, `GET /notes/:id`, `PATCH /notes/:id`, `DELETE /notes/:id` |
| Stickies | `GET /stickies`, `POST /stickies`, `PATCH /stickies/:id`, `DELETE /stickies/:id`, `POST /stickies/:id/convert-to-todo` |
| Pomodoro | `GET /pomodoro/sessions`, `POST /pomodoro/sessions`, `PATCH /pomodoro/sessions/:id`, `POST /pomodoro/sessions/:id/complete` |
| Search | `GET /search?q=...&types=...` |
| Notifications | `POST /push-tokens`, `DELETE /push-tokens/:id`, `GET /notification-preferences`, `PATCH /notification-preferences` |
| Sync | `GET /sync/pull?sinceRevision=...`, `POST /sync/push`, `POST /sync/ack` |
| Webhooks | `POST /webhooks/clerk` |

### 7.3 API implementation pattern

Each backend module follows this request path:

```text
route -> auth middleware -> validation -> controller -> use case -> repository -> Prisma -> response mapper
```

Use cases own transactions when a workflow updates multiple tables. Examples:

- Converting a sticky to a todo archives the sticky and creates a todo in one transaction.
- Completing a reminder with recurrence creates or schedules the next occurrence in one transaction.
- Updating an event time reschedules related notifications in one transaction.

---

## 8. Database Architecture

### 8.1 Principles

- PostgreSQL is the source of truth.
- Every user-owned row includes `userId`.
- IDs are UUIDs generated client-side for offline-created entities when possible.
- Soft delete user content with `deletedAt` to support sync tombstones.
- Store timestamps in UTC; render with the user's timezone.
- Use database constraints for ownership, uniqueness, and valid enum values.

### 8.2 Core tables

| Table | Purpose | Key fields |
|---|---|---|
| `users` | App shadow user for Clerk identity | `id`, `clerkUserId`, `email`, `displayName`, `timezone`, `createdAt`, `updatedAt`, `deletedAt` |
| `devices` | Signed-in device registry | `id`, `userId`, `platform`, `appVersion`, `lastSeenAt` |
| `push_tokens` | Expo push tokens per device | `id`, `userId`, `deviceId`, `expoPushToken`, `enabled`, `lastValidatedAt` |
| `notification_preferences` | Per-user notification settings | `userId`, `remindersEnabled`, `eventsEnabled`, `todosEnabled`, `pomodoroEnabled`, `quietHours` |
| `todo_lists` | Inbox and custom lists | `id`, `userId`, `name`, `sortOrder`, `isInbox`, `deletedAt` |
| `todos` | Tasks and completion state | `id`, `userId`, `listId`, `title`, `notes`, `dueAt`, `priority`, `status`, `completedAt`, `deletedAt` |
| `calendar_events` | Calendar blocks | `id`, `userId`, `title`, `startsAt`, `endsAt`, `allDay`, `description`, `deletedAt` |
| `reminders` | Reminder rules and next fire time | `id`, `userId`, `title`, `remindAt`, `recurrenceRule`, `status`, `snoozedUntil`, `deletedAt` |
| `notes` | Lightweight documents | `id`, `userId`, `title`, `body`, `plainText`, `deletedAt` |
| `sticky_notes` | Ephemeral visual notes | `id`, `userId`, `text`, `color`, `position`, `archivedAt`, `deletedAt` |
| `pomodoro_sessions` | Focus session history | `id`, `userId`, `todoId`, `startedAt`, `endedAt`, `durationMinutes`, `status` |
| `scheduled_notifications` | Server-side notification queue | `id`, `userId`, `entityType`, `entityId`, `scheduledFor`, `status`, `sentAt` |
| `entity_changes` | Server change log for sync | `id`, `userId`, `entityType`, `entityId`, `operation`, `revision`, `changedAt` |
| `idempotency_keys` | Mutation replay protection | `key`, `userId`, `requestHash`, `responseHash`, `createdAt` |

### 8.3 Relationships

- `users` has many `devices`, `push_tokens`, `todo_lists`, `todos`, `calendar_events`, `reminders`, `notes`, `sticky_notes`, and `pomodoro_sessions`.
- `todo_lists` has many `todos`.
- `todos` has many `pomodoro_sessions`.
- `scheduled_notifications` references user-owned entities through `entityType` and `entityId`.
- `entity_changes` records mutations for all syncable entities.

### 8.4 Indexing strategy

| Query | Index |
|---|---|
| Current user by Clerk identity | Unique index on `users.clerkUserId` |
| Today agenda | Composite indexes on `(userId, startsAt)`, `(userId, dueAt)`, `(userId, remindAt)` |
| Active todos by list | `(userId, listId, status, sortOrder)` |
| Pending notifications | `(status, scheduledFor)` |
| Sync pull | `(userId, revision)` |
| Search notes | PostgreSQL full-text index on note title/body plain text |
| Soft delete filtering | Include `deletedAt` in partial indexes for active rows |

### 8.5 Prisma usage

- Prisma schema models mirror database tables, not domain entities.
- Repositories map Prisma records to domain objects.
- Migrations are the only way to change schema.
- Use transactions for cross-entity workflows and sync change logging.
- Avoid leaking Prisma errors to HTTP responses; map them to application error codes.

---

## 9. Authentication Flow

### 9.1 Sign up and sign in

```text
User opens app
  -> Clerk sign-in/sign-up screen
  -> Clerk creates session
  -> Mobile app receives session token
  -> Mobile app calls GET /api/v1/me
  -> API verifies Clerk JWT
  -> API finds or creates users row
  -> API returns profile and preferences
```

### 9.2 API authorization

- Express auth middleware verifies Clerk JWT on every protected route.
- Middleware resolves `clerkUserId` to internal `user.id`.
- Controllers receive `currentUser`, never raw trust in request body user IDs.
- Repositories scope every query by `userId`.
- Attempts to access another user's entity return `404` rather than exposing existence.

### 9.3 Clerk webhooks

`POST /api/v1/webhooks/clerk` handles:

- User created: pre-create shadow user when possible.
- User updated: sync primary email and display name.
- User deleted: enqueue account deletion or anonymization workflow.

Webhook requirements:

- Verify Clerk webhook signature.
- Process events idempotently.
- Store minimal webhook audit metadata for debugging.

---

## 10. Notification Flow

### 10.1 Device registration

```text
App requests notification permission
  -> Expo returns push token
  -> App sends token with device ID to POST /push-tokens
  -> API stores token and marks device notification-capable
```

### 10.2 Scheduling

Notification-producing use cases publish scheduling commands:

- Reminder created or updated.
- Event created or updated with notification lead time.
- Todo due time created or updated.
- Pomodoro session started or completed.
- Reminder snoozed.

The API writes `scheduled_notifications` rows with `scheduledFor` in UTC.

### 10.3 Delivery

```text
Notification worker polls due scheduled_notifications
  -> loads enabled push tokens for the user
  -> sends messages through Expo Push Notifications
  -> stores Expo ticket IDs and delivery status
  -> marks notification sent, failed, or retryable
```

Delivery rules:

- Respect user notification preferences.
- Respect quiet hours except critical reminder alerts the user explicitly allowed.
- Deduplicate by `entityType`, `entityId`, and scheduled occurrence.
- Retry transient Expo errors with capped backoff.
- Disable invalid tokens when Expo reports them as unregistered.

### 10.4 Client handling

- Foreground notifications show in-app banners.
- Background notifications deep link to the entity detail screen.
- Supported quick actions call the API for complete, snooze, or open.
- If push permission is denied, the app falls back to in-app reminders while open.

---

## 11. Error Handling Strategy

### 11.1 Error taxonomy

| Category | HTTP status | Examples |
|---|---:|---|
| Validation | 400 | Invalid due date, empty title, invalid recurrence |
| Authentication | 401 | Missing or expired Clerk token |
| Authorization / ownership | 404 | Entity not found for current user |
| Conflict | 409 | Stale revision, duplicate idempotency key mismatch |
| Rate limit | 429 | Too many capture or sync requests |
| External dependency | 502/503 | Clerk or Expo unavailable |
| Unexpected | 500 | Unhandled server failure |

### 11.2 Backend handling

- Throw typed application errors from use cases.
- Central Express error middleware maps errors to stable API codes.
- Log request ID, user ID, route, error code, and safe metadata.
- Never log tokens, note bodies, or sensitive user content.
- Return generic messages for unexpected failures.

### 11.3 Frontend handling

- Map API error codes to user-friendly copy.
- Keep optimistic local changes in pending/error state when sync fails.
- Provide retry affordances for failed mutations.
- Use field-level validation for forms before submitting.
- Surface global auth expiration by returning the user to Clerk re-auth.

### 11.4 Observability

Track:

- API latency and error rate by route.
- Sync push/pull success rate.
- Notification scheduled/sent/failed counts.
- Client crash-free sessions.
- Offline outbox age and retry counts.

---

## 12. Offline Strategy

### 12.1 Offline posture

FocusTouch should feel offline-capable for daily personal productivity. The mobile app keeps a local cache and lets users create or edit core entities while offline.

MVP offline support:

- Read cached Today, todos, notes, reminders, events, stickies, and recent Pomodoro sessions.
- Create, update, complete, snooze, and delete entities offline.
- Queue mutations in a durable local outbox.
- Show sync state for pending and failed changes.

### 12.2 Local storage

Recommended storage split:

| Data | Storage |
|---|---|
| Clerk session | Clerk secure storage integration |
| Push/device identifiers | Secure storage |
| Entity cache | Local SQLite through Expo-compatible storage |
| Mutation outbox | Local SQLite |
| Lightweight UI preferences | AsyncStorage or SQLite |

### 12.3 Offline UX rules

- Optimistic writes update the UI immediately.
- Pending items show subtle sync indicators only where useful.
- Destructive actions are reversible when possible until synced.
- Search works against the local cache when offline.
- Notification permission and push token updates wait for connectivity.

### 12.4 Local notifications

For near-term reminders created on the device, schedule local notifications as a backup when platform capabilities allow. Server push remains the source of truth for cross-device reliability.

---

## 13. Sync Strategy

### 13.1 Model

Use revision-based incremental sync with an idempotent mutation outbox.

Server:

- Assigns a monotonically increasing `revision` per committed user-visible change.
- Writes one `entity_changes` row per changed entity.
- Returns tombstones for soft-deleted entities.

Client:

- Stores `lastPulledRevision`.
- Stores local entity cache.
- Stores pending mutations with `idempotencyKey`, `entityId`, `operation`, and payload.

### 13.2 Pull flow

```text
Client calls GET /sync/pull?sinceRevision=N
  -> API verifies user
  -> API returns changed entities and tombstones after N
  -> Client applies changes to local cache
  -> Client stores latest revision
```

### 13.3 Push flow

```text
Client appends mutation to local outbox
  -> UI updates optimistically
  -> Sync worker sends POST /sync/push
  -> API applies each mutation idempotently in a transaction
  -> API writes entity_changes rows
  -> API returns accepted mutations and new revisions
  -> Client marks outbox entries complete
  -> Client pulls latest changes
```

### 13.4 Conflict policy

Default policy is field-level last-write-wins using server commit time, with domain-specific exceptions:

- Todo completion wins over stale title edits only for `status` and `completedAt`.
- Reminder snooze creates a new scheduled occurrence and should not be overwritten by stale reminder edits.
- Note body conflicts keep the server version and preserve the local unsynced version as a recoverable draft.
- Calendar event time conflicts prefer the latest server commit and surface a subtle conflict notice if the event was edited on two devices.

### 13.5 Sync triggers

- App foreground.
- Network reconnect.
- Auth session refresh.
- Manual pull-to-refresh.
- Periodic background sync when Expo/platform capabilities allow.
- After every successful mutation push.

### 13.6 Idempotency and ordering

- Every client mutation includes a stable idempotency key.
- The server stores processed keys per user.
- Mutations for the same entity are applied in client order.
- Independent entity mutations may be applied in batch.
- The server rejects stale mutations only when they violate domain invariants; otherwise it records a new revision.

---

## 14. Security and Privacy

- Enforce HTTPS everywhere.
- Verify every Clerk JWT server-side.
- Scope every database query by internal `userId`.
- Store Expo push tokens as user data and delete them on logout/account deletion.
- Redact note bodies, todo titles, and tokens from logs.
- Use least-privilege database credentials for the API.
- Add rate limits for auth-adjacent, capture, search, and sync endpoints.
- Provide export/delete workflows no later than post-MVP Phase 2.

---

## 15. Deployment and Operations

Recommended MVP services:

- Mobile app distributed through Expo EAS builds.
- API deployed as a stateless Node.js service.
- PostgreSQL managed by a reliable hosted provider.
- Background worker deployed separately from the API process for notification delivery.
- Prisma migrations run as a controlled release step.

Operational checks:

- `GET /health` validates process health.
- `GET /ready` validates database connectivity and critical configuration.
- Notification worker exposes queue lag and send failure metrics.
- Sync metrics alert on elevated conflict or failed mutation rates.

---

## 16. Testing Strategy

Architecture-level testing expectations:

- Domain unit tests for recurrence, reminder state, Pomodoro timing, and sync conflict rules.
- API integration tests for authenticated CRUD and ownership isolation.
- Repository tests around Prisma transactions and soft deletes.
- Mobile tests for feature use cases with mocked repositories.
- End-to-end smoke tests for sign in, quick capture, Today rendering, reminder scheduling, and sync.
- Contract tests for shared DTOs between mobile and API.

---

## 17. Architecture Decisions

| Decision | Choice | Rationale |
|---|---|---|
| API style | REST for MVP | Simple client caching, clear resource boundaries, easy Express implementation |
| Auth provider | Clerk | Reduces auth surface area and supports mobile sessions/OAuth |
| Notifications | Expo Push Notifications plus local fallback | Fits Expo stack and supports cross-platform delivery |
| Data ownership | Internal user table linked to Clerk | Keeps app data stable if auth provider details change |
| Offline model | Local cache plus mutation outbox | Supports fast capture and protects against data loss |
| Sync model | Revision-based incremental sync | Easier to reason about than full CRDTs for MVP |
| Backend modularity | Feature modules with Clean Architecture | Maintains boundaries as product pillars expand |

---

## 18. Open Architecture Questions

1. Should MVP support both iOS and Android, or pick one mobile platform first for notification reliability validation?
2. Should notes use Markdown, limited rich text JSON, or a future-compatible block format?
3. How much Pomodoro state should be server-authoritative versus local-device authoritative?
4. Should recurring reminders be materialized into occurrences or calculated on demand until fired?
5. What is the minimum acceptable conflict UI for notes and calendar edits in MVP?

---

*End of document - FocusTouch Architecture v1.0*
