import { z } from "zod";

import { IdentifierSchema } from "../common/identifiers";
import { GoalDescriptionSchema } from "./create-goal";

export const UpdateGoalRequestSchema = z
  .object({
    habit_id: IdentifierSchema.optional(),
    title: z.string().trim().min(1, "Enter a goal title.").max(120).optional(),
    description: GoalDescriptionSchema.optional(),
  })
  .strict()
  .refine((request) => Object.keys(request).length > 0, {
    message: "Include at least one field to update.",
  });

export type UpdateGoalRequest = z.infer<typeof UpdateGoalRequestSchema>;
