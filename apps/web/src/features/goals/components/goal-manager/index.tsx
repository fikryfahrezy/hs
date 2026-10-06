import { type Habit } from "#app/features/habits/habit.types";
import { useGoalsQuery } from "../../queries/goal-queries";
import { GoalForm } from "../goal-form";
import { GoalList } from "../goal-list";
import { useGoalForm } from "./use-goal-form";
import "./styles.css";

export function GoalManager({ habits }: { habits: Habit[] }) {
  "use no memo";
  const goals = useGoalsQuery();
  const form = useGoalForm(habits);

  return (
    <section className="goals-panel" id="goals" aria-labelledby="goals-title">
      <div className="goals-heading">
        <div>
          <p className="eyebrow">Goals</p>
          <h2 id="goals-title">Connect habits to a bigger reason</h2>
        </div>
        <p className="goal-count" aria-live="polite">
          {goals.data?.length ?? 0} linked goal
          {(goals.data?.length ?? 0) === 1 ? "" : "s"}
        </p>
      </div>

      {habits.length === 0 ? (
        <p className="goals-empty">
          Add a build or break habit before creating a goal.
        </p>
      ) : (
        <GoalForm
          habits={habits}
          editingId={form.editingId}
          register={form.register}
          errors={form.errors}
          saving={form.saving}
          mutationError={form.mutationError}
          onCancelEdit={form.finishEditing}
          onSubmit={(event) => void form.submit(event)}
        />
      )}

      <p className="visually-hidden" aria-live="polite">
        {form.announcement}
      </p>
      <GoalList
        goals={goals.data ?? []}
        isPending={goals.isPending}
        isError={goals.isError}
        onRetry={() => void goals.refetch()}
        onEdit={form.edit}
        onDeleted={form.deleted}
      />
    </section>
  );
}
