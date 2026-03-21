# POS UI Architect Agent — Developer Guide

The `pos-ui-architect` agent turns a Figma frame into production-ready code for this project.
It handles architecture decisions, token mapping, typography, and visual verification automatically.

---

## Quick Start

Open Claude Code in the project root and say:

```
Use pos-ui-architect to implement this Figma frame:
https://www.figma.com/design/FowTERxYL7c34uLuPHfgN9/Yonam-POS?node-id=42-15
```

That's it. The agent will run all 8 phases and output a delivery summary when done.

---

## What the Agent Does

The agent runs 8 phases in order. You can follow along in the Claude Code output.

| Phase | What happens |
|-------|-------------|
| **0 — Pre-flight** | Reads all project rule files before touching any code |
| **1 — Parse Figma** | Calls Figma MCP to get design data + screenshot |
| **2 — Classify** | Decides: page shell / feature component / shared component |
| **3 — Token map** | Maps every Figma color and typography value to a project token |
| **4 — Scaffold** | Creates files in the correct folder and layer |
| **5 — Implement** | Writes the component with all rules enforced |
| **6 — Visual verify** | Takes a Playwright screenshot and diffs it against Figma |
| **7 — CI gate** | Runs type-check, lint, color check, arch check, tests |
| **8 — Delivery** | Reports files created, mappings used, all checks green |

---

## Prerequisites

### 1. Figma MCP must be connected

```bash
claude mcp add figma --url https://mcp.figma.com/mcp
claude mcp login figma
```

Verify it works:
```bash
claude mcp list   # should show figma
```

### 2. Dev server must be reachable for visual verification

The agent starts `npm run dev` automatically. If port 3000 is already in use:

```bash
lsof -i :3000      # find what's using it
kill -9 <PID>      # free the port
```

### 3. Your `.env.local` must be set up

The dev server won't start without env vars. Run `/setup` if you haven't already.

---

## How to Give the Agent a Figma URL

### From Figma desktop or browser

1. Right-click a frame in Figma → **Copy link**
2. Paste the URL directly into your message

The URL looks like:
```
https://www.figma.com/design/FowTERxYL7c34uLuPHfgN9/Yonam-POS?node-id=42-15
```

### Giving multiple frames

```
Use pos-ui-architect to implement these two frames:
- Cart item row: https://www.figma.com/design/.../Yonam-POS?node-id=12-34
- Payment summary: https://www.figma.com/design/.../Yonam-POS?node-id=12-56
```

The agent will implement them in sequence, one at a time.

### Specifying a target feature

If you know where the component should live:

```
Use pos-ui-architect to implement node-id=42-15 as a component in features/checkout/
```

---

## Design System Rules the Agent Enforces

### Colors — project tokens only

The agent maps every Figma hex/rgba value to a CSS variable from `globals.css`.
Raw hex values like `bg-[#57243b]` are blocked by the pre-commit hook (`check-no-hardcoded-colors`).

**Color token quick reference:**

| What you see in Figma | Tailwind token to use |
|----------------------|-----------------------|
| Brand purple-red `#57243b` | `primary-500` |
| Subtle brand bg | `primary-alpha-1` … `primary-alpha-6` |
| Body text `#6f6b7d` | `text-text-body` |
| Heading text `#4b465c` | `text-text-heading` |
| Muted text `#a5a2ad` | `text-text-muted` |
| Success green | `success` |
| Warning orange | `warning` |
| Danger red | `danger` |
| Sidebar bg `#4b4b4b` | `bg-[var(--extra-dark)]` |
| Card bg / page bg | `bg-[var(--surface-page)]` |
| Subtle bg `#f8f7fa` | `bg-[var(--surface-subtle)]` |
| Divider / border | `border-[var(--surface-border)]` |

### Typography — project utility classes only

Never use raw Tailwind `text-sm font-bold` combinations.
Always use the project's typography utility classes defined in `globals.css`:

**Heading classes:**
```tsx
<h1 className="heading-large">   {/* 24px / 800 */}
<h2 className="heading-page">    {/* 20px / 700 */}
<h3 className="heading-section"> {/* 16px / 600 / UPPERCASE */}
<h4 className="heading-card">    {/* 14px / 600 / UPPERCASE */}
```

**Button / CTA text:**
```tsx
<button className="text-cta">       {/* 14px / 700 — default buttons */}
<button className="text-cta-large"> {/* 16px / 700 — large buttons */}
```

