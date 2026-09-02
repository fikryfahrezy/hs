import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
  Logger,
  type ExceptionFilter,
} from "@nestjs/common";
import { ThrottlerException } from "@nestjs/throttler";
import {
  ERROR_CODE,
  type ErrorCode,
  type ErrorResponse,
} from "@habit-shaper/contracts";
import { type Response } from "express";

import { AppError } from "../errors/app-error";

function sendError(
  response: Response,
  status: number,
  code: ErrorCode,
  message: string,
  fieldErrors?: Record<string, string[]>,
): void {
  const body: ErrorResponse = {
    error: {
      code,
      message,
      ...(fieldErrors ? { field_errors: fieldErrors } : {}),
    },
  };

  response.status(status).json(body);
}

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  public catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception instanceof AppError) {
      sendError(
        response,
        exception.status,
        exception.code,
        exception.message,
        exception.fieldErrors,
      );
      return;
    }

    if (exception instanceof ThrottlerException) {
      sendError(
        response,
        HttpStatus.TOO_MANY_REQUESTS,
        ERROR_CODE.RATE_LIMITED,
        "Too many attempts. Please try again later.",
      );
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const notFound = status === HttpStatus.NOT_FOUND;
      sendError(
        response,
        status,
        notFound ? ERROR_CODE.RESOURCE_NOT_FOUND : ERROR_CODE.INTERNAL_ERROR,
        notFound
          ? "The requested resource was not found."
          : "The request could not be completed.",
      );
      return;
    }

    this.logger.error("Unhandled request error", exception);
    sendError(
      response,
      HttpStatus.INTERNAL_SERVER_ERROR,
      ERROR_CODE.INTERNAL_ERROR,
      "The request could not be completed.",
    );
  }
}
