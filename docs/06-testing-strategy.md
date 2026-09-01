# Testing Strategy

## Outcome

Use a small number of clearly separated test levels to give fast feedback on
business rules, prove the real MySQL and HTTP boundaries, and verify the most
important user journeys through the production-like Compose stack.

Tests describe observable behavior rather than implementation details. A rule
should be tested at the lowest level that can prove it confidently. Repeating a
scenario at another level is justified only when the second test crosses a new
boundary or protects a different risk.

## Principles

- Give every scenario its own explicit, behavior-focused test name.
- Do not use parameterized or table-driven suites. The small amount of repeated
  setup is preferable to indirect failures and awkward single-case debugging.
- Colocate an isolated test with the implementation whose lifecycle it shares.
- Put tests that bootstrap NestJS, MySQL, Compose, or multiple features in the
  owning integration-test area.
- Test public behavior and results; do not test private functions, React
  internals, SQL-driver internals, class names, or incidental DOM structure.
- Keep tests independent, deterministic, and safe to run repeatedly.
- Use shared helpers to remove infrastructure noise, not to hide the scenario.
- A bug fix should normally add a regression test at the lowest effective
  level.

## Test levels

| Level | Runtime boundary | Primary responsibility |
| --- | --- | --- |
| Frontend unit/component | Jest and JSDOM; no real API | Pure frontend logic, UI behavior, forms, hooks, and query states |
| Backend unit | Jest and plain TypeScript; no Nest application, network, or database | Domain rules and application-use-case orchestration |
| Backend integration | Jest/Supertest, bootstrapped NestJS where needed, and real MySQL | Raw SQL, migrations, persistence, HTTP contracts, authentication, and ownership |
| End-to-end | Playwright against the full Compose stack through Nginx | A few critical user journeys and assembled-system behavior |

Frontend tests that render real application providers or use Mock Service
Worker still belong to the frontend Jest suite. Creating a separate command
based on whether a component test is philosophically a unit or an integration
test would add ceremony without providing a useful execution boundary.

## Placement and filenames

