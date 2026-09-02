# Phase 1: Project Scaffolding

## Outcome

Create a minimal but complete monorepo foundation before implementing business
features. At the end of this phase, every workspace can be linted, formatted,
type-checked, tested, and built from the repository root. The applications may
only show health/placeholder behavior at this point.

## Target repository layout

```text
habit-shaper/
├── apps/
│   ├── api/
│   │   ├── src/
│   │   ├── test/
│   │   ├── Dockerfile
│   │   ├── .env.example
│   │   └── package.json
│   └── web/
│       ├── src/
│       ├── Dockerfile
│       ├── .env.example
│       └── package.json
├── packages/
│   └── contracts/
│       ├── src/
│       ├── tsconfig.json
│       └── package.json
├── tests/
│   └── e2e/
│       ├── tests/
│       ├── playwright.config.ts
│       └── package.json
├── db/
│   └── migrations/
├── infra/
│   └── nginx/
│       └── default.conf
├── docs/
├── .github/workflows/
├── compose.yaml
├── package.json
├── package-lock.json
├── tsconfig.base.json
├── oxlint.config.ts
├── .oxfmtrc.json
├── lefthook.yaml
├── .env.example
└── README.md
```

Workspace patterns:

```json
{
  "private": true,
  "workspaces": ["apps/*", "packages/*", "tests/*"]
}
```

Use scoped names such as `@habit-shaper/api`, `@habit-shaper/web`, and
`@habit-shaper/contracts`. This makes workspace commands and dependency edges
unambiguous.

## Runtime and package-management policy

- Pin Node.js 24.20.0 through `engines`, `.nvmrc`, and Docker base images.
- Pin npm 11.19.0 with the root `packageManager` field.
- Save every direct dependency and development dependency with an exact version;
  add `save-exact=true` to the root `.npmrc`.
- Commit `package-lock.json` and use `npm ci` in CI and Docker builds.
- Install shared developer tooling at the repository root.
- Install runtime and test dependencies in the workspace that imports them.
- Do not rely on globally installed CLIs; invoke local binaries through npm
  scripts.

See [Tooling and runtime conventions](./02-tooling-and-runtime-conventions.md)
for dependency, Oxfmt, and container-image policies.

## Dependency ownership

### Root development tooling

- `typescript`
- `oxlint`
- `oxfmt`
- `lefthook`
- `dbmate`
- `concurrently` for the optional local multi-process development command

### `apps/web`

Runtime dependencies:

- `react` and `react-dom`
- `react-router-dom`
- `@tanstack/react-query`
- `zod`
- `@hookform/resolvers` and `react-hook-form`
- `@habit-shaper/contracts`

Styling uses vanilla CSS with a small token-based design system. Do not add a
CSS framework, preprocessor, CSS-in-JS runtime, or component-library dependency.
See [Styling conventions](./04-styling-conventions.md).

Development dependencies:

- `vite` and `@vitejs/plugin-react`
- `babel-plugin-react-compiler`
- React and Node TypeScript declarations
- `jest`, `babel-jest`, and `jest-environment-jsdom`
- Babel presets for environment, React, and TypeScript transformation
- `@testing-library/react`, `@testing-library/jest-dom`, and
  `@testing-library/user-event`
- `msw` for selected API-adapter and network-aware feature tests

Jest does not consume Vite's plugin pipeline. Keep `jest.config` and the Jest
Babel transform explicit, map styles/assets, and avoid reading `import.meta.env`
directly throughout application code. A small environment module should isolate
Vite-specific configuration.

Add `test/setup-tests.ts` for Jest environment setup and
`test/test-utils.tsx` for the provider-aware custom render. Component tests
import `render`, queries, and user-event through `@test/test-utils` instead of
importing directly from React Testing Library.

