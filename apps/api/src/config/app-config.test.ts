import { NODE_ENVIRONMENT, parseAppConfig } from "./app-config";

function environment(overrides: NodeJS.ProcessEnv = {}): NodeJS.ProcessEnv {
  return {
    NODE_ENV: NODE_ENVIRONMENT.TEST,
    PORT: "3000",
    DATABASE_URL: "mysql://user:password@localhost:3306/habit_shaper",
    JWT_SECRET: "test-only-secret-with-at-least-32-bytes",
    COOKIE_SECURE: "false",
    ...overrides,
  };
}

describe("application configuration", () => {
  it("measures the signing secret in bytes", () => {
    expect(() => parseAppConfig(environment({ JWT_SECRET: "short" }))).toThrow(
      "JWT_SECRET must contain at least 32 bytes.",
    );
  });
});
