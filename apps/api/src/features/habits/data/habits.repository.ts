import { Inject, Injectable } from "@nestjs/common";
import {
  type Pool,
  type ResultSetHeader,
  type RowDataPacket,
} from "mysql2/promise";

import { uuidToBinary } from "../../../database/binary-uuid";
import { DATABASE_POOL } from "../../../database/database.constants";
import { type Habit } from "../habit.types";

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
