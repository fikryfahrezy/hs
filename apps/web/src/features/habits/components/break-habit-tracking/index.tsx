import { useState } from "react";

import { Button } from "#app/components/ui/button";
import { ConfirmRow } from "#app/components/ui/confirm-row";
import { type BreakHabit } from "../../habit.types";
import { useRelapseMutation } from "../../queries/habit-queries";
import "./styles.css";

export function BreakHabitTracking({ habit }: { habit: BreakHabit }) {
  const [confirmingRelapse, setConfirmingRelapse] = useState(false);
  const relapse = useRelapseMutation();

  return (
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
        <ConfirmRow
          message="A setback is information, not failure. Record today’s relapse?"
          confirmLabel="Record relapse"
          pending={relapse.isPending}
          onCancel={() => setConfirmingRelapse(false)}
          onConfirm={() =>
            relapse.mutate(
              { habitId: habit.id },
              { onSuccess: () => setConfirmingRelapse(false) },
            )
          }
        />
      ) : (
        <Button variant="secondary" onClick={() => setConfirmingRelapse(true)}>
          Record relapse
        </Button>
      )}
      {relapse.isError ? (
        <p className="form-error" role="alert">
          Could not record the relapse. Try again.
        </p>
      ) : null}
    </div>
  );
}
