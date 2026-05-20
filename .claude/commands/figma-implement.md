---
description: Implement a Figma design as a pixel-perfect Shopify section, block, or snippet
---

Implement the Figma design at this URL as Shopify Liquid:

**$ARGUMENTS**

---

## Step 0 — Check token system

Read `base.scss`. If CSS custom properties in `:root` are still commented out (no `--color-*`, `--space-*` values), stop and run `/shopify-tokens-setup` first with the same Figma fileKey. Do not proceed until `base.scss` has real token values.

## Step 1 — Parse URL

Extract `fileKey` and `nodeId` from the Figma URL.
Convert node-id dashes to colons: `42-15` → `42:15`

## Step 2 — Search docs

Before writing any code, search the Shopify documentation:

```bash
node .agents/skills/shopify-liquid/scripts/search_docs.mjs "<component type or operation>"
```

Search for the main component type (e.g. "product card section", "image banner block", "collection grid"). Use the results to write correct Liquid.

## Step 3 — Fetch design data (run in parallel)

```
get_design_context(nodeId)  →  layout, typography, colors, spacing
get_screenshot(nodeId)      →  visual reference (source of truth)
```

If `get_design_context` is truncated:
1. Call `get_metadata()` → get XML node map
2. Identify child nodeIds
3. Call `get_design_context()` per child

## Step 4 — Download assets

Download SVG icons and images from the localhost asset URLs in the MCP response. Store in `assets/`. Do not modify localhost URLs.

## Step 5 — Map design values → tokens

Before writing code, map every Figma value to a token from `base.scss`:

| Figma value | Token |
|-------------|-------|
| Color | `var(--color-*)` |
| Spacing | `var(--space-*)` |
| Border radius | `var(--rounded-*)` |
| Font family | `var(--font-*)` |

If no matching token exists, use the nearest one (±2px spacing, ±1px font). Gap > tolerance → ask user before proceeding.

## Step 6 — Check for existing components

Before creating new files:
- Check `snippets/`, `blocks/`, `sections/` for matching components
- If found → reuse or extend, do not duplicate
- UI pattern repeated ≥ 2 times in the design → extract as snippet

## Step 7 — Generate Liquid

Follow `figma-power/design-system-rules.md`. Key rules:

**Structure:**
- Section: `sections/name.liquid` with `{% schema %}` + `padding_top/bottom`
- Block: `blocks/name.liquid` with `{% schema %}` + `{% doc %}`
- Snippet: `snippets/name.liquid` with `{% doc %}`

**CSS — write in `style.scss`, NOT inline in Liquid:**
- All styles in `style.scss` (or a dedicated SCSS file imported into `style.scss`)
- All colors: `$color-*`
- All spacing: `$space-*`
- All radius: `$rounded-*`
- Typography: `@include mixin-name`
- Responsive: `@include mobile { }`, `@include desktop { }` (SCSS mixins)
- BEM class names matching Figma frame names
- No `!important`, no nesting > 3 levels

**Inline `style=""` — ONLY for dynamic settings from schema:**
```liquid
{{- Correct: value comes from merchant settings -}}
<section class="hero" style="--hero-pt: {{ section.settings.padding_top }}px;">

{{- Wrong: static value -}}
<section class="hero" style="padding: 36px;">
```
Read back in SCSS with `var()` + fallback: `padding-top: var(--hero-pt, 36px);`

**JS — inside `{% javascript %}` tag:**
- Vanilla JS only — no libraries
- Web Components pattern for interactive elements

**i18n — all user-facing text:**
```liquid
{{- 'sections.name.heading' | t -}}
```
Update `locales/en.default.json` with every new key.

**Blocks:**
- Add `{{ block.shopify_attributes }}` on the block wrapper element
- Nested blocks via `{%- content_for 'blocks' -%}`

**Images:**
```liquid
{{ image | image_url: width: 800 | image_tag: loading: 'lazy', class: 'name__image' }}
```

## Step 8 — Validate

Run validate before returning any code:

```bash
# Full mode (files on disk)
node .agents/skills/shopify-liquid/scripts/validate.mjs \
  --theme-path "f:/workSpace/template-shopify-theme" \
  --files "sections/name.liquid" \
  --model claude-sonnet-4-6 --client-name claude-code --client-version 1.0 \
  --artifact-id <stable-random-id> --revision 1

# Stateless mode (single file)
node .agents/skills/shopify-liquid/scripts/validate.mjs \
  --filename name.liquid --filetype sections \
  --code '<file content>' \
  --model claude-sonnet-4-6 --client-name claude-code --client-version 1.0 \
  --artifact-id <stable-random-id> --revision 1
```

If validation fails:
1. Read the error carefully — identify the exact tag, filter, or object
2. `node .agents/skills/shopify-liquid/scripts/search_docs.mjs "<error term>"`
3. Fix only the reported error
4. Re-validate (max 3 retries, increment `--revision` each time)
5. After 3 failures → return best attempt with explanation

## Step 9 — Visual comparison

Compare output against the `get_screenshot` reference:
- Spacing tolerance: ±2px
- Font size tolerance: ±1px
- Fix anything beyond tolerance, then re-validate

## Done — Report

List every file created or modified. Confirm validation passed and the checklist in `figma-power/design-system-rules.md` is complete.
