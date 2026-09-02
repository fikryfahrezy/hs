import { AppShell } from "../../components/app-shell";
import { Button } from "../../components/ui/button";
import {
  useLogoutMutation,
  useSessionQuery,
} from "../../features/auth/queries/auth-queries";
import "./styles.css";

export function DashboardPage() {
  const session = useSessionQuery();
  const logout = useLogoutMutation();

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
        <p className="eyebrow">Today</p>
        <h1>Your daily shape</h1>
        <p>
          Signed in as <strong>{session.data?.email}</strong>. Your habits will
          appear here.
        </p>
      </main>
    </AppShell>
  );
}
