import { HABIT_TYPE } from "@habit-shaper/contracts";

import { AppShell } from "#app/components/app-shell";
import { Button } from "#app/components/ui/button";
import { useLogoutMutation } from "#app/features/auth/queries/auth-queries";
import { GoalManager } from "#app/features/goals/components/goal-manager";
import { CreateHabitForm } from "#app/features/habits/components/create-habit-form";
import { HabitCard } from "#app/features/habits/components/habit-card";
import { useHabitsQuery } from "#app/features/habits/queries/habit-queries";
import "./styles.css";

export function DashboardPage() {
  const logout = useLogoutMutation();
  const habits = useHabitsQuery();
  const build =
    habits.data?.filter((habit) => habit.type === HABIT_TYPE.BUILD) ?? [];
  const breaking =
    habits.data?.filter((habit) => habit.type === HABIT_TYPE.BREAK) ?? [];

  return (
    <AppShell
      navigation={
        <nav className="primary-navigation" aria-label="Primary">
          <a href="#today">Today</a>
          <a href="#habits">Habits</a>
          <a href="#goals">Goals</a>
        </nav>
      }
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
      <main className="dashboard-page" id="main-content">
        <header className="dashboard-hero" id="today">
          <p className="eyebrow">Today</p>
          <h1>Your daily shape</h1>
          <p>Build what helps. Make space from what does not.</p>
        </header>
        <CreateHabitForm />
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
        <GoalManager habits={habits.data ?? []} />
      </main>
    </AppShell>
  );
}
