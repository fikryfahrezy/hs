import {
  responseBoolean,
  responseNumber,
  responseRecord,
  responseString,
} from "../../lib/response-value";

export type HabitDayState =
  | "ineligible"
  | "future"
  | "completed"
  | "pending"
  | "missed";

export class HabitDay {
  public readonly date: string;
  public readonly state: HabitDayState;
  public readonly mutable: boolean;

  public constructor(response: unknown) {
    const day = responseRecord(response);
    const state = responseString(day.state, "ineligible");
    this.date = responseString(day.date, "");
    this.state =
      state === "future" ||
      state === "completed" ||
      state === "pending" ||
      state === "missed"
        ? state
        : "ineligible";
    this.mutable = responseBoolean(day.mutable);
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
  public readonly type = "build" as const;
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
  public readonly type = "break" as const;
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
  return habit.type === "break"
    ? new BreakHabit(habit, index)
    : new BuildHabit(habit, index);
}
