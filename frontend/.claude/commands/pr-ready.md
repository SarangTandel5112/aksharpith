---
description: Final pre-PR gate — runs every check in sequence, nothing ships broken
---

Read CLAUDE.md first.

Run every check below in order.
Stop on first failure and fix it before continuing.
Only say "Ready to raise PR ✓" when ALL checks are green.

## Gate 1 — TypeScript

```bash
npm run type-check
```

Must exit 0.
If it fails → fix every error shown → re-run → confirm clean.

## Gate 2 — Lint

```bash
npm run lint
```

Must exit with zero warnings (--max-warnings 0).
If it fails → fix every warning → re-run → confirm clean.

## Gate 3 — Tests

```bash
npm test
```

Must be 100% passing. Zero failures, zero skipped.
If any fail → fix them → re-run → confirm all green.
Report: "X tests passing across Y files"

## Gate 4 — Architecture Boundaries

```bash
npm run check:arch
```

Must exit 0.
If it fails → identify which import violates which boundary → fix it.

## Gate 5 — Dead Code (informational)

```bash
npx knip
```

Do NOT fail on existing knip warnings.
ONLY fail if new unused exports were introduced by this branch.
Compare: `git diff main -- knip output` to find new additions.

## Gate 6 — Review Checklist

Run the /review command.
All items must be PASS or N/A.
Any FAIL = stop, fix, re-run.

## Gate 7 — React Compiler Check

Run the /react-check command.
Zero violations allowed.

## Final Summary

Print this table:

| Gate                  | Status | Notes                    |
|-----------------------|--------|--------------------------|
| TypeScript            | ✅/❌  |                          |
| Lint                  | ✅/❌  |                          |
| Tests                 | ✅/❌  | X passing / Y files      |
| Architecture          | ✅/❌  |                          |
| Dead code (new only)  | ✅/❌  |                          |
| Review checklist      | ✅/❌  |                          |
| React Compiler        | ✅/❌  |                          |

If ALL green:
"✅ Ready to raise PR. All 7 gates passed."

If ANY red:
"❌ Not ready. Fix the issues above before raising PR."
