import {
  type BreakHabitResponse,
  type BuildHabitResponse,
} from "@habit-shaper/contracts";

export class BuildHabitResponseDto implements BuildHabitResponse {
  public readonly id: string;
  public readonly name: string;
  public readonly type: BuildHabitResponse["type"];
  public readonly start_date: string;
  public readonly created_at: string;
  public readonly updated_at: string;
  public readonly tracking: BuildHabitResponse["tracking"];

  public constructor(response: BuildHabitResponse) {
    this.id = response.id;
    this.name = response.name;
    this.type = response.type;
    this.start_date = response.start_date;
    this.created_at = response.created_at;
    this.updated_at = response.updated_at;
    this.tracking = response.tracking;
  }
}

export class BreakHabitResponseDto implements BreakHabitResponse {
  public readonly id: string;
  public readonly name: string;
  public readonly type: BreakHabitResponse["type"];
  public readonly start_date: string;
  public readonly created_at: string;
  public readonly updated_at: string;
  public readonly tracking: BreakHabitResponse["tracking"];

  public constructor(response: BreakHabitResponse) {
    this.id = response.id;
    this.name = response.name;
    this.type = response.type;
    this.start_date = response.start_date;
    this.created_at = response.created_at;
    this.updated_at = response.updated_at;
    this.tracking = response.tracking;
  }
}

export type HabitResponseDto = BuildHabitResponseDto | BreakHabitResponseDto;
