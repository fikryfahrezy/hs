import "@testing-library/jest-dom";
import { TextDecoder, TextEncoder } from "node:util";

Object.assign(globalThis, { TextDecoder, TextEncoder });

afterEach(() => {
  jest.restoreAllMocks();
});
