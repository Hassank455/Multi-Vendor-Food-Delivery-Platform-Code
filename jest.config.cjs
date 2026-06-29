/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",

  // Keep test discovery inside the application source tree.
  roots: ["<rootDir>/src"],

  // Separate unit and integration tests by filename convention.
  testMatch: ["**/*.unit.spec.ts", "**/*.int.spec.ts"],

  transform: {
    // Let Jest execute TypeScript files through ts-jest.
    "^.+\\.ts$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.test.json" }],
  },

  moduleFileExtensions: ["ts", "js", "json"],
  clearMocks: true,
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],

  // Testcontainers startup can take longer than fast unit tests.
  testTimeout: 30000,
};
