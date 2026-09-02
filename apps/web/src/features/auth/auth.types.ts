import { responseRecord, responseString } from "../../lib/response-value";

export class SessionUser {
  public readonly id: string;
  public readonly email: string;
  public readonly timezone: string;
  public readonly createdAt: string;

  private constructor(response: Record<string, unknown>) {
    this.id = responseString(response.id, "unknown-user");
    this.email = responseString(response.email, "Unknown");
    this.timezone = responseString(response.timezone, "UTC");
    this.createdAt = responseString(response.created_at, "");
  }

  public static fromApi(response: unknown): SessionUser {
    return new SessionUser(responseRecord(response));
  }
}
