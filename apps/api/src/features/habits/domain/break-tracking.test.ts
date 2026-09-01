import { cleanStreak } from "./break-tracking";

describe("clean streak", () => {
  it("starts at one on the first clean day", () => {
    expect(cleanStreak("2026-09-02", "2026-09-02", null)).toBe(1);
  });

  it("resets to zero when a relapse is recorded today", () => {
    expect(cleanStreak("2026-09-02", "2026-09-02", "2026-09-02")).toBe(0);
  });

  it("counts clean days after the latest relapse", () => {
    expect(cleanStreak("2026-09-02", "2026-09-03", "2026-09-02")).toBe(1);
  });
});
