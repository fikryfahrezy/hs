import { Module } from "@nestjs/common";

import { DatabaseModule } from "./database/database.module";
import { AuthModule } from "./features/auth/auth.module";
import { GoalsModule } from "./features/goals/goals.module";
import { HabitsModule } from "./features/habits/habits.module";
import { HealthModule } from "./health/health.module";

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    GoalsModule,
    HabitsModule,
    HealthModule,
  ],
})
export class AppModule {}
