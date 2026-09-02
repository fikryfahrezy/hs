import { type PropsWithChildren } from "react";

import "./styles.css";

type AppShellProps = PropsWithChildren<{
  action?: React.ReactNode;
}>;

export function AppShell({ action, children }: AppShellProps) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <a className="brand" href="/" aria-label="Habit Shaper home">
          Habit Shaper
        </a>
        {action}
      </header>
      {children}
    </div>
  );
}
