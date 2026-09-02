# Product Implementation Plan

> Status: Ready

## Outcome

Deliver the complete Habit Shaper MVP as a focused daily-use application. The
primary screen behaves like a dashboard, but the product should feel like an
application rather than an administrative reporting interface: users open it,
record today's behavior, understand their progress, and leave.

This plan defines the product behavior, user experience, delivery sequence, and
acceptance criteria. It includes enough technical context to explain the work,
while [Technical Specification](./08-technical-specification.md) is the source
of truth for exact database types, HTTP contracts, validation, authentication,
date algorithms, idempotency, and transaction behavior. The existing documents
remain the source of truth for scaffolding, tooling, code organization, styling,
CI, and test conventions.

## Delivery approach

Build a thin end-to-end walking skeleton first, then deliver independently
verifiable vertical slices. Each slice includes its contracts, migration or
persistence changes, backend behavior, frontend experience, and relevant tests.

Do not complete every infrastructure concern before beginning product work.
Once the walking skeleton proves the Compose request path, prioritize working
user behavior in this order:

1. authentication;
2. habit creation and the dashboard read model;
3. build-habit tracking;
4. break-habit tracking;
5. goal management; and
6. submission hardening.

Each slice ends with passing checks and an observable result.

## Document boundary

This document answers **what the MVP does** and **in what order it is built**.
Technical sections below summarize decisions that affect scope or sequencing.
If an implementation detail here conflicts with the technical specification,
the technical specification takes precedence.

Use the two documents together:

- this plan owns product scope, experience, slices, and acceptance criteria; and
- the technical specification owns precise persistence and transport contracts
  used while implementing those slices.

## MVP scope

### Included

- Register, log in, restore an authenticated session, and log out using email
  and password.
- Create and delete build and break habits.
- List the signed-in user's habits on a daily-use dashboard.
- Mark a build habit complete or incomplete on an eligible calendar day.
- Show the current build streak.
- Show the current week's completed days, missed days, and completion rate.
- Show the current clean streak for a break habit.
- Record a relapse and reset the clean streak.
- Create, edit, list, and delete goals linked to an owned habit.
- Protect every habit, tracking event, and goal by user ownership.
- Run the complete application, database bootstrap, and reverse proxy with one
  `docker compose up` from the repository root.

### Deliberately excluded

- Email verification, password reset, social login, and multi-factor
  authentication.
- Reminders, notifications, categories, tags, social features, and sharing.
- Arbitrary habit schedules such as weekdays-only or a target number of times
  per week. All MVP habits are daily.
- Numeric goal targets, deadlines, milestones, and goal progress calculations.
- Advanced analytics, charts, exports, and calendar views beyond the current
  week.
- Editing historical relapse records through the UI.
- Dark-theme delivery. Components still use semantic design tokens so a theme
  can be added without restructuring them.
- Offline support, native applications, and installable PWA behavior.
- Refresh-token rotation and a server-side session-management interface.

These exclusions prevent optional features from reducing the completeness or
reliability of the required journeys.

## Product experience

### Experience principle

Use an app shell with a dashboard-like **Today** screen. Avoid a traditional
administrative dashboard with a permanent desktop sidebar, multiple analytics
panels, or chart-heavy summary cards.

The information priority is:

1. actions that matter today;
2. current streak and weekly context; and
3. habit and goal management.

### Navigation

Use a compact top bar on wider screens and a compact mobile navigation pattern
when the narrow layout needs it. The primary destinations are:

- **Today**: daily actions, streaks, current-week progress, and a short goals
  summary;
- **Habits**: create habits and review or delete existing habits;
- **Goals**: create, edit, and remove goals linked to habits; and
- **Account**: show the signed-in identity and provide logout.

The MVP may compose Today, Habits, and Goals in one responsive page if the
result remains easy to navigate. Separate route-level screens should be added
only when they materially improve clarity, especially on mobile.

### Today screen

The Today screen contains:

