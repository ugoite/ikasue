import { defineConfig } from "vitest/config";

export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",
      name: "Ikasue",
      fileName: (format) => `ikasue.${format}.js`,
      formats: ["es"],
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
