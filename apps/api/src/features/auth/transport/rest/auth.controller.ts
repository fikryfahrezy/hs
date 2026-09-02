import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from "@nestjs/common";
import {
  LoginRequestSchema,
  RegisterRequestSchema,
} from "@habit-shaper/contracts";
import { type Response } from "express";

import { parseSchema } from "#app/common/validation/parse-schema";
import { getAppConfig } from "#app/config/app-config";
import { AuthService } from "../../application/auth.service";
import { TokenService } from "../../application/token.service";
import { AUTH_POLICY } from "../../auth-policy";
import { UserResponseDto } from "../../dto/user-response.dto";
import { AuthGuard } from "./auth.guard";
import { CurrentUserId } from "./current-user-id";

function cookieOptions() {
  return {
    httpOnly: AUTH_POLICY.cookie.httpOnly,
    maxAge: AUTH_POLICY.cookie.maxAgeMs,
    path: AUTH_POLICY.cookie.path,
    sameSite: AUTH_POLICY.cookie.sameSite,
    secure: getAppConfig().cookieSecure,
  };
}

@Controller("auth")
export class AuthController {
  public constructor(
    private readonly auth: AuthService,
    private readonly tokens: TokenService,
  ) {}

  @Post("register")
  public async register(
    @Body() body: unknown,
    @Res({ passthrough: true }) response: Response,
  ): Promise<UserResponseDto> {
    const input = parseSchema(RegisterRequestSchema, body);
    const user = await this.auth.register(input);
    response.cookie(
      AUTH_POLICY.cookie.name,
      await this.tokens.sign(user.id),
      cookieOptions(),
    );
    return user;
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  public async login(
    @Body() body: unknown,
    @Res({ passthrough: true }) response: Response,
  ): Promise<UserResponseDto> {
    const input = parseSchema(LoginRequestSchema, body);
    const user = await this.auth.login(input.email, input.password);
    response.cookie(
      AUTH_POLICY.cookie.name,
      await this.tokens.sign(user.id),
      cookieOptions(),
    );
    return user;
  }

  @Post("logout")
  @HttpCode(HttpStatus.NO_CONTENT)
  public logout(@Res({ passthrough: true }) response: Response): void {
    response.clearCookie(AUTH_POLICY.cookie.name, cookieOptions());
  }

  @Get("me")
  @UseGuards(AuthGuard)
  public me(@CurrentUserId() userId: string): Promise<UserResponseDto> {
    return this.auth.getUser(userId);
  }
}
