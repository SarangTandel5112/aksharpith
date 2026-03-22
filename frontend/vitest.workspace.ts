import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineWorkspace } from "vitest/config";

const plugins = [react(), tsconfigPaths()];
const setupFiles = ["./src/__tests__/setup.ts"];

export default defineWorkspace([
  // ── unit ─────────────────────────────────────────────────────────────────
  // Core domain/infra/application + shared lib + app routes — no DOM needed
  {
    plugins,
    test: {
      name: "unit",
      include: [
        "src/core/**/*.test.ts",
        "src/shared/lib/**/*.test.ts",
        "src/app/**/*.test.ts",
        "src/proxy.test.ts",
      ],
      environment: "node",
      globals: true,
      setupFiles,
    },
  },

  // ── ui ───────────────────────────────────────────────────────────────────
  // React hooks and components — requires a real DOM
  {
    plugins,
    test: {
      name: "ui",
      include: [
        "src/features/**/*.test.ts",
        "src/features/**/*.test.tsx",
        "src/shared/hooks/**/*.test.ts",
        "src/shared/components/**/*.test.tsx",
        "src/app/**/*.test.tsx",
      ],
      environment: "happy-dom",
      globals: true,
      setupFiles,
    },
  },
]);
