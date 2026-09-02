import { zodResolver } from "@hookform/resolvers/zod";
import {
  CreateHabitRequestSchema,
  type CreateHabitRequest,
} from "@habit-shaper/contracts";
import { useForm } from "react-hook-form";

import { AppShell } from "../../components/app-shell";
import { FormField, SelectField } from "../../components/form-field";
import { Button } from "../../components/ui/button";
import { useLogoutMutation } from "../../features/auth/queries/auth-queries";
import { HabitCard } from "../../features/habits/components/habit-card";
import {
  useCreateHabitMutation,
  useHabitsQuery,
} from "../../features/habits/queries/habit-queries";
import "./styles.css";

export function DashboardPage() {
  const logout = useLogoutMutation();
  const habits = useHabitsQuery();
  const creation = useCreateHabitMutation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateHabitRequest>({
    resolver: zodResolver(CreateHabitRequestSchema),
    defaultValues: { name: "", type: "build" },
  });
  const submit = handleSubmit(async (input) => {
    try {
      await creation.mutateAsync(input);
      reset();
    } catch {
      // Mutation feedback remains visible and the form values are retained.
    }
  });
  const build = habits.data?.filter((habit) => habit.type === "build") ?? [];
  const breaking = habits.data?.filter((habit) => habit.type === "break") ?? [];

  return (
    <AppShell
      action={
        <Button
          variant="secondary"
          disabled={logout.isPending}
          onClick={() => logout.mutate()}
        >
          {logout.isPending ? "Signing out…" : "Sign out"}
        </Button>
      }
    >
      <main className="dashboard-page">
        <header className="dashboard-hero">
          <p className="eyebrow">Today</p>
          <h1>Your daily shape</h1>
          <p>Build what helps. Make space from what does not.</p>
        </header>
        <section className="create-panel" aria-labelledby="create-title">
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
              <option value="build">Build — do more of this</option>
              <option value="break">Break — stay clear of this</option>
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
        {habits.isPending ? (
          <p className="panel-state">Loading your habits…</p>
        ) : null}
        {habits.isError ? (
          <div className="panel-state" role="alert">
            <p>We could not load your habits.</p>
            <Button variant="secondary" onClick={() => void habits.refetch()}>
              Try again
            </Button>
          </div>
        ) : null}
        {habits.data?.length === 0 ? (
          <section className="empty-state">
            <h2>Start with one honest habit</h2>
            <p>
              Build habits are actions you want to repeat. Break habits count
              the days you stay clear.
            </p>
          </section>
        ) : null}
        {habits.data?.length ? (
          <div className="habit-sections">
            <section>
              <h2>Build</h2>
              <div className="habit-grid">
                {build.map((habit) => (
                  <HabitCard habit={habit} key={habit.id} />
                ))}
                {build.length === 0 ? <p>No build habits yet.</p> : null}
              </div>
            </section>
            <section>
              <h2>Break</h2>
              <div className="habit-grid">
                {breaking.map((habit) => (
                  <HabitCard habit={habit} key={habit.id} />
                ))}
                {breaking.length === 0 ? <p>No break habits yet.</p> : null}
              </div>
            </section>
          </div>
        ) : null}
        <section className="goals-placeholder">
          <p className="eyebrow">Goals</p>
          <h2>Connect habits to a bigger reason</h2>
          <p>Goal management arrives in the next product slice.</p>
        </section>
      </main>
    </AppShell>
  );
}
