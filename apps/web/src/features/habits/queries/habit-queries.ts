import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type CreateHabitRequest } from "@habit-shaper/contracts";
import { createHabit, deleteHabit, listHabits } from "../api/habits-api";

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
    onSuccess: () => client.invalidateQueries({ queryKey: habitQueryKeys.all }),
  });
}