- the current local date and a concise completion summary;
- a **Build** section with one actionable row or card per build habit;
- a **Break** section with clean-streak status and a relapse action;
- the current Monday-to-Sunday progress for build habits; and
- a small linked-goals summary with a route or action to manage goals.

The main daily actions must remain usable without opening a management form.
Creation and destructive management actions can use dedicated pages or dialogs.

### Build-habit presentation

Each build habit shows:

- its name;
- a clear action for today's completion;
- its current streak;
- a Monday-to-Sunday strip for the selected current week;
- completed, missed, future, and ineligible day states; and
- completed count, missed count, and completion percentage.

Eligible previous days in the current week can be corrected. Future dates and
dates before habit creation are visibly unavailable rather than reported as
missed.

### Break-habit presentation

Each break habit shows:

- its name;
- its current clean streak in days;
- its last-relapse date when one exists; and
- a clearly labeled **Record relapse** action.

Recording a relapse is consequential, so require confirmation. The copy should
be neutral and supportive rather than punitive. A successful relapse mutation
immediately displays a zero-day clean streak.

### Habit and goal management

Habit creation asks only for a name and type. Keep build and break descriptions
concrete so the type choice is understandable.

Goal management supports:

- a title;
- an optional description; and
- one linked habit.

A habit may have multiple goals. A goal belongs to exactly one habit and
inherits ownership from that habit. Deleting a habit also deletes its goals and
tracking events after explicit confirmation.

### Required UI states

Every query-backed section must define loading, empty, error, and success
states. Mutations expose pending and failure feedback, prevent accidental
duplicate submission, and preserve user-entered form values after recoverable
errors.

The empty dashboard should explain the difference between build and break
habits and offer one obvious action to create the first habit.

## Calendar and tracking rules summary

Calendar decisions are product rules, not display-only formatting. Backend
application code reads server time once, resolves the user calendar date, and
passes that explicit date into domain calculations rather than reading the
machine timezone throughout the codebase.

### User timezone

- Store one IANA timezone name on the user, for example `Asia/Jakarta`.
- The registration form defaults to the browser-resolved timezone and offers
  supported IANA timezone options instead of unrestricted free text.
- Validate the timezone on the server and reject unsupported values.
- User-facing dates and the definition of "today" use the stored timezone.
- Database audit timestamps are stored in UTC.
- The MVP does not include a timezone-settings screen.

### Week definition

- A week starts on Monday and ends on Sunday.
- API week parameters identify the Monday using an ISO calendar date.
- The initial UI displays the current week only.
- Future days in the current week are neither completed nor missed.
- Days before a habit's start date are ineligible and are not included in the
  denominator.

### Build-habit completions

- A build habit has at most one completion per calendar date.
- A completion can be created or removed for today or an earlier eligible date
  in the current week.
- Future dates and dates before the habit start date are rejected.
- Repeating the create operation leaves the date completed.
- Repeating the delete operation leaves the date incomplete.
- Break habits reject completion operations.

### Build streak

The current build streak is the number of consecutive completed eligible days
ending at the latest day whose result is final:

- if today is complete, count backward from today;
- if today is not yet complete, count backward from yesterday because today is
  still in progress;
- stop at the first missed eligible day or the habit start boundary; and
- a new habit with no completions has a zero-day streak.

Removing or backfilling an eligible completion recalculates the streak from the
stored completion dates. Do not maintain a mutable streak counter in the
database.

### Weekly completion

For a build habit in the requested week:

```text
completed days = eligible dates with a completion
missed days = eligible dates before today without a completion
pending days = today when eligible and not yet complete
evaluated days = completed days + missed days
completion rate = completed days / evaluated days
```

An incomplete today remains pending rather than missed. Return zero percent when
there are no evaluated days rather than dividing by zero. The exact state order,
rounding rule, and examples are defined in the technical specification.

### Relapses and clean streaks

