# FocusTouch — UI Screen Plan

**Version:** 1.0  
**Status:** Draft  
**Last updated:** 2026-07-23  
**Owner:** UX Design

---

## 1. UX Direction

FocusTouch should feel calm, fast, and trustworthy. The interface should reduce switching costs between planning, capturing, remembering, writing, and focusing. Every screen should make the user's next useful action obvious without filling the page with competing controls.

### Design principles

| Principle | UX meaning |
|-----------|------------|
| **Calm by default** | Use quiet hierarchy, soft surfaces, and focused layouts. Avoid visual noise. |
| **Capture first** | A user should be able to add a todo, note, event, reminder, or sticky from anywhere. |
| **One mental model** | Calendar, todos, notes, stickies, focus, and notifications should share language and patterns. |
| **Progressive detail** | Show summaries first; reveal metadata, filters, and settings when needed. |
| **Trust through feedback** | Saving, syncing, notifications, timer state, and errors should always be visible and understandable. |

### Global navigation model

- **Primary navigation:** Dashboard, Calendar, Todo, Notes, Sticky Notes, Focus Timer, Notifications.
- **Account navigation:** Profile and Settings grouped under the user menu.
- **Global actions:** Quick Add, Search, Notification Inbox, Profile Menu.
- **Persistent feedback:** Sync status, timer status, and notification permission status should appear where relevant.

### Shared interaction patterns

- **Quick Add:** Opens from any authenticated screen and lets the user capture an item, then classify it as event, todo, reminder, note, or sticky.
- **Search:** Searches across events, todos, notes, sticky notes, and reminders.
- **Inline save:** Lightweight changes save automatically when safe; destructive actions require confirmation.
- **Keyboard support:** Quick Add, Search, navigation, save, cancel, complete todo, and start/pause timer should support keyboard shortcuts.
- **Responsive behavior:** Desktop uses sidebar navigation and multi-column layouts. Mobile uses bottom navigation and focused single-column flows.

---

## 2. Screen Plans

### 2.1 Splash

#### Purpose

Introduce FocusTouch as a calm productivity home, confirm the app is loading, and route users to onboarding, login, or their authenticated dashboard.

#### Components

- Centered brand mark and product name
- Short positioning line: "Plan, capture, focus — one calm place."
- Subtle loading indicator
- Optional background gradient or soft abstract calendar/task motif
- App version or environment label in non-production builds

#### Buttons

- No primary button during automatic routing
- **Try again** appears only if startup fails
- **Log in manually** appears only if session restoration fails but the app can continue

#### Interactions

- On launch, check saved session state.
- If authenticated, route to Dashboard.
- If first-time unauthenticated, route to Onboarding.
- If returning unauthenticated, route to Login.
- Keep animation brief and accessible; avoid blocking users longer than necessary.

#### Empty State

Not applicable. This screen is transitional and should not show user data.

#### Loading State

- Brand mark remains visible.
- Loading text rotates through simple status messages only when loading exceeds a short threshold.
- Avoid progress percentages unless the app can measure them accurately.

#### Error State

- Explain the issue in plain language: "FocusTouch could not start."
- Offer **Try again** and **Log in manually**.
- Include a secondary support or diagnostics link if startup repeatedly fails.

---

### 2.2 Onboarding

#### Purpose

Help a new user understand the value of FocusTouch, create enough preference context for a useful first dashboard, and guide them to their first meaningful capture.

#### Components

- Welcome header and concise benefit statement
- 3-step value carousel: Plan your day, Capture anything, Protect focus
- Account creation entry point
- Preference setup cards for role, work hours, notification comfort, week start, and default focus length
- Permission education for notifications
- Progress indicator
- Skip affordance for non-critical setup

#### Buttons

- **Get started**
- **Continue**
- **Skip for now**
- **Enable notifications**
- **Not now**
- **Create my first task**
- **Go to Dashboard**

#### Interactions

- Start with a short value explanation before asking for preferences.
- Let users skip optional preference questions.
- Explain notification permission before invoking the browser or OS prompt.
- After account creation, offer a first task or focus block to build early momentum.
- Preserve partially entered onboarding answers if the user navigates away.

