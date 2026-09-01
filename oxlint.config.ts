export default {
  categories: {
    correctness: "error",
    suspicious: "error",
  },
  ignorePatterns: [
    "**/dist/**",
    "**/coverage/**",
    "node_modules/**",
    "playwright-report/**",
    "test-results/**",
  ],
  rules: {
    "typescript/no-extraneous-class": ["error", { allowWithDecorator: true }],
  },
};
