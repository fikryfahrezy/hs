import {
  type LoginRequest,
  type RegisterRequest,
} from "@habit-shaper/contracts";

import { ApiError, requestJson } from "#app/lib/api-client";
import { SessionUser } from "../auth.types";

async function parseUser(request: Promise<unknown>): Promise<SessionUser> {
  return SessionUser.fromApi(await request);
}

export function register(input: RegisterRequest): Promise<SessionUser> {
  return parseUser(
    requestJson("/api/auth/register", { method: "POST", body: input }),
  );
}

export function login(input: LoginRequest): Promise<SessionUser> {
  return parseUser(
    requestJson("/api/auth/login", { method: "POST", body: input }),
  );
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    return await parseUser(requestJson("/api/auth/me"));
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null;
    }
    throw error;
  }
}

export async function logout(): Promise<void> {
  await requestJson("/api/auth/logout", { method: "POST" });
}
