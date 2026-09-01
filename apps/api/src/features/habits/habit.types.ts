import { type HabitType } from "@habit-shaper/contracts";
import { type RowDataPacket } from "mysql2/promise";

export type Habit = {
  id: string;
  name: string;
  type: HabitType;
  start_date: Date;
  created_at: Date;
  updated_at: Date;
};

export type CompletionRow = RowDataPacket & {
  habit_id: string;
  completion_date: Date;
};

export type CompletionDateRow = RowDataPacket & {
  completion_date: Date;
};

export type LatestRelapseRow = RowDataPacket & {
  habit_id: string;
  relapse_date: Date;
};
