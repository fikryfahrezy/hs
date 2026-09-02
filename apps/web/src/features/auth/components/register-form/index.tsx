import { zodResolver } from "@hookform/resolvers/zod";
import {
  RegisterRequestSchema,
  type RegisterRequest,
} from "@habit-shaper/contracts";
import { useForm } from "react-hook-form";

import { FormField } from "#app/components/form-field";
import { Button } from "#app/components/ui/button";
import { ApiError } from "#app/lib/api-client";
import { useRegisterMutation } from "../../queries/auth-queries";

function browserTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

export function RegisterForm({ onSuccess }: { onSuccess: () => void }) {
  "use no memo";
  const mutation = useRegisterMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterRequest>({
    resolver: zodResolver(RegisterRequestSchema),
    defaultValues: {
      email: "",
      password: "",
      timezone: browserTimeZone(),
    },
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
        autoComplete="new-password"
        error={errors.password?.message}
        {...register("password")}
      />
      <input type="hidden" {...register("timezone")} />
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
  );
}
