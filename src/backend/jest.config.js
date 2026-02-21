export default {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@test/(.*)$": "<rootDir>/tests/$1",
  },
  testMatch: ["**/tests/**/*.ts", "!**/tests/test-data/**/*.ts", "!**/tests/fixtures/**/*.ts"],
};
