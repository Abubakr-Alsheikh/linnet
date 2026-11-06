import { fileURLToPath } from "node:url";
import mdx from "@mdx-js/rollup";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // Compiles src/content/*.mdx so tests can check content against its Zod schemas.
  plugins: [mdx()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
