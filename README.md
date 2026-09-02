# Habit Shaper

Habit Shaper is a lightweight web application for building positive daily
habits, breaking unwanted habits, and linking simple goals to either kind of
habit.

## AI assistance disclosure

This project was planned and implemented with assistance from OpenAI Codex
using GPT-5.6-Sol with High reasoning effort.

## Run with Docker Compose

Only Docker and Docker Compose are required. From a fresh clone, run:

```sh
docker compose up
```

Open <http://localhost:8080>. Compose builds the web and API images, starts
MySQL, applies every pending migration, and exposes the application through
Nginx. No `.env` file is required for local evaluation.

To rebuild after changing application code:

```sh
docker compose up --build
```

Stop the stack while preserving database data:

```sh
docker compose down
```

Remove the local database volume for a completely fresh start:

```sh
docker compose down --volumes
```

Local Compose provides all development values, so it does not use an environment
file. The committed `.env.example` files document the values required for
deployment and for host-run development servers.

## Environment files

Every `.env` file is git-ignored; only the `.env.example` templates are
committed. Copy the ones you need:

| Template                | Copy to         | Needed for                                                      |
| ----------------------- | --------------- | --------------------------------------------------------------- |
| `.env.example`          | `.env`          | `npm run db:*` (Dbmate) and `compose.deploy.yaml` deployments.  |
| `apps/api/.env.example` | `apps/api/.env` | `npm run dev` — the API refuses to boot without these values.   |
| `apps/web/.env.example` | `apps/web/.env` | Optional Vite dev server overrides (port, `/api` proxy target). |

`docker compose up` needs none of them.

Values already present in the process environment always win over a `.env`
file, so Compose and CI stay authoritative.

## Local development

The repository pins Node.js 24.20.0 and npm 11.19.0. From a fresh clone:

```sh
npm ci
cp .env.example .env
cp apps/api/.env.example apps/api/.env
# point DATABASE_URL in both files at your MySQL 8.4 instance
npm run db:migrate
npm run dev
```

Without `apps/api/.env` the API exits immediately: `getAppConfig()` validates
every variable at startup and throws on the first missing one.

The web dev server listens on <http://localhost:5173> and proxies `/api` to the
API on port 3000. The production-like Compose path remains the authoritative
integration boundary.

## Validation

Run the fast repository checks:

```sh
npm run validate
```

Run API integration tests against a migrated MySQL database:

```sh
npm run test:api:integration
```

Run browser tests while the Compose stack is healthy:

```sh
npm run test:e2e
```

## Repository layout

- `apps/web`: React and Vite frontend.
- `apps/api`: NestJS API and MySQL repositories.
- `packages/contracts`: shared Zod transport contracts.
- `db/migrations`: forward Dbmate migrations with reversible down sections.
- `tests/e2e`: Playwright tests against the Nginx entrypoint.
- `infra/nginx`: same-origin static serving and `/api` proxy configuration.
- `docs`: product and engineering decisions.
- `.env.example`: environment templates, at the root and inside each app.
