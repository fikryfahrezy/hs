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
  return useQuery({
    queryKey: habitQueryKeys.all,
    queryFn: ({ signal }) => listHabits({ signal }),
  });
}

type CreateHabitMutationParams = {
  input: CreateHabitRequest;
};

export function useCreateHabitMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (params: CreateHabitMutationParams) => createHabit(params),
    onSuccess: () => client.invalidateQueries({ queryKey: habitQueryKeys.all }),
  });
}

type DeleteHabitMutationParams = {
  id: string;
};

export function useDeleteHabitMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (params: DeleteHabitMutationParams) => deleteHabit(params),
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: habitQueryKeys.all }),
        client.invalidateQueries({ queryKey: goalQueryKeys.all }),
      ]);
    },
  });
}

type CompletionMutationParams = {
  habitId: string;
  date: string;
  present: boolean;
};

export function useCompletionMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (params: CompletionMutationParams) => setCompletion(params),
    onSuccess: () => client.invalidateQueries({ queryKey: habitQueryKeys.all }),
  });
}

type RelapseMutationParams = {
  habitId: string;
};

export function useRelapseMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (params: RelapseMutationParams) => recordRelapse(params),
    onSuccess: () => client.invalidateQueries({ queryKey: habitQueryKeys.all }),
  });
}
