import { type ErrorCode } from "@habit-shaper/contracts";

export class AppError extends Error {
  public constructor(
    public readonly status: number,
    public readonly code: ErrorCode,
    message: string,
    public readonly fieldErrors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "AppError";
  }
}
