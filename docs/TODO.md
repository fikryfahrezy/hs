# Habit Shaper Implementation Todo

This file is a working implementation checklist. The documents under `docs/`
remain the detailed engineering reference.

## 1. Scaffolding

- [x] Create the root npm workspaces and shared TypeScript configuration.
- [x] Scaffold the React web application and NestJS API.
- [x] Create the shared contracts and Playwright workspaces.
- [x] Pin exact Node.js, npm, dependency, MySQL, Nginx, and container versions.
- [x] Configure Oxfmt, Oxlint, strict TypeScript, Jest, and Lefthook.
- [x] Add the MySQL connection, Dbmate migration plumbing, and API health check.
- [x] Add multi-stage Dockerfiles, Nginx routing, health checks, and
      `compose.yaml`.
- [x] Ensure a fresh clone starts with `docker compose up` without requiring an
      `.env` file.
- [x] Add `.env.example` for optional overrides and production configuration.
- [x] Add per-application `.env.example` templates and load `apps/api/.env`
      through `ConfigModule.forRoot()` so `npm run dev` works on the host.
- [x] Add the GitHub Actions CI foundation.
- [x] Exercise the selected Argon2id package and parameters in the final API
      container.
- [x] Update the planning documents to remove the `.env` startup ambiguity.
- [x] Change the implementation plan and technical specification from `Draft`
      to `Ready` after their readiness checks pass.

## 2. Authentication

- [x] Add the users migration and shared authentication contracts.
- [x] Implement registration, login, session restoration, and logout.
- [x] Implement Argon2id password hashing and signed HTTP-only cookie sessions.
- [x] Add authentication throttling and protected-route behavior.
- [x] Add unit, integration, component, and Playwright authentication tests.

## 3. Habit management and dashboard

- [x] Add the habits migration and shared habit contracts.
- [x] Implement owned build- and break-habit creation, listing, and deletion.
- [x] Add the responsive Today dashboard and empty, loading, error, and success
      states.
- [x] Add habit creation and confirmed deletion interfaces.
- [x] Verify user isolation in application and integration tests.

## 4. Build-habit tracking

- [x] Add the habit-completions migration.
- [x] Implement current-week completion and correction operations.
- [x] Implement current streak and weekly progress calculations.
- [x] Add the seven-day progress interface and daily completion actions.
- [x] Test date eligibility, idempotency, ownership, boundaries, and UI states.

## 5. Break-habit tracking

- [x] Add the habit-relapses migration.
- [x] Implement clean-streak calculation and today's relapse operation.
- [x] Add supportive relapse confirmation and mutation feedback.
- [x] Test reset behavior, idempotency, ownership, boundaries, and UI states.

## 6. Goal management

- [ ] Add the goals migration and shared goal contracts.
- [ ] Implement owned goal listing, creation, editing, and deletion.
- [ ] Validate that every linked habit belongs to the authenticated user.
- [ ] Add goal management interfaces and the Today goal summary.
- [ ] Test CRUD, reassignment, ownership, and cascading deletion.

## 7. Hardening and submission readiness

- [ ] Complete critical Playwright journeys through Compose and Nginx.
- [ ] Review accessibility, keyboard behavior, focus management, responsive
      layout, and reduced motion.
- [ ] Review validation, security headers, cookies, throttling, ownership,
      secret handling, and safe logging.
- [ ] Verify migrations on a fresh database and persistence after restart.
- [ ] Finish `README.md` setup, operation, testing, and troubleshooting steps.
- [ ] Run formatting, linting, type-checking, unit, integration, build, and E2E
      validation.
- [ ] Inspect the final repository and containers for secrets, generated files,
      development dependencies, and other unintended artifacts.
- [ ] Change the implementation plan and technical specification to
      `Implemented` only after the shipped behavior matches them.
