import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
  Logger,
  type ExceptionFilter,
} from "@nestjs/common";
import {
  ERROR_CODE,
  type ErrorCode,
  type ErrorResponse,
} from "@habit-shaper/contracts";
import { type Response } from "express";

import { AppError } from "#app/common/errors/app-error";

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

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      if (
        status === HttpStatus.BAD_REQUEST ||
        status === HttpStatus.PAYLOAD_TOO_LARGE
      ) {
        sendError(
          response,
          HttpStatus.BAD_REQUEST,
          ERROR_CODE.VALIDATION_ERROR,
          "Check the request and try again.",
          { request: ["Send a valid JSON request within the size limit."] },
        );
        return;
      }
      if (status === HttpStatus.NOT_FOUND) {
        sendError(
          response,
          status,
          ERROR_CODE.RESOURCE_NOT_FOUND,
          "The requested resource was not found.",
        );
        return;
      }
      if (status === HttpStatus.UNAUTHORIZED) {
        sendError(
          response,
          status,
          ERROR_CODE.AUTHENTICATION_REQUIRED,
          "Sign in to continue.",
        );
        return;
      }

      this.logger.warn(`Unhandled HTTP exception with status ${status}.`);
      sendError(
        response,
        HttpStatus.INTERNAL_SERVER_ERROR,
        ERROR_CODE.INTERNAL_ERROR,
        "The request could not be completed.",
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
