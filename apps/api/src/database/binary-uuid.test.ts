import { binaryToUuid, uuidToBinary } from "./binary-uuid";

describe("binary UUID conversion", () => {
  it("round trips a canonical UUID without byte swapping", () => {
    const uuid = "186b3c50-9a9e-4802-b167-bbbd71632d4a";
    expect(binaryToUuid(uuidToBinary(uuid))).toBe(uuid);
  });

  it("rejects malformed values", () => {
    expect(() => uuidToBinary("not-a-uuid")).toThrow(TypeError);
    expect(() => binaryToUuid(Buffer.alloc(15))).toThrow(TypeError);
  });
});
