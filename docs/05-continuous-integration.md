# Continuous Integration

## Scope

Use GitHub Actions for continuous integration only. Deployment is not part of
the repository workflow; Coolify is configured manually on the target server and
builds from the repository when deployment is introduced.

The CI workflow does not publish images, push packages, call deployment hooks,
or store deployment credentials.

Test responsibilities and isolation boundaries are defined in
[Testing strategy](./06-testing-strategy.md); this document defines when and how
those suites run in CI.

## Workflow shape

Use one `.github/workflows/ci.yml` workflow containing separate logical jobs:

```text
                  ┌─ frontend ─┐
changes ──────────┤            ├─ e2e
                  └─ backend ──┘   │
quality ───────────────────────────┘
```

The jobs are:

1. `changes`: classify modified paths.
2. `quality`: run repository-wide formatting and linting.
3. `frontend`: validate the web application when affected.
4. `backend`: validate the API and MySQL integration when affected.
5. `e2e`: validate the complete Compose stack when affected.

Do not create independent path-filtered frontend, backend, and E2E workflows.
Conditional jobs inside an always-triggered workflow keep CI centralized while
allowing irrelevant application lanes to be skipped.

## Events and concurrency

Run the workflow on:

- every pull request;
- pushes to the default branch; and
- manual `workflow_dispatch` runs.

Do not apply workflow-level `paths` filters. The `changes` job controls
job-level execution instead.

Use a concurrency group based on the workflow and pull-request branch or ref.
Cancel an older in-progress run when a newer commit is pushed to the same pull
request. Default-branch runs must not cancel unrelated runs.

Set explicit job timeouts so infrastructure failures cannot consume runner time
indefinitely. Suggested starting limits:

| Job        | Timeout    |
| ---------- | ---------- |
| `changes`  | 5 minutes  |
| `quality`  | 10 minutes |
| `frontend` | 15 minutes |
| `backend`  | 20 minutes |
| `e2e`      | 30 minutes |

## Permissions and pinning

Set workflow permissions to read-only by default:

```yaml
permissions:
  contents: read
```

Grant an additional permission only to the job that demonstrates a need for it.
The CI workflow must not request package, deployment, environment, or repository
write permissions.

Pin every external action to its full commit SHA and include the corresponding
release tag as a maintenance comment:

```yaml
- uses: actions/checkout@<full-commit-sha> # vX.Y.Z
```

Do not reference action branches, moving major tags, or floating tags. Action
updates are deliberate dependency changes and receive the same review as npm
dependency updates.

## Runner policy

Use the latest generally available Ubuntu runner through its fixed OS label:

```yaml
runs-on: ubuntu-24.04
```

Do not use `ubuntu-latest`. Ubuntu 26.04 is not selected while its GitHub-hosted
runner image is in preview. Move to `ubuntu-26.04` in a deliberate commit after
GitHub marks it generally available and the workflow passes on that image.

The fixed label pins the operating-system generation, not the exact weekly image
revision maintained by GitHub. Exact runner-image immutability would require a
self-hosted image and is outside this project scope.

Every job installs the exact Node.js and npm versions declared by the
repository; do not rely on whichever Node.js version happens to be preinstalled
on the runner.

## Change detection

The `changes` job exposes boolean `frontend`, `backend`, and `e2e` outputs. Use a
well-scoped change-filter implementation pinned to a full commit SHA, or an
equivalently reviewed repository script. Avoid duplicating fragile Git diff
logic independently across jobs.

### Frontend paths

```text
apps/web/**
packages/contracts/**
package.json
package-lock.json
tsconfig.base.json
frontend build/test configuration
.github/workflows/ci.yml
```

### Backend paths

```text
apps/api/**
packages/contracts/**
db/**
package.json
package-lock.json
tsconfig.base.json
backend build/test configuration
.github/workflows/ci.yml
```

### E2E paths

```text
apps/web/**
apps/api/**
packages/contracts/**
tests/e2e/**
db/**
infra/**
compose.yml
compose.deploy.yml
**/Dockerfile
.dockerignore
.env.example
package.json
package-lock.json
.github/workflows/ci.yml
```

A contracts, root dependency, or CI workflow change therefore validates both
applications and the integrated system. A documentation-only change runs the
`quality` and `ci` jobs while the application lanes are skipped.

## Quality job

The `quality` job runs for every workflow invocation:

1. Check out the repository.
2. Install the pinned Node.js/npm versions.
3. Install dependencies with `npm ci`.
4. Run the repository Oxfmt check.
5. Run Oxlint.

