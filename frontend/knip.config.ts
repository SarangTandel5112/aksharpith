import type { KnipConfig } from "knip";

const config: KnipConfig = {
  next: true, // enables Next.js plugin (auto-detects pages, layouts, etc.)
  entry: [
    "src/app/**/{page,layout,loading,error,not-found,route}.tsx",
    "src/app/**/{page,layout,loading,error,not-found,route}.ts",
    "src/app/api/**/*.ts",
  ],
  project: ["src/**/*.{ts,tsx}"],
  ignore: [
    // Test infrastructure — fixtures and helpers are used dynamically
    "src/__tests__/fixtures/**",
  ],
  ignoreDependencies: [
    // Peer dependency — used via CSS, not JS imports
    "tailwindcss",
    // shadcn is a CLI tool (npx shadcn add ...), not a runtime import
    "shadcn",
    // @playwright/test is the actual import — playwright is the browser binary
    "playwright",
  ],
  ignoreExportsUsedInFile: true,
};

export default config;
