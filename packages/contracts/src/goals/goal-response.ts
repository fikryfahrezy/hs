import { z } from "zod";

import { IdentifierSchema } from "../common/identifiers";
import { HabitTypeSchema } from "../habits/create-habit";

export const GoalResponseSchema = z.object({
  id: IdentifierSchema,
  habit: z.object({
    id: IdentifierSchema,
    name: z.string(),
    type: HabitTypeSchema,
  }),
  title: z.string(),
  description: z.string().nullable(),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
});

export const GoalListResponseSchema = z.array(GoalResponseSchema);

export type GoalResponse = z.infer<typeof GoalResponseSchema>;
