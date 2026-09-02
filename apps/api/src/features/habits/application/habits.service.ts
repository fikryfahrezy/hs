import { randomUUID } from "node:crypto";

import { Injectable } from "@nestjs/common";
import {
  ERROR_CODE,
  HABIT_TYPE,
  type HabitType,
} from "@habit-shaper/contracts";

import { AppError } from "#app/common/errors/app-error";
import {
  dateInTimeZone,
  startOfWeek,
  toEpochDay,
} from "#app/common/time/calendar";
import { AuthService } from "#app/features/auth/application/auth.service";
import { HabitsRepository } from "../data/habits.repository";
import { cleanStreak } from "../domain/break-tracking";
import { buildTracking, isCompletionEligible } from "../domain/build-tracking";
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
    const [habits, completions, relapses] = await Promise.all([
      this.repository.list(userId),
      this.repository.completionDates(userId),
      this.repository.latestRelapses(userId),
    ]);
    return habits.map((habit) =>
      this.present(
        habit,
        today,
        weekStart,
        completions.get(habit.id) ?? [],
        relapses.get(habit.id) ?? null,
      ),
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
    return this.present(habit, today, startOfWeek(today), [], null);
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

  public async setCompletion(
    userId: string,
    habitId: string,
    date: string,
    present: boolean,
  ): Promise<HabitResponseDto> {
    const today = await this.today(userId);
    const habit = await this.repository.findOwned(userId, habitId);
    if (!habit) {
      throw new AppError(
        404,
        ERROR_CODE.RESOURCE_NOT_FOUND,
        "The requested habit was not found.",
      );
    }

    if (habit.type !== HABIT_TYPE.BUILD) {
      throw new AppError(
        409,
        ERROR_CODE.INVALID_HABIT_TYPE_OPERATION,
        "This action is only available for build habits.",
      );
    }

    const startDate = this.startDate(habit);
    if (!isCompletionEligible(startDate, today, date)) {
      throw new AppError(
        409,
        ERROR_CODE.DATE_NOT_ELIGIBLE,
        "Choose an eligible date in the current week.",
      );
    }

    await this.repository.setCompletion({
      userId,
      habitId,
      date,
      present,
    });
    const completions = await this.repository.completionDatesForHabit(
      userId,
      habitId,
    );
    return this.present(habit, today, startOfWeek(today), completions, null);
  }

  public async relapse(
    userId: string,
    habitId: string,
  ): Promise<HabitResponseDto> {
    const today = await this.today(userId);
    const habit = await this.repository.findOwned(userId, habitId);
    if (!habit) {
      throw new AppError(
        404,
        ERROR_CODE.RESOURCE_NOT_FOUND,
        "The requested habit was not found.",
      );
    }

    if (habit.type !== HABIT_TYPE.BREAK) {
      throw new AppError(
        409,
        ERROR_CODE.INVALID_HABIT_TYPE_OPERATION,
        "This action is only available for break habits.",
      );
    }

    await this.repository.recordRelapse({ userId, habitId, date: today });
    return this.present(habit, today, startOfWeek(today), [], today);
  }

  private present(
    habit: Habit,
    today: string,
    weekStart: string,
    completions: string[],
    lastRelapse: string | null,
  ): HabitResponseDto {
    const startDate = this.startDate(habit);
    const common = {
      id: habit.id,
      name: habit.name,
      start_date: startDate,
      created_at: habit.created_at.toISOString(),
      updated_at: habit.updated_at.toISOString(),
    };

    if (habit.type === HABIT_TYPE.BREAK) {
      return new BreakHabitResponseDto({
        ...common,
        type: HABIT_TYPE.BREAK,
        tracking: {
          current_clean_streak: cleanStreak(startDate, today, lastRelapse),
          last_relapse_date: lastRelapse,
        },
      });
    }

    const tracking = buildTracking({
      startDate,
      today,
      weekStart,
      completions,
    });
    return new BuildHabitResponseDto({
      ...common,
      type: HABIT_TYPE.BUILD,
      tracking: {
        current_streak: tracking.currentStreak,
        week: {
          starts_on: tracking.week.startsOn,
          ends_on: tracking.week.endsOn,
          completed_day_count: tracking.week.completedDayCount,
          missed_day_count: tracking.week.missedDayCount,
          pending_day_count: tracking.week.pendingDayCount,
          completion_rate_percent: tracking.week.completionRatePercent,
          days: tracking.week.days,
        },
      },
    });
  }

  private startDate(habit: Habit): string {
    return habit.start_date.toISOString().slice(0, 10);
  }

  private async today(userId: string): Promise<string> {
    const timezone = await this.auth.getTimezone(userId);
    return dateInTimeZone(new Date(), timezone);
  }
}
