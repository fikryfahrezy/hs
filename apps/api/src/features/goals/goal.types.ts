import { type HabitType } from "@habit-shaper/contracts";

export type Goal = {
  id: string;
  habit: {
    id: string;
    name: string;
    type: HabitType;
  };
  title: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
};

export type GoalChanges = {
  habit_id?: string;
  title?: string;
  description?: string | null;
};

export const GOAL_UPDATE_STATUS = {
  UPDATED: "updated",
  GOAL_NOT_FOUND: "goal_not_found",
  HABIT_NOT_FOUND: "habit_not_found",
} as const;

export type GoalUpdateResult =
  | { status: typeof GOAL_UPDATE_STATUS.UPDATED; goal: Goal }
  | { status: typeof GOAL_UPDATE_STATUS.GOAL_NOT_FOUND }
  | { status: typeof GOAL_UPDATE_STATUS.HABIT_NOT_FOUND };
