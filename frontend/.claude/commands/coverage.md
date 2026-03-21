# coverage — Find and Fix Test Coverage Gaps

---

## Usage

```
/coverage
```

---

## Steps to Execute

### 1. Run coverage report

```bash
npm run coverage
```

### 2. Parse the output and report

Show a table of files sorted by line coverage ascending:

| File | Lines % | Fns % | Branches % | Uncovered Lines |
|------|---------|-------|------------|-----------------|

Focus only on non-type files (skip `*.types.ts`, `*.d.ts`).
Focus only on files with real logic (skip `*.gitkeep`, barrel `index.ts`).

### 3. Identify the top 3 gaps

Pick the 3 files with the lowest coverage that have real business logic.
For each:
- Show which lines are uncovered
- Explain what scenario those lines represent
- Suggest the specific test to write to cover them

### 4. Offer to write the tests

For each gap, ask: "Should I write the test for `<filename>` now?"
If yes — follow TDD rules from `.claude/rules/03-testing.md`:
  1. Write the test first
  2. Confirm it fails
  3. If the implementation already exists, confirm the test passes

### 5. Re-run coverage after fixes

```bash
npm run coverage
```

Show before/after comparison.

---

## Coverage Thresholds (must stay above)

| Metric    | Threshold |
|-----------|-----------|
| Lines     | 50%       |
| Functions | 50%       |
| Branches  | 40%       |

If any threshold is failing — fix it before moving on to new features.

---

## Known Low-coverage Areas (baseline from foundation)

These are known gaps from the coverage baseline:

| File | Gap | Priority |
|------|-----|----------|
| `src/core/infrastructure/offline/idempotency.ts` | Lines 6-17 | High |
| `src/shared/lib/analytics.ts` | Lines 13-41 (event branches) | Medium |
| `src/core/domain/shared/value-objects.ts` | Lines 20-24 | Medium |
| `src/app/api/checkout/route.ts` | 0% — untested | High |
| `src/app/api/sync/command/route.ts` | 0% — untested | High |
| `src/features/checkout/hooks/useCartRestore.ts` | 0% — untested | Medium |
| `src/features/checkout/hooks/useQueueStatus.ts` | 0% — untested | Medium |
