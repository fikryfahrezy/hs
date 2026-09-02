import "@testing-library/jest-dom";
import { TextDecoder, TextEncoder } from "node:util";

Object.assign(globalThis, { TextDecoder, TextEncoder, fetch: jest.fn() });

afterEach(() => {
  jest.mocked(globalThis.fetch).mockReset();
  jest.restoreAllMocks();
});
