---
name: "figma-implement-design"
description: "Translate Figma nodes into production-ready code with 1:1 visual fidelity using the Figma MCP workflow. Automatically discovers and aligns to any project's stack, architecture, design system, and conventions before writing a single line of code. Trigger when the user provides Figma URLs or node IDs, or asks to implement designs, screens, or components that must match Figma specs."
author: sarang
---

# Figma → Production Code

## Overview

This skill translates Figma designs into production-ready code with pixel-perfect accuracy. It works for **any project** by first auditing the codebase structure, then implementing components that are architecturally aligned — not just visually correct.

Two guarantees:
1. **Visual fidelity** — output matches the Figma design exactly
2. **Architectural fidelity** — output follows the project's actual conventions, not generic patterns

---

## Required Workflow

**Follow every step in order. Never skip or reorder.**

---

### PHASE 0: Figma MCP Setup (if not yet connected)

If any MCP call fails because Figma is not connected, stop and set it up:

```bash
codex mcp add figma --url https://mcp.figma.com/mcp
codex mcp login figma
```

After login, restart the session and resume from Step 1.

---

### PHASE 1: Parse Figma URL

Extract `fileKey` and `nodeId` from the provided Figma URL.

**URL format:**
```
https://www.figma.com/design/:fileKey/:fileName?node-id=1-2
```

**Extract:**
- `fileKey` → the segment after `/design/`
- `nodeId` → value of `node-id` query param (e.g. `1-2`)

**Example:**
```
URL:      https://www.figma.com/design/FowTERxYL7c34uLuPHfgN9/Yonam-POS?node-id=42-15
fileKey:  FowTERxYL7c34uLuPHfgN9
nodeId:   42-15
```

> When using `figma-desktop` MCP: `fileKey` is not required — the server uses the currently open file automatically.

---

### PHASE 2: Fetch Design Context + Screenshot

Run both tools before touching any code.

```
get_design_context(fileKey, nodeId)
get_screenshot(fileKey, nodeId)
```

The screenshot is the **source of truth** for visual validation throughout implementation. Keep it visible.

**If `get_design_context` response is truncated or too large:**
1. Run `get_metadata(fileKey, nodeId)` to get the full node tree
2. Identify the major child sections and their node IDs
3. Run `get_design_context` individually for each child node
4. Run `get_screenshot` for the full parent node

**Extract from design context:**
- Layout: Auto Layout direction, gaps, padding, alignment, sizing (fill/hug/fixed)
- Typography: font family, size, weight, line height, letter spacing
- Colors: exact hex/rgba values, opacity
- Border radius, border width, shadow values
- Component variants and their states (default, hover, active, disabled, focus)
- Spacing tokens and their values

---

### PHASE 3: Asset Handling

Download all assets returned by the Figma MCP before implementation.

**Critical rules — no exceptions:**
- If Figma MCP returns a `localhost` source for an image or SVG → use it directly, as-is
- NEVER import new icon packages — all icons must come from the Figma payload
- NEVER create placeholder assets if a `localhost` source exists
- NEVER modify or re-host localhost asset URLs

---

### PHASE 4: Audit Project Structure

Before writing any component code, audit the project to understand its exact conventions. This step prevents architectural drift and duplicate work.

**Answer every question below before proceeding to Phase 5.**

