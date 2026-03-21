---
description: Verify React Compiler compliance — no manual memoisation, no bail-outs
---

Read CLAUDE.md first.

Audit all React components and hooks for React Compiler compliance.

## Check 1 — Scan for manual memoisation

```bash
grep -rn "useMemo\|useCallback" src/ --include="*.ts" --include="*.tsx"
```

For each result:
- Check if the line ABOVE contains `// useCallback exception:` or `// useMemo exception:`
- If comment exists → documented exception → SKIP
- If no comment → VIOLATION

Currently documented exceptions:
- src/shared/hooks/useConnectivity.ts — useCallback required because
  the function is a useEffect dependency needing stable reference

Report all violations. For each:
- Show the file + line
- Explain why React Compiler makes it unnecessary
- Remove the useMemo/useCallback

## Check 2 — Find compiler bail-out causes

The React Compiler cannot optimise these patterns. Search for them:

```bash
# Direct prop mutation
grep -rn "props\.[a-z]* =" src/features src/shared --include="*.tsx"

# ref.current during render (outside useEffect/handler)
grep -rn "\.current" src/features src/shared --include="*.tsx"

# Conditional hooks
grep -rn "if.*use[A-Z]" src/features src/shared --include="*.tsx"
```

For each result, verify it does NOT cause a bail-out.
If it does → fix it → note what was changed.

## Check 3 — interface keyword

```bash
grep -rn "^interface \|^export interface " src/ --include="*.ts" --include="*.tsx"
```

Every result is a violation.
Replace with `type` keyword.
Report how many were found and fixed.

## Check 4 — Props destructuring in signatures

```bash
grep -rn "function.*({ " src/features src/shared --include="*.tsx"
grep -rn "= ({" src/features src/shared --include="*.tsx"
```

Any component destructuring props in the function signature is a violation.

Wrong:  `function ProductCard({ name, price }: Props)`
Right:  `function ProductCard(props: Props)` → access as `props.name`

Report violations and fix them.

## Check 5 — Report

| Check                    | Files Scanned | Violations Found | Fixed |
|--------------------------|---------------|------------------|-------|
| useMemo/useCallback      |               |                  |       |
| Compiler bail-outs       |               |                  |       |
| interface keyword        |               |                  |       |
| Props destructuring      |               |                  |       |

If all zero violations: "✅ React Compiler compliance confirmed."
If any violations remain: "❌ Fix violations above before raising PR."
