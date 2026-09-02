import { z } from "zod";

import { IdentifierSchema } from "../common/identifiers";

export const GoalDescriptionSchema = z
  .union([z.string().trim().max(500), z.null()])
  .transform((description) => (description === "" ? null : description));

export const CreateGoalRequestSchema = z
  .object({
    habit_id: IdentifierSchema,
    title: z.string().trim().min(1, "Enter a goal title.").max(120),
    description: GoalDescriptionSchema.optional(),
  })
  .strict();

export type CreateGoalRequest = z.infer<typeof CreateGoalRequestSchema>;