#### Empty State

- If no onboarding answers are selected, show helpful examples instead of validation pressure.
- For the first-capture step, show sample prompts such as "Review project brief" or "Block 30 minutes for planning."

#### Loading State

- Use step-level loading after account creation or preference save.
- Keep current answers visible while saving.
- Show a clear "Setting up your workspace..." message before routing to Dashboard.

#### Error State

- Field errors appear next to the relevant input.
- Account creation errors provide recovery: change email, retry, or log in.
- Notification permission denial is not treated as a blocking error; explain how to enable it later in Settings.

---

### 2.3 Login

#### Purpose

Let returning users quickly and safely access their workspace while supporting recovery paths for forgotten credentials and unavailable authentication providers.

#### Components

- FocusTouch brand header
- Email field
- Password field
- OAuth sign-in option
- Remembered-account hint when available
- Forgot password link
- Signup link for new users
- Security and privacy reassurance copy

#### Buttons

- **Log in**
- **Continue with Google** or the selected OAuth provider
- **Forgot password**
- **Create account**
- **Show password**

#### Interactions

- Submit with Enter when fields are valid.
- Keep the login form short and centered.
- Support password visibility toggle.
- After successful login, route to Dashboard or the last intended protected screen.
- Rate-limit repeated failed attempts with calm, clear messaging.

#### Empty State

- Empty fields show examples and guidance.
- No workspace data appears until authentication succeeds.

#### Loading State

- Disable duplicate submissions while signing in.
- Keep entered email visible.
- Show provider-specific loading for OAuth redirects or popups.

#### Error State

- Invalid credentials use neutral language that does not reveal which field is wrong.
- Expired sessions explain that the user needs to log in again.
- OAuth errors include fallback to email login.
- Network errors offer retry without clearing form inputs.

---

### 2.4 Dashboard

#### Purpose

Serve as the user's Today view: a single, prioritized overview of events, due todos, reminders, active sticky notes, notes in progress, and current focus state.

#### Components

- Greeting with date and daily summary
- Today timeline with calendar events and time-sensitive tasks
- Due and overdue todo section
- Upcoming reminders
- Active focus timer card
- Recent notes
- Pinned sticky notes
- Quick Add entry
- Global search
- Sync status
- Lightweight productivity summary, such as completed tasks and focus minutes

#### Buttons

- **Quick Add**
- **Start focus**
- **Add event**
- **Add todo**
- **Add note**
- **Add sticky**
- **Complete**
- **Snooze**
- **View all**
- **Plan tomorrow**

#### Interactions

- Clicking an event, task, note, or sticky opens its detail view or editor.
- Completing a todo immediately updates the day summary.
- Snoozing a reminder offers common options such as later today, tomorrow, and custom.
- Starting focus can optionally link to the selected todo.
- Dragging or reordering should be reserved for clear contexts; avoid accidental changes on dense dashboards.

#### Empty State

- Show a calm "Your day is clear" message.
- Offer three useful starts: **Add your first task**, **Block focus time**, and **Write a note**.
- Explain that reminders and events will appear here when scheduled.

#### Loading State

- Use section-level skeletons so the screen feels stable.
- Load Today data first, then recent notes and stickies.
- Preserve visible cached data with a small "Updating..." sync indicator when available.

#### Error State

- If one section fails, keep the rest of the dashboard usable.
- Show section-level retry controls.
- If sync fails, show "Changes are saved on this device and will retry" only when local persistence is true.

---

### 2.5 Calendar

#### Purpose

Help users see, create, and adjust time-based commitments across day and week views, with tasks and reminders available as contextual overlays.

#### Components

- Calendar header with current range
- Day and week view switcher
- Mini date picker
- Time grid
- Event blocks
- Optional todo overlay for due-time tasks
- Event detail panel or modal
- Timezone indicator
- Search and filter controls
- Quick Add

#### Buttons

- **Today**
- **Previous**
- **Next**
- **Day**
- **Week**
- **Add event**
- **Save event**
- **Delete event**
- **Cancel**
- **Add reminder**

#### Interactions

