import type { CreateGoalRequest } from "@habit-shaper/contracts";
import type { FieldErrors, UseFormRegister } from "react-hook-form";

import {
  FormField,
  SelectField,
  TextareaField,
} from "#app/components/form-field";
import { Button } from "#app/components/ui/button";
import { type Habit } from "#app/features/habits/habit.types";
import { mutationMessage } from "../goal-manager/use-goal-form";
import "./styles.css";

export function GoalForm({
  habits,
  editingId,
  register,
  errors,
  saving,
  mutationError,
  onCancelEdit,
  onSubmit,
}: {
  habits: Habit[];
  editingId: string | null;
  register: UseFormRegister<CreateGoalRequest>;
  errors: FieldErrors<CreateGoalRequest>;
  saving: boolean;
  mutationError: unknown;
  onCancelEdit: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  "use no memo";
  return (
    <form className="goal-form" onSubmit={onSubmit} noValidate>
      <div className="goal-form-heading">
        <h3>{editingId ? "Edit goal" : "Add a goal"}</h3>
        {editingId ? (
          <Button variant="secondary" onClick={onCancelEdit}>
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
  );
}
