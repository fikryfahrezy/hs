const CANONICAL_UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export function uuidToBinary(uuid: string): Buffer {
  if (!CANONICAL_UUID_PATTERN.test(uuid)) {
    throw new TypeError("Expected a canonical lowercase UUID.");
  }

  return Buffer.from(uuid.replaceAll("-", ""), "hex");
}

export function binaryToUuid(value: Buffer): string {
  if (value.length !== 16) {
    throw new TypeError("Expected a 16-byte UUID buffer.");
  }

  const hex = value.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
