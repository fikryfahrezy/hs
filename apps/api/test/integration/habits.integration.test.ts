import { type INestApplication } from "@nestjs/common";
import { type Pool } from "mysql2/promise";
import request, { type SuperAgentTest } from "supertest";

import { DATABASE_POOL } from "#app/database/database.constants";
import { createTestApp } from "../support/create-test-app";

const testRun = Date.now();

async function register(
  app: INestApplication,
  label: string,
): Promise<SuperAgentTest> {
  const agent = request.agent(app.getHttpServer());

  await agent
    .post("/api/auth/register")
    .send({
      email: `integration-habits-${testRun}-${label}@example.com`,
      password: "correct horse battery staple",
      timezone: "Asia/Jakarta",
    })
    .expect(201);

  return agent;
}

describe("habit endpoints", () => {
  let app: INestApplication;
  let pool: Pool;

  beforeAll(async () => {
    app = await createTestApp();
    pool = app.get<Pool>(DATABASE_POOL);
  });

  afterAll(async () => {
    await pool.execute("DELETE FROM users WHERE email LIKE ?", [
      `integration-habits-${testRun}-%`,
    ]);
    await app.close();
  });

  it("creates, scopes, and deletes owned build and break habits", async () => {
    const owner = await register(app, "owner");
    const stranger = await register(app, "stranger");
    const created = await owner
      .post("/api/habits")
      .send({ name: "  Meditate  ", type: "build" })
      .expect(201);
    await owner
      .post("/api/habits")
      .send({ name: "Doomscrolling", type: "break" })
      .expect(201);

    expect((await owner.get("/api/habits").expect(200)).body).toHaveLength(2);
    expect((await stranger.get("/api/habits").expect(200)).body).toEqual([]);

    await stranger.delete(`/api/habits/${created.body.id}`).expect(404);
    await owner.delete(`/api/habits/${created.body.id}`).expect(204);

    expect((await owner.get("/api/habits").expect(200)).body).toHaveLength(1);
  });

  it("records and corrects an owned current-week completion idempotently", async () => {
    const owner = await register(app, "tracking-owner");
    const stranger = await register(app, "tracking-stranger");
    const created = await owner
      .post("/api/habits")
      .send({ name: "Read", type: "build" })
      .expect(201);
    const today = created.body.tracking.week.days.find(
      (day: { state: string }) => day.state === "pending",
    ).date;
    const endpoint = `/api/habits/${created.body.id}/completions/${today}`;

    await stranger.put(endpoint).expect(404);
    const completed = await owner.put(endpoint).expect(200);
    expect(completed.body.tracking.week.completed_day_count).toBe(1);
    expect(
      completed.body.tracking.week.days.find(
        (day: { date: string }) => day.date === today,
      ).state,
    ).toBe("completed");

    const repeated = await owner.put(endpoint).expect(200);
    expect(repeated.body.tracking.week.completed_day_count).toBe(1);

    const corrected = await owner.delete(endpoint).expect(200);
    expect(corrected.body.tracking.week.completed_day_count).toBe(0);
  });

  it("records an owned relapse idempotently and rejects other habit types", async () => {
    const owner = await register(app, "relapse-owner");
    const stranger = await register(app, "relapse-stranger");
    const breaking = await owner
      .post("/api/habits")
      .send({ name: "Doomscrolling", type: "break" })
      .expect(201);
    const building = await owner
      .post("/api/habits")
      .send({ name: "Read", type: "build" })
      .expect(201);
    const endpoint = `/api/habits/${breaking.body.id}/relapses`;

    await stranger.post(endpoint).expect(404);

    const recorded = await owner.post(endpoint).expect(200);
    expect(recorded.body.tracking.current_clean_streak).toBe(0);
    expect(recorded.body.tracking.last_relapse_date).toBe(
      breaking.body.start_date,
    );

    const repeated = await owner.post(endpoint).expect(200);
    expect(repeated.body.tracking.current_clean_streak).toBe(0);

    await owner.post(`/api/habits/${building.body.id}/relapses`).expect(409);
  });
});
