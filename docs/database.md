# FocusTouch PostgreSQL Database Design

This document defines the PostgreSQL schema for FocusTouch and the Prisma models in `prisma/schema.prisma`. The design is single-tenant per user: every owned table carries `user_id`, and deleting a user cascades through all owned product data.

## Conventions

- Primary keys use `uuid`.
- Timestamps use `timestamptz(6)`.
- Application-facing names are camelCase in Prisma and snake_case in PostgreSQL.
- Most user-owned records use `ON DELETE CASCADE` from `users`.
- Historical delivery records in `notifications` use `ON DELETE SET NULL` for optional target records so delivery evidence can remain until the owning user is deleted.
- Prisma enums back PostgreSQL enum-like constraints: status, priority, recurrence, theme, notification type/channel/status, and Pomodoro session state.

## Recommended PostgreSQL extensions

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

Use `pg_trgm` or generated `tsvector` indexes for global search across todos, notes, calendar events, and sticky notes. Prisma does not model generated `tsvector` columns directly.

## Tables

### `users`

| Field | Type | Constraints |
|---|---|---|
| `id` | `uuid` | Primary key, default UUID |
| `email` | `varchar(320)` | Required, unique |
| `password_hash` | `text` | Nullable |
| `auth_provider` | enum `AuthProvider` | Required, default `EMAIL` |
| `oauth_subject` | `varchar(255)` | Nullable |
| `status` | enum `UserStatus` | Required, default `ACTIVE` |
| `email_verified_at` | `timestamptz(6)` | Nullable |
| `last_login_at` | `timestamptz(6)` | Nullable |
| `deleted_at` | `timestamptz(6)` | Nullable |
| `created_at` | `timestamptz(6)` | Required, default `now()` |
| `updated_at` | `timestamptz(6)` | Required, auto-updated |

- Indexes: unique `users_email_key`; unique `users_auth_provider_oauth_subject_key`; `idx_users_status_created_at`; `idx_users_deleted_at`.
- Foreign keys: none.
- Cascade rules: parent table for all user-owned data.
- Additional constraints: store normalized lowercase email; use a partial unique index for OAuth identities when `oauth_subject IS NOT NULL` if stricter null handling is desired.

### `profiles`

| Field | Type | Constraints |
|---|---|---|
| `id` | `uuid` | Primary key |
| `user_id` | `uuid` | Required, unique |
| `display_name` | `varchar(120)` | Required |
| `first_name` | `varchar(80)` | Nullable |
| `last_name` | `varchar(80)` | Nullable |
| `avatar_url` | `text` | Nullable |
| `bio` | `text` | Nullable |
| `locale` | `varchar(16)` | Required, default `en` |
| `timezone` | `varchar(64)` | Required, default `UTC` |
| `created_at` | `timestamptz(6)` | Required |
| `updated_at` | `timestamptz(6)` | Required |

- Indexes: unique `profiles_user_id_key`; `idx_profiles_display_name`.
- Foreign keys: `profiles.user_id -> users.id`.
- Cascade rules: `ON DELETE CASCADE`, `ON UPDATE CASCADE`.
- Additional constraints: validate `timezone` against IANA timezone names in application or via lookup table.

### `settings`

| Field | Type | Constraints |
|---|---|---|
| `id` | `uuid` | Primary key |
| `user_id` | `uuid` | Required, unique |
| `theme` | enum `ThemePreference` | Required, default `SYSTEM` |
| `time_format` | enum `TimeFormat` | Required, default `HOUR_12` |
| `week_start_day` | enum `WeekStartDay` | Required, default `MONDAY` |
| `default_calendar_view` | `varchar(24)` | Required, default `week` |
| `default_todo_list_id` | `uuid` | Nullable |
| `notifications_enabled` | `boolean` | Required, default `true` |
| `quiet_hours_enabled` | `boolean` | Required, default `false` |
| `quiet_hours_start` | `varchar(5)` | Nullable, `HH:MM` |
| `quiet_hours_end` | `varchar(5)` | Nullable, `HH:MM` |
| `reduce_notifications_during_focus` | `boolean` | Required, default `true` |
| `metadata` | `jsonb` | Required, default `{}` |
| `created_at` | `timestamptz(6)` | Required |
| `updated_at` | `timestamptz(6)` | Required |

