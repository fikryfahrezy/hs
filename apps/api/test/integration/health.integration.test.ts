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
    const response = await request(app.getHttpServer())
      .get("/api/health")
      .expect(200)
      .expect({ status: "ok", database: "ready" });

    expect(response.headers["x-powered-by"]).toBeUndefined();
    expect(response.headers["x-content-type-options"]).toBe("nosniff");
    expect(response.headers["cache-control"]).toBe("no-store");
    expect(response.headers["x-request-id"]).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });
});