- A break habit starts clean on its start date.
- Its start date is clean day 1 when no relapse exists on that date.
- Recording a relapse for today sets the clean streak to 0.
- The calendar day after the most recent relapse is clean day 1.
- Only one relapse record is stored for a habit on a calendar date.
- Repeating today's relapse operation is idempotent.
- Build habits reject relapse operations.
- The MVP records relapses for today only through the UI and API.

The clean streak is derived from the habit start date, the user's current date,
and the latest relapse date. Do not update a stored counter each day.

## Authentication and authorization summary

- Normalize email addresses consistently before uniqueness checks and login.
- Hash passwords with the selected maintained password-hashing package; never
  store or log plaintext passwords.
- Return the same invalid-credentials response whether the email is unknown or
  the password is wrong.
- Store the signed authentication token in an HTTP-only, same-site cookie.
- Set the secure-cookie behavior from validated environment configuration so
  local HTTP Compose and HTTPS deployment modes are explicit.
- Logout clears the authentication cookie.
- The Nginx deployment serves the web and `/api` from one origin.
- Protected controllers resolve the user identity at the transport boundary and
  pass an explicit user ID into application use cases.
- Every read and mutation verifies ownership in the repository query or use
  case. A client-provided habit or goal ID is never sufficient authorization.

The MVP uses one expiring signed token and does not implement refresh tokens or
a session-revocation screen.

## Data model summary

Use UUID strings in application and API interfaces, stored as `BINARY(16)` in
MySQL, and UTC `DATETIME(3)` audit timestamps. Tracking events use their natural
habit-and-date composite identity. Use MySQL `DATE` columns for calendar dates
interpreted in the owner's timezone.

### `users`

| Column                     | Purpose                                     |
| -------------------------- | ------------------------------------------- |
| `id`                       | Primary identifier.                         |
| `email`                    | Normalized login email with a unique index. |
| `password_hash`            | Password hash only.                         |
| `timezone`                 | Validated IANA timezone name.               |
| `created_at`, `updated_at` | UTC audit timestamps.                       |

### `habits`

| Column                     | Purpose                             |
| -------------------------- | ----------------------------------- |
| `id`                       | Primary identifier.                 |
| `user_id`                  | Owning user foreign key.            |
| `name`                     | Trimmed, user-visible habit name.   |
| `type`                     | Constrained to `build` or `break`.  |
| `start_date`               | First eligible local calendar date. |
| `created_at`, `updated_at` | UTC audit timestamps.               |

Index `user_id` for owned lists. Habit deletion cascades to completions,
relapses, and goals.

### `habit_completions`

| Column            | Purpose                        |
| ----------------- | ------------------------------ |
| `habit_id`        | Build habit foreign key.       |
| `completion_date` | Completed local calendar date. |
| `created_at`      | UTC audit timestamp.           |

Use `(habit_id, completion_date)` as the composite primary key and bounded-range
lookup index.

### `habit_relapses`

| Column         | Purpose                      |
| -------------- | ---------------------------- |
| `habit_id`     | Break habit foreign key.     |
| `relapse_date` | Relapse local calendar date. |
| `created_at`   | UTC audit timestamp.         |

Use `(habit_id, relapse_date)` as the composite primary key and latest-relapse
lookup index.

### `goals`

| Column                     | Purpose                                      |
| -------------------------- | -------------------------------------------- |
| `id`                       | Primary identifier.                          |
| `habit_id`                 | Linked habit foreign key and ownership path. |
| `title`                    | Trimmed goal title.                          |
| `description`              | Optional trimmed description.                |
| `created_at`, `updated_at` | UTC audit timestamps.                        |

Goal queries join through the owned habit. Avoid a duplicated `user_id` on the
goal unless a demonstrated query need justifies maintaining the additional
ownership invariant.

## API surface summary

All paths use the `/api` prefix. Shared Zod schemas define accepted inputs and
successful response bodies. The API client handles credentials and normalized
error responses centrally.

### Authentication

