import { Inject, Injectable, type OnApplicationShutdown } from "@nestjs/common";
import { type Pool } from "mysql2/promise";

import { DATABASE_POOL } from "./database.constants";

@Injectable()
export class DatabaseShutdownService implements OnApplicationShutdown {
  public constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  public async onApplicationShutdown() {
    await this.pool.end();
  }
}
