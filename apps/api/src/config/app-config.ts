import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { z } from "zod";

const booleanFromEnvironment = z
  .enum(["true", "false"])
  .transform((value) => value === "true");

export const NODE_ENVIRONMENT = {
  DEVELOPMENT: "development",
  TEST: "test",
  PRODUCTION: "production",
} as const;

const AppConfigSchema = z.object({
  nodeEnv: z.enum(NODE_ENVIRONMENT),
  port: z.coerce.number().int().min(1).max(65_535),
  databaseUrl: z.url().startsWith("mysql://"),
  jwtSecret: z
    .string({ error: "JWT_SECRET is required." })
    .refine(
      (secret) => Buffer.byteLength(secret, "utf8") >= 32,
      "JWT_SECRET must contain at least 32 bytes.",
    ),
  cookieSecure: booleanFromEnvironment,
});

export type AppConfig = z.infer<typeof AppConfigSchema>;

let cachedConfig: AppConfig | undefined;

/**
 * Loads `apps/api/.env` into `process.env` for host-run development.
 *
 * Variables already present in the environment take precedence, so Compose, CI,
 * and deployment stay authoritative. A missing file is expected in containers,
 * where every value is supplied directly. See `apps/api/.env.example`.
 */
function loadEnvironmentFile(): void {
  const envFilePath = resolve(process.cwd(), ".env");

  if (existsSync(envFilePath)) {
    process.loadEnvFile(envFilePath);
  }
}

export function parseAppConfig(environment: NodeJS.ProcessEnv): AppConfig {
  return AppConfigSchema.parse({
    nodeEnv: environment.NODE_ENV,
    port: environment.PORT,
    databaseUrl: environment.DATABASE_URL,
    jwtSecret: environment.JWT_SECRET,
    cookieSecure: environment.COOKIE_SECURE,
  });
}

export function getAppConfig(): AppConfig {
  if (cachedConfig === undefined) {
    loadEnvironmentFile();
    cachedConfig = parseAppConfig(process.env);
  }

  return cachedConfig;
}
