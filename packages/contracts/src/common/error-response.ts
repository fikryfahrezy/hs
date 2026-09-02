import { z } from "zod";

export const ERROR_CODE = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  AUTHENTICATION_REQUIRED: "AUTHENTICATION_REQUIRED",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  EMAIL_ALREADY_EXISTS: "EMAIL_ALREADY_EXISTS",
  RESOURCE_NOT_FOUND: "RESOURCE_NOT_FOUND",
  INVALID_HABIT_TYPE_OPERATION: "INVALID_HABIT_TYPE_OPERATION",
  DATE_NOT_ELIGIBLE: "DATE_NOT_ELIGIBLE",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

export const ErrorCodeSchema = z.enum(ERROR_CODE);

export const ErrorResponseSchema = z.object({
  error: z.object({
    code: ErrorCodeSchema,
    message: z.string(),
    field_errors: z.record(z.string(), z.array(z.string())).optional(),
  }),
});

export type ErrorCode = z.infer<typeof ErrorCodeSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
