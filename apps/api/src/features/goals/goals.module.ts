import { Module } from "@nestjs/common";

import { AuthModule } from "#app/features/auth/auth.module";
import { GoalsService } from "./application/goals.service";
import { GoalsRepository } from "./data/goals.repository";
import { GoalsController } from "./transport/rest/goals.controller";

@Module({
  imports: [AuthModule],
  controllers: [GoalsController],
  providers: [GoalsRepository, GoalsService],
})
export class GoalsModule {}
