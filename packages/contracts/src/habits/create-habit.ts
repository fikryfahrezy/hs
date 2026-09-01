import { z } from "zod";

export const HABIT_TYPE = {
  BUILD: "build",
  BREAK: "break",
} as const;

export const HabitTypeSchema = z.enum(HABIT_TYPE);

export const CreateHabitRequestSchema = z
  .object({
    name: z.string().trim().min(1, "Enter a habit name.").max(100),
    type: HabitTypeSchema,
  })
  .strict();

export type HabitType = z.infer<typeof HabitTypeSchema>;
export type CreateHabitRequest = z.infer<typeof CreateHabitRequestSchema>;
