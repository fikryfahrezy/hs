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
file. `.env.example` documents the values required for deployment.

## Local development

The repository pins Node.js 24.20.0 and npm 11.19.0. Install the exact locked
dependencies and run both development servers with:

```sh
npm ci
npm run dev
```

Local application development expects MySQL to be available through Compose or
an equivalent MySQL 8.4 instance. The production-like Compose path remains the
authoritative integration boundary.

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
