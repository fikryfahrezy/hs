import { zodResolver } from "@hookform/resolvers/zod";
import { LoginRequestSchema, type LoginRequest } from "@habit-shaper/contracts";
import { useForm } from "react-hook-form";

import { FormField } from "#app/components/form-field";
import { Button } from "#app/components/ui/button";
import { ApiError } from "#app/lib/api-client";
import { useLoginMutation } from "../../queries/auth-queries";

export function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  "use no memo";
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
      await mutation.mutateAsync({ input });
      onSuccess();
    } catch {
      // The mutation state renders the normalized error while preserving inputs.
    }
  });

  return (
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
  );
}
