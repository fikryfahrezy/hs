import {
  type CreateGoalRequest,
  type UpdateGoalRequest,
} from "@habit-shaper/contracts";

import { requestJson } from "#app/lib/api-client";
import { goalFromApi, type Goal } from "../goal.types";

const GOALS_ENDPOINT = "/api/goals";

type ListGoalsOptions = {
  signal?: AbortSignal;
};

export async function listGoals({ signal }: ListGoalsOptions = {}): Promise<
  Goal[]
> {
  const response = await requestJson(GOALS_ENDPOINT, { signal });
  return Array.isArray(response)
    ? response.map((goal, index) => goalFromApi(goal, index))
    : [];
}

type CreateGoalParams = {
  input: CreateGoalRequest;
};

export async function createGoal({ input }: CreateGoalParams): Promise<Goal> {
  return goalFromApi(
    await requestJson(GOALS_ENDPOINT, { method: "POST", body: input }),
  );
}

type UpdateGoalParams = {
  id: string;
  input: UpdateGoalRequest;
};

export async function updateGoal({
  id,
  input,
}: UpdateGoalParams): Promise<Goal> {
  return goalFromApi(
    await requestJson(`${GOALS_ENDPOINT}/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: input,
    }),
  );
}

type DeleteGoalParams = {
  id: string;
};

export async function deleteGoal({ id }: DeleteGoalParams): Promise<void> {
  await requestJson(`${GOALS_ENDPOINT}/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
