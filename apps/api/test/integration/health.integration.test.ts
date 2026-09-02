import { type INestApplication } from "@nestjs/common";
import request from "supertest";

import { createTestApp } from "../support/create-test-app";

describe("health endpoint", () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it("reports application and database readiness", async () => {
    await request(app.getHttpServer())
      .get("/api/health")
      .expect(200)
      .expect({ status: "ok", database: "ready" });
  });
});
