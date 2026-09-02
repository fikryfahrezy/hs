import { AppShell } from "#app/components/app-shell";
import { Button } from "#app/components/ui/button";
import { useLogoutMutation } from "#app/features/auth/queries/auth-queries";
import { GoalManager } from "#app/features/goals/components/goal-manager";
import { CreateHabitForm } from "#app/features/habits/components/create-habit-form";
import { HabitBoard } from "#app/features/habits/components/habit-board";
import { useHabitsQuery } from "#app/features/habits/queries/habit-queries";
import "./styles.css";

export function DashboardPage() {
  const logout = useLogoutMutation();
  const habits = useHabitsQuery();

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
        <HabitBoard
          habits={habits.data ?? []}
          isPending={habits.isPending}
          isError={habits.isError}
          onRetry={() => void habits.refetch()}
        />
        <GoalManager habits={habits.data ?? []} />
      </main>
    </AppShell>
  );
}
