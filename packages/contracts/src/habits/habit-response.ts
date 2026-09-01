import { z } from "zod";

import { CalendarDateSchema } from "../common/calendar-date";
import { IdentifierSchema } from "../common/identifiers";
import { HABIT_TYPE } from "./create-habit";

export const HABIT_DAY_STATE = {
  INELIGIBLE: "ineligible",
  FUTURE: "future",
  COMPLETED: "completed",
  PENDING: "pending",
  MISSED: "missed",
} as const;

const HabitDayStateSchema = z.enum(HABIT_DAY_STATE);

const HabitCommonSchema = z.object({
  id: IdentifierSchema,
  name: z.string(),
  start_date: CalendarDateSchema,
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
});

export const BuildDayStateSchema = z.object({
  date: CalendarDateSchema,
  state: HabitDayStateSchema,
  mutable: z.boolean(),
});

export const BuildHabitResponseSchema = HabitCommonSchema.extend({
  type: z.literal(HABIT_TYPE.BUILD),
  tracking: z.object({
    current_streak: z.number().int().nonnegative(),
    week: z.object({
      starts_on: CalendarDateSchema,
      ends_on: CalendarDateSchema,
      completed_day_count: z.number().int().nonnegative(),
      missed_day_count: z.number().int().nonnegative(),
      pending_day_count: z.number().int().nonnegative(),
      completion_rate_percent: z.number().int().min(0).max(100),
      days: z.array(BuildDayStateSchema).length(7),
    }),
  }),
});

export const BreakHabitResponseSchema = HabitCommonSchema.extend({
  type: z.literal(HABIT_TYPE.BREAK),
  tracking: z.object({
    current_clean_streak: z.number().int().nonnegative(),
    last_relapse_date: CalendarDateSchema.nullable(),
  }),
});

export const HabitResponseSchema = z.discriminatedUnion("type", [
  BuildHabitResponseSchema,
  BreakHabitResponseSchema,
]);
export const HabitListResponseSchema = z.array(HabitResponseSchema);

export const ListHabitsQuerySchema = z
  .object({ week_start: CalendarDateSchema.optional() })
  .strict();

export type BuildDayState = z.infer<typeof BuildDayStateSchema>;
export type HabitDayState = z.infer<typeof HabitDayStateSchema>;
export type BuildHabitResponse = z.infer<typeof BuildHabitResponseSchema>;
export type BreakHabitResponse = z.infer<typeof BreakHabitResponseSchema>;
export type HabitResponse = z.infer<typeof HabitResponseSchema>;
