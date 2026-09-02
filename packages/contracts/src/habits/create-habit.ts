import { z } from "zod";

export const HabitTypeSchema = z.enum(["build", "break"]);

export const CreateHabitRequestSchema = z
  .object({
    name: z.string().trim().min(1, "Enter a habit name.").max(100),
    type: HabitTypeSchema,
  })
  .strict();

export type HabitType = z.infer<typeof HabitTypeSchema>;
export type CreateHabitRequest = z.infer<typeof CreateHabitRequestSchema>;
