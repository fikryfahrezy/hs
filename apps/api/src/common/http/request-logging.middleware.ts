import { randomUUID } from "node:crypto";

import { Logger, type NestMiddleware } from "@nestjs/common";
import { type NextFunction, type Request, type Response } from "express";

export class RequestLoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger("HTTP");

  public use(request: Request, response: Response, next: NextFunction): void {
    const requestId = randomUUID();
    const startedAt = performance.now();
    response.setHeader("Cache-Control", "no-store");
    response.setHeader("X-Request-ID", requestId);

    response.once("finish", () => {
      const route = request.route?.path as string | undefined;
      this.logger.log(
        JSON.stringify({
          request_id: requestId,
          method: request.method,
          route: route ? `${request.baseUrl}${route}` : request.path,
          status: response.statusCode,
          duration_ms: Math.round((performance.now() - startedAt) * 10) / 10,
        }),
      );
    });

    next();
  }
}
