import { Inject, Injectable } from "@nestjs/common";
import {
  type Pool,
  type ResultSetHeader,
  type RowDataPacket,
} from "mysql2/promise";

import { uuidToBinary } from "../../../database/binary-uuid";
import { DATABASE_POOL } from "../../../database/database.constants";
import {
  type CompletionDateRow,
  type CompletionRow,
  type Habit,
  type LatestRelapseRow,
} from "../habit.types";

function toCalendarDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

@Injectable()
export class HabitsRepository {
  public constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  public async list(userId: string): Promise<Habit[]> {
    const [rows] = await this.pool.execute<(RowDataPacket & Habit)[]>(
      `SELECT LOWER(BIN_TO_UUID(id)) AS id,
              name,
              type,
              start_date,
              created_at,
              updated_at
       FROM habits
       WHERE user_id = ?
       ORDER BY created_at ASC, id ASC`,
      [uuidToBinary(userId)],
    );

    return rows;
  }

  public async completionDates(userId: string): Promise<Map<string, string[]>> {
    const [rows] = await this.pool.execute<CompletionRow[]>(
      `SELECT LOWER(BIN_TO_UUID(habit_completions.habit_id)) AS habit_id,
              habit_completions.completion_date
       FROM habit_completions
       INNER JOIN habits ON habits.id = habit_completions.habit_id
       WHERE habits.user_id = ?
       ORDER BY habit_completions.completion_date`,
      [uuidToBinary(userId)],
    );
    const grouped = new Map<string, string[]>();
    for (const row of rows) {
      const dates = grouped.get(row.habit_id) ?? [];
      dates.push(toCalendarDate(row.completion_date));
      grouped.set(row.habit_id, dates);
    }
    return grouped;
  }

  public async completionDatesForHabit(
    userId: string,
    habitId: string,
  ): Promise<string[]> {
    const [rows] = await this.pool.execute<CompletionDateRow[]>(
      `SELECT habit_completions.completion_date
       FROM habit_completions
       INNER JOIN habits ON habits.id = habit_completions.habit_id
       WHERE habits.user_id = ? AND habits.id = ?
       ORDER BY habit_completions.completion_date`,
      [uuidToBinary(userId), uuidToBinary(habitId)],
    );
    return rows.map((row) => toCalendarDate(row.completion_date));
  }

  public async latestRelapses(userId: string): Promise<Map<string, string>> {
    const [rows] = await this.pool.execute<LatestRelapseRow[]>(
      `SELECT LOWER(BIN_TO_UUID(habit_relapses.habit_id)) AS habit_id,
              MAX(habit_relapses.relapse_date) AS relapse_date
       FROM habit_relapses
       INNER JOIN habits ON habits.id = habit_relapses.habit_id
       WHERE habits.user_id = ?
       GROUP BY habit_relapses.habit_id`,
      [uuidToBinary(userId)],
    );
    return new Map(
      rows.map((row) => [row.habit_id, toCalendarDate(row.relapse_date)]),
    );
  }

  public async findOwned(
    userId: string,
    habitId: string,
  ): Promise<Habit | null> {
    const [rows] = await this.pool.execute<(RowDataPacket & Habit)[]>(
      `SELECT LOWER(BIN_TO_UUID(id)) AS id,
              name,
              type,
              start_date,
              created_at,
              updated_at
       FROM habits
       WHERE id = ? AND user_id = ?
       LIMIT 1`,
      [uuidToBinary(habitId), uuidToBinary(userId)],
    );
    return rows[0] ?? null;
  }

  public async recordRelapse(input: {
    userId: string;
    habitId: string;
    date: string;
  }): Promise<void> {
    await this.pool.execute<ResultSetHeader>(
      `INSERT IGNORE INTO habit_relapses (habit_id, relapse_date)
       SELECT id, ?
       FROM habits
       WHERE id = ? AND user_id = ?`,
      [input.date, uuidToBinary(input.habitId), uuidToBinary(input.userId)],
    );
  }

  public async setCompletion(input: {
    userId: string;
    habitId: string;
    date: string;
    present: boolean;
  }): Promise<void> {
    if (input.present) {
      await this.pool.execute<ResultSetHeader>(
        `INSERT IGNORE INTO habit_completions (habit_id, completion_date)
         SELECT id, ?
         FROM habits
         WHERE id = ? AND user_id = ?`,
        [input.date, uuidToBinary(input.habitId), uuidToBinary(input.userId)],
      );
      return;
    }

    await this.pool.execute<ResultSetHeader>(
      `DELETE habit_completions
       FROM habit_completions
       INNER JOIN habits ON habits.id = habit_completions.habit_id
       WHERE habit_completions.habit_id = ?
         AND habit_completions.completion_date = ?
         AND habits.user_id = ?`,
      [uuidToBinary(input.habitId), input.date, uuidToBinary(input.userId)],
    );
  }

  public async create(input: {
    id: string;
    user_id: string;
    name: string;
    type: Habit["type"];
    start_date: string;
  }): Promise<Habit> {
    await this.pool.execute<ResultSetHeader>(
      `INSERT INTO habits (id, user_id, name, type, start_date)
       VALUES (?, ?, ?, ?, ?)`,
      [
        uuidToBinary(input.id),
        uuidToBinary(input.user_id),
        input.name,
        input.type,
        input.start_date,
      ],
    );

    const [rows] = await this.pool.execute<(RowDataPacket & Habit)[]>(
      `SELECT LOWER(BIN_TO_UUID(id)) AS id,
              name,
              type,
              start_date,
              created_at,
              updated_at
       FROM habits
       WHERE id = ? AND user_id = ?
       LIMIT 1`,
      [uuidToBinary(input.id), uuidToBinary(input.user_id)],
    );

    const habit = rows[0];
    if (!habit) {
      throw new Error("Created habit could not be loaded.");
    }

    return habit;
  }

  public async delete(userId: string, habitId: string): Promise<boolean> {
    const [result] = await this.pool.execute<ResultSetHeader>(
      "DELETE FROM habits WHERE id = ? AND user_id = ?",
      [uuidToBinary(habitId), uuidToBinary(userId)],
    );

    return result.affectedRows === 1;
  }
}
