# tdd — Enforce Strict TDD for a Single File

Use this whenever you are about to implement something new.

---

## Usage

```
/tdd <what you want to build>
```

Example: `/tdd useLogin hook for auth feature`

---

## The Process — Non-negotiable

### Phase 1 — RED (test fails)

1. Read the relevant rule files:
   - `.claude/rules/03-testing.md` — always
   - `.claude/rules/04-react.md` — if building a component or hook
   - `.claude/rules/02-typescript.md` — always

2. Identify the file to be implemented. Do NOT create it yet.

3. Write the test file first (`<name>.test.ts` or `<name>.test.tsx`).
   The test must import from the implementation file path
   even though the file does not exist yet.

4. Run the test:
   ```bash
   npx vitest run src/path/to/file.test.ts
   ```

5. Confirm it FAILS with a module-not-found or similar error.
   If it somehow passes — the test is wrong. Fix the test.

6. Show the failing output before proceeding.

### Phase 2 — GREEN (test passes)

7. Now create the implementation file.
   Write the MINIMUM code to make the tests pass.
   Do not over-engineer. Do not add untested code.

8. Run the test again:
   ```bash
   npx vitest run src/path/to/file.test.ts
   ```

9. Confirm ALL tests pass.
   If any fail — fix the implementation, not the test.

10. Show the passing output.

### Phase 3 — REFACTOR

11. Clean up the implementation:
    - Remove duplication
    - Improve naming
    - Extract helpers if needed
    - Ensure rules from `02-typescript.md` are followed

12. Run tests again — must still be green.

13. Run full suite to check for regressions:
    ```bash
    npm test
    ```

14. Show final test count. Must be >= previous count.

---

## Test Checklist Before Writing

Before writing the test, answer these:

- [ ] Where does this file live? (check `01-architecture.md`)
- [ ] What environment does it run in? (`unit` node or `ui` happy-dom)
- [ ] Does it make HTTP calls? (add MSW handler override in test)
- [ ] Does it touch IndexedDB? (import `fake-indexeddb/auto`, call `resetDBForTesting`)
- [ ] Does it use TanStack Query? (wrap in `QueryClientWrapper` test utility)
- [ ] Does it use Zustand store? (call `.clearCart()` or equivalent in `beforeEach`)

---

## What Tests Must Cover (minimum)

| File type | Minimum test cases |
|-----------|-------------------|
| Domain factory | output shape, calculated values, edge cases |
| Saga / use-case | happy path, each failure mode, compensation |
| Infrastructure | write + read roundtrip, error handling |
| Hook | return values, loading state, error state, MSW interaction |
| Store | each action, each selector, state reset |
| Component | renders content, user interactions, edge states |
| API route | auth missing → 401, bad body → 422, success → correct response |
