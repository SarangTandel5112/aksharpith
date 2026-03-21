// ESLint is used exclusively for eslint-plugin-sonarjs code quality rules.
// Biome handles formatting and standard linting.

import tsParser from "@typescript-eslint/parser";
import sonarjs from "eslint-plugin-sonarjs";

export default [
  {
    files: ["src/**/*.ts", "src/**/*.tsx"],
    ignores: [
      "src/__tests__/**",
      "**/*.test.ts",
      "**/*.test.tsx",
      "**/*.types.ts",
      "**/*.d.ts",
    ],
    plugins: { sonarjs },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    rules: {
      // ── Bugs & correctness ──────────────────────────────────────────────
      "sonarjs/no-all-duplicated-branches": "error",
      "sonarjs/no-element-overwrite": "error",
      "sonarjs/no-identical-conditions": "error",
      "sonarjs/no-identical-expressions": "error",
      "sonarjs/no-use-of-empty-return-value": "error",
      "sonarjs/no-collection-size-mischeck": "error",
      "sonarjs/no-unthrown-error": "error",

      // ── Code smells / complexity (SRP indicators) ───────────────────────
      "sonarjs/cognitive-complexity": ["warn", 15],
      "sonarjs/no-collapsible-if": "warn",
      "sonarjs/no-duplicate-string": ["warn", { threshold: 4 }],
      "sonarjs/no-identical-functions": "warn",
      "sonarjs/no-inverted-boolean-check": "warn",
      "sonarjs/no-nested-switch": "warn",
      "sonarjs/no-redundant-boolean": "warn",
      "sonarjs/no-redundant-jump": "warn",
      "sonarjs/no-same-line-conditional": "warn",
      "sonarjs/no-small-switch": "warn",
      "sonarjs/prefer-immediate-return": "warn",
      "sonarjs/prefer-single-boolean-return": "warn",
      "sonarjs/no-nested-conditional": "warn",
      "sonarjs/no-duplicated-branches": "warn",
    },
  },
];
