import { zodResolver } from "@hookform/resolvers/zod";
import {
  RegisterRequestSchema,
  type RegisterRequest,
} from "@habit-shaper/contracts";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";

import { AppShell } from "#app/components/app-shell";
import { FormField, SelectField } from "#app/components/form-field";
import { Button } from "#app/components/ui/button";
import { useRegisterMutation } from "#app/features/auth/queries/auth-queries";
import { ApiError } from "#app/lib/api-client";
import { dashboardRoute } from "../dashboard-page/dashboard-route";
import { loginRoute } from "../login-page/login-route";
import "../login-page/styles.css";

function browserTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

function timeZoneOptions(selectedTimeZone: string): string[] {
  const supported =
    typeof Intl.supportedValuesOf === "function"
      ? Intl.supportedValuesOf("timeZone")
      : [];

  return Array.from(
    new Set([selectedTimeZone, "UTC", ...supported]),
  ).toSorted();
}

export function RegisterPage() {
  const navigate = useNavigate();
  const mutation = useRegisterMutation();
  const defaultTimeZone = browserTimeZone();
  const timeZones = timeZoneOptions(defaultTimeZone);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterRequest>({
    resolver: zodResolver(RegisterRequestSchema),
    defaultValues: {
      email: "",
      password: "",
      timezone: defaultTimeZone,
    },
  });

  const submit = handleSubmit(async (input) => {
    try {
      await mutation.mutateAsync({ input });
      navigate(dashboardRoute.to(), { replace: true });
    } catch {
      // The mutation state renders the normalized error while preserving inputs.
    }
  });

  return (
    <AppShell>
      <main className="auth-page" id="main-content">
        <section className="auth-card" aria-labelledby="register-title">
          <p className="eyebrow">Start small</p>
          <h1 id="register-title">Create your account</h1>
          <p className="auth-intro">
            Your timezone keeps each daily action on the right day.
          </p>
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
              autoComplete="new-password"
              error={errors.password?.message}
              {...register("password")}
            />
            <SelectField
              id="timezone"
              label="Timezone"
              error={errors.timezone?.message}
              {...register("timezone")}
            >
              <option value="">Choose a timezone</option>
              {timeZones.map((timeZone) => (
                <option key={timeZone} value={timeZone}>
                  {timeZone}
                </option>
              ))}
            </SelectField>
            {mutation.error ? (
              <p className="form-error" role="alert">
                {mutation.error instanceof ApiError
                  ? mutation.error.message
                  : "We could not create your account. Try again."}
              </p>
            ) : null}
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Creating account…" : "Create account"}
            </Button>
          </form>
          <p className="auth-switch">
            Already have an account? <Link to={loginRoute.to()}>Sign in</Link>
          </p>
        </section>
      </main>
    </AppShell>
  );
}
