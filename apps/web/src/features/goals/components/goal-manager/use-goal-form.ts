import { zodResolver } from "@hookform/resolvers/zod";
import {
  CreateGoalRequestSchema,
  type CreateGoalRequest,
} from "@habit-shaper/contracts";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { type Habit } from "#app/features/habits/habit.types";
import { ApiError } from "#app/lib/api-client";
import { type Goal } from "../../goal.types";
import {
  useCreateGoalMutation,
  useUpdateGoalMutation,
} from "../../queries/goal-queries";

export function mutationMessage(error: unknown): string {
  return error instanceof ApiError
    ? error.message
    : "We could not save that change. Try again.";
}

export function useGoalForm(habits: Habit[]) {
  const creation = useCreateGoalMutation();
  const update = useUpdateGoalMutation();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    setFocus,
    formState: { errors },
  } = useForm<CreateGoalRequest>({
    resolver: zodResolver(CreateGoalRequestSchema),
    defaultValues: {
      habit_id: habits[0]?.id ?? "",
      title: "",
      description: "",
    },
  });

  useEffect(() => {
    if (!editingId && habits[0]) {
      reset({ habit_id: habits[0].id, title: "", description: "" });
    }
  }, [editingId, habits, reset]);

  const finishEditing = () => {
    setEditingId(null);
    reset({ habit_id: habits[0]?.id ?? "", title: "", description: "" });
  };

  const edit = (goal: Goal) => {
    setEditingId(goal.id);
    reset({
      habit_id: goal.habit.id,
      title: goal.title,
      description: goal.description ?? "",
    });
    setTimeout(() => setFocus("title"), 0);
  };

  const submit = handleSubmit(async (input) => {
    setAnnouncement("");
    try {
      if (editingId) {
        await update.mutateAsync({ id: editingId, input });
        setAnnouncement("Goal updated.");
      } else {
        await creation.mutateAsync({ input });
        setAnnouncement("Goal added.");
      }
      finishEditing();
    } catch {
      // Mutation feedback remains visible and recoverable input is preserved.
    }
  });

  return {
    register,
    errors,
    editingId,
    announcement,
    setAnnouncement,
    finishEditing,
    edit,
    submit,
    saving: creation.isPending || update.isPending,
    mutationError: creation.error ?? update.error,
  };
}
