# FocusTouch REST API Specification

**Version:** 1.0
**Status:** Draft
**Last updated:** 2026-07-23
**Owner:** Backend API

---

## 1. API Conventions

### Base URL

```text
https://api.focustouch.app/api/v1
```

### Content type

All request and response bodies use JSON.

```http
Content-Type: application/json
Accept: application/json
```

### Authentication

Authenticated endpoints require a bearer access token.

```http
Authorization: Bearer <accessToken>
```

Access tokens are short lived. Refresh tokens are long lived, revocable, and rotated on refresh.

### Identifiers and timestamps

- All resource IDs are UUID strings.
- All timestamps use ISO 8601 UTC strings, for example `2026-07-23T08:44:00Z`.
- Date-only fields use `YYYY-MM-DD`.
- Timezone values use IANA names, for example `America/New_York`.

### Pagination

List endpoints support cursor pagination unless noted otherwise.

| Query parameter | Validation | Description |
|---|---|---|
| `limit` | Integer from `1` to `100`; default `25` | Maximum items returned. |
| `cursor` | Opaque string | Cursor returned by the previous page. |

Paginated success responses use this shape:

```json
{
  "data": [],
  "page": {
    "nextCursor": "opaque-cursor-or-null",
    "hasMore": false
  }
}
```

### Standard error response

