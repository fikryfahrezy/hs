import { zodResolver } from "@hookform/resolvers/zod";
import {
  CreateHabitRequestSchema,
  HABIT_TYPE,
  type CreateHabitRequest,
} from "@habit-shaper/contracts";
import { useForm } from "react-hook-form";

import { FormField, SelectField } from "#app/components/form-field";
import { Button } from "#app/components/ui/button";
import { useCreateHabitMutation } from "#app/features/habits/queries/habit-queries";
import "./styles.css";

export function CreateHabitForm() {
  "use no memo";
  const creation = useCreateHabitMutation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateHabitRequest>({
    resolver: zodResolver(CreateHabitRequestSchema),
    defaultValues: { name: "", type: HABIT_TYPE.BUILD },
  });
  const submit = handleSubmit(async (input) => {
    try {
      await creation.mutateAsync({ input });
      reset();
    } catch {
      // Mutation feedback remains visible and the form values are retained.
    }
  });

  return (
    <section
      className="create-panel"
      id="habits"
      aria-labelledby="create-title"
    >
      <div>
        <p className="eyebrow">New habit</p>
        <h2 id="create-title">Shape one small action</h2>
      </div>
      <form onSubmit={(event) => void submit(event)} noValidate>
        <FormField
          {...register("name")}
          error={errors.name?.message}
          id="habit-name"
          label="Name"
        />
        <SelectField
          {...register("type")}
          error={errors.type?.message}
          id="habit-type"
          label="Type"
        >
          <option value={HABIT_TYPE.BUILD}>Build — do more of this</option>
          <option value={HABIT_TYPE.BREAK}>Break — stay clear of this</option>
        </SelectField>
        <Button type="submit" disabled={creation.isPending}>
          {creation.isPending ? "Adding…" : "Add habit"}
        </Button>
      </form>
      {creation.isError ? (
        <p className="form-error" role="alert">
          Could not add your habit. Try again.
        </p>
      ) : null}
    </section>
  );
}