- Click or tap an empty time slot to create an event.
- Select an event to view details and edit.
- Drag or resize events where precision is clear; confirm on mobile if accidental movement is likely.
- Navigate date ranges with arrows, keyboard shortcuts, and date picker.
- Allow users to show or hide due tasks on the calendar.

#### Empty State

- Empty day: "No events yet. Block time for what matters."
- Empty week: show gentle prompts for planning focus blocks and upcoming deadlines.
- Provide **Add event** and **Plan focus block** as primary empty actions.

#### Loading State

- Show a stable time-grid skeleton.
- Render cached events while refreshing if available.
- Use a small loading indicator during date-range changes rather than blanking the grid.

#### Error State

- Calendar load failure keeps navigation visible and offers retry.
- Event save conflicts explain when another session changed the event.
- Invalid time ranges are corrected with inline guidance.
- External calendar sync issues, when supported, should be isolated from native FocusTouch events.

---

### 2.6 Todo

#### Purpose

Provide a fast, organized task space for capturing, prioritizing, scheduling, completing, and reviewing work.

#### Components

- List sidebar with Inbox, Today, Upcoming, Completed, and custom lists
- Task list grouped by due date or priority
- Quick task input
- Task detail panel
- Filters for priority, due date, and list
- Completion affordance
- Overdue section
- Empty completed-state celebration kept subtle

#### Buttons

- **Add task**
- **Complete**
- **Schedule**
- **Set priority**
- **Move to list**
- **Add subtask**
- **Delete**
- **Undo**
- **Create list**

#### Interactions

- Quick task entry should accept natural-feeling text, due date, priority, and list metadata.
- Completing a task removes it from active lists with a brief undo option.
- Tasks can be moved between lists from the detail panel or list menu.
- Overdue tasks remain visible until completed, rescheduled, or dismissed.
- Todo items can be linked to focus sessions from the task detail.

#### Empty State

- Inbox empty: "Nothing waiting. Capture a task when it appears."
- Today empty: "No tasks due today. Add one or enjoy the space."
- Custom list empty: explain the list's purpose and offer **Add task**.
- Completed empty: avoid guilt; show "Completed tasks will appear here."

#### Loading State

- Skeleton rows preserve list density.
- Sidebar loads before task details.
- Keep optimistic tasks visible while sync completes.

#### Error State

- Failed task creation keeps the draft text available.
- Failed completion shows undo/retry without losing task position.
- Permission or sync errors explain whether the data is local, remote, or unavailable.

---

### 2.7 Notes

#### Purpose

Give users a lightweight writing space for meeting notes, project thoughts, checklists, and reference material without becoming a heavy document workspace.

#### Components

- Notes list with title, excerpt, updated date, and optional linked item
- Search field
- Editor with title and body
- Basic formatting toolbar
- Note metadata panel for links, tags, or related tasks
- Recent notes section
- Empty editor placeholder
- Autosave indicator

#### Buttons

- **New note**
- **Save**
- **Link to task**
- **Link to event**
- **Convert selection to todo**
- **Delete**
- **Restore**
- **Search notes**

#### Interactions

- Selecting a note opens it in the editor.
- New note starts with cursor in the title or body depending on context.
- Autosave should be visible but unobtrusive.
- Users can create a todo from selected text.
- Search results highlight matching titles and body snippets.

#### Empty State

- No notes: "Start with a thought, meeting, or plan."
- Offer templates as simple prompts, not heavyweight structure: Meeting note, Project idea, Daily review.
- Empty editor shows writing prompts and keyboard hints.

#### Loading State

- Notes list skeleton appears first.
- Editor shows the selected note skeleton only when opening an existing note.
- Autosave shows "Saving..." then "Saved" with timestamp.

#### Error State

- Autosave failure keeps local edits visible and clearly marked.
- Note load failure offers retry and return to list.
- Delete actions require confirmation and show restore if supported.

---

### 2.8 Sticky Notes

#### Purpose

Support quick, visual capture of fleeting thoughts, reminders, ideas, and temporary information that may later become tasks or full notes.

#### Components

- Sticky board or responsive grid
- Sticky cards with color variants
- Quick sticky composer
- Pin and archive affordances
- Color picker
- Convert actions
- Board filters for active, pinned, and archived
- Optional compact list mode for mobile

