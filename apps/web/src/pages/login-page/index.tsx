import { zodResolver } from "@hookform/resolvers/zod";
import { LoginRequestSchema, type LoginRequest } from "@habit-shaper/contracts";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";

import { AppShell } from "#app/components/app-shell";
import { FormField } from "#app/components/form-field";
import { Button } from "#app/components/ui/button";
import { useLoginMutation } from "#app/features/auth/queries/auth-queries";
import { ApiError } from "#app/lib/api-client";
import { dashboardRoute } from "../dashboard-page/dashboard-route";
import { registerRoute } from "../register-page/register-route";
import "./styles.css";

export function LoginPage() {
  const navigate = useNavigate();
  const mutation = useLoginMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>({
    resolver: zodResolver(LoginRequestSchema),
    defaultValues: { email: "", password: "" },
  });

  const submit = handleSubmit(async (input) => {
    try {
      await mutation.mutateAsync(input);
      navigate(dashboardRoute.to(), { replace: true });
    } catch {
      // The mutation state renders the normalized error while preserving inputs.
    }
  });

  return (
    <AppShell>
      <main className="auth-page">
        <section className="auth-card" aria-labelledby="login-title">
          <p className="eyebrow">Welcome back</p>
          <h1 id="login-title">Sign in</h1>
          <p className="auth-intro">Continue shaping one day at a time.</p>
          <form onSubmit={(event) => void submit(event)} noValidate>
            <FormField
              id="email"
              label="Email"
              type="email"
              autoComplete="email"
              error={errors.email?.message}
              {...register("email")}
            />
            <FormField
              id="password"
              label="Password"
              type="password"
              autoComplete="current-password"
              error={errors.password?.message}
              {...register("password")}
            />
            {mutation.error ? (
              <p className="form-error" role="alert">
                {mutation.error instanceof ApiError
                  ? mutation.error.message
                  : "We could not sign you in. Try again."}
              </p>
            ) : null}
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Signing in…" : "Sign in"}
            </Button>
          </form>
          <p className="auth-switch">
            New here? <Link to={registerRoute.to()}>Create an account</Link>
          </p>
        </section>
      </main>
    </AppShell>
  );
}
