import { Module } from "@nestjs/common";

import { AuthModule } from "#app/features/auth/auth.module";
import { HabitsService } from "./application/habits.service";
import { HabitsRepository } from "./data/habits.repository";
import { HabitsController } from "./transport/rest/habits.controller";

@Module({
  imports: [AuthModule],
  controllers: [HabitsController],
  providers: [HabitsRepository, HabitsService],
})
export class HabitsModule {}
