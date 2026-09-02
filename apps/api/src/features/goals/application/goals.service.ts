import { randomUUID } from "node:crypto";

import { Injectable } from "@nestjs/common";
import {
  ERROR_CODE,
  type CreateGoalRequest,
  type UpdateGoalRequest,
} from "@habit-shaper/contracts";

import { AppError } from "#app/common/errors/app-error";
import { GoalsRepository } from "../data/goals.repository";
import { GoalResponseDto } from "../dto/goal-response.dto";
import { GOAL_UPDATE_STATUS, type Goal } from "../goal.types";

@Injectable()
export class GoalsService {
  public constructor(private readonly repository: GoalsRepository) {}

  public async list(userId: string): Promise<GoalResponseDto[]> {
    return (await this.repository.list(userId)).map(
      (goal) => new GoalResponseDto(this.toResponse(goal)),
    );
  }

  public async create(
    userId: string,
    input: CreateGoalRequest,
  ): Promise<GoalResponseDto> {
    const goal = await this.repository.createOwned({
      id: randomUUID(),
      userId,
      habitId: input.habit_id,
      title: input.title,
      description: input.description ?? null,
    });
    if (!goal) {
      throw this.notFound();
    }
    return new GoalResponseDto(this.toResponse(goal));
  }

  public async update(
    userId: string,
    goalId: string,
    input: UpdateGoalRequest,
  ): Promise<GoalResponseDto> {
    const result = await this.repository.updateOwned(userId, goalId, input);
    if (result.status !== GOAL_UPDATE_STATUS.UPDATED) {
      throw this.notFound();
    }
    return new GoalResponseDto(this.toResponse(result.goal));
  }

  public async delete(userId: string, goalId: string): Promise<void> {
    if (!(await this.repository.deleteOwned(userId, goalId))) {
      throw this.notFound();
    }
  }

  private notFound(): AppError {
    return new AppError(
      404,
      ERROR_CODE.RESOURCE_NOT_FOUND,
      "The requested goal or linked habit was not found.",
    );
  }

  private toResponse(goal: Goal) {
    return {
      ...goal,
      created_at: goal.created_at.toISOString(),
      updated_at: goal.updated_at.toISOString(),
    };
  }
}
