import {
  HABIT_DAY_STATE,
  HABIT_TYPE,
  type HabitDayState,
} from "@habit-shaper/contracts";

import {
  responseBoolean,
  responseNumber,
  responseRecord,
  responseString,
} from "#app/lib/response-value";

export class HabitDay {
  public readonly date: string;
  public readonly state: HabitDayState;
  public readonly mutable: boolean;

  public constructor(response: unknown) {
    const day = responseRecord(response);
    const responseState = responseString(day.state, "");
    let state: HabitDayState = HABIT_DAY_STATE.INELIGIBLE;
    if (
      responseState === HABIT_DAY_STATE.FUTURE ||
      responseState === HABIT_DAY_STATE.COMPLETED ||
      responseState === HABIT_DAY_STATE.PENDING ||
      responseState === HABIT_DAY_STATE.MISSED
    ) {
      state = responseState;
    }
    this.date = responseString(day.date, "");
    this.state = state;
    this.mutable = responseBoolean(day.mutable);
  }

  public get weekdayLabel(): string {
    const date = new Date(`${this.date}T00:00:00Z`);
    return Number.isNaN(date.getTime())
      ? "?"
      : date.toLocaleDateString("en", {
          weekday: "narrow",
          timeZone: "UTC",
        });
  }
}

abstract class HabitModel {
  public readonly id: string;
  public readonly name: string;
  public readonly startDate: string;
  public readonly createdAt: string;
  public readonly updatedAt: string;

  protected constructor(habit: Record<string, unknown>, index: number) {
    this.id = responseString(habit.id, `unknown-habit-${index}`);
    this.name = responseString(habit.name, "Untitled habit");
    this.startDate = responseString(habit.start_date, "");
    this.createdAt = responseString(habit.created_at, "");
    this.updatedAt = responseString(habit.updated_at, "");
  }
}

export class BuildHabit extends HabitModel {
  public readonly type = HABIT_TYPE.BUILD;
  public readonly tracking: {
    currentStreak: number;
    week: {
      startsOn: string;
      endsOn: string;
      completedDayCount: number;
      missedDayCount: number;
      pendingDayCount: number;
      completionRatePercent: number;
      days: HabitDay[];
    };
  };

  public constructor(habit: Record<string, unknown>, index: number) {
    super(habit, index);
    const tracking = responseRecord(habit.tracking);
    const week = responseRecord(tracking.week);
    this.tracking = {
      currentStreak: responseNumber(tracking.current_streak),
      week: {
        startsOn: responseString(week.starts_on, ""),
        endsOn: responseString(week.ends_on, ""),
        completedDayCount: responseNumber(week.completed_day_count),
        missedDayCount: responseNumber(week.missed_day_count),
        pendingDayCount: responseNumber(week.pending_day_count),
        completionRatePercent: responseNumber(week.completion_rate_percent),
        days: Array.isArray(week.days)
          ? week.days.map((day) => new HabitDay(day))
          : [],
      },
    };
  }
}

export class BreakHabit extends HabitModel {
  public readonly type = HABIT_TYPE.BREAK;
  public readonly tracking: {
    currentCleanStreak: number;
    lastRelapseDate: string | null;
  };

  public constructor(habit: Record<string, unknown>, index: number) {
    super(habit, index);
    const tracking = responseRecord(habit.tracking);
    this.tracking = {
      currentCleanStreak: responseNumber(tracking.current_clean_streak),
      lastRelapseDate:
        tracking.last_relapse_date === null
          ? null
          : responseString(tracking.last_relapse_date, "") || null,
    };
  }
}

export type Habit = BuildHabit | BreakHabit;

export function habitFromApi(response: unknown, index = 0): Habit {
  const habit = responseRecord(response);
  return habit.type === HABIT_TYPE.BREAK
    ? new BreakHabit(habit, index)
    : new BuildHabit(habit, index);
}
