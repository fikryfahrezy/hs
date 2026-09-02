import { randomUUID } from "node:crypto";

import { Injectable } from "@nestjs/common";
import { ERROR_CODE } from "@habit-shaper/contracts";

import { AppError } from "#app/common/errors/app-error";
import { EmailAlreadyExistsError } from "../auth.errors";
import { type AuthUser } from "../auth.types";
import { AuthRepository } from "../data/auth.repository";
import { UserResponseDto } from "../dto/user-response.dto";
import { PasswordService } from "./password.service";

@Injectable()
export class AuthService {
  public constructor(
    private readonly repository: AuthRepository,
    private readonly passwords: PasswordService,
  ) {}

  public async register(input: {
    email: string;
    password: string;
    timezone: string;
  }): Promise<UserResponseDto> {
    const passwordHash = await this.passwords.hash(input.password);

    try {
      return this.toResponse(
        await this.repository.create({
          id: randomUUID(),
          email: input.email,
          passwordHash,
          timezone: input.timezone,
        }),
      );
    } catch (error) {
      if (error instanceof EmailAlreadyExistsError) {
        throw new AppError(409, ERROR_CODE.EMAIL_ALREADY_EXISTS, error.message);
      }
      throw error;
    }
  }

  public async login(
    email: string,
    password: string,
  ): Promise<UserResponseDto> {
    const user = await this.repository.findCredentialsByEmail(email);
    const valid = user
      ? await this.passwords.verify(user.password_hash, password)
      : false;

    if (!user || !valid) {
      throw new AppError(
        401,
        ERROR_CODE.INVALID_CREDENTIALS,
        "The email or password is incorrect.",
      );
    }

    const { password_hash: _passwordHash, ...publicUser } = user;
    return this.toResponse(publicUser);
  }

  public async getUser(userId: string): Promise<UserResponseDto> {
    return this.toResponse(await this.requireUser(userId));
  }

  public async getTimezone(userId: string): Promise<string> {
    return (await this.requireUser(userId)).timezone;
  }

  private async requireUser(userId: string): Promise<AuthUser> {
    const user = await this.repository.findById(userId);
    if (!user) {
      throw new AppError(
        401,
        ERROR_CODE.AUTHENTICATION_REQUIRED,
        "Sign in to continue.",
      );
    }
    return user;
  }

  private toResponse(user: AuthUser): UserResponseDto {
    return new UserResponseDto({
      id: user.id,
      email: user.email,
      timezone: user.timezone,
      created_at: user.created_at.toISOString(),
    });
  }
}
