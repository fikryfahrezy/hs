module.exports = {
  clearMocks: true,
  moduleFileExtensions: ["js", "json", "ts"],
  moduleNameMapper: {
    "^#app/(.*)$": "<rootDir>/src/$1",
    "^@habit-shaper/contracts$":
      "<rootDir>/../../packages/contracts/src/index.ts",
  },
  rootDir: ".",
  setupFiles: ["<rootDir>/test/support/set-test-env.ts"],
  testEnvironment: "node",
  testMatch: ["<rootDir>/test/integration/**/*.integration.test.ts"],
  watchman: false,
  transform: {
    "^.+\\.ts$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.test.json" }],
  },
};
