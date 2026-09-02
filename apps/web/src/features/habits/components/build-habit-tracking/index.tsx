import { HABIT_DAY_STATE } from "@habit-shaper/contracts";

import { type BuildHabit } from "../../habit.types";
import { useCompletionMutation } from "../../queries/habit-queries";
import "./styles.css";

export function BuildHabitTracking({ habit }: { habit: BuildHabit }) {
  const completion = useCompletionMutation();

  return (
    <div className="build-tracking">
      <p>
        <strong>{habit.tracking.currentStreak}</strong> day streak ·{" "}
        {habit.tracking.week.completionRatePercent}% this week
      </p>
      <div className="week-strip">
        {habit.tracking.week.days.map((day) => (
          <button
            key={day.date}
            type="button"
            className={`day-state day-${day.state}`}
            disabled={!day.mutable || completion.isPending}
            aria-label={`${day.date}: ${day.state}`}
            onClick={() =>
              completion.mutate({
                habitId: habit.id,
                date: day.date,
                present: day.state !== HABIT_DAY_STATE.COMPLETED,
              })
            }
          >
            <span>{day.weekdayLabel}</span>
            <span aria-hidden="true">
              {day.state === HABIT_DAY_STATE.COMPLETED ? "✓" : "·"}
            </span>
          </button>
        ))}
      </div>
      <small>
        {habit.tracking.week.completedDayCount} completed ·{" "}
        {habit.tracking.week.missedDayCount} missed
      </small>
      {completion.isError ? (
        <p className="form-error" role="alert">
          Could not update this day.
        </p>
      ) : null}
    </div>
  );
}
