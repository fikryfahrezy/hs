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
