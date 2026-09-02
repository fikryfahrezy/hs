import { zodResolver } from "@hookform/resolvers/zod";
import {
  CreateGoalRequestSchema,
  type CreateGoalRequest,
} from "@habit-shaper/contracts";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import {
  FormField,
  SelectField,
  TextareaField,
} from "#app/components/form-field";
import { Button } from "#app/components/ui/button";
import { type Habit } from "#app/features/habits/habit.types";
import { ApiError } from "#app/lib/api-client";
import { type Goal } from "../../goal.types";
import {
  useCreateGoalMutation,
  useDeleteGoalMutation,
  useGoalsQuery,
  useUpdateGoalMutation,
} from "../../queries/goal-queries";
import "./styles.css";

function mutationMessage(error: unknown): string {
  return error instanceof ApiError
    ? error.message
    : "We could not save that change. Try again.";
}

export function GoalManager({ habits }: { habits: Habit[] }) {
  const goals = useGoalsQuery();
  const creation = useCreateGoalMutation();
  const update = useUpdateGoalMutation();
  const deletion = useDeleteGoalMutation();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    setFocus,
    formState: { errors },
  } = useForm<CreateGoalRequest>({
    resolver: zodResolver(CreateGoalRequestSchema),
    defaultValues: {
      habit_id: habits[0]?.id ?? "",
      title: "",
      description: "",
    },
  });

  useEffect(() => {
    if (!editingId && habits[0]) {
      reset({ habit_id: habits[0].id, title: "", description: "" });
    }
  }, [editingId, habits, reset]);

  const finishEditing = () => {
    setEditingId(null);
    reset({ habit_id: habits[0]?.id ?? "", title: "", description: "" });
  };

  const edit = (goal: Goal) => {
    setEditingId(goal.id);
    reset({
      habit_id: goal.habit.id,
      title: goal.title,
      description: goal.description ?? "",
    });
    setTimeout(() => setFocus("title"), 0);
  };

  const submit = handleSubmit(async (input) => {
    setAnnouncement("");
    try {
      if (editingId) {
        await update.mutateAsync({ id: editingId, input });
        setAnnouncement("Goal updated.");
      } else {
        await creation.mutateAsync(input);
        setAnnouncement("Goal added.");
      }
      finishEditing();
    } catch {
      // Mutation feedback remains visible and recoverable input is preserved.
    }
  });
  const saving = creation.isPending || update.isPending;
  const mutationError = creation.error ?? update.error;

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
        <form
          className="goal-form"
          onSubmit={(event) => void submit(event)}
          noValidate
        >
          <div className="goal-form-heading">
            <h3>{editingId ? "Edit goal" : "Add a goal"}</h3>
            {editingId ? (
              <Button variant="secondary" onClick={finishEditing}>
                Cancel editing
              </Button>
            ) : null}
          </div>
          <FormField
            {...register("title")}
            error={errors.title?.message}
            id="goal-title"
            label="Title"
          />
          <SelectField
            {...register("habit_id")}
            error={errors.habit_id?.message}
            id="goal-habit"
            label="Habit"
          >
            {habits.map((habit) => (
              <option key={habit.id} value={habit.id}>
                {habit.name} ({habit.type})
              </option>
            ))}
          </SelectField>
          <TextareaField
            {...register("description")}
            error={errors.description?.message}
            id="goal-description"
            label="Description (optional)"
            maxLength={500}
          />
          {mutationError ? (
            <p className="form-error" role="alert">
              {mutationMessage(mutationError)}
            </p>
          ) : null}
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : editingId ? "Save goal" : "Add goal"}
          </Button>
        </form>
      )}

      <p className="visually-hidden" aria-live="polite">
        {announcement}
      </p>
      {goals.isPending ? (
        <p className="goals-state">Loading your goals…</p>
      ) : null}
      {goals.isError ? (
        <div className="goals-state" role="alert">
          <p>We could not load your goals.</p>
          <Button variant="secondary" onClick={() => void goals.refetch()}>
            Try again
          </Button>
        </div>
      ) : null}
      {goals.data?.length === 0 ? (
        <p className="goals-state">No goals yet. Link one to a daily habit.</p>
      ) : null}
      {goals.data?.length ? (
        <ul className="goal-list">
          {goals.data.map((goal) => (
            <li key={goal.id}>
              <article className="goal-card">
                <div>
                  <p className="goal-habit">
                    {goal.habit.name} · {goal.habit.type}
                  </p>
                  <h3>{goal.title}</h3>
                  {goal.description ? <p>{goal.description}</p> : null}
                </div>
                {confirmingId === goal.id ? (
                  <div
                    className="goal-actions"
                    role="group"
                    aria-label={`Delete ${goal.title}?`}
                  >
                    <span>Delete this goal?</span>
                    <Button
                      variant="secondary"
                      onClick={() => setConfirmingId(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      disabled={deletion.isPending}
                      onClick={() =>
                        deletion.mutate(goal.id, {
                          onSuccess: () => {
                            setConfirmingId(null);
                            setAnnouncement("Goal deleted.");
                          },
                        })
                      }
                    >
                      Confirm delete
                    </Button>
                  </div>
                ) : (
                  <div className="goal-actions">
                    <Button variant="secondary" onClick={() => edit(goal)}>
                      Edit
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setConfirmingId(goal.id)}
                    >
                      Delete
                    </Button>
                  </div>
                )}
                {deletion.isError && confirmingId === goal.id ? (
                  <p className="form-error" role="alert">
                    Could not delete this goal. Try again.
                  </p>
                ) : null}
              </article>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
