import { type INestApplication } from "@nestjs/common";
import { type Pool } from "mysql2/promise";
import request, { type SuperAgentTest } from "supertest";

import { DATABASE_POOL } from "../../src/database/database.constants";
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
});
