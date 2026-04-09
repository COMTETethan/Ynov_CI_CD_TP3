import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.js"],
    coverage: {
      provider: "istanbul",
      all: true,
      include: ["src/**/*.js"],
      exclude: ["node_modules", "tests"],
      reporter: ["text", "lcov"],
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
      thresholdAutoUpdate: false,
    },
    testTimeout: 20000,
  },
});
