import { Link, useNavigate } from "react-router-dom";

import { AppShell } from "#app/components/app-shell";
import { RegisterForm } from "#app/features/auth/components/register-form";
import { dashboardRoute } from "../dashboard-page/dashboard-route";
import { loginRoute } from "../login-page/login-route";
import "../login-page/styles.css";

export function RegisterPage() {
  const navigate = useNavigate();

  return (
    <AppShell>
      <main className="auth-page" id="main-content">
        <section className="auth-card" aria-labelledby="register-title">
          <p className="eyebrow">Start small</p>
          <h1 id="register-title">Create your account</h1>
          <RegisterForm
            onSuccess={() => navigate(dashboardRoute.to(), { replace: true })}
          />
          <p className="auth-switch">
            Already have an account? <Link to={loginRoute.to()}>Sign in</Link>
          </p>
        </section>
      </main>
    </AppShell>
  );
}