- Indexes: unique `settings_user_id_key`; `idx_settings_default_todo_list_id`.
- Foreign keys: `settings.user_id -> users.id`; `settings.default_todo_list_id -> todo_lists.id`.
- Cascade rules: user delete cascades settings; default list delete sets `default_todo_list_id` to null; updates cascade.
- Additional constraints: `quiet_hours_start` and `quiet_hours_end` should match `^[0-2][0-9]:[0-5][0-9]$`.

### `pomodoro_settings`

| Field | Type | Constraints |
|---|---|---|
| `id` | `uuid` | Primary key |
| `user_id` | `uuid` | Required, unique |
| `work_minutes` | `integer` | Required, default `25` |
| `short_break_minutes` | `integer` | Required, default `5` |
| `long_break_minutes` | `integer` | Required, default `15` |
| `sessions_until_long_break` | `integer` | Required, default `4` |
| `auto_start_breaks` | `boolean` | Required, default `false` |
| `auto_start_work` | `boolean` | Required, default `false` |
| `sound_enabled` | `boolean` | Required, default `true` |
| `created_at` | `timestamptz(6)` | Required |
| `updated_at` | `timestamptz(6)` | Required |

- Indexes: unique `pomodoro_settings_user_id_key`.
- Foreign keys: `pomodoro_settings.user_id -> users.id`.
- Cascade rules: `ON DELETE CASCADE`, `ON UPDATE CASCADE`.
- Additional constraints: all minute values should be between `1` and `240`; `sessions_until_long_break >= 1`.

### `todo_lists`

| Field | Type | Constraints |
|---|---|---|
| `id` | `uuid` | Primary key |
| `user_id` | `uuid` | Required |
| `name` | `varchar(120)` | Required |
| `slug` | `varchar(140)` | Required |
| `kind` | enum `TodoListKind` | Required, default `STANDARD` |
| `color` | `varchar(24)` | Nullable |
| `sort_order` | `integer` | Required, default `0` |
| `archived_at` | `timestamptz(6)` | Nullable |
| `created_at` | `timestamptz(6)` | Required |
| `updated_at` | `timestamptz(6)` | Required |

- Indexes: unique `todo_lists_user_id_slug_key`; `idx_todo_lists_user_id_kind`; `idx_todo_lists_user_id_archived_at`.
- Foreign keys: `todo_lists.user_id -> users.id`.
- Cascade rules: user delete cascades lists; deleting a list cascades its todos and note-list links; settings default list is set null.
- Additional constraints: create a partial unique index to enforce one inbox per user: `UNIQUE (user_id) WHERE kind = 'INBOX'`.

### `todos`

| Field | Type | Constraints |
|---|---|---|
| `id` | `uuid` | Primary key |
| `user_id` | `uuid` | Required |
| `list_id` | `uuid` | Required |
| `parent_todo_id` | `uuid` | Nullable |
| `title` | `varchar(240)` | Required |
| `description` | `text` | Nullable |
| `status` | enum `TodoStatus` | Required, default `ACTIVE` |
| `priority` | enum `TodoPriority` | Required, default `MEDIUM` |
| `due_at` | `timestamptz(6)` | Nullable |
| `due_all_day` | `boolean` | Required, default `false` |
| `sort_order` | `integer` | Required, default `0` |
| `completed_at` | `timestamptz(6)` | Nullable |
| `archived_at` | `timestamptz(6)` | Nullable |
| `created_at` | `timestamptz(6)` | Required |
| `updated_at` | `timestamptz(6)` | Required |

- Indexes: `idx_todos_user_id_list_id_status_sort_order`; `idx_todos_user_id_status_due_at`; `idx_todos_user_id_priority`; `idx_todos_parent_todo_id`; `idx_todos_completed_at`.
- Foreign keys: `todos.user_id -> users.id`; `todos.list_id -> todo_lists.id`; `todos.parent_todo_id -> todos.id`.
- Cascade rules: user/list/parent todo deletion cascades todos and subtasks; focus sessions and notifications set their optional todo reference null; reminders attached to the todo cascade.
- Additional constraints: `completed_at` should be present when `status = 'COMPLETED'`; prevent `parent_todo_id = id`; enforce same-user list and parent with composite constraints or application invariants.

