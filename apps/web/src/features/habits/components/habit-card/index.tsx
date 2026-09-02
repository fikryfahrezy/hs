import { HABIT_DAY_STATE, HABIT_TYPE } from "@habit-shaper/contracts";
import { useState } from "react";
import { Button } from "#app/components/ui/button";
import { type Habit } from "../../habit.types";
import {
  useCompletionMutation,
  useDeleteHabitMutation,
  useRelapseMutation,
} from "../../queries/habit-queries";
import "./styles.css";

export function HabitCard({ habit }: { habit: Habit }) {
  const [confirming, setConfirming] = useState(false);
  const [confirmingRelapse, setConfirmingRelapse] = useState(false);
  const deletion = useDeleteHabitMutation();
  const completion = useCompletionMutation();
  const relapse = useRelapseMutation();
  return (
    <article className="habit-card">
      <div>
        <p className="habit-type">{habit.type}</p>
        <h3>{habit.name}</h3>
      </div>
      {habit.type === HABIT_TYPE.BUILD ? (
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
        </div>
      ) : (
        <div className="break-tracking">
          <p>
            <strong>{habit.tracking.currentCleanStreak}</strong> clean days
          </p>
          {habit.tracking.lastRelapseDate ? (
            <small>Last relapse: {habit.tracking.lastRelapseDate}</small>
          ) : (
            <small>No relapses recorded</small>
          )}
          {confirmingRelapse ? (
            <div className="confirm-row">
              <span>
                A setback is information, not failure. Record today’s relapse?
              </span>
              <Button
                variant="secondary"
                onClick={() => setConfirmingRelapse(false)}
              >
                Cancel
              </Button>
              <Button
                disabled={relapse.isPending}
                onClick={() =>
                  relapse.mutate(
                    { habitId: habit.id },
                    {
                      onSuccess: () => setConfirmingRelapse(false),
                    },
                  )
                }
              >
                Record relapse
              </Button>
            </div>
          ) : (
            <Button
              variant="secondary"
              onClick={() => setConfirmingRelapse(true)}
            >
              Record relapse
            </Button>
          )}
        </div>
      )}
      {confirming ? (
        <div
          className="confirm-row"
          role="group"
          aria-label={`Delete ${habit.name}?`}
        >
          <span>Delete this habit and its history?</span>
          <Button variant="secondary" onClick={() => setConfirming(false)}>
            Cancel
          </Button>
          <Button
            disabled={deletion.isPending}
            onClick={() => deletion.mutate({ id: habit.id })}
          >
            Confirm delete
          </Button>
        </div>
      ) : (
        <Button variant="secondary" onClick={() => setConfirming(true)}>
          Delete
        </Button>
      )}
      {deletion.isError ? (
        <p className="form-error" role="alert">
          Could not delete this habit.
        </p>
      ) : null}
      {completion.isError ? (
        <p className="form-error" role="alert">
          Could not update this day.
        </p>
      ) : null}
      {relapse.isError ? (
        <p className="form-error" role="alert">
          Could not record the relapse. Try again.
        </p>
      ) : null}
    </article>
  );
}
