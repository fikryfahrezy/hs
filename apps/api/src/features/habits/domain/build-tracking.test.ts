import { buildTracking, isCompletionEligible } from "./build-tracking";

describe("build tracking", () => {
  it("keeps yesterday's streak while today is pending", () => {
    const result = buildTracking({
      startDate: "2026-08-31",
      today: "2026-09-02",
      weekStart: "2026-08-31",
      completions: ["2026-08-31", "2026-09-01"],
    });

    expect(result.currentStreak).toBe(2);
    expect(result.week.completionRatePercent).toBe(100);
  });

  it("allows completion changes only for eligible current-week dates", () => {
    expect(isCompletionEligible("2026-08-31", "2026-09-02", "2026-09-01")).toBe(
      true,
    );
    expect(isCompletionEligible("2026-09-02", "2026-09-02", "2026-09-01")).toBe(
      false,
    );
    expect(isCompletionEligible("2026-08-01", "2026-09-02", "2026-08-30")).toBe(
      false,
    );
    expect(isCompletionEligible("2026-08-01", "2026-09-02", "2026-09-03")).toBe(
      false,
    );
  });
});
