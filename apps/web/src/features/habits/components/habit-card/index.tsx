import { HABIT_TYPE } from "@habit-shaper/contracts";
import { useState } from "react";

import { Button } from "#app/components/ui/button";
import { ConfirmRow } from "#app/components/ui/confirm-row";
import { type Habit } from "../../habit.types";
import { useDeleteHabitMutation } from "../../queries/habit-queries";
import { BreakHabitTracking } from "../break-habit-tracking";
import { BuildHabitTracking } from "../build-habit-tracking";
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
      {habit.type === HABIT_TYPE.BUILD ? (
        <BuildHabitTracking habit={habit} />
      ) : (
        <BreakHabitTracking habit={habit} />
      )}
      {confirming ? (
        <ConfirmRow
          message="Delete this habit and its history?"
          confirmLabel="Confirm delete"
          pending={deletion.isPending}
          ariaLabel={`Delete ${habit.name}?`}
          onCancel={() => setConfirming(false)}
          onConfirm={() => deletion.mutate({ id: habit.id })}
        />
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
