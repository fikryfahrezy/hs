import { Inject, Injectable } from "@nestjs/common";
import {
  type Pool,
  type PoolConnection,
  type ResultSetHeader,
} from "mysql2/promise";

import { uuidToBinary } from "#app/database/binary-uuid";
import { DATABASE_POOL } from "#app/database/database.constants";
import {
  GOAL_UPDATE_STATUS,
  type Goal,
  type GoalChanges,
  type GoalUpdateResult,
} from "../goal.types";
import {
  type IdentifierRow,
  type JoinedGoalRow,
} from "./goals.repository.types";

const GOAL_SELECT = `SELECT LOWER(BIN_TO_UUID(goals.id)) AS id,
                            LOWER(BIN_TO_UUID(habits.id)) AS habit_id,
                            habits.name AS habit_name,
                            habits.type AS habit_type,
                            goals.title,
                            goals.description,
                            goals.created_at,
                            goals.updated_at
                     FROM goals
                     INNER JOIN habits ON habits.id = goals.habit_id`;

function mapGoal(row: JoinedGoalRow): Goal {
  return {
    id: row.id,
    habit: {
      id: row.habit_id,
      name: row.habit_name,
      type: row.habit_type,
    },
    title: row.title,
    description: row.description,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

@Injectable()
export class GoalsRepository {
  public constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  public async list(userId: string): Promise<Goal[]> {
    const [rows] = await this.pool.execute<JoinedGoalRow[]>(
      `${GOAL_SELECT}
       WHERE habits.user_id = ?
       ORDER BY goals.updated_at DESC, goals.id ASC`,
      [uuidToBinary(userId)],
    );
    return rows.map(mapGoal);
  }

  public async createOwned(input: {
    id: string;
    userId: string;
    habitId: string;
    title: string;
    description: string | null;
  }): Promise<Goal | null> {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();
      const habit = await this.lockOwnedHabit(
        connection,
        input.userId,
        input.habitId,
      );
      if (!habit) {
        await connection.rollback();
        return null;
      }

      await connection.execute<ResultSetHeader>(
        `INSERT INTO goals (id, habit_id, title, description)
         VALUES (?, ?, ?, ?)`,
        [
          uuidToBinary(input.id),
          uuidToBinary(input.habitId),
          input.title,
          input.description,
        ],
      );
      const goal = await this.findOwnedWith(connection, input.userId, input.id);
      if (!goal) {
        throw new Error("Created goal could not be loaded.");
      }
      await connection.commit();
      return goal;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  public async updateOwned(
    userId: string,
    goalId: string,
    changes: GoalChanges,
  ): Promise<GoalUpdateResult> {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();
      const goal = await this.findOwnedWith(
        connection,
        userId,
        goalId,
        "FOR UPDATE",
      );
      if (!goal) {
        await connection.rollback();
        return { status: GOAL_UPDATE_STATUS.GOAL_NOT_FOUND };
      }

      if (
        changes.habit_id &&
        !(await this.lockOwnedHabit(connection, userId, changes.habit_id))
      ) {
        await connection.rollback();
        return { status: GOAL_UPDATE_STATUS.HABIT_NOT_FOUND };
      }

      const assignments: string[] = [];
      const values: (Buffer | null | string)[] = [];
      if (changes.habit_id !== undefined) {
        assignments.push("habit_id = ?");
        values.push(uuidToBinary(changes.habit_id));
      }
      if (changes.title !== undefined) {
        assignments.push("title = ?");
        values.push(changes.title);
      }
      if (changes.description !== undefined) {
        assignments.push("description = ?");
        values.push(changes.description);
      }

      await connection.execute<ResultSetHeader>(
        `UPDATE goals SET ${assignments.join(", ")} WHERE id = ?`,
        [...values, uuidToBinary(goalId)],
      );
      const updated = await this.findOwnedWith(connection, userId, goalId);
      if (!updated) {
        throw new Error("Updated goal could not be loaded.");
      }
      await connection.commit();
      return { status: GOAL_UPDATE_STATUS.UPDATED, goal: updated };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  public async deleteOwned(userId: string, goalId: string): Promise<boolean> {
    const [result] = await this.pool.execute<ResultSetHeader>(
      `DELETE goals
       FROM goals
       INNER JOIN habits ON habits.id = goals.habit_id
       WHERE goals.id = ? AND habits.user_id = ?`,
      [uuidToBinary(goalId), uuidToBinary(userId)],
    );
    return result.affectedRows === 1;
  }

  private async lockOwnedHabit(
    connection: PoolConnection,
    userId: string,
    habitId: string,
  ): Promise<boolean> {
    const [rows] = await connection.execute<IdentifierRow[]>(
      `SELECT LOWER(BIN_TO_UUID(id)) AS id
       FROM habits
       WHERE id = ? AND user_id = ?
       LIMIT 1
       FOR SHARE`,
      [uuidToBinary(habitId), uuidToBinary(userId)],
    );
    return Boolean(rows[0]);
  }

  private async findOwnedWith(
    connection: PoolConnection,
    userId: string,
    goalId: string,
    lock = "",
  ): Promise<Goal | null> {
    const [rows] = await connection.execute<JoinedGoalRow[]>(
      `${GOAL_SELECT}
       WHERE goals.id = ? AND habits.user_id = ?
       LIMIT 1
       ${lock}`,
      [uuidToBinary(goalId), uuidToBinary(userId)],
    );
    return rows[0] ? mapGoal(rows[0]) : null;
  }
}
