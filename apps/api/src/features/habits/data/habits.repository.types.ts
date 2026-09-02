import { type RowDataPacket } from "mysql2/promise";

import { type Habit } from "../habit.types";

export type HabitRow = RowDataPacket & Habit;

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
