---
description: Verify React Compiler is optimising components correctly
---

Read AGENTS.md first.

Run the following checks to verify the React Compiler
is working correctly and no manual memoisation has
been introduced.

## Step 1 — Scan for manual memoisation
Search for useMemo or useCallback that are NOT documented exceptions:

grep -r "useMemo\|useCallback" src/ \
  --include="*.ts" --include="*.tsx"

For each result check if the line above it contains a comment
starting with "// useCallback exception:" or "// useMemo exception:".

If the comment exists — it is a documented exception, skip it.
If no comment exists — it is a violation. Explain why it is wrong,
what the React Compiler will do instead, and remove it.

The only currently documented exception is:
- src/shared/hooks/useConnectivity.ts — useCallback is required
  because the function is a useEffect dependency and must have
  a stable reference across renders.

## Step 2 — Check for bail-out causes
The React Compiler cannot optimise components that:
- Mutate props or state directly
- Use ref.current during render
- Have conditional hook calls
- Use non-stable external values without proper dependencies

Search for these patterns:
grep -r "props\." src/features src/shared --include="*.tsx" -l
grep -r "\.current" src/features src/shared --include="*.tsx"

For each match, verify it does not cause a compiler bail-out.

## Step 3 — Verify no interface keyword
grep -r "^interface \|^export interface " src/ --include="*.ts" --include="*.tsx"

All results are violations — replace with `type` keyword.

## Step 4 — Check props destructuring
grep -r "function.*{.*}.*:" src/features src/shared --include="*.tsx"

Any component destructuring props in the function signature
is a violation — props must be accessed as props.foo.

## Step 5 — Report
For each check report:
- How many files scanned
- How many violations found
- What was fixed
