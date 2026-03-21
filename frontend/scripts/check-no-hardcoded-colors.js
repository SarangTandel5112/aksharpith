#!/usr/bin/env node
/**
 * check-no-hardcoded-colors.js
 *
 * Prevents hardcoded color values in TypeScript/TSX source files.
 * All colors must come from CSS custom properties defined in globals.css,
 * referenced via Tailwind tokens or var(--...) — never as raw hex/rgb literals.
 *
 * ✅ Allowed:
 *   className="text-primary-500 bg-surface-subtle"
 *   className={cn("bg-white/10", isActive && "border-primary-500")}
 *   style={{ color: "var(--text-body)" }}
 *
 * ❌ Blocked:
 *   className="text-[#57243b]"
 *   className="bg-[rgba(87,36,59,0.04)]"
 *   style={{ color: "#6f6b7d" }}
 *   style={{ backgroundColor: "rgb(255, 255, 255)" }}
 */

const fs = require("node:fs");
const path = require("node:path");

// ── Patterns that indicate a hardcoded color ──────────────────────────────────

const PATTERNS = [
  // Tailwind arbitrary value with hex color: bg-[#fff], text-[#57243b]
  {
    re: /\w+-\[#[0-9a-fA-F]{3,8}\]/,
    message: "Tailwind arbitrary hex color",
    example: "text-[#57243b] → use text-primary-500",
  },
  // Tailwind arbitrary value with rgb/rgba: bg-[rgb(...)], hover:bg-[rgba(...)]
  {
    re: /\w+-\[rgba?\s*\(/,
    message: "Tailwind arbitrary rgb/rgba color",
    example: "bg-[rgba(87,36,59,0.04)] → use bg-primary-500/4",
  },
  // Tailwind arbitrary value with hsl: bg-[hsl(...)]
  {
    re: /\w+-\[hsla?\s*\(/,
    message: "Tailwind arbitrary hsl/hsla color",
    example: "bg-[hsl(0,0%,100%)] → use a CSS variable",
  },
  // Inline style prop with hex: style={{ color: "#fff" }} or style={{ color: '#fff' }}
  {
    re: /style=\{[^}]*:\s*["']#[0-9a-fA-F]{3,8}["']/,
    message: "Inline style with hex color",
    example:
      "style={{ color: '#57243b' }} → use style={{ color: 'var(--primary-500)' }}",
  },
  // Inline style prop with rgb/rgba: style={{ color: "rgb(...)" }}
  {
    re: /style=\{[^}]*:\s*["']rgba?\s*\(/,
    message: "Inline style with rgb/rgba color",
    example:
      "style={{ color: 'rgb(87,36,59)' }} → use style={{ color: 'var(--primary-500)' }}",
  },
];

// ── Directories and files to check ───────────────────────────────────────────

const SRC_DIR = path.join(__dirname, "..", "src");
const EXTENSIONS = new Set([".tsx", ".ts"]);

// Files/directories that are explicitly exempt
const EXEMPT_PATTERNS = [
  // Test files — we don't test color rules
  /\.test\.(tsx?|jsx?)$/,
  // Storybook stories
  /\.stories\.(tsx?|jsx?)$/,
  // Type declaration files have no runtime code
  /\.d\.ts$/,
];

function isExempt(filePath) {
  const rel = path.relative(SRC_DIR, filePath);
  return EXEMPT_PATTERNS.some((p) => p.test(rel));
}

// ── File walker ───────────────────────────────────────────────────────────────

function walk(dir, results = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Skip node_modules just in case SRC_DIR is misconfigured
      if (entry.name !== "node_modules") walk(full, results);
    } else if (EXTENSIONS.has(path.extname(entry.name))) {
      results.push(full);
    }
  }
  return results;
}

// ── Main ──────────────────────────────────────────────────────────────────────

const files = walk(SRC_DIR).filter((f) => !isExempt(f));
const violations = [];

for (const filePath of files) {
  const lines = fs.readFileSync(filePath, "utf8").split("\n");
  const rel = path.relative(path.join(__dirname, ".."), filePath);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip pure comments
    const trimmed = line.trim();
    if (trimmed.startsWith("//") || trimmed.startsWith("*")) continue;

    for (const { re, message, example } of PATTERNS) {
      if (re.test(line)) {
        violations.push({
          file: rel,
          line: i + 1,
          text: trimmed,
          message,
          example,
        });
        break; // one violation per line is enough
      }
    }
  }
}

if (violations.length === 0) {
  process.exit(0);
}

console.error("\n❌ Hardcoded color values found in source files.");
console.error(
  "   All colors must use CSS custom properties from globals.css.\n",
);

for (const v of violations) {
  console.error(`  ${v.file}:${v.line}`);
  console.error(`    ${v.message}: ${v.text.slice(0, 120)}`);
  console.error(`    Fix: ${v.example}\n`);
}

console.error(
  `${violations.length} violation(s) found.\n` +
    "Define colors in globals.css as CSS variables, then reference them\n" +
    "via Tailwind tokens (text-primary-500) or var(--token-name) in style props.\n",
);

process.exit(1);
