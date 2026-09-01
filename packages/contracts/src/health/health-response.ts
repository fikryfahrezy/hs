import { z } from "zod";

export const HealthResponseSchema = z
  .object({
    status: z.literal("ok"),
    database: z.literal("ready"),
  })
  .strict();

export type HealthResponse = z.infer<typeof HealthResponseSchema>;
