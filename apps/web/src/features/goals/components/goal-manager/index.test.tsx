import { screen, waitFor, within } from "@test/test-utils";
import { render, userEvent } from "@test/test-utils";

import { BuildHabit } from "#app/features/habits/habit.types";
import { GoalManager } from ".";

const habitId = "186b3c50-9a9e-4802-b167-bbbd71632d4a";
const goalId = "7f269562-bb36-4bd7-8f0d-173835568dbe";
const habit = new BuildHabit(
  {
    id: habitId,
    name: "Read",
    type: "build",
    start_date: "2026-09-02",
    created_at: "2026-09-02T00:00:00.000Z",
    updated_at: "2026-09-02T00:00:00.000Z",
    tracking: { current_streak: 0, week: { days: [] } },
  },
  0,
);

function response(body?: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

function goal(title: string) {
  return {
    id: goalId,
    habit: { id: habitId, name: "Read", type: "build" },
    title,
    description: "Ten pages after breakfast.",
    created_at: "2026-09-02T00:00:00.000Z",
    updated_at: "2026-09-02T00:00:00.000Z",
  };
}

describe("GoalManager", () => {
  it.each(["editing", "other", "failed"])(
    "handles deletion of an %s goal while the edit form is open",
    async (scenario) => {
      const otherGoalId = "65e77827-6cac-4304-a4d9-5b9a2eaeb0cd";
      let storedGoals = [
        goal("Read every day"),
        { ...goal("Another goal"), id: otherGoalId },
      ];
      const fetchSpy = jest
        .spyOn(globalThis, "fetch")
        .mockImplementation(async (url, options) => {
          const method = options?.method ?? "GET";
          if (method === "GET") {
            return response(storedGoals);
          }
          if (method === "DELETE") {
            if (scenario === "failed") {
              return response(undefined, 500);
            }
            const deletedId = String(url).split("/").at(-1);
            storedGoals = storedGoals.filter((item) => item.id !== deletedId);
            return response(undefined, 204);
          }
          if (method === "POST") {
            return response(goal("A fresh goal"), 201);
          }
          throw new Error(`Unexpected request: ${method} ${String(url)}`);
        });
      const user = userEvent.setup();
      render(<GoalManager habits={[habit]} />);

      const heading = await screen.findByRole("heading", {
        name: "Read every day",
      });
      await user.click(
        within(heading.closest("article")!).getByRole("button", {
          name: "Edit",
        }),
      );
      expect(screen.getByLabelText("Title")).toHaveValue("Read every day");
      expect(screen.getByLabelText("Description (optional)")).toHaveValue(
        "Ten pages after breakfast.",
      );
      const deletingTitle =
        scenario === "other" ? "Another goal" : "Read every day";
      const card = screen
        .getByRole("heading", { name: deletingTitle })
        .closest("article")!;
      await user.click(within(card).getByRole("button", { name: "Delete" }));
      await user.click(
        within(card).getByRole("button", { name: "Confirm delete" }),
      );

      if (scenario === "failed") {
        expect(
          await screen.findByText("Could not delete this goal. Try again."),
        ).toBeVisible();
      } else {
        await waitFor(() =>
          expect(
            screen.queryByRole("heading", { name: deletingTitle }),
          ).not.toBeInTheDocument(),
        );
        expect(screen.getByText("Goal deleted.")).toBeInTheDocument();
      }

      if (scenario === "editing") {
        expect(screen.getByLabelText("Title")).toHaveValue("");
        expect(screen.getByLabelText("Description (optional)")).toHaveValue("");
        expect(screen.getByLabelText("Habit")).toHaveValue(habitId);
        expect(screen.getByRole("button", { name: "Add goal" })).toBeVisible();
        expect(
          screen.queryByRole("button", { name: "Save goal" }),
        ).not.toBeInTheDocument();
        expect(
          screen.queryByRole("button", { name: "Cancel editing" }),
        ).not.toBeInTheDocument();

        await user.type(screen.getByLabelText("Title"), "A fresh goal");
        await user.click(screen.getByRole("button", { name: "Add goal" }));
        await waitFor(() =>
          expect(fetchSpy).toHaveBeenCalledWith(
            expect.stringContaining("/goals"),
            expect.objectContaining({ method: "POST" }),
          ),
        );
      } else {
        expect(screen.getByLabelText("Title")).toHaveValue("Read every day");
        expect(screen.getByLabelText("Description (optional)")).toHaveValue(
          "Ten pages after breakfast.",
        );
        expect(screen.getByRole("button", { name: "Save goal" })).toBeVisible();
      }
    },
  );

  it("shows validation and does not submit an empty title", async () => {
    const fetchSpy = jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(response([]));
    const user = userEvent.setup();
    render(<GoalManager habits={[habit]} />);

    await screen.findByText("No goals yet. Link one to a daily habit.");
    await user.click(screen.getByRole("button", { name: "Add goal" }));

    expect(await screen.findByText("Enter a goal title.")).toBeVisible();
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("edits and deletes a goal with confirmation", async () => {
    let storedGoal: ReturnType<typeof goal> | null = goal("Read every day");
    jest.spyOn(globalThis, "fetch").mockImplementation(async (url, options) => {
      const method = options?.method ?? "GET";
      if (method === "GET") {
        return response(storedGoal ? [storedGoal] : []);
      }
      if (method === "PATCH") {
        const input = JSON.parse(String(options?.body)) as { title: string };
        storedGoal = goal(input.title);
        return response(storedGoal);
      }
      if (method === "DELETE") {
        storedGoal = null;
        return response(undefined, 204);
      }
      throw new Error(`Unexpected request: ${method} ${String(url)}`);
    });
    const user = userEvent.setup();
    render(<GoalManager habits={[habit]} />);

    const original = await screen.findByRole("heading", {
      name: "Read every day",
    });
    const card = original.closest("article");
    expect(card).not.toBeNull();
    await user.click(within(card!).getByRole("button", { name: "Edit" }));
    const title = screen.getByLabelText("Title");
    await user.clear(title);
    await user.type(title, "Read with focus");
    await user.click(screen.getByRole("button", { name: "Save goal" }));

    expect(
      await screen.findByRole("heading", { name: "Read with focus" }),
    ).toBeVisible();
    const updatedCard = screen
      .getByRole("heading", { name: "Read with focus" })
      .closest("article");
    await user.click(
      within(updatedCard!).getByRole("button", { name: "Delete" }),
    );
    await user.click(
      within(updatedCard!).getByRole("button", { name: "Confirm delete" }),
    );

    await waitFor(() =>
      expect(
        screen.queryByRole("heading", { name: "Read with focus" }),
      ).not.toBeInTheDocument(),
    );
  });
});
