import { HABIT_DAY_STATE, type HabitDayState } from "@habit-shaper/contracts";

import { addDays, startOfWeek, toEpochDay } from "#app/common/time/calendar";

export function buildTracking(input: {
  startDate: string;
  today: string;
  weekStart: string;
  completions: string[];
}) {
  const complete = new Set(input.completions);
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = addDays(input.weekStart, index);
    let state: HabitDayState;
    if (date < input.startDate) {
      state = HABIT_DAY_STATE.INELIGIBLE;
    } else if (date > input.today) {
      state = HABIT_DAY_STATE.FUTURE;
    } else if (complete.has(date)) {
      state = HABIT_DAY_STATE.COMPLETED;
    } else if (date === input.today) {
      state = HABIT_DAY_STATE.PENDING;
    } else {
      state = HABIT_DAY_STATE.MISSED;
    }
    return {
      date,
      state,
      mutable:
        input.weekStart === startOfWeek(input.today) &&
        (state === HABIT_DAY_STATE.COMPLETED ||
          state === HABIT_DAY_STATE.PENDING ||
          state === HABIT_DAY_STATE.MISSED),
    };
  });
  const completed = days.filter(
    (day) => day.state === HABIT_DAY_STATE.COMPLETED,
  ).length;
  const missed = days.filter(
    (day) => day.state === HABIT_DAY_STATE.MISSED,
  ).length;
  const pending = days.filter(
    (day) => day.state === HABIT_DAY_STATE.PENDING,
  ).length;
  let candidate = complete.has(input.today)
    ? input.today
    : addDays(input.today, -1);
  let streak = 0;
  while (candidate >= input.startDate && complete.has(candidate)) {
    streak++;
    candidate = addDays(candidate, -1);
  }
  return {
    currentStreak: streak,
    week: {
      startsOn: input.weekStart,
      endsOn: addDays(input.weekStart, 6),
      completedDayCount: completed,
      missedDayCount: missed,
      pendingDayCount: pending,
      completionRatePercent:
        completed + missed === 0
          ? 0
          : Math.round((completed / (completed + missed)) * 100),
      days,
    },
  };
}

export function isCompletionEligible(
  startDate: string,
  today: string,
  date: string,
): boolean {
  return (
    toEpochDay(date) >= toEpochDay(startDate) &&
    toEpochDay(date) <= toEpochDay(today) &&
    startOfWeek(date) === startOfWeek(today)
  );
}
