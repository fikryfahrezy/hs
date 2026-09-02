import { HABIT_TYPE } from "@habit-shaper/contracts";

import { Button } from "#app/components/ui/button";
import { type Habit } from "../../habit.types";
import { HabitCard } from "../habit-card";
import "./styles.css";

export function HabitBoard({
  habits,
  isPending,
  isError,
  onRetry,
}: {
  habits: Habit[];
  isPending: boolean;
  isError: boolean;
  onRetry: () => void;
}) {
  if (isPending) {
    return <p className="panel-state">Loading your habits…</p>;
  }
  if (isError) {
    return (
      <div className="panel-state" role="alert">
        <p>We could not load your habits.</p>
        <Button variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      </div>
    );
  }
  if (habits.length === 0) {
    return (
      <section className="empty-state">
        <h2>Start with one honest habit</h2>
        <p>
          Build habits are actions you want to repeat. Break habits count the
          days you stay clear.
        </p>
      </section>
    );
  }

  const build = habits.filter((habit) => habit.type === HABIT_TYPE.BUILD);
  const breaking = habits.filter((habit) => habit.type === HABIT_TYPE.BREAK);

  return (
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
  );
}
