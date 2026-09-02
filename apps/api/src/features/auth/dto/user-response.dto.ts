import { type UserResponse } from "@habit-shaper/contracts";

export class UserResponseDto implements UserResponse {
  public readonly id: string;
  public readonly email: string;
  public readonly timezone: string;
  public readonly created_at: string;

  public constructor(response: UserResponse) {
    this.id = response.id;
    this.email = response.email;
    this.timezone = response.timezone;
    this.created_at = response.created_at;
  }
}
