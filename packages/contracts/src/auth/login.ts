import { z } from "zod";

export const LoginRequestSchema = z
  .object({
    email: z.string().trim().toLowerCase().pipe(z.email().max(254)),
    password: z.string().min(1, "Enter your password.").max(128),
  })
  .strict();

export type LoginRequest = z.infer<typeof LoginRequestSchema>;
