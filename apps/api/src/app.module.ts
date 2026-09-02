import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";

import { DatabaseModule } from "./database/database.module";
import { AuthModule } from "./features/auth/auth.module";
import { HealthModule } from "./health/health.module";

@Module({
  imports: [
    DatabaseModule,
    ThrottlerModule.forRoot([{ name: "default", limit: 1_000, ttl: 60_000 }]),
    AuthModule,
    HealthModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
