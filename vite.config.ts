import { defineConfig } from "vitest/config";

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: "src/index.ts",
        elements: "src/elements.ts",
        view: "src/view.ts",
        contract: "src/contract.ts",
      },
      name: "Ikasue",
      fileName: (format, entryName) =>
        entryName === "index"
          ? `ikasue.${format}.js`
          : `ikasue-${entryName}.${format}.js`,
      formats: ["es"],
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
