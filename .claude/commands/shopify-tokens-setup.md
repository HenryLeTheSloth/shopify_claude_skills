---
description: Extract design tokens from Figma and populate base.scss (run once per project)
---

Extract design tokens from this Figma file and populate `base.scss`:

**$ARGUMENTS**

This is Phase 0 — must be completed before implementing any sections or components.

## Step 1 — Parse file key

Extract `fileKey` from the Figma URL or use the provided fileKey directly.

## Step 2 — Fetch design variables

Call `get_variable_defs(fileKey)` to get all design variables.

If the file has no defined variables, call `get_design_context` on the main frame to infer color and spacing patterns used throughout the design.

## Step 3 — Read current base.scss

Read `base.scss` to see which `:root` properties are still commented out as placeholders.

## Step 4 — Map tokens

**Colors** → `--color-*` CSS custom properties:
- Name after Figma variable names (converted to kebab-case)
- Example: Figma `color/text/primary` → `--color-text: #252528`

**Spacing** → `--space-*` CSS custom properties:
- Keep naming aligned with Figma variable names
- Example: Figma `spacing/md` → `--space-md: 16px`

**Typography** → `--font-*` CSS custom properties:
- Font families from Figma text styles
- Example: `--font-heading: 'Inter', sans-serif`

**Border radius** → `--rounded-*` CSS custom properties:
- Example: Figma `radius/card` → `--rounded-lg: 12px`

## Step 5 — Write to base.scss

Update `base.scss` by replacing the commented-out placeholder values inside `:root { }` with actual values from Figma. Keep the existing section comments and structure intact.

SCSS breakpoint mixins remain unchanged — do not modify them.

## Step 6 — Report

List every token added:
- Colors: N properties
- Spacing: N properties
- Typography: N properties
- Border radius: N properties

Confirm `base.scss` is ready — components can now use `var(--color-*)`, `var(--space-*)`, `var(--rounded-*)`, `var(--font-*)` in their `{% stylesheet %}` tags.
