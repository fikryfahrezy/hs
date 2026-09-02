import { HealthStatus } from "#app/features/health/components/health-status";
import "./styles.css";

export function HomePage() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <a className="brand" href="/" aria-label="Habit Shaper home">
          Habit Shaper
        </a>
        <span className="phase-label">Foundation</span>
      </header>

      <main className="home-page">
        <section className="hero" aria-labelledby="hero-title">
          <p className="eyebrow">Small steps, shaped daily</p>
          <h1 id="hero-title">Build what helps. Break what holds you back.</h1>
          <p className="hero-copy">
            The application foundation is running. Habit tracking will arrive in
            the next vertical slices.
          </p>
          <HealthStatus />
        </section>
      </main>
    </div>
  );
}
