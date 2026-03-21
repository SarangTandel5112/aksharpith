# new-feature — Scaffold a Feature Vertical

Use this when starting a brand new feature from scratch.

---

## Usage

```
/new-feature <name>
```

Example: `/new-feature receipts`

---

## What This Does

Creates the complete folder structure for a new feature vertical,
matching the existing `auth`, `catalog`, and `checkout` structure.

---

## Steps to Execute

### 1. Read architecture first
Read `.claude/rules/01-architecture.md` before creating anything.

### 2. Create folder structure

```
src/features/<name>/
  components/    ← React components (.tsx)
  hooks/         ← React hooks (.ts)
  store/         ← Zustand stores (only if feature has local state)
  types/         ← Feature-specific types (<n>.types.ts files)
  constants/     ← Feature-specific constants
  validations/   ← Zod schemas for forms
  schemas/       ← Zod schemas for API response contracts
  services/      ← Orchestration logic (not business logic)
```

### 3. Create placeholder files

For each folder, create a `.gitkeep` file so git tracks empty folders.

### 4. Create the types file

Create `src/features/<name>/types/<name>.types.ts` with a comment:
```ts
// Types for the <name> feature
// Add types here as the feature is built
```

### 5. Register in architecture docs

Add the new feature to the folder structure section of
`.claude/rules/01-architecture.md`.

### 6. Update CLAUDE.md status table

Add a row to the Current Project State table in `CLAUDE.md`:
```
| <Name> feature | 🔲 Not started | Brief description |
```

### 7. Report

Show the complete list of folders and files created.
Confirm no existing files were modified.

---

## What This Does NOT Do

- Does not write any implementation code
- Does not write any tests
- Does not modify any existing feature
- Does not create application/ or infrastructure/ files
  (those are created when the feature's domain logic is defined)
