import { type CreateHabitRequest } from "@habit-shaper/contracts";

import { requestJson } from "#app/lib/api-client";
import { habitFromApi, type Habit } from "../habit.types";

const HABITS_ENDPOINT = "/api/habits";

type ListHabitsOptions = {
  signal?: AbortSignal;
};

export async function listHabits({ signal }: ListHabitsOptions = {}): Promise<
  Habit[]
> {
  const response = await requestJson(HABITS_ENDPOINT, { signal });
  return Array.isArray(response) ? response.map(habitFromApi) : [];
}

type CreateHabitParams = {
  input: CreateHabitRequest;
};

export async function createHabit({
  input,
}: CreateHabitParams): Promise<Habit> {
  return habitFromApi(
    await requestJson(HABITS_ENDPOINT, { method: "POST", body: input }),
  );
}

type DeleteHabitParams = {
  id: string;
};

export async function deleteHabit({ id }: DeleteHabitParams): Promise<void> {
  await requestJson(`${HABITS_ENDPOINT}/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

type SetCompletionParams = {
  habitId: string;
  date: string;
  present: boolean;
};

export async function setCompletion({
  habitId,
  date,
  present,
}: SetCompletionParams): Promise<Habit> {
  return habitFromApi(
    await requestJson(
      `${HABITS_ENDPOINT}/${encodeURIComponent(habitId)}/completions/${encodeURIComponent(date)}`,
      {
        method: present ? "PUT" : "DELETE",
      },
    ),
  );
}

type RecordRelapseParams = {
  habitId: string;
};

export async function recordRelapse({
  habitId,
}: RecordRelapseParams): Promise<Habit> {
  return habitFromApi(
    await requestJson(
      `${HABITS_ENDPOINT}/${encodeURIComponent(habitId)}/relapses`,
      { method: "POST" },
    ),
  );
}
