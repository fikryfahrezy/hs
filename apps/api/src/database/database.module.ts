import { Global, Module } from "@nestjs/common";
import { createPool } from "mysql2/promise";

import { getAppConfig } from "../config/app-config";
import { DATABASE_POOL } from "./database.constants";
import { DatabaseShutdownService } from "./database-shutdown.service";

@Global()
@Module({
  providers: [
    {
      provide: DATABASE_POOL,
      useFactory: () =>
        createPool({
          uri: getAppConfig().databaseUrl,
          connectionLimit: 10,
          timezone: "Z",
          decimalNumbers: true,
        }),
    },
    DatabaseShutdownService,
  ],
  exports: [DATABASE_POOL],
})
export class DatabaseModule {}
