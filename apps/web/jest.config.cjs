module.exports = {
  clearMocks: true,
  collectCoverageFrom: ["src/**/*.{ts,tsx}", "!src/index.tsx"],
  coverageDirectory: "coverage",
  moduleNameMapper: {
    "^#app/(.*)$": "<rootDir>/src/$1",
    "^@habit-shaper/contracts$":
      "<rootDir>/../../packages/contracts/src/index.ts",
    "^@test/(.*)$": "<rootDir>/test/$1",
    "\\.(css|less|scss|sass)$": "<rootDir>/test/style-mock.cjs",
  },
  rootDir: ".",
  setupFilesAfterEnv: ["<rootDir>/test/setup-tests.ts"],
  testEnvironment: "jsdom",
  testMatch: ["<rootDir>/src/**/*.test.{ts,tsx}"],
  watchman: false,
  transform: {
    "^.+\\.[tj]sx?$": "babel-jest",
  },
};
