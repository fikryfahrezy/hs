import { Button } from "#app/components/ui/button";
import { type Goal } from "../../goal.types";
import { GoalListItem } from "../goal-list-item";
import "./styles.css";

export function GoalList({
  goals,
  isPending,
  isError,
  onRetry,
  onEdit,
  onDeleted,
}: {
  goals: Goal[];
  isPending: boolean;
  isError: boolean;
  onRetry: () => void;
  onEdit: (goal: Goal) => void;
  onDeleted: (goalId: string) => void;
}) {
  if (isPending) {
    return <p className="goals-state">Loading your goals…</p>;
  }
  if (isError) {
    return (
      <div className="goals-state" role="alert">
        <p>We could not load your goals.</p>
        <Button variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      </div>
    );
  }
  if (goals.length === 0) {
    return (
      <p className="goals-state">No goals yet. Link one to a daily habit.</p>
    );
  }
  return (
    <ul className="goal-list">
      {goals.map((goal) => (
        <GoalListItem
          key={goal.id}
          goal={goal}
          onEdit={onEdit}
          onDeleted={onDeleted}
        />
      ))}
    </ul>
  );
}
