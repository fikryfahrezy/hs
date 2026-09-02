import { useState } from "react";

import { Button } from "#app/components/ui/button";
import { type Goal } from "../../goal.types";
import { useDeleteGoalMutation } from "../../queries/goal-queries";
import "./styles.css";

export function GoalListItem({
  goal,
  onEdit,
  onDeleted,
}: {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDeleted: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const deletion = useDeleteGoalMutation();

  return (
    <li>
      <article className="goal-card">
        <div>
          <p className="goal-habit">
            {goal.habit.name} · {goal.habit.type}
          </p>
          <h3>{goal.title}</h3>
          {goal.description ? <p>{goal.description}</p> : null}
        </div>
        {confirming ? (
          <div
            className="goal-actions"
            role="group"
            aria-label={`Delete ${goal.title}?`}
          >
            <span>Delete this goal?</span>
            <Button variant="secondary" onClick={() => setConfirming(false)}>
              Cancel
            </Button>
            <Button
              disabled={deletion.isPending}
              onClick={() =>
                deletion.mutate(
                  { id: goal.id },
                  {
                    onSuccess: () => {
                      setConfirming(false);
                      onDeleted();
                    },
                  },
                )
              }
            >
              Confirm delete
            </Button>
          </div>
        ) : (
          <div className="goal-actions">
            <Button variant="secondary" onClick={() => onEdit(goal)}>
              Edit
            </Button>
            <Button variant="secondary" onClick={() => setConfirming(true)}>
              Delete
            </Button>
          </div>
        )}
        {deletion.isError && confirming ? (
          <p className="form-error" role="alert">
            Could not delete this goal. Try again.
          </p>
        ) : null}
      </article>
    </li>
  );
}