**Body text** (format: `.text-{scale}-{weight}` where weight 1=heavy, 2=medium, 3=regular):
```tsx
<p className="text-large-1">   {/* 16px / 800 */}
<p className="text-large-2">   {/* 16px / 600 */}
<p className="text-large-3">   {/* 16px / 400 */}
<p className="text-regular-1"> {/* 14px / 700 */}
<p className="text-regular-2"> {/* 14px / 500 */}
<p className="text-regular-3"> {/* 14px / 400 */}
<p className="text-normal-2">  {/* 12px / 600 */}
<p className="text-normal-3">  {/* 12px / 400 */}
<span className="text-smallest-1"> {/* 10px / 700 */}
<span className="text-smallest-3"> {/* 10px / 400 */}
```

**Combine with text color:**
```tsx
<p className="text-regular-3 text-text-body">Description</p>
<span className="text-normal-3 text-text-muted">Last updated</span>
```

---

## Visual Verification — How It Works

After implementing the component, the agent:

1. Starts `npm run dev` (or checks it's already running)
2. Navigates to the route containing the component using **Playwright MCP**
3. Takes a screenshot of the rendered page
4. Compares it against the Figma screenshot from Phase 1
5. Fixes any discrepancies and re-screenshots until they match

### Temporary review page

If your component isn't wired into a real route yet, the agent creates a temporary page:

```
src/app/[storeName]/(pos)/ui-review/page.tsx
```

You can open `http://localhost:3000/demo/ui-review` to see it.
The agent deletes this file after verification is complete.

### What gets checked in the visual diff

| Category | Items |
|----------|-------|
| Layout | Padding, gap, flex direction, alignment, sizing |
| Typography | Correct class applied, size/weight/line-height visible |
| Colors | Correct token used, no raw hex in rendered output |
| Visual | Border radius, shadows, icon size/color |
| States | Hover, focus ring, disabled styling |

---

## Architecture Decisions the Agent Makes

### Where does the file go?

```
Is it a new screen/route?
  YES → app/[storeName]/(pos)/<route>/page.tsx  (Server Component, <15 lines)

Used by only one feature?
  YES → src/features/<feature>/components/ComponentName.tsx
  NO  → src/shared/components/ComponentName.tsx
```

### Server Component or Client Component?

```
Uses useState / useEffect / browser events?  → 'use client'
Uses React Context?                          → 'use client'
Reads Zustand store?                         → 'use client'
Fetches from Django?                         → Server Component (async)
Pure display / layout?                       → Server Component (default)
```

The `'use client'` boundary is pushed as deep as possible —
pages and panel wrappers stay as Server Components.

---

## What Happens When Checks Fail

The agent will not mark work as complete until all checks pass.

| Check | What a failure means | Agent action |
|-------|---------------------|--------------|
| `check-no-hardcoded-colors` | A raw `#hex` or `rgb()` was written | Replace with token from Phase 3 table |
| `type-check` | TypeScript error | Fix types — no `@ts-ignore` |
| `lint` | Biome rule violated | Follow the fix Biome suggests |
| `check:arch` | Import crosses layer boundary | Move file or change import path |
| `npm test` | Existing test broke | Fix component, not the test |

---

## Common Questions

**Q: The Figma has a color I can't find a token for.**
The agent will use the closest token and add a `/* TODO: add --token-name to globals.css */` comment.
You should then add the CSS variable to `globals.css` and remove the comment.

**Q: The typography in Figma doesn't match any class exactly.**
The agent uses the closest class. If a new scale is needed (e.g. 18px/600),
add it to `globals.css` following the existing pattern and tell the agent the new class name.

**Q: I want to implement multiple screens from Figma.**
Give the agent multiple URLs in one message. It will process them in sequence.

**Q: The dev server isn't starting.**
Check that `.env.local` is configured (run `/setup` if not).
Then run `npm run dev` manually and confirm it reaches `http://localhost:3000`.

**Q: I want to skip visual verification for a quick iteration.**
Tell the agent: "Skip Phase 6 visual verification for this run."
All CI checks (Phase 7) will still run.

---

## Files Created by the Agent

For a typical feature component implementation:

```
src/features/<feature>/components/
  ComponentName.tsx              ← main component
  component-name.types.ts        ← types (only if cross-file)

src/features/<feature>/constants/
  feature.constants.ts           ← constants extracted from the component
```

For a new page:
```
src/app/[storeName]/(pos)/<route>/
  page.tsx                       ← Server Component shell
  loading.tsx                    ← Suspense skeleton
  error.tsx                      ← ErrorBoundary fallback
```

---

## Keeping the Agent Up to Date

The agent file lives at `.claude/agents/pos-ui-architect.md`.

When you add new CSS variables or typography classes to `globals.css`, update the
**Design Token Reference** and **Typography System** sections in the agent file.
Otherwise the agent will use outdated mappings.

Rule files in `.claude/rules/` are read fresh on every run — no agent update needed
when a rule changes.
