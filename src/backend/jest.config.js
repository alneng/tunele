export default {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: [
    "**/tests/**/*.ts",
    "!**/tests/test-data/**/*.ts",
    "!**/tests/fixtures/**/*.ts",
  ],
};