#### Buttons

- **New sticky**
- **Pin**
- **Archive**
- **Delete**
- **Change color**
- **Convert to todo**
- **Convert to note**
- **Restore**

#### Interactions

- Click or tap a sticky to edit inline.
- New stickies save quickly with minimal required metadata.
- Color changes should be decorative and not the only semantic signal.
- Users can convert a sticky into a todo or note while preserving original text.
- Pinning keeps important stickies visible on Dashboard.

#### Empty State

- "No sticky thoughts yet."
- Offer **New sticky** with example prompts: "Call back Alex", "Idea for Friday", "Remember invoice."
- Explain that pinned stickies can appear on Dashboard.

#### Loading State

- Use card skeletons in the board layout.
- If board positions are supported later, preserve approximate positions while loading.
- Show sync state for recently edited stickies.

#### Error State

- Failed sticky save keeps the card in an unsynced state with retry.
- Conversion failure keeps the original sticky intact.
- Delete failure restores the sticky and explains the issue.

---

### 2.9 Focus Timer

#### Purpose

Help users start, sustain, and complete focused work sessions, optionally tied to a specific todo, while reducing interruption pressure.

#### Components

- Large timer display
- Current mode: Focus, Short Break, Long Break
- Linked todo selector
- Session progress ring or simple progress bar
- Start/pause/stop controls
- Session length controls
- Daily focus summary
- Recent session log
- Notification and sound preference hint

#### Buttons

- **Start**
- **Pause**
- **Resume**
- **Stop**
- **Skip break**
- **Link task**
- **Complete linked task**
- **Customize**

#### Interactions

- Starting a session begins countdown and updates persistent timer status globally.
- Pausing keeps intent visible without marking the session complete.
- Stopping asks for confirmation if meaningful progress would be discarded.
- At session end, notify the user and offer break, restart, or complete linked task.
- If notifications are disabled, provide a non-blocking prompt to enable them.

#### Empty State

- Before any sessions: "Choose one thing and start with 25 minutes."
- Offer **Link task** and **Start** as the main actions.
- Daily summary shows zero focus minutes without shame or gamification pressure.

#### Loading State

- Timer controls should remain locally responsive.
- Session history and linked task options can load separately.
- If restoring an active timer, show "Restoring session..." and then the corrected remaining time.

#### Error State

- Timer persistence failure explains whether the timer can continue locally.
- Notification failure explains that the timer will still complete in-app.
- Linked task failure does not stop the focus session; it offers retry.

---

### 2.10 Notifications

#### Purpose

Give users a trusted place to review, manage, snooze, complete, and configure alerts for reminders, todos, calendar events, and focus sessions.

#### Components

- Notification permission banner
- Notification inbox grouped by Today, Upcoming, Snoozed, and History
- Alert category filters
- Reminder detail panel
- Quick actions for complete, snooze, dismiss, and reschedule
- Quiet hours summary
- Delivery status where relevant
- Notification settings shortcut

#### Buttons

- **Enable notifications**
- **Snooze**
- **Complete**
- **Dismiss**
- **Reschedule**
- **Mark all read**
- **Open settings**
- **Retry delivery check**

#### Interactions

- Snooze opens a short menu with common intervals and custom time.
- Completing a notification-linked todo updates the Todo and Dashboard screens.
- Dismiss removes the alert from active attention but does not delete the source item.
- Permission prompts should be contextual and user-initiated after education.
- Filters help users separate reminders from system or focus alerts.

#### Empty State

- "No notifications need your attention."
- If permission is disabled, explain what users will miss and offer **Enable notifications**.
- If all notifications are handled, show a quiet confirmation rather than a celebratory overload.

#### Loading State

- Show grouped list skeletons.
- Keep notification permission state visible while inbox loads.
- Refresh silently after quick actions and show small status feedback.

#### Error State

- Permission denied: provide steps to change browser or OS settings.
- Failed snooze or complete action keeps the notification visible with retry.
- Delivery service issues should be transparent without implying user fault.

---

### 2.11 Profile

#### Purpose

