import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import {
  CreateGoalRequestSchema,
  IdentifierSchema,
  UpdateGoalRequestSchema,
} from "@habit-shaper/contracts";

import { parseSchema } from "#app/common/validation/parse-schema";
import { AuthGuard } from "#app/features/auth/transport/rest/auth.guard";
import { CurrentUserId } from "#app/features/auth/transport/rest/current-user-id";
import { GoalsService } from "../../application/goals.service";
import { GoalResponseDto } from "../../dto/goal-response.dto";

@Controller("goals")
@UseGuards(AuthGuard)
export class GoalsController {
  public constructor(private readonly goals: GoalsService) {}

  @Get()
  public list(@CurrentUserId() userId: string): Promise<GoalResponseDto[]> {
    return this.goals.list(userId);
  }

  @Post()
  public create(
    @CurrentUserId() userId: string,
    @Body() body: unknown,
  ): Promise<GoalResponseDto> {
    return this.goals.create(
      userId,
      parseSchema(CreateGoalRequestSchema, body),
    );
  }

  @Patch(":goal_id")
  public update(
    @CurrentUserId() userId: string,
    @Param("goal_id") id: string,
    @Body() body: unknown,
  ): Promise<GoalResponseDto> {
    return this.goals.update(
      userId,
      parseSchema(IdentifierSchema, id),
      parseSchema(UpdateGoalRequestSchema, body),
    );
  }

  @Delete(":goal_id")
  @HttpCode(HttpStatus.NO_CONTENT)
  public async delete(
    @CurrentUserId() userId: string,
    @Param("goal_id") id: string,
  ): Promise<void> {
    await this.goals.delete(userId, parseSchema(IdentifierSchema, id));
  }
}