### `notes`

| Field | Type | Constraints |
|---|---|---|
| `id` | `uuid` | Primary key |
| `user_id` | `uuid` | Required |
| `title` | `varchar(240)` | Required |
| `body` | `text` | Required |
| `format` | enum `NoteFormat` | Required, default `RICH_TEXT` |
| `pinned` | `boolean` | Required, default `false` |
| `archived_at` | `timestamptz(6)` | Nullable |
| `created_at` | `timestamptz(6)` | Required |
| `updated_at` | `timestamptz(6)` | Required |

- Indexes: `idx_notes_user_id_updated_at`; `idx_notes_user_id_archived_at`; `idx_notes_user_id_title`.
- Foreign keys: `notes.user_id -> users.id`.
- Cascade rules: user delete cascades notes; linked reminders, tags, and note links cascade.
- Additional constraints: add trigram or generated full-text indexes over `title` and `body` for global search.

### `sticky_notes`

| Field | Type | Constraints |
|---|---|---|
| `id` | `uuid` | Primary key |
| `user_id` | `uuid` | Required |
| `content` | `text` | Required |
| `color` | enum `StickyColor` | Required, default `YELLOW` |
| `position_x` | `integer` | Required, default `0` |
| `position_y` | `integer` | Required, default `0` |
| `width` | `integer` | Required, default `240` |
| `height` | `integer` | Required, default `240` |
| `pinned` | `boolean` | Required, default `false` |
| `converted_to_todo_id` | `uuid` | Nullable, unique |
| `archived_at` | `timestamptz(6)` | Nullable |
| `created_at` | `timestamptz(6)` | Required |
| `updated_at` | `timestamptz(6)` | Required |

- Indexes: unique `sticky_notes_converted_to_todo_id_key`; `idx_sticky_notes_user_id_archived_at_pinned`; `idx_sticky_notes_user_id_updated_at`.
- Foreign keys: `sticky_notes.user_id -> users.id`; `sticky_notes.converted_to_todo_id -> todos.id`.
- Cascade rules: user delete cascades stickies; converted todo delete sets `converted_to_todo_id` null; sticky reminders and tags cascade.
- Additional constraints: `width > 0`, `height > 0`; enforce same-user converted todo in application or with composite FKs.

### `focus_sessions`

| Field | Type | Constraints |
|---|---|---|
| `id` | `uuid` | Primary key |
| `user_id` | `uuid` | Required |
| `todo_id` | `uuid` | Nullable |
| `type` | enum `FocusSessionType` | Required, default `WORK` |
| `status` | enum `FocusSessionStatus` | Required, default `RUNNING` |
| `started_at` | `timestamptz(6)` | Required, default `now()` |
| `paused_at` | `timestamptz(6)` | Nullable |
| `ended_at` | `timestamptz(6)` | Nullable |
| `planned_minutes` | `integer` | Required |
| `completed_minutes` | `integer` | Required, default `0` |
| `pause_seconds` | `integer` | Required, default `0` |
| `notes` | `text` | Nullable |
| `created_at` | `timestamptz(6)` | Required |
| `updated_at` | `timestamptz(6)` | Required |

- Indexes: `idx_focus_sessions_user_id_started_at`; `idx_focus_sessions_user_id_status`; `idx_focus_sessions_todo_id_started_at`.
- Foreign keys: `focus_sessions.user_id -> users.id`; `focus_sessions.todo_id -> todos.id`.
- Cascade rules: user delete cascades sessions; todo delete sets `todo_id` null; notification focus references set null.
- Additional constraints: `planned_minutes > 0`, `completed_minutes >= 0`, `pause_seconds >= 0`, `ended_at >= started_at`.

### `calendar_events`

