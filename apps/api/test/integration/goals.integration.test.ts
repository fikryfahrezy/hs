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
      email: `integration-goals-${testRun}-${label}@example.com`,
      password: "correct horse battery staple",
      timezone: "Asia/Jakarta",
    })
    .expect(201);
  return agent;
}

async function createHabit(
  agent: SuperAgentTest,
  name: string,
  type: "build" | "break" = "build",
) {
  return agent.post("/api/habits").send({ name, type }).expect(201);
}

describe("goal endpoints", () => {
  let app: INestApplication;
  let pool: Pool;

  beforeAll(async () => {
    app = await createTestApp();
    pool = app.get<Pool>(DATABASE_POOL);
  });

  afterAll(async () => {
    await pool.execute("DELETE FROM users WHERE email LIKE ?", [
      `integration-goals-${testRun}-%`,
    ]);
    await app.close();
  });

  it("creates, lists, edits, reassigns, and deletes an owned goal", async () => {
    const owner = await register(app, "crud-owner");
    const firstHabit = await createHabit(owner, "Read");
    const secondHabit = await createHabit(owner, "Doomscrolling", "break");

    const created = await owner
      .post("/api/goals")
      .send({
        habit_id: firstHabit.body.id,
        title: "  Read consistently  ",
        description: "   ",
      })
      .expect(201);
    expect(created.body).toMatchObject({
      title: "Read consistently",
      description: null,
      habit: { id: firstHabit.body.id, name: "Read", type: "build" },
    });

    const listed = await owner.get("/api/goals").expect(200);
    expect(listed.body).toHaveLength(1);

    const updated = await owner
      .patch(`/api/goals/${created.body.id}`)
      .send({
        habit_id: secondHabit.body.id,
        title: "Stay present",
        description: "Keep evenings intentional.",
      })
      .expect(200);
    expect(updated.body).toMatchObject({
      title: "Stay present",
      description: "Keep evenings intentional.",
      habit: { id: secondHabit.body.id, type: "break" },
    });

    await owner.delete(`/api/goals/${created.body.id}`).expect(204);
    expect((await owner.get("/api/goals").expect(200)).body).toEqual([]);
  });

  it("does not reveal goals or replacement habits owned by another user", async () => {
    const owner = await register(app, "scope-owner");
    const stranger = await register(app, "scope-stranger");
    const ownerHabit = await createHabit(owner, "Meditate");
    const strangerHabit = await createHabit(stranger, "Walk");
    const goal = await owner
      .post("/api/goals")
      .send({ habit_id: ownerHabit.body.id, title: "Find calm" })
      .expect(201);

    expect((await stranger.get("/api/goals").expect(200)).body).toEqual([]);
    await stranger
      .patch(`/api/goals/${goal.body.id}`)
      .send({ title: "Mine" })
      .expect(404);
    await stranger.delete(`/api/goals/${goal.body.id}`).expect(404);
    await owner
      .patch(`/api/goals/${goal.body.id}`)
      .send({ habit_id: strangerHabit.body.id })
      .expect(404);
    await owner
      .post("/api/goals")
      .send({ habit_id: strangerHabit.body.id, title: "Not allowed" })
      .expect(404);

    const unchanged = await owner.get("/api/goals").expect(200);
    expect(unchanged.body[0].habit.id).toBe(ownerHabit.body.id);
  });

  it("cascades linked goals when their habit is deleted", async () => {
    const owner = await register(app, "cascade-owner");
    const habit = await createHabit(owner, "Journal");
    await owner
      .post("/api/goals")
      .send({ habit_id: habit.body.id, title: "Reflect daily" })
      .expect(201);

    await owner.delete(`/api/habits/${habit.body.id}`).expect(204);
    expect((await owner.get("/api/goals").expect(200)).body).toEqual([]);
  });

  it("validates goal bodies and rejects empty updates", async () => {
    const owner = await register(app, "validation-owner");
    const habit = await createHabit(owner, "Stretch");
    const invalidCreate = await owner
      .post("/api/goals")
      .send({ habit_id: habit.body.id, title: "   ", unexpected: true })
      .expect(400);
    expect(invalidCreate.body.error.code).toBe("VALIDATION_ERROR");

    const goal = await owner
      .post("/api/goals")
      .send({ habit_id: habit.body.id, title: "Move freely" })
      .expect(201);
    await owner.patch(`/api/goals/${goal.body.id}`).send({}).expect(400);
  });
});
