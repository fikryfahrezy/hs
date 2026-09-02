import { useState } from "react";
import { Button } from "../../../../components/ui/button";
import { type Habit } from "../../habit.types";
import { useDeleteHabitMutation } from "../../queries/habit-queries";
import "./styles.css";

export function HabitCard({ habit }: { habit: Habit }) {
  const [confirming, setConfirming] = useState(false);
  const deletion = useDeleteHabitMutation();
  return (
    <article className="habit-card">
      <div>
        <p className="habit-type">{habit.type}</p>
        <h3>{habit.name}</h3>
      </div>
      {habit.type === "build" ? (
        <p>
          <strong>{habit.tracking.currentStreak}</strong> day streak
        </p>
      ) : (
        <p>
          <strong>{habit.tracking.currentCleanStreak}</strong> clean days
        </p>
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
            onClick={() => deletion.mutate(habit.id)}
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
    </article>
  );
}
