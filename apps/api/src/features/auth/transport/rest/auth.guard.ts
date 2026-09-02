import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { ERROR_CODE } from "@habit-shaper/contracts";

import { AppError } from "../../../../common/errors/app-error";
import { TokenService } from "../../application/token.service";
import { AUTH_POLICY } from "../../auth-policy";

@Injectable()
export class AuthGuard implements CanActivate {
  public constructor(private readonly tokens: TokenService) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      cookies?: Record<string, unknown>;
      userId?: unknown;
    }>();
    const cookie = request.cookies?.[AUTH_POLICY.cookie.name];
    const userId =
      typeof cookie === "string" ? await this.tokens.verify(cookie) : null;

    if (!userId) {
      throw new AppError(
        401,
        ERROR_CODE.AUTHENTICATION_REQUIRED,
        "Sign in to continue.",
      );
    }

    request.userId = userId;
    return true;
  }
}
