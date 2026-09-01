# Code Organization

## Architecture rule

Organize both applications by feature/domain using a pragmatic Vertical Slice
Architecture. A feature owns its transport calls, business behavior, persistence
or cache integration, UI, and tests. Avoid repository-wide horizontal folders
such as `controllers`, `services`, or `repositories` that mix unrelated domains.

Shared code must be genuinely domain-independent. Do not move code into a shared
folder merely because two files currently look similar.

## Naming conventions

Use lowercase kebab-case for directories and ordinary filename stems in both
applications. Dots may separate conventional roles such as `.controller`,
`.module`, `.provider`, `.repository`, `.test`, and `.spec`.

Examples:

```text
habit-card/
habit-query-keys.ts
use-habits.ts
create-habit.ts
weekly-completion.repository.ts
habits.controller.ts
calculate-streak.test.ts
tracking.integration.test.ts
```

React components and pages are the deliberate entrypoint convention: put the
unit in a named kebab-case directory and use `index.tsx`, `index.test.tsx`, and
`styles.css` inside it. TypeScript component symbols still use PascalCase, while
functions and values use camelCase. Do not use PascalCase filenames such as
`HabitCard.tsx`.

Repository-standard and tool-mandated filenames such as `Dockerfile`,
`README.md`, `package.json`, timestamped migrations, and framework configuration
files are exceptions when their ecosystem defines the name.

## Frontend structure

```text
apps/web/src/
├── app/
│   ├── app-config.ts
│   ├── app-shell.tsx
│   ├── providers.tsx
│   ├── query-client.ts
│   └── route-registry.ts
├── components/
│   ├── feedback/
│   ├── navigation/
│   └── ui/
├── features/
│   ├── auth/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── model/
│   │   └── routes/
│   ├── goals/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── model/
│   │   └── routes/
│   ├── habits/
│   │   ├── api/
│   │   ├── components/
│   │   ├── config/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── model/
│   │   └── routes/
│   └── tracking/
│       ├── api/
│       ├── components/
│       ├── hooks/
│       ├── lib/
│       └── model/
├── hooks/
├── lib/
│   ├── api-client.ts
│   ├── formatters.ts
│   └── type-guards.ts
├── mocks/
├── pages/
│   ├── dashboard/
│   │   ├── index.test.tsx
│   │   ├── index.tsx
│   │   └── styles.css
│   ├── login/
│   │   ├── index.test.tsx
│   │   ├── index.tsx
│   │   └── styles.css
│   └── not-found/
│       ├── index.tsx
│       └── styles.css
├── styles/
│   ├── base.css
│   ├── reset.css
│   ├── themes.css
│   └── tokens.css
├── test/
│   ├── setup-tests.ts
│   └── test-utils.tsx
├── types/
├── index.css
├── index.tsx
└── root.tsx
```

### Frontend responsibilities

- `app/` is the composition root. It configures providers, QueryClient defaults,
  route registration, application shell, and application-level configuration.
- `components/ui/` contains low-level reusable visual primitives without domain
  knowledge.
- `components/feedback/` and `components/navigation/` contain reusable behavior
  such as query states, notifications, and pagination.
- `features/<domain>/` owns domain-specific API calls, query definitions,
  components, hooks, types, policies, route metadata, and calculations.
- `pages/` contains thin route-level composition components. Pages assemble
  feature components but do not own API calls or substantial domain logic. Each
  page is a self-contained directory.
- `styles/` contains global CSS foundations, design tokens, and theme variable
  definitions. Component-specific styles stay beside their component.
- `hooks/`, `lib/`, and `types/` at the source root contain only cross-feature,
  framework-level utilities.
- `mocks/` owns Mock Service Worker setup and handlers if API mocking is used for
  development or component tests.
- `test/` owns Jest environment setup and the application-aware Testing Library
  render utility.
- `root.tsx` builds the route tree; `index.tsx` performs browser bootstrap and
  mounts application providers.

Every custom component and page is a self-contained directory. Keep its entry
point, stylesheet, and tests together so deleting the directory removes the
whole unit without leaving styles or tests behind:

```text
components/ui/button/
├── index.test.tsx
├── index.tsx
└── styles.css

features/habits/components/habit-card/
├── index.test.tsx
├── index.tsx
└── styles.css

pages/dashboard/
├── index.test.tsx
├── index.tsx
└── styles.css
```

