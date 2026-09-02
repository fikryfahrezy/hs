import { Inject, Injectable } from "@nestjs/common";
import { type Pool } from "mysql2/promise";

import { DATABASE_POOL } from "#app/database/database.constants";

@Injectable()
export class HealthService {
  public constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  public async checkReadiness() {
    await this.pool.execute("SELECT 1");

    return {
      status: "ok" as const,
      database: "ready" as const,
    };
  }
}