| Method and path       | Behavior                                                                                  |
| --------------------- | ----------------------------------------------------------------------------------------- |
| `POST /auth/register` | Create a user, set the authentication cookie, and return the current-user representation. |
| `POST /auth/login`    | Validate credentials, set the cookie, and return the current user.                        |
| `POST /auth/logout`   | Clear the cookie and return a no-content response.                                        |
| `GET /auth/me`        | Return the authenticated user or an unauthorized response.                                |

Registration accepts email, password, and timezone. Login accepts email and
password. Responses never include the password hash or signed token.

### Habits and dashboard state

| Method and path                     | Behavior                                                                              |
| ----------------------------------- | ------------------------------------------------------------------------------------- |
| `GET /habits?week_start=YYYY-MM-DD` | Return owned habits enriched with tracking state for the requested Monday-based week. |
| `POST /habits`                      | Create a daily build or break habit starting today.                                   |
| `DELETE /habits/:habit_id`          | Delete an owned habit and its dependent data.                                         |

The enriched habit representation contains common identity fields and a
type-specific tracking object. A build tracking object contains current streak,
completed/missed/pending counts, completion rate, and seven dated day states. A
break tracking object contains current clean streak and the last-relapse date.

Use a discriminated union on `type` so the frontend cannot accidentally treat a
break habit as having completion-day state.

### Build tracking

| Method and path                              | Behavior                               |
| -------------------------------------------- | -------------------------------------- |
| `PUT /habits/:habit_id/completions/:date`    | Ensure an eligible date is complete.   |
| `DELETE /habits/:habit_id/completions/:date` | Ensure an eligible date is incomplete. |

Both operations return the recalculated build tracking representation needed to
update or invalidate the owning habit query.

### Break tracking

| Method and path                   | Behavior                                                             |
| --------------------------------- | -------------------------------------------------------------------- |
| `POST /habits/:habit_id/relapses` | Record today's relapse and return recalculated break tracking state. |

The server derives today's calendar date from the authenticated user's timezone
rather than accepting a trusted client date.

### Goals

| Method and path          | Behavior                                              |
| ------------------------ | ----------------------------------------------------- |
| `GET /goals`             | Return goals linked to the user's owned habits.       |
| `POST /goals`            | Create a goal linked to an owned habit.               |
| `PATCH /goals/:goal_id`  | Update the title, description, or linked owned habit. |
| `DELETE /goals/:goal_id` | Delete an owned goal.                                 |

### Error behavior

Use one small error envelope with a stable application code, user-safe message,
and optional field errors. At minimum, distinguish:

- malformed or invalid input;
- unauthenticated access;
- owned resource not found;
- duplicate email; and
- an unexpected server failure.

Do not reveal whether a resource owned by another user exists. Return the same
not-found result as an unknown identifier.

## Implementation slices

### Slice 1: Walking skeleton

**Outcome:** a clean checkout can start the complete empty application path,
and the browser reaches the API through Nginx.

Work:

- Create the npm workspaces, pinned runtime metadata, shared TypeScript config,
  and lockfile.
- Scaffold the React, NestJS, contracts, and Playwright workspaces according to
  the project-scaffolding document.
- Add the root quality commands and minimal tests.
- Add database configuration validation, the MySQL pool, and `/api/health`.
- Add the web application shell, routing, QueryClient, API client, global CSS
  foundations, and one accessible UI primitive.
- Add Dbmate plumbing, multi-stage Dockerfiles, Nginx routing, health checks,
  and `compose.yaml` service ordering.
- Add the CI skeleton after local commands exist.

Acceptance criteria:

- `npm ci`, formatting check, lint, type-check, unit tests, and builds pass.
- `docker compose up` from a fresh clone builds and starts MySQL, migrations,
  API, and web without a locally installed Node.js or MySQL runtime or a
  required `.env` file. `docker compose up --build` remains the documented
  rebuild command after source changes.
- The browser entrypoint renders the application shell.
- A web request to `/api/health` succeeds through Nginx.
- Final runtime containers do not contain development source or run as root.

### Slice 2: Authentication

**Outcome:** a visitor can register, maintain an authenticated browser session,
log in again, and log out.

Work:

