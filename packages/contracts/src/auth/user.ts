import { z } from "zod";

export const UserResponseSchema = z.object({
  id: z.uuid(),
  email: z.email().max(254),
  timezone: z.string().min(1).max(64),
  created_at: z.iso.datetime(),
});

export type UserResponse = z.infer<typeof UserResponseSchema>;