Organize application composition, shared UI, pages, feature code, colocated
tests, and TanStack Query key factories according to
[Code organization](./03-code-organization.md#frontend-structure).

### `apps/api`

Runtime dependencies:

- NestJS core, platform, configuration, and JWT packages
- `mysql2`
- `zod`
- `@habit-shaper/contracts`
- `cookie-parser`
- `helmet`
- `argon2` for the specified Argon2id password hashing contract
- Nest throttling support for authentication endpoints

Development dependencies:

- Nest CLI and testing packages
- `jest` and `ts-jest`
- `supertest`
- TypeScript declarations required by the API

The API will expose a custom database module that owns a `mysql2/promise` pool.
Feature repositories receive that pool through dependency injection and use
parameterized `execute()` calls. No ORM or query builder is introduced.

NestJS modules, controllers, use cases, domain rules, repositories, raw SQL, and
tests follow the feature-owned boundaries in
[Code organization](./03-code-organization.md#backend-structure).

REST is the initial application transport. Controllers remain thin adapters so
GraphQL resolvers or another transport can be added later without rewriting
application use cases, domain rules, or repositories. The frontend isolates
HTTP URLs and methods inside each feature's API adapter.

### `packages/contracts`

- `zod` as a runtime dependency
- TypeScript build configuration with declaration output

This package contains transport schemas, response shapes, and inferred types.
It must not import NestJS, React, database code, or domain services.

### `tests/e2e`

- `@playwright/test`

Keep browser tests out of the web workspace so component tests and end-to-end
tests have distinct responsibilities and commands.

The responsibilities, isolation boundaries, fixture rules, and initial test
scope are defined in [Testing strategy](./06-testing-strategy.md).

## Root command contract

The root `package.json` should provide a predictable interface:

| Command                        | Responsibility                                                                                    |
| ------------------------------ | ------------------------------------------------------------------------------------------------- |
| `npm run dev`                  | Start web and API development processes; requires `apps/api/.env` and a reachable MySQL instance. |
| `npm run build`                | Build contracts first, followed by API and web.                                                   |
| `npm run typecheck`            | Type-check all TypeScript workspaces without emitting.                                            |
| `npm run lint`                 | Run Oxlint across tracked source/config files.                                                    |
| `npm run lint:fix`             | Apply safe Oxlint fixes.                                                                          |
| `npm run format`               | Apply Oxfmt.                                                                                      |
| `npm run format:check`         | Verify formatting without modifying files.                                                        |
| `npm run test:web`             | Run frontend Jest and React Testing Library tests.                                                |
| `npm run test:api:unit`        | Run infrastructure-free API Jest tests.                                                           |
| `npm run test:api:integration` | Run API and repository integration tests against migrated MySQL.                                  |
| `npm test`                     | Run fast frontend, contracts when applicable, and API unit suites.                                |
| `npm run test:e2e`             | Run Playwright tests.                                                                             |
| `npm run db:new -- <name>`     | Create a timestamped SQL migration with Dbmate.                                                   |
| `npm run db:migrate`           | Wait for MySQL and apply pending migrations.                                                      |
| `npm run db:rollback`          | Roll back the latest migration in development.                                                    |
| `npm run validate`             | Run formatting check, lint, type-check, unit tests, and builds.                                   |

Commands should use explicit workspace names where build order matters rather
than assuming glob order.

## Scaffold sequence

### 1. Establish repository metadata

- Add root workspace metadata, Node/npm pinning, TypeScript base settings, and
  `.gitignore`.
- Add a root `.npmrc` that enables exact dependency saving.
- Add `.env.example` files with documented placeholders only: one at the root
  for Dbmate and deployment Compose, and one per application for the host-run
  development servers.
- Preserve the supplied coding-test brief in the repository.
- Install root tooling and generate the initial lockfile.

### 2. Scaffold the applications

- Generate `apps/web` from the Vite `react-ts` template without creating a
  nested Git repository.
- Generate `apps/api` from the NestJS TypeScript template without performing a
  nested dependency installation.
- Remove template demo code and retain only a simple application shell and API
  health behavior.
- Normalize both package manifests for the root workspace.

### 3. Add the shared contracts workspace

- Create a buildable TypeScript package.
- Export one small health response schema to prove API-to-web consumption.
- Configure project references or explicit build order.

### 4. Configure React Compiler and frontend routing

- Enable React Compiler through the Vite React plugin's Babel configuration.
- Create public and authenticated route layouts with placeholder routes.
- Place every placeholder page and custom component in its own directory with
  `index.tsx`, `styles.css`, and a colocated `index.test.tsx` when tested.
- Add the TanStack Query provider and a centralized API client boundary.
- Add the vanilla CSS entrypoint, design tokens, semantic theme variables,
  global foundations, and first reusable UI primitives.
- Add the Jest environment setup and custom Testing Library render utility.
- Add one component test proving the Jest/RTL transform works.

### 5. Configure the NestJS foundation

- Import `ConfigModule.forRoot()` first in `AppModule` so `apps/api/.env` is
  assigned into `process.env` before `getAppConfig()` runs during bootstrap.
  Existing process variables take precedence, keeping Compose and CI
  authoritative.
- Add configuration validation, global request validation, security headers,
  cookie parsing, consistent API prefixing, and graceful shutdown.
- Keep REST controllers separate from transport-independent application use
  cases and plain input/output types.
- Add `DatabaseModule` with a pool provider, without feature queries yet.
- Add `/api/health` with a small unit test.

### 6. Configure quality tooling and hooks

- Add the root Oxlint configuration and the agreed `.oxfmtrc.json` from
  [Tooling and runtime conventions](./02-tooling-and-runtime-conventions.md#oxfmt).
- Add workspace-aware type-check scripts.
- Configure Lefthook:
  - pre-commit: format check and lint staged source files, then type-check all
    workspaces.
- Keep tests out of Git hooks because they can slow down routine commits. Run
  them explicitly during development and through CI.

### 7. Add migration and container plumbing

- Install Dbmate at the root and create `db/migrations`.
- Add multi-stage API and web Dockerfiles with separate dependency, build, and
  runtime stages.
- Use pinned stable Debian- or Ubuntu-based images for custom build and runtime
  stages; do not use Alpine or floating tags.
- Include an API Docker target that runs the npm-installed Dbmate CLI.
- Define preliminary `db`, `migrate`, `api`, and `web` Compose services.
- Add database and HTTP health checks and explicit dependency conditions.
- Configure Nginx to serve the web build and proxy `/api` to NestJS.

The first real migration is created after the schema decisions are confirmed.
The scaffold verifies the migration CLI, Docker target, and Compose dependency
chain without inventing a temporary application table.

### 8. Add CI skeleton

- Add the single orchestrating GitHub Actions workflow defined in
  [Continuous integration](./05-continuous-integration.md).
- Configure change detection, repository quality, frontend, backend, and E2E
  jobs.
- Pin the runner label and every referenced action according to the CI policy.
- Do not add artifact upload, cache storage, image publishing, or deployment
  steps.

## Scaffold acceptance criteria

- A clean clone can run `npm ci` successfully.
- Workspace manifests contain exact direct dependency versions and no nested
  lockfiles.
- `npm run validate` succeeds from the repository root.
- Both workspaces compile in strict TypeScript mode.
- REST details do not leak into application services, repositories, React
  components, or TanStack Query key factories.
- React Compiler is enabled in the production web build.
- Web styling uses vanilla CSS, shared design tokens, and semantic theme
  variables without a styling framework.
- Custom components and pages keep their implementation, styles, and tests in a
  single deletable directory.
- Jest runs at least one API test and one React Testing Library test.
- Web component tests import Testing Library APIs through `@test/test-utils`.
- Oxlint, Oxfmt, and Lefthook use repository-local installations.
- Dbmate can create a new migration through the root npm script.
- Docker images build from the root context without copying host `node_modules`.
- Final web and API images contain runtime artifacts and dependencies only.
- Custom Dockerfiles use pinned stable Debian- or Ubuntu-based images.
- The CI workflow runs change-aware validation and persists no build or test
  artifacts.
- No secrets, nested lockfiles, generated builds, or nested Git repositories are
  committed.
