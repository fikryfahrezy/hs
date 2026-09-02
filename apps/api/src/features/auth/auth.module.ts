import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";

import { getAppConfig } from "../../config/app-config";
import { AuthService } from "./application/auth.service";
import { PasswordService } from "./application/password.service";
import { TokenService } from "./application/token.service";
import { AuthRepository } from "./data/auth.repository";
import { AuthController } from "./transport/rest/auth.controller";
import { AuthGuard } from "./transport/rest/auth.guard";

@Module({
  imports: [JwtModule.register({ secret: getAppConfig().jwtSecret })],
  controllers: [AuthController],
  providers: [
    AuthRepository,
    AuthService,
    PasswordService,
    TokenService,
    AuthGuard,
  ],
  exports: [AuthRepository, AuthGuard],
})
export class AuthModule {}