Every error response uses this envelope:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable summary.",
    "details": [
      {
        "field": "email",
        "message": "Must be a valid email address."
      }
    ],
    "requestId": "req_123"
  }
}
```

### Common status codes

| Status | Meaning |
|---|---|
| `200 OK` | Request succeeded. |
| `201 Created` | Resource created. |
| `202 Accepted` | Request accepted for asynchronous processing. |
| `204 No Content` | Request succeeded with no response body. |
| `400 Bad Request` | Malformed JSON, invalid query, or invalid state transition. |
| `401 Unauthorized` | Missing, expired, or invalid token. |
| `403 Forbidden` | Authenticated user cannot access the resource. |
| `404 Not Found` | Resource does not exist or is not visible to the user. |
| `409 Conflict` | Unique constraint, version conflict, or duplicate request. |
| `422 Unprocessable Entity` | Body is syntactically valid but fails business validation. |
| `429 Too Many Requests` | Rate limit exceeded. |
| `500 Internal Server Error` | Unexpected server error. |

---

## 2. Authentication APIs

| Method | URL | Body | Validation | Authentication | Success Response | Error Response | Status Codes |
|---|---|---|---|---|---|---|---|
| `POST` | `/api/v1/auth/register` | `{ "email": "alex@example.com", "password": "Secret123!", "displayName": "Alex", "timezone": "America/New_York" }` | `email` required and valid; `password` min 10 chars with mixed character classes; `displayName` 1-80 chars; `timezone` valid IANA timezone. | Public. | `201` with `{ "user": User, "accessToken": "...", "refreshToken": "..." }`. | Standard error with `VALIDATION_ERROR`, `EMAIL_ALREADY_REGISTERED`, or `RATE_LIMITED`. | `201`, `400`, `409`, `422`, `429`, `500` |
| `POST` | `/api/v1/auth/login` | `{ "email": "alex@example.com", "password": "Secret123!" }` | `email` and `password` required; account must be active. | Public. | `200` with `{ "user": User, "accessToken": "...", "refreshToken": "..." }`. | Standard error with `INVALID_CREDENTIALS`, `ACCOUNT_LOCKED`, or `RATE_LIMITED`. | `200`, `400`, `401`, `403`, `429`, `500` |
| `POST` | `/api/v1/auth/refresh` | `{ "refreshToken": "..." }` | `refreshToken` required, unexpired, unrevoked, and latest rotation token. | Public with valid refresh token in body. | `200` with `{ "accessToken": "...", "refreshToken": "..." }`. | Standard error with `INVALID_REFRESH_TOKEN`, `TOKEN_REUSED`, or `RATE_LIMITED`. | `200`, `400`, `401`, `409`, `429`, `500` |
| `POST` | `/api/v1/auth/logout` | `{ "refreshToken": "..." }` | `refreshToken` required when revoking one session; omit only when `logoutAll` is true. | Bearer token required. | `204` with no body. | Standard error with `UNAUTHORIZED` or `INVALID_REFRESH_TOKEN`. | `204`, `400`, `401`, `500` |
| `POST` | `/api/v1/auth/logout-all` | `{ "logoutAll": true }` | `logoutAll` must be `true`. | Bearer token required. | `204` after all refresh tokens for the user are revoked. | Standard error with `UNAUTHORIZED` or `INVALID_STATE`. | `204`, `400`, `401`, `500` |
| `GET` | `/api/v1/auth/session` | None. | Access token must be valid. | Bearer token required. | `200` with `{ "user": User, "session": { "expiresAt": "..." } }`. | Standard error with `UNAUTHORIZED`. | `200`, `401`, `500` |
| `POST` | `/api/v1/auth/password/forgot` | `{ "email": "alex@example.com" }` | `email` required and valid. | Public. | `202` with `{ "message": "If the email exists, reset instructions were sent." }`. | Standard error with `VALIDATION_ERROR` or `RATE_LIMITED`. | `202`, `400`, `422`, `429`, `500` |
| `POST` | `/api/v1/auth/password/reset` | `{ "resetToken": "...", "newPassword": "NewSecret123!" }` | `resetToken` required and unexpired; `newPassword` min 10 chars with mixed character classes. | Public with valid reset token. | `204` after password update and token revocation. | Standard error with `INVALID_RESET_TOKEN`, `VALIDATION_ERROR`, or `RATE_LIMITED`. | `204`, `400`, `401`, `422`, `429`, `500` |
| `POST` | `/api/v1/auth/oauth/{provider}/callback` | `{ "code": "oauth-code", "redirectUri": "https://app.focustouch.app/auth/callback" }` | `provider` one of supported providers; `code` and `redirectUri` required; redirect URI must match registered client. | Public with provider authorization code. | `200` with `{ "user": User, "accessToken": "...", "refreshToken": "...", "isNewUser": false }`. | Standard error with `INVALID_OAUTH_PROVIDER`, `OAUTH_EXCHANGE_FAILED`, or `RATE_LIMITED`. | `200`, `400`, `401`, `409`, `429`, `500` |

---

## 3. Profile APIs

| Method | URL | Body | Validation | Authentication | Success Response | Error Response | Status Codes |
|---|---|---|---|---|---|---|---|
| `GET` | `/api/v1/profile` | None. | Access token must map to an active user. | Bearer token required. | `200` with `{ "profile": Profile }`. | Standard error with `UNAUTHORIZED` or `PROFILE_NOT_FOUND`. | `200`, `401`, `404`, `500` |
| `PATCH` | `/api/v1/profile` | `{ "displayName": "Alex Kim", "avatarUrl": "https://...", "timezone": "America/New_York", "locale": "en-US" }` | At least one field required; `displayName` 1-80 chars; `avatarUrl` HTTPS URL; `timezone` valid IANA timezone; `locale` valid BCP 47 tag. | Bearer token required. | `200` with `{ "profile": Profile }`. | Standard error with `VALIDATION_ERROR`, `UNAUTHORIZED`, or `PROFILE_NOT_FOUND`. | `200`, `400`, `401`, `404`, `422`, `500` |
| `PATCH` | `/api/v1/profile/email` | `{ "email": "new@example.com", "password": "Secret123!" }` | `email` valid and not already used; `password` required for password accounts. | Bearer token required. | `202` with `{ "message": "Verification email sent." }`. | Standard error with `EMAIL_ALREADY_REGISTERED`, `INVALID_CREDENTIALS`, or `VALIDATION_ERROR`. | `202`, `400`, `401`, `409`, `422`, `429`, `500` |
| `PATCH` | `/api/v1/profile/password` | `{ "currentPassword": "Secret123!", "newPassword": "NewSecret123!" }` | `currentPassword` required; `newPassword` min 10 chars and cannot equal current password. | Bearer token required. | `204` after password update and refresh-token revocation. | Standard error with `INVALID_CREDENTIALS`, `VALIDATION_ERROR`, or `UNAUTHORIZED`. | `204`, `400`, `401`, `422`, `429`, `500` |
| `GET` | `/api/v1/profile/export` | None; optional query `format=json`. | `format` must be `json` for v1. | Bearer token required. | `202` with `{ "exportId": "...", "status": "queued" }`. | Standard error with `EXPORT_ALREADY_RUNNING` or `UNAUTHORIZED`. | `202`, `400`, `401`, `409`, `500` |
| `DELETE` | `/api/v1/profile` | `{ "password": "Secret123!", "confirm": "DELETE" }` | `confirm` must equal `DELETE`; password required for password accounts. | Bearer token required. | `202` with `{ "deletionId": "...", "scheduledFor": "..." }`. | Standard error with `INVALID_CREDENTIALS`, `VALIDATION_ERROR`, or `UNAUTHORIZED`. | `202`, `400`, `401`, `422`, `429`, `500` |

---

## 4. Todos APIs

### Todo lists

| Method | URL | Body | Validation | Authentication | Success Response | Error Response | Status Codes |
|---|---|---|---|---|---|---|---|
| `GET` | `/api/v1/todo-lists` | None. | Optional query `includeArchived` boolean. | Bearer token required. | `200` with `{ "data": [TodoList] }`. | Standard error with `UNAUTHORIZED` or `VALIDATION_ERROR`. | `200`, `400`, `401`, `500` |
| `POST` | `/api/v1/todo-lists` | `{ "name": "Inbox", "color": "blue", "position": 1 }` | `name` required, 1-80 chars, unique per user among active lists; `color` allowed token; `position` non-negative integer. | Bearer token required. | `201` with `{ "todoList": TodoList }`. | Standard error with `VALIDATION_ERROR`, `DUPLICATE_LIST_NAME`, or `UNAUTHORIZED`. | `201`, `400`, `401`, `409`, `422`, `500` |
| `PATCH` | `/api/v1/todo-lists/{listId}` | `{ "name": "Work", "color": "indigo", "position": 2, "archived": false }` | `listId` UUID; at least one mutable field; `name` unique per user; default Inbox cannot be archived. | Bearer token required. | `200` with `{ "todoList": TodoList }`. | Standard error with `LIST_NOT_FOUND`, `DUPLICATE_LIST_NAME`, or `VALIDATION_ERROR`. | `200`, `400`, `401`, `404`, `409`, `422`, `500` |
| `DELETE` | `/api/v1/todo-lists/{listId}` | None; optional query `moveTodosToListId`. | `listId` UUID; default Inbox cannot be deleted; `moveTodosToListId` must belong to user when provided. | Bearer token required. | `204` with no body. | Standard error with `LIST_NOT_FOUND`, `CANNOT_DELETE_DEFAULT_LIST`, or `VALIDATION_ERROR`. | `204`, `400`, `401`, `404`, `422`, `500` |

### Todos

| Method | URL | Body | Validation | Authentication | Success Response | Error Response | Status Codes |
|---|---|---|---|---|---|---|---|
| `GET` | `/api/v1/todos` | None; query `status`, `listId`, `dueFrom`, `dueTo`, `priority`, `tag`, `limit`, `cursor`. | Filters must use supported enum values; dates must be ISO 8601 or `YYYY-MM-DD`; IDs must be UUIDs. | Bearer token required. | `200` with paginated `{ "data": [Todo], "page": Page }`. | Standard error with `VALIDATION_ERROR` or `UNAUTHORIZED`. | `200`, `400`, `401`, `422`, `500` |
| `POST` | `/api/v1/todos` | `{ "title": "Draft API docs", "listId": "...", "notes": "", "dueAt": "2026-07-23T17:00:00Z", "priority": "high", "tags": ["work"], "reminderAt": "2026-07-23T16:30:00Z", "parentTodoId": null }` | `title` required, 1-200 chars; `listId` owned by user or defaults to Inbox; `dueAt` after now when time-specific; `priority` one of `low`, `medium`, `high`; max 20 tags; `parentTodoId` owned by user. | Bearer token required. | `201` with `{ "todo": Todo }`. | Standard error with `VALIDATION_ERROR`, `LIST_NOT_FOUND`, `PARENT_TODO_NOT_FOUND`, or `UNAUTHORIZED`. | `201`, `400`, `401`, `404`, `422`, `500` |
| `GET` | `/api/v1/todos/{todoId}` | None. | `todoId` must be a UUID owned by the user. | Bearer token required. | `200` with `{ "todo": Todo }`. | Standard error with `TODO_NOT_FOUND` or `UNAUTHORIZED`. | `200`, `400`, `401`, `404`, `500` |
| `PATCH` | `/api/v1/todos/{todoId}` | `{ "title": "Draft API docs v1", "listId": "...", "notes": "Scope: MVP", "dueAt": null, "priority": "medium", "tags": ["api"], "reminderAt": null }` | `todoId` UUID; at least one mutable field; field rules match create; completed todos may be edited but retain completion state. | Bearer token required. | `200` with `{ "todo": Todo }`. | Standard error with `TODO_NOT_FOUND`, `LIST_NOT_FOUND`, `VALIDATION_ERROR`, or `UNAUTHORIZED`. | `200`, `400`, `401`, `404`, `422`, `500` |
| `DELETE` | `/api/v1/todos/{todoId}` | None. | `todoId` must be a UUID owned by the user. | Bearer token required. | `204` with no body. | Standard error with `TODO_NOT_FOUND` or `UNAUTHORIZED`. | `204`, `400`, `401`, `404`, `500` |
| `POST` | `/api/v1/todos/{todoId}/complete` | `{ "completedAt": "2026-07-23T18:00:00Z" }` | `todoId` UUID; `completedAt` optional ISO 8601 timestamp; todo must not already be completed. | Bearer token required. | `200` with `{ "todo": Todo }`. | Standard error with `TODO_NOT_FOUND`, `ALREADY_COMPLETED`, or `VALIDATION_ERROR`. | `200`, `400`, `401`, `404`, `409`, `422`, `500` |
| `POST` | `/api/v1/todos/{todoId}/reopen` | `{ "reason": "Need another pass" }` | `todoId` UUID; todo must be completed; `reason` optional, max 300 chars. | Bearer token required. | `200` with `{ "todo": Todo }`. | Standard error with `TODO_NOT_FOUND`, `NOT_COMPLETED`, or `VALIDATION_ERROR`. | `200`, `400`, `401`, `404`, `409`, `422`, `500` |

---

## 5. Notes APIs

| Method | URL | Body | Validation | Authentication | Success Response | Error Response | Status Codes |
|---|---|---|---|---|---|---|---|
| `GET` | `/api/v1/notes` | None; query `q`, `linkedType`, `linkedId`, `limit`, `cursor`. | `q` max 200 chars; `linkedType` one of `todo`, `calendar_event`, `sticky_note`; `linkedId` UUID when present. | Bearer token required. | `200` with paginated `{ "data": [NoteSummary], "page": Page }`. | Standard error with `VALIDATION_ERROR` or `UNAUTHORIZED`. | `200`, `400`, `401`, `422`, `500` |
| `POST` | `/api/v1/notes` | `{ "title": "Meeting notes", "body": { "format": "markdown", "content": "..." }, "linkedResources": [{ "type": "calendar_event", "id": "..." }] }` | `title` required, 1-200 chars; `body.format` one of `markdown`, `plain_text`; `body.content` max 1 MB; linked resources must be owned by user. | Bearer token required. | `201` with `{ "note": Note }`. | Standard error with `VALIDATION_ERROR`, `LINKED_RESOURCE_NOT_FOUND`, or `UNAUTHORIZED`. | `201`, `400`, `401`, `404`, `422`, `500` |
| `GET` | `/api/v1/notes/{noteId}` | None. | `noteId` must be a UUID owned by the user. | Bearer token required. | `200` with `{ "note": Note }`. | Standard error with `NOTE_NOT_FOUND` or `UNAUTHORIZED`. | `200`, `400`, `401`, `404`, `500` |
| `PATCH` | `/api/v1/notes/{noteId}` | `{ "title": "Updated notes", "body": { "format": "markdown", "content": "..." } }` | `noteId` UUID; at least one mutable field; body rules match create. | Bearer token required. | `200` with `{ "note": Note }`. | Standard error with `NOTE_NOT_FOUND`, `VALIDATION_ERROR`, or `UNAUTHORIZED`. | `200`, `400`, `401`, `404`, `422`, `500` |
| `DELETE` | `/api/v1/notes/{noteId}` | None. | `noteId` must be a UUID owned by the user. | Bearer token required. | `204` with no body. | Standard error with `NOTE_NOT_FOUND` or `UNAUTHORIZED`. | `204`, `400`, `401`, `404`, `500` |
| `POST` | `/api/v1/notes/{noteId}/links` | `{ "type": "todo", "id": "..." }` | `noteId` UUID; `type` one of `todo`, `calendar_event`, `sticky_note`; linked ID must exist and be owned by user; duplicate links rejected. | Bearer token required. | `201` with `{ "link": ResourceLink }`. | Standard error with `NOTE_NOT_FOUND`, `LINKED_RESOURCE_NOT_FOUND`, `DUPLICATE_LINK`, or `VALIDATION_ERROR`. | `201`, `400`, `401`, `404`, `409`, `422`, `500` |
| `DELETE` | `/api/v1/notes/{noteId}/links/{linkId}` | None. | `noteId` and `linkId` must be UUIDs owned by the user. | Bearer token required. | `204` with no body. | Standard error with `NOTE_NOT_FOUND`, `LINK_NOT_FOUND`, or `UNAUTHORIZED`. | `204`, `400`, `401`, `404`, `500` |

---

## 6. Sticky Notes APIs

| Method | URL | Body | Validation | Authentication | Success Response | Error Response | Status Codes |
|---|---|---|---|---|---|---|---|
| `GET` | `/api/v1/sticky-notes` | None; query `boardId`, `archived`, `limit`, `cursor`. | `boardId` UUID when provided; `archived` boolean. | Bearer token required. | `200` with paginated `{ "data": [StickyNote], "page": Page }`. | Standard error with `VALIDATION_ERROR` or `UNAUTHORIZED`. | `200`, `400`, `401`, `422`, `500` |
| `POST` | `/api/v1/sticky-notes` | `{ "text": "Call Sam", "color": "yellow", "boardId": null, "position": { "x": 120, "y": 240 }, "pinned": true }` | `text` required, 1-1000 chars; `color` allowed token; `boardId` owned by user when present; `position.x` and `position.y` finite numbers. | Bearer token required. | `201` with `{ "stickyNote": StickyNote }`. | Standard error with `VALIDATION_ERROR`, `BOARD_NOT_FOUND`, or `UNAUTHORIZED`. | `201`, `400`, `401`, `404`, `422`, `500` |
| `GET` | `/api/v1/sticky-notes/{stickyId}` | None. | `stickyId` must be a UUID owned by the user. | Bearer token required. | `200` with `{ "stickyNote": StickyNote }`. | Standard error with `STICKY_NOTE_NOT_FOUND` or `UNAUTHORIZED`. | `200`, `400`, `401`, `404`, `500` |
| `PATCH` | `/api/v1/sticky-notes/{stickyId}` | `{ "text": "Call Sam tomorrow", "color": "pink", "position": { "x": 160, "y": 260 }, "pinned": false, "archived": false }` | `stickyId` UUID; at least one mutable field; field rules match create. | Bearer token required. | `200` with `{ "stickyNote": StickyNote }`. | Standard error with `STICKY_NOTE_NOT_FOUND`, `VALIDATION_ERROR`, or `UNAUTHORIZED`. | `200`, `400`, `401`, `404`, `422`, `500` |
| `DELETE` | `/api/v1/sticky-notes/{stickyId}` | None. | `stickyId` must be a UUID owned by the user. | Bearer token required. | `204` with no body. | Standard error with `STICKY_NOTE_NOT_FOUND` or `UNAUTHORIZED`. | `204`, `400`, `401`, `404`, `500` |
| `POST` | `/api/v1/sticky-notes/{stickyId}/convert-to-todo` | `{ "listId": "...", "dueAt": "2026-07-24T15:00:00Z", "priority": "medium", "archiveSticky": true }` | `stickyId` UUID; sticky must be active; `listId` owned by user or defaults to Inbox; `priority` supported enum. | Bearer token required. | `201` with `{ "todo": Todo, "stickyNote": StickyNote }`. | Standard error with `STICKY_NOTE_NOT_FOUND`, `LIST_NOT_FOUND`, `VALIDATION_ERROR`, or `UNAUTHORIZED`. | `201`, `400`, `401`, `404`, `422`, `500` |
| `POST` | `/api/v1/sticky-notes/{stickyId}/convert-to-note` | `{ "title": "Idea", "archiveSticky": true }` | `stickyId` UUID; sticky must be active; `title` optional 1-200 chars. | Bearer token required. | `201` with `{ "note": Note, "stickyNote": StickyNote }`. | Standard error with `STICKY_NOTE_NOT_FOUND`, `VALIDATION_ERROR`, or `UNAUTHORIZED`. | `201`, `400`, `401`, `404`, `422`, `500` |

---

## 7. Focus Timer APIs

| Method | URL | Body | Validation | Authentication | Success Response | Error Response | Status Codes |
|---|---|---|---|---|---|---|---|
| `GET` | `/api/v1/focus/sessions` | None; query `from`, `to`, `todoId`, `status`, `limit`, `cursor`. | `from` and `to` ISO 8601 timestamps; range max 366 days; `todoId` UUID owned by user; `status` supported enum. | Bearer token required. | `200` with paginated `{ "data": [FocusSession], "page": Page }`. | Standard error with `VALIDATION_ERROR` or `UNAUTHORIZED`. | `200`, `400`, `401`, `422`, `500` |
| `GET` | `/api/v1/focus/sessions/active` | None. | User may have at most one active session. | Bearer token required. | `200` with `{ "focusSession": FocusSession|null }`. | Standard error with `UNAUTHORIZED`. | `200`, `401`, `500` |
| `POST` | `/api/v1/focus/sessions/start` | `{ "mode": "work", "durationMinutes": 25, "breakMinutes": 5, "todoId": "...", "label": "API design" }` | `mode` one of `work`, `short_break`, `long_break`; `durationMinutes` 1-180; `breakMinutes` 0-60; `todoId` owned by user when present; no other active session. | Bearer token required. | `201` with `{ "focusSession": FocusSession }`. | Standard error with `ACTIVE_SESSION_EXISTS`, `TODO_NOT_FOUND`, `VALIDATION_ERROR`, or `UNAUTHORIZED`. | `201`, `400`, `401`, `404`, `409`, `422`, `500` |
| `POST` | `/api/v1/focus/sessions/{sessionId}/pause` | `{ "pausedAt": "2026-07-23T09:00:00Z" }` | `sessionId` UUID; session must be active and not already paused; `pausedAt` optional ISO 8601. | Bearer token required. | `200` with `{ "focusSession": FocusSession }`. | Standard error with `SESSION_NOT_FOUND`, `INVALID_SESSION_STATE`, or `VALIDATION_ERROR`. | `200`, `400`, `401`, `404`, `409`, `422`, `500` |
| `POST` | `/api/v1/focus/sessions/{sessionId}/resume` | `{ "resumedAt": "2026-07-23T09:05:00Z" }` | `sessionId` UUID; session must be paused; `resumedAt` optional ISO 8601. | Bearer token required. | `200` with `{ "focusSession": FocusSession }`. | Standard error with `SESSION_NOT_FOUND`, `INVALID_SESSION_STATE`, or `VALIDATION_ERROR`. | `200`, `400`, `401`, `404`, `409`, `422`, `500` |
| `POST` | `/api/v1/focus/sessions/{sessionId}/complete` | `{ "completedAt": "2026-07-23T09:25:00Z" }` | `sessionId` UUID; session must be active or paused; `completedAt` optional ISO 8601. | Bearer token required. | `200` with `{ "focusSession": FocusSession, "earnedBreakMinutes": 5 }`. | Standard error with `SESSION_NOT_FOUND`, `INVALID_SESSION_STATE`, or `VALIDATION_ERROR`. | `200`, `400`, `401`, `404`, `409`, `422`, `500` |
| `POST` | `/api/v1/focus/sessions/{sessionId}/cancel` | `{ "reason": "Interrupted" }` | `sessionId` UUID; session must be active or paused; `reason` optional max 300 chars. | Bearer token required. | `200` with `{ "focusSession": FocusSession }`. | Standard error with `SESSION_NOT_FOUND`, `INVALID_SESSION_STATE`, or `VALIDATION_ERROR`. | `200`, `400`, `401`, `404`, `409`, `422`, `500` |
| `GET` | `/api/v1/focus/stats` | None; query `from`, `to`, `groupBy`. | `from` and `to` date or ISO 8601; range max 366 days; `groupBy` one of `day`, `week`, `month`. | Bearer token required. | `200` with `{ "stats": FocusStats }`. | Standard error with `VALIDATION_ERROR` or `UNAUTHORIZED`. | `200`, `400`, `401`, `422`, `500` |

---

## 8. Notifications APIs

| Method | URL | Body | Validation | Authentication | Success Response | Error Response | Status Codes |
|---|---|---|---|---|---|---|---|
| `GET` | `/api/v1/notifications` | None; query `status`, `type`, `from`, `to`, `limit`, `cursor`. | `status` one of `unread`, `read`, `dismissed`; `type` supported enum; date range max 180 days. | Bearer token required. | `200` with paginated `{ "data": [Notification], "page": Page }`. | Standard error with `VALIDATION_ERROR` or `UNAUTHORIZED`. | `200`, `400`, `401`, `422`, `500` |
| `GET` | `/api/v1/notifications/unread-count` | None. | Access token must be valid. | Bearer token required. | `200` with `{ "count": 4 }`. | Standard error with `UNAUTHORIZED`. | `200`, `401`, `500` |
| `PATCH` | `/api/v1/notifications/{notificationId}/read` | `{ "read": true }` | `notificationId` UUID; `read` boolean required. | Bearer token required. | `200` with `{ "notification": Notification }`. | Standard error with `NOTIFICATION_NOT_FOUND`, `VALIDATION_ERROR`, or `UNAUTHORIZED`. | `200`, `400`, `401`, `404`, `422`, `500` |
| `POST` | `/api/v1/notifications/{notificationId}/snooze` | `{ "snoozeUntil": "2026-07-23T10:00:00Z" }` | `notificationId` UUID; notification must support snooze; `snoozeUntil` future ISO 8601 timestamp. | Bearer token required. | `200` with `{ "notification": Notification }`. | Standard error with `NOTIFICATION_NOT_FOUND`, `SNOOZE_NOT_SUPPORTED`, or `VALIDATION_ERROR`. | `200`, `400`, `401`, `404`, `409`, `422`, `500` |
| `DELETE` | `/api/v1/notifications/{notificationId}` | None. | `notificationId` must be a UUID owned by user. | Bearer token required. | `204` with no body. | Standard error with `NOTIFICATION_NOT_FOUND` or `UNAUTHORIZED`. | `204`, `400`, `401`, `404`, `500` |
| `POST` | `/api/v1/notification-devices` | `{ "platform": "web", "pushToken": "...", "deviceName": "Chrome on Mac", "timezone": "America/New_York" }` | `platform` one of `web`, `ios`, `android`; `pushToken` required and unique per user; `deviceName` max 120 chars; `timezone` valid IANA timezone. | Bearer token required. | `201` with `{ "device": NotificationDevice }`. | Standard error with `VALIDATION_ERROR`, `DUPLICATE_DEVICE`, or `UNAUTHORIZED`. | `201`, `400`, `401`, `409`, `422`, `500` |
| `DELETE` | `/api/v1/notification-devices/{deviceId}` | None. | `deviceId` must be a UUID owned by user. | Bearer token required. | `204` with no body. | Standard error with `DEVICE_NOT_FOUND` or `UNAUTHORIZED`. | `204`, `400`, `401`, `404`, `500` |
| `POST` | `/api/v1/notifications/test` | `{ "type": "reminder", "deviceId": "..." }` | `type` supported notification type; `deviceId` optional UUID owned by user. | Bearer token required. | `202` with `{ "deliveryId": "...", "status": "queued" }`. | Standard error with `DEVICE_NOT_FOUND`, `VALIDATION_ERROR`, or `NOTIFICATIONS_DISABLED`. | `202`, `400`, `401`, `404`, `409`, `422`, `500` |

---

## 9. Calendar APIs

| Method | URL | Body | Validation | Authentication | Success Response | Error Response | Status Codes |
|---|---|---|---|---|---|---|---|
| `GET` | `/api/v1/calendar/events` | None; query `from`, `to`, `view`, `includeTodos`, `limit`, `cursor`. | `from` and `to` required ISO 8601 or date strings; range max 366 days; `view` one of `day`, `week`, `month`; `includeTodos` boolean. | Bearer token required. | `200` with paginated `{ "data": [CalendarEvent], "page": Page }`. | Standard error with `VALIDATION_ERROR` or `UNAUTHORIZED`. | `200`, `400`, `401`, `422`, `500` |
| `POST` | `/api/v1/calendar/events` | `{ "title": "Deep work", "startsAt": "2026-07-23T14:00:00Z", "endsAt": "2026-07-23T15:30:00Z", "allDay": false, "location": "", "description": "", "color": "blue", "reminderMinutesBefore": 10, "linkedNoteId": null }` | `title` required, 1-200 chars; `startsAt` before `endsAt`; all-day events must align to dates; `reminderMinutesBefore` 0-10080; linked note owned by user. | Bearer token required. | `201` with `{ "event": CalendarEvent }`. | Standard error with `VALIDATION_ERROR`, `LINKED_NOTE_NOT_FOUND`, or `UNAUTHORIZED`. | `201`, `400`, `401`, `404`, `422`, `500` |
| `GET` | `/api/v1/calendar/events/{eventId}` | None. | `eventId` must be a UUID owned by the user. | Bearer token required. | `200` with `{ "event": CalendarEvent }`. | Standard error with `EVENT_NOT_FOUND` or `UNAUTHORIZED`. | `200`, `400`, `401`, `404`, `500` |
| `PATCH` | `/api/v1/calendar/events/{eventId}` | `{ "title": "Deep work block", "startsAt": "2026-07-23T15:00:00Z", "endsAt": "2026-07-23T16:00:00Z", "allDay": false, "location": "Home", "description": "API docs", "color": "indigo", "reminderMinutesBefore": 5 }` | `eventId` UUID; at least one mutable field; time and linked-resource rules match create. | Bearer token required. | `200` with `{ "event": CalendarEvent }`. | Standard error with `EVENT_NOT_FOUND`, `VALIDATION_ERROR`, or `UNAUTHORIZED`. | `200`, `400`, `401`, `404`, `422`, `500` |
| `DELETE` | `/api/v1/calendar/events/{eventId}` | None. | `eventId` must be a UUID owned by user. | Bearer token required. | `204` with no body. | Standard error with `EVENT_NOT_FOUND` or `UNAUTHORIZED`. | `204`, `400`, `401`, `404`, `500` |
| `GET` | `/api/v1/calendar/agenda` | None; query `date`, `timezone`, `includeOverdueTodos`. | `date` required `YYYY-MM-DD`; `timezone` valid IANA timezone; `includeOverdueTodos` boolean. | Bearer token required. | `200` with `{ "date": "2026-07-23", "events": [CalendarEvent], "todos": [Todo], "notifications": [Notification] }`. | Standard error with `VALIDATION_ERROR` or `UNAUTHORIZED`. | `200`, `400`, `401`, `422`, `500` |

---

## 10. Settings APIs

| Method | URL | Body | Validation | Authentication | Success Response | Error Response | Status Codes |
|---|---|---|---|---|---|---|---|
| `GET` | `/api/v1/settings` | None. | Access token must be valid. | Bearer token required. | `200` with `{ "settings": Settings }`. | Standard error with `UNAUTHORIZED` or `SETTINGS_NOT_FOUND`. | `200`, `401`, `404`, `500` |
| `PATCH` | `/api/v1/settings` | `{ "theme": "dark", "defaultView": "today", "timezone": "America/New_York", "timeFormat": "12h", "weekStart": "monday" }` | At least one field required; `theme` one of `system`, `light`, `dark`; `defaultView` one of `today`, `calendar`, `todos`, `notes`; `timeFormat` one of `12h`, `24h`; `weekStart` valid weekday. | Bearer token required. | `200` with `{ "settings": Settings }`. | Standard error with `VALIDATION_ERROR` or `UNAUTHORIZED`. | `200`, `400`, `401`, `422`, `500` |
| `PATCH` | `/api/v1/settings/notifications` | `{ "enabled": true, "quietHours": { "enabled": true, "start": "22:00", "end": "07:00" }, "types": { "todoDue": true, "eventStart": true, "focusComplete": true, "reminder": true } }` | Time values `HH:mm`; quiet-hours range may cross midnight; notification type keys must be supported booleans. | Bearer token required. | `200` with `{ "notificationSettings": NotificationSettings }`. | Standard error with `VALIDATION_ERROR` or `UNAUTHORIZED`. | `200`, `400`, `401`, `422`, `500` |
| `PATCH` | `/api/v1/settings/focus-timer` | `{ "workMinutes": 25, "shortBreakMinutes": 5, "longBreakMinutes": 15, "sessionsUntilLongBreak": 4, "autoStartBreaks": false, "suppressNotifications": true }` | Durations 1-180 minutes; `sessionsUntilLongBreak` 1-12; booleans required when present. | Bearer token required. | `200` with `{ "focusTimerSettings": FocusTimerSettings }`. | Standard error with `VALIDATION_ERROR` or `UNAUTHORIZED`. | `200`, `400`, `401`, `422`, `500` |
| `PATCH` | `/api/v1/settings/calendar` | `{ "defaultView": "week", "showWeekends": true, "showTodosOnCalendar": true, "defaultEventReminderMinutes": 10 }` | `defaultView` one of `day`, `week`, `month`; booleans required when present; reminder 0-10080 minutes. | Bearer token required. | `200` with `{ "calendarSettings": CalendarSettings }`. | Standard error with `VALIDATION_ERROR` or `UNAUTHORIZED`. | `200`, `400`, `401`, `422`, `500` |
| `POST` | `/api/v1/settings/reset` | `{ "scope": "all" }` | `scope` one of `all`, `notifications`, `focus_timer`, `calendar`, `appearance`. | Bearer token required. | `200` with `{ "settings": Settings }`. | Standard error with `VALIDATION_ERROR` or `UNAUTHORIZED`. | `200`, `400`, `401`, `422`, `500` |

---

## 11. Core Resource Shapes

These shapes define response payload names used by the endpoint tables. Implementations may add server-managed fields, but clients should not depend on undocumented properties.

### User

```json
{
  "id": "uuid",
  "email": "alex@example.com",
  "displayName": "Alex",
  "createdAt": "2026-07-23T08:44:00Z"
}
```

### Profile

```json
{
  "id": "uuid",
  "userId": "uuid",
  "displayName": "Alex",
  "avatarUrl": null,
  "timezone": "America/New_York",
  "locale": "en-US",
  "createdAt": "2026-07-23T08:44:00Z",
  "updatedAt": "2026-07-23T08:44:00Z"
}
```

### Todo

```json
{
  "id": "uuid",
  "listId": "uuid",
  "title": "Draft API docs",
  "notes": "",
  "status": "active",
  "priority": "high",
  "dueAt": "2026-07-23T17:00:00Z",
  "reminderAt": "2026-07-23T16:30:00Z",
  "tags": ["api"],
  "completedAt": null,
  "createdAt": "2026-07-23T08:44:00Z",
  "updatedAt": "2026-07-23T08:44:00Z"
}
```

### Note

```json
{
  "id": "uuid",
  "title": "Meeting notes",
  "body": {
    "format": "markdown",
    "content": "..."
  },
  "linkedResources": [],
  "createdAt": "2026-07-23T08:44:00Z",
  "updatedAt": "2026-07-23T08:44:00Z"
}
```

### StickyNote

```json
{
  "id": "uuid",
  "text": "Call Sam",
  "color": "yellow",
  "boardId": null,
  "position": {
    "x": 120,
    "y": 240
  },
  "pinned": true,
  "archived": false,
  "createdAt": "2026-07-23T08:44:00Z",
  "updatedAt": "2026-07-23T08:44:00Z"
}
```

### FocusSession

```json
{
  "id": "uuid",
  "mode": "work",
  "status": "active",
  "todoId": "uuid",
  "label": "API design",
  "durationMinutes": 25,
  "startedAt": "2026-07-23T09:00:00Z",
  "pausedAt": null,
  "completedAt": null
}
```

### Notification

```json
{
  "id": "uuid",
  "type": "todo_due",
  "title": "Todo due",
  "body": "Draft API docs is due soon.",
  "status": "unread",
  "resourceType": "todo",
  "resourceId": "uuid",
  "scheduledFor": "2026-07-23T16:30:00Z",
  "createdAt": "2026-07-23T08:44:00Z"
}
```

### CalendarEvent

```json
{
  "id": "uuid",
  "title": "Deep work",
  "startsAt": "2026-07-23T14:00:00Z",
  "endsAt": "2026-07-23T15:30:00Z",
  "allDay": false,
  "location": "",
  "description": "",
  "color": "blue",
  "reminderMinutesBefore": 10,
  "linkedNoteId": null,
  "createdAt": "2026-07-23T08:44:00Z",
  "updatedAt": "2026-07-23T08:44:00Z"
}
```

### Settings

```json
{
  "theme": "system",
  "defaultView": "today",
  "timezone": "America/New_York",
  "timeFormat": "12h",
  "weekStart": "monday",
  "notifications": {},
  "focusTimer": {},
  "calendar": {}
}
```

---

*End of document - FocusTouch REST API Specification v1.0*
