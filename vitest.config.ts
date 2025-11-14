import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    globals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "src/env.d.ts",
        "src/db/database.types.ts",
        "**/*.config.*",
        "**/*.astro",
        "dist/",
        ".astro/",
        "e2e/",
        "src/pages/api/**",
        "src/pages/**",
        "src/layouts/**",
        "**/*.d.ts",
        "**/*.astro.*",
        "src/middleware/**",
        "**/*.types.ts",
      ],
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
