import { Inject, Injectable } from "@nestjs/common";
import {
  type Pool,
  type ResultSetHeader,
  type RowDataPacket,
} from "mysql2/promise";

import { DATABASE_POOL } from "#app/database/database.constants";
import { uuidToBinary } from "#app/database/binary-uuid";
import { isMysqlDuplicateEntryError } from "#app/database/mysql-error";
import { EmailAlreadyExistsError } from "../auth.errors";
import { type AuthUser, type StoredAuthUser } from "../auth.types";

const USERS_EMAIL_UNIQUE_CONSTRAINT = "users_email_unique";

@Injectable()
export class AuthRepository {
  public constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  public async create(input: {
    id: string;
    email: string;
    passwordHash: string;
    timezone: string;
  }): Promise<AuthUser> {
    try {
      await this.pool.execute<ResultSetHeader>(
        `INSERT INTO users (id, email, password_hash, timezone)
         VALUES (?, ?, ?, ?)`,
        [
          uuidToBinary(input.id),
          input.email,
          input.passwordHash,
          input.timezone,
        ],
      );
    } catch (error) {
      if (isMysqlDuplicateEntryError(error, USERS_EMAIL_UNIQUE_CONSTRAINT)) {
        throw new EmailAlreadyExistsError({ cause: error });
      }
      throw error;
    }

    const user = await this.findById(input.id);
    if (!user) {
      throw new Error("Created user could not be loaded.");
    }

    return user;
  }

  public async findCredentialsByEmail(
    email: string,
  ): Promise<StoredAuthUser | null> {
    const [rows] = await this.pool.execute<(RowDataPacket & StoredAuthUser)[]>(
      `SELECT LOWER(BIN_TO_UUID(id)) AS id,
              email,
              password_hash,
              timezone,
              created_at
       FROM users
       WHERE email = ?
       LIMIT 1`,
      [email],
    );

    return rows[0] ?? null;
  }

  public async findById(id: string): Promise<AuthUser | null> {
    const [rows] = await this.pool.execute<(RowDataPacket & AuthUser)[]>(
      `SELECT LOWER(BIN_TO_UUID(id)) AS id,
              email,
              timezone,
              created_at
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [uuidToBinary(id)],
    );

    return rows[0] ?? null;
  }
}
