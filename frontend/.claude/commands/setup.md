# setup -- New Developer Onboarding

Use this when setting up the project for the first time on a new machine.

---

## Usage

```
/setup
```

---

## Steps to Execute

### 1. Clone and install

```bash
git clone <repo-url>
cd pos-pwa
npm install
```

### 2. Set up environment

```bash
cp .env.example .env.local
```

Then open `.env.local` and fill in each value:

| Variable                    | What to put              |
|-----------------------------|--------------------------|
| NEXTAUTH_SECRET             | Run: `openssl rand -base64 32` and paste the output |
| NEXTAUTH_URL                | `http://localhost:3000`  |
| DJANGO_API                  | `http://localhost:8000` (or your Django dev URL) |
| DJANGO_API_SECRET           | Any 16+ char string for dev |
| NEXT_PUBLIC_TERMINAL_ENV    | `development`            |
| NEXT_PUBLIC_SENTRY_DISABLED | `true`                   |

### 3. Set up Claude Code local settings (optional)

If you use Claude Code and want to enable personal MCP servers (Figma, Playwright, etc.):

```bash
cp .claude/settings.local.json.example .claude/settings.local.json
```

Then edit `.claude/settings.local.json` to add the MCP servers you have installed.
This file is gitignored — your local settings never get pushed.

### 4. Install git hooks

```bash
npx lefthook install
```

This sets up the pre-commit hook that runs type-check -> lint -> test automatically.

### 5. Verify the setup

```bash
npm run dev          # Should start on http://localhost:3000
```

Open a second terminal and run:

```bash
npm run type-check   # Should exit 0
npm run lint         # Should exit 0
npm test             # Should show 122/122 passing
npm run check:arch   # Should show 0 violations
```

If all four pass, you are ready to build.

### 6. Read the rule files

Before writing any code, read:
1. `CLAUDE.md` -- project overview and quick reference
2. `.claude/rules/01-architecture.md` -- layer structure and where files go
3. `.claude/rules/02-typescript.md` -- TypeScript conventions

Then read the rule file for the feature you are building.

---

## If Something Fails

### `npm install` fails
- Check Node version: must be >= 20 (`node --version`)
- Delete `node_modules` and `package-lock.json`, then retry

### `npm run dev` shows env errors
- Open `src/config/env.ts` to see exactly which variables are required
- Make sure `.env.local` has all of them

### `npm test` fails
- Run `npm run type-check` first -- type errors can cause test failures
- Check that `fake-indexeddb` is installed: `npm ls fake-indexeddb`

### `npm run check:arch` fails after adding a file
- Read `.claude/rules/01-architecture.md` dependency rules
- The file you added imports from a layer it is not allowed to import from
