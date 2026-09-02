import {
  type CreateGoalRequest,
  type UpdateGoalRequest,
} from "@habit-shaper/contracts";

import { requestJson } from "#app/lib/api-client";
import { goalFromApi, type Goal } from "../goal.types";

const GOALS_ENDPOINT = "/api/goals";

export async function listGoals(): Promise<Goal[]> {
  const response = await requestJson(GOALS_ENDPOINT);
  return Array.isArray(response)
    ? response.map((goal, index) => goalFromApi(goal, index))
    : [];
}

export async function createGoal(input: CreateGoalRequest): Promise<Goal> {
  return goalFromApi(
    await requestJson(GOALS_ENDPOINT, { method: "POST", body: input }),
  );
}

export async function updateGoal(
  id: string,
  input: UpdateGoalRequest,
): Promise<Goal> {
  return goalFromApi(
    await requestJson(`${GOALS_ENDPOINT}/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: input,
    }),
  );
}

export async function deleteGoal(id: string): Promise<void> {
  await requestJson(`${GOALS_ENDPOINT}/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
