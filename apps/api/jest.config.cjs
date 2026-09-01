module.exports = {
  clearMocks: true,
  collectCoverageFrom: ["src/**/*.ts", "!src/main.ts"],
  coverageDirectory: "coverage/unit",
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: ".",
  testEnvironment: "node",
  testMatch: ["<rootDir>/src/**/*.test.ts"],
  watchman: false,
  transform: {
    "^.+\\.ts$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.json" }],
  },
};