- Add the users migration and authentication contracts.
- Implement password hashing, signed-cookie token creation, the authentication
  guard, and current-user resolution.
- Implement register, login, logout, and current-user use cases and endpoints.
- Build registration and login forms with visible validation and error states.
- Add public and protected route behavior.

Acceptance criteria:

- Duplicate normalized emails are rejected.
- Invalid credentials do not reveal which credential was wrong.
- Protected endpoints reject missing or invalid authentication.
- Reloading the page restores a valid session through `/auth/me`.
- Logout clears the cookie and returns the user to a public route.
- Authentication works through the Compose/Nginx origin.

Primary tests:

- Unit tests for authentication use-case decisions and token boundaries.
- MySQL/Supertest tests for registration, duplicate email, login, cookie
  authentication, logout, and invalid credentials.
- Component tests for form validation, pending, error, and success behavior.
- One Playwright registration and login journey.

### Slice 3: Habits and dashboard

**Outcome:** an authenticated user can create build or break habits and see only
their own habits in the app-like dashboard.

Work:

- Add the habits migration and shared discriminated contracts.
- Implement owned create, list, and delete use cases and repositories.
- Implement the initial enriched read model with zero/default tracking states.
- Build the Today layout, empty state, habit creation flow, build and break
  sections, and deletion confirmation.
- Display goal-summary space without requiring goals to exist yet.

Acceptance criteria:

- Habit names and types are validated.
- The server assigns the habit start date in the user's timezone.
- Users cannot list or delete another user's habits.
- Empty, loading, error, success, and mutation-pending states are visible.
- Deleting a habit requires explicit confirmation.
- The dashboard remains usable at narrow and desktop widths.

Primary tests:

- Use-case tests for ownership and input decisions.
- MySQL/API tests for persistence, user scoping, and deletion.
- Component tests for the empty state, creation, grouping, and deletion flow.

### Slice 4: Build-habit tracking

**Outcome:** a user can track eligible daily completions and understand the
current streak and current-week result.

Work:

- Add the habit-completions migration.
- Implement pure calendar, build-streak, and weekly-stat calculations.
- Implement idempotent completion create/delete use cases and repositories.
- Enrich the habit read model with seven explicit day states and calculated
  statistics.
- Build the week strip, today's primary action, correction interactions, and
  progress summary.

Acceptance criteria:

- The same habit and calendar date cannot create duplicate completions.
- Future, pre-start, and break-habit completion operations are rejected.
- Today's unfinished state does not prematurely erase yesterday's active
  streak.
- Future and pre-start dates do not count as missed.
- Correcting an earlier completion recalculates the displayed streak and week.
- A user cannot mutate another user's completion state.

Primary tests:

- Exhaustive named unit scenarios for no completions, today complete, today
  pending, a missed day, duplicates, week boundaries, and month/year boundaries.
- MySQL/API tests for uniqueness, date mapping, idempotency, type restrictions,
  ownership, and enriched responses.
- Network-aware component tests for mutation, failure, and query refresh.
- One Playwright journey that creates and completes a build habit.

### Slice 5: Break-habit tracking

**Outcome:** a user sees the clean streak for a break habit and can record a
relapse that resets it.

Work:

- Add the habit-relapses migration.
- Implement the pure clean-streak calculation.
- Implement the idempotent record-relapse use case and repository behavior.
- Enrich break-habit responses with clean-streak and last-relapse state.
- Build the supportive relapse confirmation and mutation feedback.

Acceptance criteria:

- A new clean habit starts at day 1.
- A relapse today produces a zero-day streak.
- Tomorrow after a relapse is day 1.
- Repeating the relapse request does not create another same-day row.
- Build habits reject relapse operations.
- A user cannot record a relapse against another user's habit.

Primary tests:

- Named unit scenarios for a new habit, same-day relapse, consecutive clean
  days, multiple relapses, and month/year boundaries.
- MySQL/API tests for uniqueness, latest-relapse selection, type restrictions,
  ownership, and response mapping.
