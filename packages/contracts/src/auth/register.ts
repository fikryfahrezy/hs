import { z } from "zod";

function isTimeZone(value: string): boolean {
  try {
    Intl.DateTimeFormat("en-US", { timeZone: value }).format();
    return true;
  } catch {
    return false;
  }
}

export const RegisterRequestSchema = z
  .object({
    email: z.string().trim().toLowerCase().pipe(z.email().max(254)),
    password: z
      .string()
      .min(8, "Use at least 8 characters.")
      .max(128, "Use no more than 128 characters."),
    timezone: z
      .string()
      .trim()
      .min(1, "Choose a timezone.")
      .max(64)
      .refine(isTimeZone, "Choose a valid timezone."),
  })
  .strict();

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