#### 4a. Framework & Runtime
- What framework is this? (Next.js App Router / Pages Router / Vite React / Vue / other)
- What version?
- Is TypeScript used? What strictness flags?
  - Check: `strict`, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`

#### 4b. Styling System
- What CSS approach? (Tailwind / CSS Modules / Styled Components / vanilla / other)
- If Tailwind: v3 (`tailwind.config.js`) or v4 (CSS-first `@theme` in `.css`)?
- Where are design tokens defined? (CSS variables, JS theme, Tailwind config)
- Is there a `cn()` utility (clsx + tailwind-merge)? Where?
- Are there global styles? Where?

#### 4c. Component Library & Primitives
- What UI primitive library? (Base UI / Radix UI / Headless UI / none)
- Is shadcn/ui used? Which backend — Radix or Base UI?
- Where are shadcn components copied? (typically `components/ui/`)
- Where are custom/feature components defined?
- Naming conventions? (PascalCase files, barrel exports, index files)

#### 4d. Type Conventions
- `interface` vs `type` — which does the project use?
- Props: destructured in function signature or accessed as `props.foo`?
- Where do shared types live? (`.types.ts` files, `types/` folder, colocated)
- Are types re-exported from implementation files or kept isolated?

#### 4e. Architecture & Folder Structure
- What top-level folders exist? (`app/`, `src/`, `features/`, `components/`, `lib/`, etc.)
- Is Clean Architecture / feature-vertical-slice / domain layering used?
- Are there ESLint boundary rules? (`eslint-plugin-boundaries` or similar)
- What path aliases are configured? (`@/`, `@ui`, `@features`, etc.)

#### 4f. Hooks & State
- What state management is used? (Zustand / Redux / Context / Jotai / none)
- Are there forbidden hooks? (e.g. no `useMemo`/`useCallback` if React Compiler handles it)
- Are there custom hooks for common patterns? (auth, connectivity, store access)

#### 4g. Existing Component Inventory
- Does a component already exist for what Figma shows?
- If **yes** → extend it with a new variant. Never create a duplicate.
- If **no** → create a new component following all conventions above.

---

### PHASE 5: Map Figma Tokens → Project Tokens

Before writing any styles, map every Figma value to a project token.

| Figma value | Project token | Notes |
|---|---|---|
| Color `#6B1E2E` | `var(--color-brand-primary)` or `bg-brand-primary` | Map to actual project token name |
| `font-size: 14px` | `text-sm` or `var(--text-sm)` | Use project scale |
| `gap: 16px` | `gap-4` or `var(--spacing-4)` | Use project spacing |
| `border-radius: 8px` | `rounded-lg` or `var(--radius-lg)` | Use project radius |

**Rules:**
- Never hardcode hex values, px sizes, or raw numbers in component code
- When a Figma value has no exact token match → use the closest token and note the deviation in a comment
- When project tokens conflict with Figma values → prefer project tokens, adjust minimally to preserve visual intent

---

### PHASE 6: Implement the Component

Now write the code. Follow every convention discovered in Phase 4.

#### Structural Rules

```
✓ Use the project's type keyword convention (type vs interface)
✓ Follow props access pattern (destructured vs props.foo) per project convention
✓ Place shared types in .types.ts if they cross file boundaries
✓ Use cn() for all className composition (if available)
✓ Use existing primitives (Base UI / Radix) — never re-implement accessible behavior from scratch
✓ Use existing shadcn components from components/ui/ when applicable
✓ Respect ESLint layer boundaries — never import across forbidden boundaries
✓ Use correct path aliases (@/, @ui, @store, etc.)
✓ No inline styles unless value is purely dynamic (e.g. runtime width from JS)
```

#### Accessibility Rules (WCAG 2.1 AA minimum)
- All interactive elements must be keyboard navigable
- Focus rings must be visible and consistently styled
- Color contrast: 4.5:1 for normal text, 3:1 for large text
- Icon-only buttons must have `aria-label`
- Form inputs must have associated labels
- Loading and error states must be announced to screen readers
- Never use `div` or `span` for interactive elements — use semantic HTML or proper ARIA roles via primitives

#### Interactive States
Implement every state visible in Figma or implied by the component type:
- `default` → base styles
- `hover` → color/shadow/scale shift
- `active/pressed` → slightly darker or depressed
- `focus-visible` → visible focus ring (never `outline: none` without a proper replacement)
- `disabled` → reduced opacity, `cursor-not-allowed`, `pointer-events-none`
- `loading` → skeleton or spinner inline with the component
- `error` → border/color change + accessible error message

#### Component File Template

