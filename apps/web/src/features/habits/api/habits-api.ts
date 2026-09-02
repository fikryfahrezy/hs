import { type CreateHabitRequest } from "@habit-shaper/contracts";

import { requestJson } from "#app/lib/api-client";
import { habitFromApi, type Habit } from "../habit.types";

const HABITS_ENDPOINT = "/api/habits";

export async function listHabits(): Promise<Habit[]> {
  const response = await requestJson(HABITS_ENDPOINT);
  return Array.isArray(response) ? response.map(habitFromApi) : [];
}

export async function createHabit(input: CreateHabitRequest): Promise<Habit> {
  return habitFromApi(
    await requestJson(HABITS_ENDPOINT, { method: "POST", body: input }),
  );
}

export async function deleteHabit(id: string): Promise<void> {
  await requestJson(`${HABITS_ENDPOINT}/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export async function setCompletion(
  habitId: string,
  date: string,
  present: boolean,
): Promise<Habit> {
  return habitFromApi(
    await requestJson(
      `${HABITS_ENDPOINT}/${encodeURIComponent(habitId)}/completions/${encodeURIComponent(date)}`,
      {
        method: present ? "PUT" : "DELETE",
      },
    ),
  );
}

export async function recordRelapse(habitId: string): Promise<Habit> {
  return habitFromApi(
    await requestJson(
      `${HABITS_ENDPOINT}/${encodeURIComponent(habitId)}/relapses`,
      { method: "POST" },
    ),
  );
}