Add other component-owned files, such as `types.ts`, `constants.ts`, or
`fixtures.ts`, inside the same directory only when needed. Logic that is shared
by multiple components belongs at the owning feature level rather than inside
one component directory.

Non-component modules keep tests beside the source file:

```text
features/habits/api/habit-queries.ts
features/habits/api/habit-queries.test.ts
```

### React Testing Library setup

Follow Testing Library's
[custom render setup](https://testing-library.com/docs/react-testing-library/setup/).
Component tests must import Testing Library APIs from the project test utility,
not directly from `@testing-library/react`.

`test/setup-tests.ts` is registered through Jest's `setupFilesAfterEnv` and owns
global environment setup:

```ts
import "@testing-library/jest-dom";
```

It also owns global mock-server lifecycle hooks if Mock Service Worker is added.
Individual test files must not repeat global matcher or server setup.

`test/test-utils.tsx` provides the custom render function:

```tsx
import type { PropsWithChildren, ReactElement } from "react";
import {
  render as testingLibraryRender,
  type RenderOptions,
} from "@testing-library/react";

function TestProviders({ children }: PropsWithChildren) {
  return children;
}

function render(ui: ReactElement, options?: Omit<RenderOptions, "wrapper">) {
  return testingLibraryRender(ui, {
    wrapper: TestProviders,
    ...options,
  });
}

export * from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";
export { render };
```

`TestProviders` evolves with the application and should provide isolated test
instances of QueryClient, routing, authentication, and other global providers as
needed. Each render must receive a fresh QueryClient so cache state cannot leak
between tests.

Configure a stable `@test/*` alias in TypeScript and Jest, then import from the
test utility consistently:

```ts
import { render, screen, userEvent } from "@test/test-utils";
```

Only `test/test-utils.tsx` imports from `@testing-library/react` directly. Tests
call `userEvent.setup()` inside each test that performs user interactions.

### Frontend dependency direction

```text
index/root -> app/pages -> features -> shared components/hooks/lib
                              |
                              v
                     shared contracts package
```

- Shared UI and root utilities must not import feature modules.
- Features must not reach into another feature's private files.
- Cross-feature composition belongs in a page, the app layer, or an explicitly
  exported feature boundary.
- Domain transport types should come from `@habit-shaper/contracts`; local UI
  state types remain inside the feature.
- Prefer direct imports to broad barrel files that can hide cycles.

Styling ownership and CSS dependency rules are defined in
[Styling conventions](./04-styling-conventions.md).

## TanStack Query organization

Follow effective query-key conventions with a hierarchical factory per domain.
Keep API transport, query keys, query options/hooks, and cache mutation logic in
separate colocated files when the feature needs them.

```text
features/habits/api/
├── habits-api.ts
├── habits-cache.ts
├── habits-queries.ts
└── habit-query-keys.ts
```

Example key factory:

```ts
export const habitKeys = {
  all: ["habits"] as const,
  lists: () => [...habitKeys.all, "list"] as const,
  list: (filters: HabitListFilters = {}) =>
    [...habitKeys.lists(), filters] as const,
  details: () => [...habitKeys.all, "detail"] as const,
  detail: (habitId: string) => [...habitKeys.details(), habitId] as const,
  statistics: (habitId: string, week: string) =>
    [...habitKeys.detail(habitId), "statistics", week] as const,
};
```

Query rules:

- Start every key with a stable domain root.
- Move from broad to specific: all, collection type, filters or identifier, then
  nested resource.
- Include every input used by the query function in its query key.
- Use JSON-serializable key values and normalize optional filters before adding
  them.
- Return readonly tuple keys with `as const`.
- Build query definitions with `queryOptions()` where they are reused by hooks,
  prefetching, loaders, or tests.
- Keep one application QueryClient factory with intentional retry, stale-time,
  garbage-collection, and refetch defaults.
- Invalidate the narrowest useful key branch after a mutation.
- Keep mutation cache snapshot, optimistic update, rollback, reconciliation, and
  invalidation behavior near the owning feature.
- Do not copy server state into context or another client-side store.

## Backend structure

```text
apps/api/src/
├── app/
│   ├── app.module.ts
│   └── bootstrap.ts
├── common/
│   ├── auth/
│   ├── errors/
│   ├── http/
│   └── validation/
├── config/
├── database/
│   ├── database.module.ts
│   ├── database.tokens.ts
│   └── mysql.provider.ts
├── features/
│   ├── auth/
│   │   ├── application/
│   │   ├── data/
│   │   ├── transport/
│   │   │   └── rest/
│   │   └── auth.module.ts
│   ├── goals/
│   │   ├── application/
│   │   ├── data/
│   │   ├── transport/
│   │   │   └── rest/
│   │   └── goals.module.ts
│   ├── habits/
│   │   ├── application/
│   │   ├── data/
│   │   ├── domain/
│   │   ├── transport/
│   │   │   └── rest/
│   │   └── habits.module.ts
│   └── tracking/
│       ├── application/
│       ├── data/
│       ├── domain/
│       ├── transport/
│       │   └── rest/
│       └── tracking.module.ts
└── main.ts
```

### Backend responsibilities

- Each `features/<domain>` directory is an independent NestJS feature module.
- `transport/rest/` owns controllers, HTTP validation, status codes, headers,
  and request/response adaptation.
- `application/` owns use cases, orchestration, authorization decisions, and
  transaction boundaries.
- `domain/` owns pure rules and calculations when the feature needs them.
- `data/` owns raw SQL, row interfaces, result mapping, and repository classes.
- Keep simple features flat until multiple files justify a subdirectory; the
  structure is a boundary, not a requirement to create empty folders.
- `database/` owns the MySQL pool lifecycle and database-level primitives only.
- `common/` is restricted to cross-cutting HTTP, validation, authentication, and
  error behavior. It must not become a miscellaneous business-logic folder.
- NestJS controllers never execute SQL directly.
- Repository classes never receive HTTP request objects or return NestJS response
  types.

## Transport boundaries

REST is the initial transport, but it is an adapter rather than the application
architecture. Keep the dependency direction explicit:

```text
REST controller ────┐
                    ├──> application use case -> domain -> repository -> MySQL
GraphQL resolver ───┘
```

GraphQL is not implemented during the REST scaffold. The boundary exists so a
future `transport/graphql/` resolver can call the same application use cases as
`transport/rest/`.

### Backend transport rules

- Application use cases accept and return plain TypeScript values.
- Do not pass Express `Request`/`Response`, NestJS decorators, HTTP status codes,
  GraphQL context, or resolver metadata into application or domain code.
- REST controllers translate HTTP parameters and bodies into use-case input.
- Controllers translate use-case results and typed application errors into HTTP
  responses.
- Authentication resolves the current user at the transport boundary and passes
  an explicit user identity into the use case.
- Business validation belongs in application/domain code. Transport validation
  may reject malformed input before calling a use case.
- Transactions are owned by application use cases, not controllers or future
  resolvers.
- Repositories expose domain-oriented operations and remain unaware of REST or
  GraphQL.
- If GraphQL is added, resolvers live beside REST under `transport/graphql/` and
  adapt to the same use-case inputs and outputs.

### Frontend transport rules

Each feature's `api/` directory is the network adapter. React components, page
components, and TanStack Query hooks must not contain URLs, HTTP methods, header
construction, response-envelope parsing, or GraphQL documents.

```text
component/page
      |
feature query hook + query keys
      |
feature API adapter
      |
REST client now / GraphQL client later
```

- `lib/api-client.ts` owns cross-feature REST mechanics such as the base URL,
  credentials, headers, JSON parsing, and normalized transport errors.
- `features/<domain>/api/*-api.ts` owns domain endpoint paths and maps REST
  request/response shapes to the stable values consumed by query hooks.
- TanStack Query keys describe domain data, not REST URLs or GraphQL operation
  names.
- Components consume feature hooks and domain-facing values only.
- A future GraphQL migration replaces or supplements the feature API adapters;
  query keys and components should not require a transport-driven rewrite.
- Do not create a generic repository abstraction solely to anticipate GraphQL.
  A thin, well-contained adapter is sufficient until a second transport exists.

Tests remain near the unit they verify. Tests that require a bootstrapped API or
real MySQL instance belong in the API integration-test area rather than inside a
feature's unit-test files. Test levels, fixtures, naming suffixes, and database
isolation are defined in [Testing strategy](./06-testing-strategy.md).

## Shared contracts structure

```text
packages/contracts/src/
├── auth/
├── goals/
├── habits/
├── tracking/
├── common/
└── index.ts
```

The contracts workspace owns Zod boundary schemas and transport-neutral
input/output types that are useful to both applications. REST-only envelopes,
headers, and status semantics stay in REST adapters. It does not contain React
components, NestJS decorators, Express types, GraphQL decorators, SQL row types,
repositories, or business services.
