import {
  ERROR_CODE,
  ErrorResponseSchema,
  type ErrorCode,
} from "@habit-shaper/contracts";

export class ApiError extends Error {
  public constructor(
    message: string,
    public readonly status: number,
    public readonly code: ErrorCode = ERROR_CODE.INTERNAL_ERROR,
    public readonly fieldErrors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: unknown;
  signal?: AbortSignal;
};

export async function requestJson(
  path: string,
  options: RequestOptions = {},
): Promise<unknown> {
  const response = await fetch(path, {
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
      ...(options.body === undefined
        ? {}
        : { "Content-Type": "application/json" }),
    },
    method: options.method ?? "GET",
    ...(options.signal ? { signal: options.signal } : {}),
    ...(options.body === undefined
      ? {}
      : { body: JSON.stringify(options.body) }),
  });

  if (!response.ok) {
    const parsed = ErrorResponseSchema.safeParse(
      await response.json().catch(() => null),
    );
    if (parsed.success) {
      throw new ApiError(
        parsed.data.error.message,
        response.status,
        parsed.data.error.code,
        parsed.data.error.field_errors,
      );
    }
    throw new ApiError("The request could not be completed.", response.status);
  }

  if (response.status === 204) {
    return undefined;
  }
  return response.json() as Promise<unknown>;
}