Follow the repository-wide lowercase kebab-case convention from
[Code organization](./03-code-organization.md#naming-conventions).

Custom frontend components and pages live in a directory named for the unit.
The directory, rather than `components/` itself, is the lifecycle boundary:

```text
features/habits/components/
└── habit-card/
    ├── index.test.tsx
    ├── index.tsx
    └── styles.css
```

Frontend non-component modules and backend unit tests mirror the implementation
basename and add `.test`:

```text
apps/web/src/features/habits/api/
├── habit-query-keys.test.ts
└── habit-query-keys.ts

apps/api/src/features/tracking/domain/
├── calculate-streak.test.ts
└── calculate-streak.ts
```

Tests that require application or database infrastructure live outside
production source while remaining grouped by feature:

```text
apps/api/test/
├── integration/
│   ├── auth.integration.test.ts
│   ├── goals.integration.test.ts
│   ├── habits.integration.test.ts
│   └── tracking.integration.test.ts
└── support/
    ├── database.ts
    ├── fixtures.ts
    └── test-app.ts

tests/e2e/
├── fixtures/
│   └── authenticated-user.ts
├── tests/
│   ├── authentication.spec.ts
│   ├── break-habit.spec.ts
│   ├── build-habit.spec.ts
│   └── goal-management.spec.ts
└── playwright.config.ts
```

Use `.test.ts` or `.test.tsx` for Jest, `.integration.test.ts` for API/MySQL
integration tests, and `.spec.ts` for Playwright. Do not mix `.spec` and `.test`
within the same runner.

## Frontend unit and component tests

### Pure frontend logic

Call pure formatters, date-presentation helpers, query-key factories, and local
state transitions directly. Keep these tests free of React rendering when a
function call proves the behavior.

### Components and pages

Use React Testing Library through `@test/test-utils` and use `userEvent` for
interaction. Assert what a user can observe:

- accessible roles, names, descriptions, and states;
- validation feedback and submission behavior;
- loading, empty, error, and success states;
- enabled, disabled, expanded, selected, and focused behavior;
- navigation and the visible outcome of an action.

Use the real child components and providers when practical. Each render gets a
fresh QueryClient configured with retries disabled so cache state and retry
delays cannot leak between tests.

Do not make snapshots the primary assertion. Do not assert CSS class names,
component internals, exact DOM nesting, hook call counts, or other details that
can change without changing user behavior.

### Network-aware feature tests

Use Mock Service Worker only when the network lifecycle matters, such as API
response parsing, loading and error states, mutation behavior, optimistic
updates, rollback, or query invalidation. Presentational components and pure
logic do not need MSW.

Prefer this boundary:

```text
component -> real query hook -> feature API adapter -> mocked HTTP response
```

Do not mock a feature query hook merely to make its component easy to render.
That skips the integration between the component, cache, and API adapter. When a
component is intentionally presentational, pass its values and callbacks as
props instead of introducing MSW.

## MSW handlers and response data

MSW is a controlled transport boundary, not a second implementation of the
backend. Handlers return deliberate responses; they must not reproduce streak
calculation, authorization, persistence, or other server behavior.

Organize reusable test support by responsibility:

```text
apps/web/src/mocks/
├── builders/
│   ├── goal-response.ts
│   └── habit-response.ts
├── handlers/
│   ├── auth.ts
│   ├── goals.ts
│   ├── habits.ts
│   └── tracking.ts
└── server.ts
```

The shared Zod contract is the only response-shape definition. A builder owns
one representative valid response instance, parses it with the shared schema,
and accepts typed overrides for values relevant to a test:

```ts
export function buildHabitResponse(
  overrides: Partial<HabitResponse> = {},
): HabitResponse {
  return HabitResponseSchema.parse({
    id: "habit-1",
    name: "Read",
    type: "build",
    currentStreak: 0,
    ...overrides,
  });
}
```

The literal above is test data, not another response-schema declaration. Do not
repeat complete response objects throughout tests, generate random fixtures,
add production schema defaults solely for tests, or import backend factories
into frontend tests.

Handler factories centralize endpoint and response boilerplate while tests own
their scenario data:

```ts
export function mockListHabits(habits: HabitResponse[]) {
  return http.get("/api/habits", () => HttpResponse.json(habits));
}
```

Keep these factories as ordinary typed functions. Do not build a fluent mock
DSL or a stateful in-memory CRUD server. A small amount of visible setup is
easier to maintain than another framework inside the test suite.

Configure the test server to reject unhandled requests, reset per-test handler
overrides after every test, and close after the suite:

```ts
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

Avoid a global set of handlers that silently makes every endpoint succeed.
Enable only the handlers needed by a test or a tightly related `describe`
block.

## Backend unit tests

Backend unit tests instantiate plain functions or classes directly. Do not
bootstrap a Nest testing module unless Nest-specific composition is the
behavior under test.

Prioritize tests for:

- build-habit streak calculation;
- clean-streak calculation and relapse reset;
- weekly completion and missed-day calculation;
- duplicate completion or relapse rules;
- goal-to-habit constraints;
- user ownership and authorization decisions; and
- use-case orchestration, transaction decisions, and typed failures.

Use small fakes for application boundaries such as repositories, the clock, ID
generation, password hashing, and token creation. Prefer an in-memory fake with
observable behavior over mocks that reproduce call-by-call implementation
details. Do not mock MySQL in a repository unit test; repository behavior
belongs to the real-MySQL integration suite.

Each behavior receives its own test so Jest output identifies the failing rule
without decoding parameter indices:

```ts
describe("calculateBuildStreak", () => {
  it("returns zero when there are no completions", () => {});
  it("counts consecutive completions ending today", () => {});
  it("stops counting after a missed day", () => {});
  it("does not count the same calendar day twice", () => {});
});
```

## Backend integration tests

The API uses raw SQL and MySQL-specific behavior, so real-MySQL integration
tests are mandatory. Do not replace MySQL with SQLite or mock `mysql2` for these
tests.

Repository integration tests verify:

- parameterized SQL and result mapping;
- uniqueness and foreign-key constraints;
- nullable values and date serialization;
- user-scoped reads and writes; and
- transaction commit and rollback where relevant.

Selected Supertest scenarios boot the real Nest application and verify:

- malformed input is rejected at the transport boundary;
- expected status codes and contract-compatible bodies are returned;
- registration, login, authentication, and logout behavior;
- duplicate-email and invalid-credential failures;
- authenticated users cannot read or mutate another user's records; and
- mutations persist the expected database state.

Do not repeat every domain edge case through HTTP. Unit tests own combinations
of streak, relapse, and weekly-calculation rules. Integration tests prove that
the transport, application, and persistence boundaries are connected correctly.

Apply all Dbmate migrations to a fresh test database before the integration
suite. Initially run database integration tests serially and clean application
tables in a deliberate foreign-key-safe order between tests. Never reuse the
development database or credentials. Per-worker databases may replace serial
execution later if suite duration demonstrates the need.

## Time and calendar control

Time is a domain dependency in Habit Shaper. Backend application and domain code
must receive an explicit clock or explicit calendar date rather than calling
`new Date()` throughout business logic.

Before implementing tracking, decide and document:

- which timezone defines an application day;
- which day starts a week;
- whether a completion can be recorded for a previous day;
- whether future days count as missed in the current week; and
- whether recording the same event twice is idempotent or rejected.

Tests use fixed dates and cover each rule with separately named scenarios,
including consecutive days, a missed day, duplicate same-day events, relapse,
week boundaries, and month/year boundaries. Unit and integration results must
not depend on the machine timezone or wall clock.

Playwright changes only the browser clock and does not automatically change the
API clock. E2E should therefore use current-day behavior or explicit seeded
data rather than pretending that changing the browser time changes the whole
system.

## End-to-end tests

Playwright validates the same full Compose path required for submission. It
accesses the application through Nginx rather than starting Vite and Nest
development servers independently.

Keep the initial suite limited to critical journeys:

1. Register, log in, and reach an authenticated page.
2. Create a build habit, complete it for today, and see the updated state.
3. Create a break habit, record a relapse, and see the clean streak reset.
4. Create, edit, and delete a goal linked to a habit.
5. Verify logout and protected-route behavior if not already covered naturally.

Exercise the behavior under test through the UI. API-assisted setup is allowed
for unrelated prerequisites so every test does not repeat registration through
the browser; at least one authentication journey must cover registration and
login through the UI.

Use a unique user identity per test and start with one Playwright worker while
the database strategy is simple. Prefer accessible role, label, and text
locators. Add `data-testid` only when an element has no meaningful semantic
locator. Use Playwright's web-first assertions and never fixed sleeps.

Compose teardown removes the E2E database volume after the suite. A test must
not depend on execution order or records created by another test.

## Coverage by behavior

| Behavior | Frontend | Backend unit | Backend integration | E2E |
| --- | --- | --- | --- | --- |
| Form interaction and visible validation | Primary | Not applicable | Selected request-validation cases | Happy path |
| Streak calculation | Display only | Exhaustive business scenarios | Persistence boundary | One representative journey |
| Weekly missed days | Display only | Exhaustive business scenarios | Selected date persistence | Optional representative journey |
| Relapse reset | Display and mutation state | Exhaustive business scenarios | Persisted reset | One representative journey |
| Habit and goal persistence | Query and mutation states | Use-case decisions | Primary | Indirect confirmation |
| Authentication | Forms and authenticated states | Token/use-case decisions | HTTP and security boundary | Primary journey |
| Cross-user ownership | Not duplicated in UI | Authorization decision | Required | Optional |
| Shared response contracts | API-adapter parsing | Producer mapping where relevant | Real HTTP response | Indirect confirmation |

This matrix is a responsibility guide, not a checklist requiring every behavior
to appear at every level.

## Command contract

Expose distinct root commands so failures identify the affected boundary:

| Command | Responsibility |
| --- | --- |
| `npm run test:web` | Run frontend Jest and React Testing Library tests. |
| `npm run test:api:unit` | Run infrastructure-free API Jest tests. |
| `npm run test:api:integration` | Run API and repository integration tests against migrated MySQL. |
| `npm run test:e2e` | Run Playwright against the Compose stack. |
| `npm test` | Run the fast frontend, contracts when applicable, and API unit suites. |

The pre-push hook runs type-checking and `npm test`. Database integration and
E2E remain in their explicit commands because they require infrastructure and
are slower. CI runs all applicable levels according to
[Continuous integration](./05-continuous-integration.md).

## Coverage policy

Do not enforce a repository-wide percentage threshold initially. Coverage is a
diagnostic, not a substitute for meaningful scenarios, and a global target
encourages low-value tests for framework setup, declarations, and pass-through
code.

Domain and application rules should receive strong branch coverage through
named business scenarios. Review uncovered branches in these areas rather than
using a percentage as the only gate. Reconsider targeted thresholds only after
the implementation has stabilized and the team has evidence that a threshold
would prevent real regressions.

## Anti-patterns

- Parameterized or table-driven suites that obscure which scenario failed.
- Large snapshots used instead of behavior assertions.
- MSW handlers that duplicate backend rules or maintain application state.
- Complete response literals repeated across frontend tests.
- Mocked SQL-driver behavior presented as repository confidence.
- Nest application bootstrap in ordinary domain unit tests.
- Fixed sleeps, uncontrolled wall-clock reads, or machine-timezone assumptions.
- Shared mutable users or records across integration and E2E tests.
- Repeating every business-rule permutation at every test level.
- Production-code branches or endpoints added solely to make tests convenient.

## Acceptance criteria

- Every test level has a distinct responsibility and root command.
- Frontend and backend unit tests run without MySQL, Compose, or network access.
- Component tests use the shared render utility and assert user-visible behavior.
- MSW rejects unexpected requests and uses contract-validated response builders.
- Backend domain tests use explicit, behavior-named cases rather than tables.
- Repository and API integration tests run against a freshly migrated MySQL
  database.
- Time-dependent business rules use a controllable clock or explicit date.
- Playwright covers the critical journeys through the complete Compose stack.
- Tests are independently repeatable and do not rely on execution order.
- No global coverage percentage causes low-value framework or declaration tests.
