import { cleanStreak } from "./break-tracking";

describe("clean streak", () => {
  it("starts at one on the day it's created", () => {
    expect(cleanStreak("2026-09-02", "2026-09-02", null)).toBe(1);
  });

  it("counts clean days since creation when never relapsed", () => {
    expect(cleanStreak("2026-09-02", "2026-09-03", null)).toBe(2);
    expect(cleanStreak("2026-09-02", "2026-09-05", null)).toBe(4);
  });

  it("resets to zero when a relapse is recorded today", () => {
    expect(cleanStreak("2026-09-02", "2026-09-02", "2026-09-02")).toBe(0);
  });

  it("counts clean days after the latest relapse", () => {
    expect(cleanStreak("2026-09-02", "2026-09-03", "2026-09-02")).toBe(1);
    expect(cleanStreak("2026-09-02", "2026-09-05", "2026-09-02")).toBe(3);
  });
});
