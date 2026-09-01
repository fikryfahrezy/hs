import { type INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";

import { AppModule } from "../../src/app.module";

describe("health endpoint", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    app.setGlobalPrefix("api");
    await app.init();
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
