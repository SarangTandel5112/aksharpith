import react from "@vitejs/plugin-react";
import { config as loadDotenv } from "dotenv";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

// Load .env.local so @t3-oss/env-nextjs validation passes in test environment
loadDotenv({ path: ".env.local" });

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    setupFiles: ["./src/__tests__/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      // Only measure coverage on application source — exclude config files, scripts, test infra
      include: ["src/**"],
      thresholds: { lines: 50, functions: 50, branches: 40 },
      exclude: ["**/*.test.ts", "**/*.test.tsx", "src/__tests__/**"],
    },
  },
});
