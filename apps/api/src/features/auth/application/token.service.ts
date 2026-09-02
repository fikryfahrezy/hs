import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

import { AUTH_POLICY } from "../auth-policy";

@Injectable()
export class TokenService {
  public constructor(private readonly jwtService: JwtService) {}

  public sign(userId: string): Promise<string> {
    return this.jwtService.signAsync(
      {},
      {
        algorithm: AUTH_POLICY.token.algorithm,
        audience: AUTH_POLICY.token.audience,
        expiresIn: AUTH_POLICY.token.lifetimeSeconds,
        issuer: AUTH_POLICY.token.issuer,
        subject: userId,
      },
    );
  }

  public async verify(token: string): Promise<string | null> {
    try {
      const payload = await this.jwtService.verifyAsync<{ sub?: unknown }>(
        token,
        {
          algorithms: [AUTH_POLICY.token.algorithm],
          audience: AUTH_POLICY.token.audience,
          issuer: AUTH_POLICY.token.issuer,
        },
      );

      return typeof payload.sub === "string" ? payload.sub : null;
    } catch {
      return null;
    }
  }
}
