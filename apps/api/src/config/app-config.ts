import { z } from "zod";

const booleanFromEnvironment = z
  .enum(["true", "false"])
  .transform((value) => value === "true");

const AppConfigSchema = z.object({
  nodeEnv: z.enum(["development", "test", "production"]),
  port: z.coerce.number().int().min(1).max(65_535),
  databaseUrl: z.url().startsWith("mysql://"),
  jwtSecret: z
    .string({ error: "JWT_SECRET is required." })
    .min(32, "JWT_SECRET must contain at least 32 characters."),
  cookieSecure: booleanFromEnvironment,
  webOrigin: z.url(),
});

export type AppConfig = z.infer<typeof AppConfigSchema>;

let cachedConfig: AppConfig | undefined;

export function parseAppConfig(environment: NodeJS.ProcessEnv): AppConfig {
  return AppConfigSchema.parse({
    nodeEnv: environment.NODE_ENV,
    port: environment.PORT,
    databaseUrl: environment.DATABASE_URL,
    jwtSecret: environment.JWT_SECRET,
    cookieSecure: environment.COOKIE_SECURE,
    webOrigin: environment.WEB_ORIGIN,
  });
}

export function getAppConfig(): AppConfig {
  cachedConfig ??= parseAppConfig(process.env);

  return cachedConfig;
}