| Field | Type | Constraints |
|---|---|---|
| `id` | `uuid` | Primary key |
| `user_id` | `uuid` | Required |
| `title` | `varchar(240)` | Required |
| `description` | `text` | Nullable |
| `location` | `varchar(255)` | Nullable |
| `start_at` | `timestamptz(6)` | Required |
| `end_at` | `timestamptz(6)` | Required |
| `all_day` | `boolean` | Required, default `false` |
| `status` | enum `CalendarEventStatus` | Required, default `CONFIRMED` |
| `recurrence_frequency` | enum `RecurrenceFrequency` | Required, default `NONE` |
| `recurrence_interval` | `integer` | Required, default `1` |
| `recurrence_ends_at` | `timestamptz(6)` | Nullable |
| `external_source` | `varchar(80)` | Nullable |
| `external_id` | `varchar(255)` | Nullable |
| `created_at` | `timestamptz(6)` | Required |
| `updated_at` | `timestamptz(6)` | Required |

- Indexes: unique `calendar_events_user_id_external_source_external_id_key`; `idx_calendar_events_user_id_start_at_end_at`; `idx_calendar_events_user_id_status_start_at`; `idx_calendar_events_user_id_recurrence_frequency`.
- Foreign keys: `calendar_events.user_id -> users.id`.
- Cascade rules: user delete cascades events; event delete cascades event reminders, event tags, and note-event links; notifications set event reference null.
- Additional constraints: `end_at > start_at`, `recurrence_interval >= 1`, both `external_source` and `external_id` should be null or both present.

### `reminders`

| Field | Type | Constraints |
|---|---|---|
| `id` | `uuid` | Primary key |
| `user_id` | `uuid` | Required |
| `todo_id` | `uuid` | Nullable |
| `calendar_event_id` | `uuid` | Nullable |
| `note_id` | `uuid` | Nullable |
| `sticky_note_id` | `uuid` | Nullable |
| `title` | `varchar(240)` | Required |
| `notes` | `text` | Nullable |
| `scheduled_at` | `timestamptz(6)` | Required |
| `status` | enum `ReminderStatus` | Required, default `SCHEDULED` |
| `recurrence_frequency` | enum `RecurrenceFrequency` | Required, default `NONE` |
| `recurrence_interval` | `integer` | Required, default `1` |
| `recurrence_ends_at` | `timestamptz(6)` | Nullable |
| `snoozed_until` | `timestamptz(6)` | Nullable |
| `completed_at` | `timestamptz(6)` | Nullable |
| `dismissed_at` | `timestamptz(6)` | Nullable |
| `created_at` | `timestamptz(6)` | Required |
| `updated_at` | `timestamptz(6)` | Required |

- Indexes: `idx_reminders_user_id_status_scheduled_at`; `idx_reminders_todo_id`; `idx_reminders_calendar_event_id`; `idx_reminders_note_id`; `idx_reminders_sticky_note_id`.
- Foreign keys: `reminders.user_id -> users.id`; optional target FKs to `todos`, `calendar_events`, `notes`, and `sticky_notes`.
- Cascade rules: user or target delete cascades reminders; reminder delete sets notification reminder reference null.
- Additional constraints: at most one target FK should be non-null for attached reminders; `recurrence_interval >= 1`; `snoozed_until > scheduled_at` when present.

### `notifications`

| Field | Type | Constraints |
|---|---|---|
| `id` | `uuid` | Primary key |
| `user_id` | `uuid` | Required |
| `reminder_id` | `uuid` | Nullable |
| `todo_id` | `uuid` | Nullable |
| `calendar_event_id` | `uuid` | Nullable |
| `focus_session_id` | `uuid` | Nullable |
| `type` | enum `NotificationType` | Required |
| `channel` | enum `NotificationChannel` | Required, default `IN_APP` |
| `status` | enum `NotificationStatus` | Required, default `PENDING` |
| `title` | `varchar(240)` | Required |
| `body` | `text` | Nullable |
| `scheduled_at` | `timestamptz(6)` | Nullable |
| `delivered_at` | `timestamptz(6)` | Nullable |
| `read_at` | `timestamptz(6)` | Nullable |
| `failed_at` | `timestamptz(6)` | Nullable |
| `failure_reason` | `text` | Nullable |
| `action_payload` | `jsonb` | Nullable |
| `created_at` | `timestamptz(6)` | Required |
| `updated_at` | `timestamptz(6)` | Required |

