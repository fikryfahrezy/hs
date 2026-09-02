import {
  responseBoolean,
  responseNumber,
  responseRecord,
  responseString,
} from "./response-value";

describe("response value defaults", () => {
  it("preserves values with the expected primitive type", () => {
    expect(responseString("expected", "fallback")).toBe("expected");
    expect(responseNumber(12)).toBe(12);
    expect(responseBoolean(true)).toBe(true);
  });

  it("uses a field default without discarding neighboring data", () => {
    const response = responseRecord({ id: 123, name: "Still here" });

    expect(responseString(response.id, "unknown")).toBe("unknown");
    expect(responseString(response.name, "Untitled")).toBe("Still here");
  });
});
