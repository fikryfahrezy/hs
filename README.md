# Habit Shaper

A full-stack habit tracker for build habits, break habits, weekly progress, and
goals linked to either habit type.

## Quick start

Requires Docker with Compose:

```sh
docker compose up
```

Open <http://localhost:8080>. Compose starts MySQL, applies pending migrations,
builds the API and web applications, and serves both through Nginx. Local data
is stored in the `mysql-data` volume; `docker compose down` preserves it.

Use `APP_PORT` or `MYSQL_PORT` to override ports 8080 or 3306.

## Host development

Requires Node.js 24.20.0, npm 11.19.0, and MySQL 8.4.

```sh
npm ci
cp .env.example .env
cp apps/api/.env.example apps/api/.env
npm run db:migrate
npm run dev
```

Set both `DATABASE_URL` values for the local MySQL instance. The web application
runs at <http://localhost:5173> and proxies `/api` to port 3000.

Environment templates:

| Template                | Consumer                                    |
| ----------------------- | ------------------------------------------- |
| `.env.example`          | Dbmate and the deployment Compose file.     |
| `apps/api/.env.example` | Host-run NestJS API.                        |
| `apps/web/.env.example` | Optional Vite port and API proxy overrides. |

## Validation

```sh
npm run validate             # format, lint, types, unit tests, and builds
npm run test:api:integration # requires a migrated MySQL database
npm run test:e2e             # requires a healthy Compose stack
```

## Deployment

[`compose.deploy.yaml`](./compose.deploy.yaml) expects an external MySQL
database and these values:

| Variable        | Requirement                                        |
| --------------- | -------------------------------------------------- |
| `DATABASE_URL`  | MySQL URL used by migrations and the API.          |
| `JWT_SECRET`    | Signing secret containing at least 32 bytes.       |
| `COOKIE_SECURE` | Optional cookie `Secure` flag; defaults to `true`. |

Route external traffic to the `web` service on port 8080. The API is internal
and exposed only through Nginx at `/api`.

## Implementation notes

- React/Vite frontend, NestJS API, MySQL, and shared Zod contracts.
- Authentication uses Argon2id and a signed HTTP-only, SameSite=Lax cookie.
- Resource queries enforce ownership in SQL. Dbmate migrations are the schema
  source of truth.

## Repository layout

- `apps/web`: frontend application.
- `apps/api`: API and MySQL repositories.
- `packages/contracts`: shared request and response contracts.
- `db/migrations`: database migrations.
- `tests/e2e`: Playwright journeys through Nginx.
- `infra`: Nginx and migration container configuration.
- `docs`: architecture, conventions, and implementation plan.

## AI assistance

The project was planned and implemented with OpenAI Codex using GPT-5.6-Sol
with High reasoning effort.