- Indexes: `idx_notifications_user_id_status_scheduled_at`; `idx_notifications_user_id_type_created_at`; `idx_notifications_reminder_id`; `idx_notifications_todo_id`; `idx_notifications_calendar_event_id`; `idx_notifications_focus_session_id`.
- Foreign keys: `notifications.user_id -> users.id`; optional FKs to reminders, todos, calendar events, and focus sessions.
- Cascade rules: user delete cascades notifications; target deletes set nullable target FKs to null.
- Additional constraints: `delivered_at`, `read_at`, and `failed_at` should be consistent with `status`.

### `tags`

| Field | Type | Constraints |
|---|---|---|
| `id` | `uuid` | Primary key |
| `user_id` | `uuid` | Required |
| `name` | `varchar(80)` | Required |
| `slug` | `varchar(100)` | Required |
| `color` | `varchar(24)` | Nullable |
| `created_at` | `timestamptz(6)` | Required |
| `updated_at` | `timestamptz(6)` | Required |

- Indexes: unique `tags_user_id_slug_key`; `idx_tags_user_id_name`.
- Foreign keys: `tags.user_id -> users.id`.
- Cascade rules: user delete cascades tags and all tag assignment rows.
- Additional constraints: slug should be normalized lowercase per user.

### Tag assignment tables

#### `todo_tags`

Fields: `user_id uuid`, `todo_id uuid`, `tag_id uuid`, `assigned_at timestamptz(6)`.

- Primary key: `(todo_id, tag_id)`.
- Indexes: `idx_todo_tags_user_id_tag_id`.
- Foreign keys: `user_id -> users.id`, `todo_id -> todos.id`, `tag_id -> tags.id`.
- Cascade rules: all FKs use `ON DELETE CASCADE`, `ON UPDATE CASCADE`.
- Additional constraints: enforce same-user todo/tag ownership in application or with composite FKs.

#### `note_tags`

Fields: `user_id uuid`, `note_id uuid`, `tag_id uuid`, `assigned_at timestamptz(6)`.

- Primary key: `(note_id, tag_id)`.
- Indexes: `idx_note_tags_user_id_tag_id`.
- Foreign keys: `user_id -> users.id`, `note_id -> notes.id`, `tag_id -> tags.id`.
- Cascade rules: all FKs use `ON DELETE CASCADE`, `ON UPDATE CASCADE`.
- Additional constraints: enforce same-user note/tag ownership in application or with composite FKs.

#### `sticky_note_tags`

Fields: `user_id uuid`, `sticky_note_id uuid`, `tag_id uuid`, `assigned_at timestamptz(6)`.

- Primary key: `(sticky_note_id, tag_id)`.
- Indexes: `idx_sticky_note_tags_user_id_tag_id`.
- Foreign keys: `user_id -> users.id`, `sticky_note_id -> sticky_notes.id`, `tag_id -> tags.id`.
- Cascade rules: all FKs use `ON DELETE CASCADE`, `ON UPDATE CASCADE`.
- Additional constraints: enforce same-user sticky/tag ownership in application or with composite FKs.

#### `calendar_event_tags`

Fields: `user_id uuid`, `calendar_event_id uuid`, `tag_id uuid`, `assigned_at timestamptz(6)`.

- Primary key: `(calendar_event_id, tag_id)`.
- Indexes: `idx_calendar_event_tags_user_id_tag_id`.
- Foreign keys: `user_id -> users.id`, `calendar_event_id -> calendar_events.id`, `tag_id -> tags.id`.
- Cascade rules: all FKs use `ON DELETE CASCADE`, `ON UPDATE CASCADE`.
- Additional constraints: enforce same-user event/tag ownership in application or with composite FKs.

### Note link tables

#### `note_todos`

Fields: `user_id uuid`, `note_id uuid`, `todo_id uuid`, `linked_at timestamptz(6)`.