- Component tests for confirmation, cancellation, pending, success, and error.
- One Playwright journey that records a relapse and observes the reset.

### Slice 6: Goal management

**Outcome:** a user can manage simple goals linked to their habits.

Work:

- Add the goals migration and contracts.
- Implement owned list, create, update, and delete behavior.
- Validate linked-habit ownership during create and reassignment.
- Build the goal list, empty state, create/edit form, habit selector, delete
  confirmation, and Today summary.

Acceptance criteria:

- Every goal is linked to an existing habit owned by the current user.
- A goal can move only to another habit owned by the same user.
- Users cannot observe or mutate another user's goals.
- Habit deletion removes linked goals without leaving orphaned rows.
- Create, edit, and delete results are immediately visible.

Primary tests:

- Use-case tests for ownership and goal-to-habit rules.
- MySQL/API tests for foreign keys, cascading deletion, CRUD, and cross-user
  attempts.
- Component tests for form validation, editing, deletion, and query states.
- One Playwright create/edit/delete goal journey.

### Slice 7: Hardening and submission

**Outcome:** the repository is reproducible, secure for its stated scope, and
ready for reviewer evaluation.

Work:

- Complete the critical Playwright suite through the Compose/Nginx entrypoint.
- Review accessibility, keyboard behavior, focus management, responsive layout,
  and reduced-motion behavior.
- Review validation, error mapping, logs, security headers, cookie settings,
  request throttling, ownership queries, and secret handling.
- Verify migrations against a fresh database volume and service restart against
  an existing volume.
- Finish the root and per-application `.env.example` templates plus the README
  setup, operation, test, and troubleshooting instructions.
- Run the complete local validation and inspect final container contents and
  health checks.
- Review the repository diff and commit history for generated artifacts, real
  secrets, accidental nested repositories, and unclear commits.

Acceptance criteria:

- A reviewer needs only Docker and Docker Compose to start the application.
- First boot applies every migration automatically before the API becomes
  available.
- Restarting the stack preserves data while a deliberate volume teardown gives
  a clean environment.
- All root validation, backend integration, and Playwright commands pass.
- Critical journeys work at standard desktop and narrow mobile viewports.
- README commands work when copied exactly.
- Every `.env.example` contains placeholders only and no real secret is
  committed.
- `npm run dev` works after copying the documented `.env.example` templates,
  and the README states that requirement.

## Cross-cutting implementation rules

- Use shared contracts at HTTP boundaries without putting persistence or UI
  models into the contracts package.
- Keep controllers and pages thin; domain calculations remain pure and
  independently testable.
- Scope SQL by authenticated user wherever possible instead of fetching an
  unscoped row and checking ownership later.
- Use parameterized SQL for every dynamic value.
- Calculate streaks and weekly results from source events; do not persist
  counters that can drift.
- Localize the server-time read and pass an explicit calendar date into
  time-dependent calculations.
- Prefer query invalidation after mutations initially. Add optimistic behavior
  only when it materially improves the daily interaction and has rollback
  coverage.
- Add shared UI primitives only when an implemented screen needs them.
- Keep user-safe error messages actionable and keep internal diagnostics in
  server logs without passwords, cookies, or tokens.
- Avoid introducing abstractions solely for a hypothetical second database,
  transport, or frontend state library.

## Final definition of done

The MVP is complete when a new reviewer can:

1. clone the repository without creating a local `.env` file;
2. run `docker compose up` from the repository root;
3. register and log in;
4. create a build habit and mark an eligible date complete;
5. observe a correct streak and current-week missed/completion result;
6. create a break habit and observe its clean streak;
7. record a relapse and observe the streak reset;
8. create, edit, and remove a goal linked to a habit;
9. log out and confirm protected content is inaccessible; and
10. run the documented automated checks successfully.

Completion also requires user isolation, deterministic calendar behavior,
automatic schema bootstrap, responsive and accessible critical interactions,
no committed secrets or generated dependencies, and a Git history that shows
the implementation progressing through coherent vertical slices.
