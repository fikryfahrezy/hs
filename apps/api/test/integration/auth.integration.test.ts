import { type INestApplication } from "@nestjs/common";
import { type Pool } from "mysql2/promise";
import request from "supertest";

import { DATABASE_POOL } from "#app/database/database.constants";
import { createTestApp } from "../support/create-test-app";

describe("authentication endpoints", () => {
  let app: INestApplication;
  let pool: Pool;
  const email = `integration-auth-${Date.now()}@example.com`;

  beforeAll(async () => {
    app = await createTestApp();
    pool = app.get<Pool>(DATABASE_POOL);
  });

  afterAll(async () => {
    await pool.execute("DELETE FROM users WHERE email = ?", [email]);
    await app.close();
  });

  it("registers, restores a cookie session, logs out, and logs in again", async () => {
    const browser = request.agent(app.getHttpServer());
    const registerResponse = await browser
      .post("/api/auth/register")
      .send({
        email: `  ${email.toUpperCase()}  `,
        password: "correct horse battery staple",
        timezone: "Asia/Jakarta",
      })
      .expect(201);

    expect(registerResponse.body).toMatchObject({
      email,
      timezone: "Asia/Jakarta",
    });
    expect(registerResponse.headers["set-cookie"]?.[0]).toEqual(
      expect.stringMatching(
        /^hs_session=.+; Max-Age=604800; Path=\/; Expires=.+; HttpOnly; SameSite=Lax$/,
      ),
    );

    await browser
      .get("/api/auth/me")
      .expect(200)
      .expect((response) => expect(response.body.email).toBe(email));

    await request(app.getHttpServer())
      .post("/api/auth/register")
      .send({
        email,
        password: "another valid password",
        timezone: "UTC",
      })
      .expect(409)
      .expect((response) =>
        expect(response.body.error.code).toBe("EMAIL_ALREADY_EXISTS"),
      );

    await browser.post("/api/auth/logout").expect(204);
    await browser
      .get("/api/auth/me")
      .expect(401)
      .expect((response) =>
        expect(response.body.error.code).toBe("AUTHENTICATION_REQUIRED"),
      );

    await browser
      .post("/api/auth/login")
      .send({ email, password: "correct horse battery staple" })
      .expect(200);
    await browser.get("/api/auth/me").expect(200);
  });

  it("does not reveal whether the email or password was wrong", async () => {
    const server = app.getHttpServer();
    const unknown = await request(server)
      .post("/api/auth/login")
      .send({ email: "unknown@example.com", password: "wrong password" })
      .expect(401);
    const wrongPassword = await request(server)
      .post("/api/auth/login")
      .send({ email, password: "wrong password" })
      .expect(401);

    expect(wrongPassword.body).toEqual(unknown.body);
    expect(unknown.body.error.code).toBe("INVALID_CREDENTIALS");
  });

  it("maps malformed JSON to the public validation contract", async () => {
    const response = await request(app.getHttpServer())
      .post("/api/auth/login")
      .set("Content-Type", "application/json")
      .send('{"email":')
      .expect(400);

    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });
});