- Primary key: `(note_id, todo_id)`.
- Indexes: `idx_note_todos_user_id_todo_id`.
- Foreign keys: `user_id -> users.id`, `note_id -> notes.id`, `todo_id -> todos.id`.
- Cascade rules: all FKs use `ON DELETE CASCADE`, `ON UPDATE CASCADE`.
- Additional constraints: enforce same-user note/todo ownership in application or with composite FKs.

#### `note_todo_lists`

Fields: `user_id uuid`, `note_id uuid`, `todo_list_id uuid`, `linked_at timestamptz(6)`.

- Primary key: `(note_id, todo_list_id)`.
- Indexes: `idx_note_todo_lists_user_id_todo_list_id`.
- Foreign keys: `user_id -> users.id`, `note_id -> notes.id`, `todo_list_id -> todo_lists.id`.
- Cascade rules: all FKs use `ON DELETE CASCADE`, `ON UPDATE CASCADE`.
- Additional constraints: enforce same-user note/list ownership in application or with composite FKs.

#### `note_calendar_events`

Fields: `user_id uuid`, `note_id uuid`, `calendar_event_id uuid`, `linked_at timestamptz(6)`.

- Primary key: `(note_id, calendar_event_id)`.
- Indexes: `idx_note_calendar_events_user_id_calendar_event_id`.
- Foreign keys: `user_id -> users.id`, `note_id -> notes.id`, `calendar_event_id -> calendar_events.id`.
- Cascade rules: all FKs use `ON DELETE CASCADE`, `ON UPDATE CASCADE`.
- Additional constraints: enforce same-user note/event ownership in application or with composite FKs.

## Migration-level constraints to add

Prisma models cover primary keys, unique constraints, indexes, enum values, foreign keys, and cascade rules. Add the following SQL constraints in migrations because Prisma does not express them natively:

```sql
ALTER TABLE calendar_events
  ADD CONSTRAINT calendar_events_end_after_start CHECK (end_at > start_at),
  ADD CONSTRAINT calendar_events_recurrence_interval_positive CHECK (recurrence_interval >= 1);

ALTER TABLE reminders
  ADD CONSTRAINT reminders_recurrence_interval_positive CHECK (recurrence_interval >= 1),
  ADD CONSTRAINT reminders_single_target CHECK (
    num_nonnulls(todo_id, calendar_event_id, note_id, sticky_note_id) <= 1
  );

ALTER TABLE focus_sessions
  ADD CONSTRAINT focus_sessions_positive_durations CHECK (
    planned_minutes > 0 AND completed_minutes >= 0 AND pause_seconds >= 0
  ),
  ADD CONSTRAINT focus_sessions_end_after_start CHECK (
    ended_at IS NULL OR ended_at >= started_at
  );

ALTER TABLE sticky_notes
  ADD CONSTRAINT sticky_notes_positive_size CHECK (width > 0 AND height > 0);

ALTER TABLE todos
  ADD CONSTRAINT todos_not_own_parent CHECK (parent_todo_id IS NULL OR parent_todo_id <> id);

ALTER TABLE pomodoro_settings
  ADD CONSTRAINT pomodoro_settings_positive_values CHECK (
    work_minutes BETWEEN 1 AND 240
    AND short_break_minutes BETWEEN 1 AND 240
    AND long_break_minutes BETWEEN 1 AND 240
    AND sessions_until_long_break >= 1
  );

CREATE UNIQUE INDEX todo_lists_one_inbox_per_user
  ON todo_lists (user_id)
  WHERE kind = 'INBOX';
```

## Search indexes to add

```sql
CREATE INDEX todos_search_trgm_idx
  ON todos USING gin ((title || ' ' || coalesce(description, '')) gin_trgm_ops);

CREATE INDEX notes_search_trgm_idx
  ON notes USING gin ((title || ' ' || body) gin_trgm_ops);

CREATE INDEX sticky_notes_search_trgm_idx
  ON sticky_notes USING gin (content gin_trgm_ops);

CREATE INDEX calendar_events_search_trgm_idx
  ON calendar_events USING gin ((title || ' ' || coalesce(description, '') || ' ' || coalesce(location, '')) gin_trgm_ops);
```