```tsx
// [ComponentName].types.ts  (only if types are used across multiple files)
export type [ComponentName]Props = {
  // props here
}

// [ComponentName].tsx
import { cn } from '@/lib/utils'   // adjust alias to project
import type { [ComponentName]Props } from './[ComponentName].types'

/**
 * [ComponentName]
 *
 * Implements: [Figma node name]
 * Figma reference: [Figma URL with node-id]
 * Tokens used: [list token names]
 * Variants: [list variants if any]
 */
export function [ComponentName](props: [ComponentName]Props) {
  return (
    // implementation
  )
}
```

---

### PHASE 7: Validate Against Figma

Before marking complete, validate every item in this checklist.

**Layout**
- [ ] Spacing matches (padding, margin, gap)
- [ ] Alignment matches (flex/grid direction, justify, align)
- [ ] Sizing matches (width, height — fixed vs fill vs hug)
- [ ] Z-index / stacking matches

**Typography**
- [ ] Font family matches
- [ ] Font size matches
- [ ] Font weight matches
- [ ] Line height matches
- [ ] Letter spacing matches
- [ ] Text truncation behavior matches (if applicable)

**Visual**
- [ ] Colors match exactly (including opacity)
- [ ] Border radius matches
- [ ] Border width and color match
- [ ] Shadows match
- [ ] Icons match (source, size, color)
- [ ] Background matches (solid, gradient, transparent)

**Behavior**
- [ ] All interactive states implemented (hover, active, focus, disabled)
- [ ] Keyboard navigation works correctly
- [ ] Screen reader announcements are correct
- [ ] Loading and error states render correctly

**Architecture**
- [ ] No ESLint boundary violations
- [ ] No hardcoded values — all tokens used
- [ ] No duplicate component created (extended existing where possible)
- [ ] Types isolated correctly per project convention
- [ ] Imports use correct path aliases
- [ ] TypeScript: zero errors in strict mode

**If any item fails** → fix it before proceeding. Do not mark complete with known deviations unless technically impossible. In that case, document the deviation inline (see below).

---

## Deviation Policy

If you must deviate from the Figma design for any reason (accessibility, technical constraint, no matching token), document it inline at the exact point of deviation:

```tsx
{/*
  DEVIATION: Figma specifies #5A1A28 here but project uses --color-brand-900.
  Visual difference is <5% luminance — acceptable.
  Reason: No exact token match in project design system.
  Figma node: https://figma.com/design/...?node-id=42-15
*/}
```

---

## Common Issues & Solutions

| Issue | Cause | Solution |
|---|---|---|
| `get_design_context` truncated | Node too complex | Use `get_metadata` first, fetch children individually |
| Asset not loading | localhost URL modified | Use the URL exactly as returned — no modifications |
| ESLint boundary violation | Wrong import path | Check boundary config, move file or fix the import |
| Token not found | Figma value absent from project system | Use closest token + document deviation |
| Component already exists | Risk of duplication | Extend with variant — never duplicate |
| Type errors in strict mode | `exactOptionalPropertyTypes` active | Be explicit: `prop?: T \| undefined`, never assume |
| `asChild` fighting (Radix) | Radix composition limits | Switch to Base UI render prop pattern if project allows |

---

## Asset Rules (Always Apply, Override Everything)

1. `localhost` source returned by Figma MCP → use directly, never modify the URL
2. New icon package needed → **STOP**. All icons must come from the Figma payload
3. No `localhost` source but asset is clearly needed → flag to the user before proceeding
4. SVG from Figma → inline it or use the `localhost` URL directly, never convert format

---

## Quick Reference Checklist

```
□ Figma URL parsed → fileKey + nodeId extracted
□ get_design_context fetched (or chunked via get_metadata if truncated)
□ get_screenshot fetched — kept as visual reference throughout
□ All assets downloaded from localhost sources
□ Project structure fully audited (Phase 4, all 7 sections)
□ Figma tokens mapped to project tokens (Phase 5)
□ Existing component inventory checked — no duplicates
□ Component implemented with all project conventions
□ All interactive states implemented
□ Accessibility validated (WCAG 2.1 AA)
□ Final output validated against Figma screenshot (Phase 7 checklist)
□ All deviations documented inline
□ ESLint passes — zero boundary violations
□ TypeScript passes — zero errors
```