Let users manage personal identity, account details, connected devices, and data controls in a focused, confidence-building space.

#### Components

- Avatar or initials
- Display name
- Email address
- Account provider details
- Timezone and locale summary
- Connected devices list
- Sync status
- Data export and delete account section
- Account security section

#### Buttons

- **Edit profile**
- **Change photo**
- **Change email**
- **Change password**
- **Manage devices**
- **Export data**
- **Delete account**
- **Log out**

#### Interactions

- Profile edits happen in focused forms with clear save/cancel actions.
- Destructive account actions require confirmation and plain-language consequences.
- Device management lets users review and remove old sessions.
- Export data begins a request and explains where the file will be delivered.
- Logout returns the user to Login.

#### Empty State

- Missing avatar falls back to initials.
- No connected devices beyond current device shows a simple confirmation.
- If optional profile fields are empty, show unobtrusive prompts to complete them.

#### Loading State

- Profile identity loads first.
- Sensitive sections can show separate loading indicators.
- Export requests show clear pending state and expected next step without calendar-time promises.

#### Error State

- Failed profile save preserves edits and marks affected fields.
- Reauthentication-required errors explain why and route to a secure confirmation flow.
- Failed export or device removal offers retry.

---

### 2.12 Settings

#### Purpose

Centralize preferences for appearance, calendar behavior, todos, notes, sticky notes, focus timer, notifications, privacy, and accessibility.

#### Components

- Settings navigation grouped by category
- Appearance controls: theme, density, accent preference
- Calendar controls: week start, time format, default view
- Todo controls: default list, priority behavior, completed-task visibility
- Notes controls: default note behavior and formatting preference
- Sticky controls: default color and dashboard visibility
- Focus controls: work length, break length, long break cadence
- Notification controls: categories, lead times, quiet hours
- Privacy and data controls
- Accessibility controls: reduce motion, contrast, keyboard hints

#### Buttons

- **Save changes**
- **Reset to default**
- **Test notification**
- **Enable quiet hours**
- **Export data**
- **Delete data**
- **Cancel**

#### Interactions

- Prefer immediate preview for appearance and density settings.
- Use explicit save for sensitive or cross-device preferences.
- Test notification validates permission and delivery setup.
- Reset defaults applies per section rather than wiping all settings at once.
- Unsaved changes prompt appears when leaving a settings section with pending edits.

#### Empty State

- Settings categories should not be empty; unavailable future features should be hidden or marked clearly.
- If notification permissions are not granted, the notification settings section shows education and setup actions.

#### Loading State

- Load categories quickly, then values.
- Use section-level loading so one slow preference group does not block all settings.
- Show "Saving..." on the active section only.

#### Error State

- Failed saves keep edited values in place and identify the affected section.
- Invalid values, such as impossible focus durations, show inline correction.
- Permission-dependent settings explain what needs to change outside FocusTouch.

---

## 3. Cross-Screen State Standards

### Empty states

- Be calm and specific.
- Offer one primary next action and one optional secondary action.
- Avoid implying failure when the user has no data.

### Loading states

- Preserve layout stability.
- Prefer section-level skeletons over full-screen spinners.
- Use cached data when available and clearly indicate refresh status.

### Error states

- Explain what happened, whether user data is safe, and what the user can do next.
- Keep unaffected areas usable.
- Never clear user input after a recoverable error.

### Button hierarchy

- One primary action per screen or panel.
- Secondary actions should be visually quieter.
- Destructive actions require confirmation and should be separated from frequent actions.

### Accessibility standards

- Meet WCAG 2.1 AA contrast for text and controls.
- All interactive elements require visible focus states.
- Do not rely on color alone for priority, status, or errors.
- Motion should respect reduce-motion preferences.
- Keyboard and screen-reader flows must support core creation and completion tasks.

---

## 4. Screen Inventory Checklist

- [x] Splash
- [x] Onboarding
- [x] Login
- [x] Dashboard
- [x] Calendar
- [x] Todo
- [x] Notes
- [x] Sticky Notes
- [x] Focus Timer
- [x] Notifications
- [x] Profile
- [x] Settings

---

*End of document — FocusTouch UI Screen Plan v1.0*
