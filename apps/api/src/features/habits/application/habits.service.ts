import { randomUUID } from "node:crypto";

import { Injectable } from "@nestjs/common";
import { ERROR_CODE, type HabitType } from "@habit-shaper/contracts";

import { AppError } from "../../../common/errors/app-error";
import {
  addDays,
  dateInTimeZone,
  startOfWeek,
  toEpochDay,
} from "../../../common/time/calendar";
import { AuthService } from "../../auth/application/auth.service";
import { HabitsRepository } from "../data/habits.repository";
import {
  BreakHabitResponseDto,
  BuildHabitResponseDto,
  type HabitResponseDto,
} from "../dto/habit-response.dto";
import { type Habit } from "../habit.types";

@Injectable()
export class HabitsService {
  public constructor(
    private readonly repository: HabitsRepository,
    private readonly auth: AuthService,
  ) {}

  public async list(
    userId: string,
    requestedWeek?: string,
  ): Promise<HabitResponseDto[]> {
    const today = await this.today(userId);
    const weekStart = requestedWeek ?? startOfWeek(today);
    if (
      startOfWeek(weekStart) !== weekStart ||
      toEpochDay(weekStart) > toEpochDay(startOfWeek(today))
    ) {
      throw new AppError(
        400,
        ERROR_CODE.VALIDATION_ERROR,
        "Choose a current or previous Monday.",
        {
          week_start: ["Choose a current or previous Monday."],
        },
      );
    }
    return (await this.repository.list(userId)).map((habit) =>
      this.present(habit, today, weekStart),
    );
  }

  public async create(
    userId: string,
    input: { name: string; type: HabitType },
  ): Promise<HabitResponseDto> {
    const today = await this.today(userId);
    const habit = await this.repository.create({
      id: randomUUID(),
      user_id: userId,
      name: input.name,
      type: input.type,
      start_date: today,
    });
    return this.present(habit, today, startOfWeek(today));
  }

  public async delete(userId: string, habitId: string): Promise<void> {
    if (!(await this.repository.delete(userId, habitId))) {
      throw new AppError(
        404,
        ERROR_CODE.RESOURCE_NOT_FOUND,
        "The requested habit was not found.",
      );
    }
  }

  private present(
    habit: Habit,
    today: string,
    weekStart: string,
  ): HabitResponseDto {
    const startDate = habit.start_date.toISOString().slice(0, 10);
    const common = {
      id: habit.id,
      name: habit.name,
      type: habit.type,
      start_date: startDate,
      created_at: habit.created_at.toISOString(),
      updated_at: habit.updated_at.toISOString(),
    };
    if (habit.type === "break") {
      return new BreakHabitResponseDto({
        ...common,
        type: "break",
        tracking: {
          current_clean_streak: toEpochDay(today) - toEpochDay(startDate) + 1,
          last_relapse_date: null,
        },
      });
    }
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = addDays(weekStart, index);
      const state =
        date < startDate
          ? ("ineligible" as const)
          : date > today
            ? ("future" as const)
            : date === today
              ? ("pending" as const)
              : ("missed" as const);
      return {
        date,
        state,
        mutable:
          state === "pending" ||
          (state === "missed" && weekStart === startOfWeek(today)),
      };
    });
    const missed = days.filter((day) => day.state === "missed").length;
    const pending = days.filter((day) => day.state === "pending").length;
    return new BuildHabitResponseDto({
      ...common,
      type: "build",
      tracking: {
        current_streak: 0,
        week: {
          starts_on: weekStart,
          ends_on: addDays(weekStart, 6),
          completed_day_count: 0,
          missed_day_count: missed,
          pending_day_count: pending,
          completion_rate_percent: 0,
          days,
        },
      },
    });
  }

  private async today(userId: string): Promise<string> {
    const timezone = await this.auth.getTimezone(userId);
    return dateInTimeZone(new Date(), timezone);
  }
}
