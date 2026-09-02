import { type z } from "zod";
import { ERROR_CODE } from "@habit-shaper/contracts";

import { AppError } from "../errors/app-error";

export function parseSchema<T>(schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (result.success) {
    return result.data;
  }

  const fieldErrors: Record<string, string[]> = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0]?.toString() ?? "request";
    (fieldErrors[field] ??= []).push(issue.message);
  }

  throw new AppError(
    400,
    ERROR_CODE.VALIDATION_ERROR,
    "Check the highlighted fields.",
    fieldErrors,
  );
}
