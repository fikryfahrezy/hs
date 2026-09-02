import { type PropsWithChildren } from "react";

import "./styles.css";

type AppShellProps = PropsWithChildren<{
  action?: React.ReactNode;
  navigation?: React.ReactNode;
}>;

export function AppShell({ action, children, navigation }: AppShellProps) {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <header className="app-header">
        <a className="brand" href="/" aria-label="Habit Shaper home">
          Habit Shaper
        </a>
        <div className="app-header-actions">
          {navigation}
          {action}
        </div>
      </header>
      {children}
    </div>
  );
}
