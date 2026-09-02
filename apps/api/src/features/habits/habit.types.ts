import { type HabitType } from "@habit-shaper/contracts";

export type Habit = {
  id: string;
  name: string;
  type: HabitType;
  start_date: Date;
  created_at: Date;
  updated_at: Date;
};
