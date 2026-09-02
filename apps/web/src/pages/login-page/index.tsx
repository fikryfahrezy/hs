import { Link, useNavigate } from "react-router-dom";

import { AppShell } from "#app/components/app-shell";
import { LoginForm } from "#app/features/auth/components/login-form";
import { dashboardRoute } from "../dashboard-page/dashboard-route";
import { registerRoute } from "../register-page/register-route";
import "./styles.css";

export function LoginPage() {
  const navigate = useNavigate();

  return (
    <AppShell>
      <main className="auth-page" id="main-content">
        <section className="auth-card" aria-labelledby="login-title">
          <p className="eyebrow">Welcome back</p>
          <h1 id="login-title">Sign in</h1>
          <p className="auth-intro">Continue shaping one day at a time.</p>
          <LoginForm
            onSuccess={() => navigate(dashboardRoute.to(), { replace: true })}
          />
          <p className="auth-switch">
            New here? <Link to={registerRoute.to()}>Create an account</Link>
          </p>
        </section>
      </main>
    </AppShell>
  );
}
