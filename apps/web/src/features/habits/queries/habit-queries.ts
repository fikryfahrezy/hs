import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type CreateHabitRequest } from "@habit-shaper/contracts";
import {
  createHabit,
  deleteHabit,
  listHabits,
  recordRelapse,
  setCompletion,
} from "../api/habits-api";
import { goalQueryKeys } from "#app/features/goals/queries/goal-queries";

export const habitQueryKeys = { all: ["habits"] as const };

export function useHabitsQuery() {
  return useQuery({ queryKey: habitQueryKeys.all, queryFn: listHabits });
}

export function useCreateHabitMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateHabitRequest) => createHabit(input),
    onSuccess: () => client.invalidateQueries({ queryKey: habitQueryKeys.all }),
  });
}

export function useDeleteHabitMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: deleteHabit,
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: habitQueryKeys.all }),
        client.invalidateQueries({ queryKey: goalQueryKeys.all }),
      ]);
    },
  });
}

export function useCompletionMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: { habitId: string; date: string; present: boolean }) =>
      setCompletion(input.habitId, input.date, input.present),
    onSuccess: () => client.invalidateQueries({ queryKey: habitQueryKeys.all }),
  });
}

export function useRelapseMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: recordRelapse,
    onSuccess: () => client.invalidateQueries({ queryKey: habitQueryKeys.all }),
  });
}
