import { randomBytes } from "node:crypto";

import { Injectable } from "@nestjs/common";
import { argon2id, hash, verify } from "argon2";

@Injectable()
export class PasswordService {
  public hash(password: string): Promise<string> {
    return hash(password, {
      type: argon2id,
      hashLength: 32,
      memoryCost: 19_456,
      timeCost: 2,
      parallelism: 1,
      salt: randomBytes(16),
    });
  }

  public verify(passwordHash: string, password: string): Promise<boolean> {
    return verify(passwordHash, password);
  }
}