Keep type-checking, tests, and builds in their owning application jobs so their
result identifies the failing boundary clearly.

## Frontend job

Run when `changes.frontend` is true and after `changes` succeeds:

1. Check out the repository.
2. Install pinned Node.js/npm and run `npm ci`.
3. Build or type-check shared contracts as required.
4. Run the web TypeScript check.
5. Run web Jest and React Testing Library tests.
6. Build the production Vite application with React Compiler enabled.

The frontend job does not start MySQL, the API, Playwright, or Compose.

## Backend job

Run when `changes.backend` is true and after `changes` succeeds. Provide a pinned
official MySQL service container with explicit health checks and test-only
credentials.

Steps:

1. Check out the repository.
2. Install pinned Node.js/npm and run `npm ci`.
3. Build or type-check shared contracts as required.
4. Run the API TypeScript check.
5. Run API Jest unit tests.
6. Wait for MySQL and apply all Dbmate migrations to an empty test database.
7. Run repository and API integration tests against MySQL.
8. Build the production NestJS application.

Do not substitute SQLite or an in-memory database for MySQL integration tests.
Keep unit and integration commands separate so failures are easy to identify.

## E2E job

E2E is a cross-stack responsibility and belongs in its own job rather than the
frontend or backend job. It lives in the `tests/e2e` workspace and validates the
same Compose path required by the coding test.

Run when `changes.e2e` is true, after `quality` and every relevant application
job has succeeded or been skipped as not applicable. A backend failure must not
start E2E, and a frontend failure must not start E2E.

Steps:

1. Check out the repository.
2. Install pinned Node.js/npm and run `npm ci`.
3. Install the lockfile-pinned Playwright Chromium browser and required system
   dependencies.
4. Set a unique Compose project name using the workflow run ID and attempt.
5. Build and start the full stack with Docker Compose.
6. Wait for declared service health checks.
7. Run the critical Playwright suite against the Nginx entrypoint.
8. Print Compose logs to the job log when setup or tests fail.
9. Always stop the project and remove its containers, networks, and volumes.

Use the Compose configuration itself rather than manually starting separate web
and API development servers. This validates image builds, migration ordering,
Nginx routing, API health, MySQL connectivity, and browser behavior together.

## Artifact and cache policy

Do not use GitHub Actions artifact storage:

- no `actions/upload-artifact`;
- no frontend or backend build uploads;
- no Docker image archives;
- no coverage-report uploads;
- no Playwright HTML report, trace, screenshot, or video uploads; and
- no build-output transfer between jobs.

Each validation job builds what it needs. The E2E job builds the Compose stack
again rather than consuming frontend/backend build artifacts. The extra compute
is acceptable for this project and avoids artifact storage and lifecycle
management.

Use standard job logs and `$GITHUB_STEP_SUMMARY` for concise diagnostics. Print
Compose logs on E2E failure. Configure Playwright output under `$RUNNER_TEMP` so
failure files are local to the runner and disappear with the job.

Do not enable GitHub-hosted dependency caches initially. `npm ci` downloads from
the registry for each job. If CI duration later becomes a demonstrated problem,
an npm download cache may be evaluated separately with an explicit storage and
retention decision; never cache `node_modules`.

## Self-hosted runner cleanup

The initial workflow uses GitHub-hosted `ubuntu-24.04`, whose filesystem is
ephemeral. If a self-hosted runner is introduced later:

- use a unique Compose project name per run;
- always run `docker compose down --volumes --remove-orphans` for that project;
- keep Playwright output under the runner temporary directory;
- do not run broad image or builder-cache pruning inside normal CI jobs; and
- perform image and BuildKit-cache maintenance through a separately scheduled,
  concurrency-safe runner operation.

Aggressive per-job pruning can interfere with another job sharing the runner.
Runner maintenance is infrastructure administration rather than a repository
artifact-upload concern.

## Acceptance criteria

- Documentation-only changes run quality checks without starting application or
  E2E jobs.
- Frontend-only changes run frontend and E2E checks.
- Backend-only changes run backend and E2E checks.
- Shared contract and root dependency changes run both application jobs and E2E.
- Backend integration tests apply migrations to real MySQL.
- E2E starts the complete Compose stack and always tears it down.
- All runners use `ubuntu-24.04` and repository-pinned Node/npm versions.
- All referenced actions use full immutable commit SHAs.
- The workflow uploads no artifacts, publishes no images, and performs no
  deployment.
