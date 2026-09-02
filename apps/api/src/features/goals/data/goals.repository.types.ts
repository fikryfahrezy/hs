import { type RowDataPacket } from "mysql2/promise";

import { type Goal } from "../goal.types";

export type IdentifierRow = RowDataPacket & { id: string };

export type JoinedGoalRow = RowDataPacket &
  Goal & {
    habit_id: string;
    habit_name: string;
    habit_type: Goal["habit"]["type"];
  };
