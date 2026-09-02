import { HABIT_TYPE, type HabitType } from "@habit-shaper/contracts";

import { responseRecord, responseString } from "#app/lib/response-value";

export class Goal {
  public readonly id: string;
  public readonly habit: {
    id: string;
    name: string;
    type: HabitType;
  };
  public readonly title: string;
  public readonly description: string | null;
  public readonly createdAt: string;
  public readonly updatedAt: string;

  public constructor(response: unknown, index = 0) {
    const goal = responseRecord(response);
    const habit = responseRecord(goal.habit);
    this.id = responseString(goal.id, `unknown-goal-${index}`);
    this.habit = {
      id: responseString(habit.id, ""),
      name: responseString(habit.name, "Unknown habit"),
      type:
        habit.type === HABIT_TYPE.BREAK ? HABIT_TYPE.BREAK : HABIT_TYPE.BUILD,
    };
    this.title = responseString(goal.title, "Untitled goal");
    this.description =
      goal.description === null
        ? null
        : responseString(goal.description, "") || null;
    this.createdAt = responseString(goal.created_at, "");
    this.updatedAt = responseString(goal.updated_at, "");
  }
}

export function goalFromApi(response: unknown, index = 0): Goal {
  return new Goal(response, index);
}
