import { type GoalResponse } from "@habit-shaper/contracts";

export class GoalResponseDto implements GoalResponse {
  public readonly id: string;
  public readonly habit: GoalResponse["habit"];
  public readonly title: string;
  public readonly description: string | null;
  public readonly created_at: string;
  public readonly updated_at: string;

  public constructor(response: GoalResponse) {
    this.id = response.id;
    this.habit = response.habit;
    this.title = response.title;
    this.description = response.description;
    this.created_at = response.created_at;
    this.updated_at = response.updated_at;
  }
}
