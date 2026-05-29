---
description: Audit Shopify sections/blocks/snippets for design system compliance and fix violations
---

Audit and fix design system compliance for: **$ARGUMENTS**

If no argument provided, audit all files in `sections/`, `blocks/`, and `snippets/`.

## Step 1 — Read token system

Read `base.scss` to know available tokens: `--color-*`, `--space-*`, `--rounded-*`, `--font-*`.

## Step 2 — Scan for violations

For each file in scope, check:

**Token violations (must fix):**
- [ ] Hardcoded hex colors (`#252528`, `color: black`, `background: white`) → `var(--color-*)`
- [ ] Hardcoded px spacing (`padding: 16px`, `gap: 24px`) → `var(--space-*)`
- [ ] Hardcoded border-radius (`border-radius: 8px`) → `var(--rounded-*)`
- [ ] Hardcoded font-family (`font-family: 'Inter'`) → `var(--font-*)`

**CSS structure violations (must fix):**
- [ ] Separate `.css` file for component styles → move into `{% stylesheet %}`
- [ ] `!important` used for layout → remove and fix root cause
- [ ] Nesting deeper than 3 levels → flatten

**Liquid violations (must fix):**
- [ ] `{% include %}` → replace with `{% render %}`
- [ ] Global variable dependencies (e.g. `{{ product }}` not passed as param)
- [ ] Section missing `{% schema %}` with `padding_top` / `padding_bottom`
- [ ] Block wrapper missing `{{ block.shopify_attributes }}`

**Doc violations (should fix):**
- [ ] Snippet missing `{% doc %}` header
- [ ] Static block missing `{% doc %}` header

**Structure violations (should fix):**
- [ ] UI pattern repeated ≥ 2 times without a snippet → extract
- [ ] CSS class names not following BEM convention

**Asset violations (should fix):**
- [ ] Images using deprecated `img_url` / `img_tag` → use `image_url` + `image_tag`
- [ ] Images missing `loading: 'lazy'`

## Step 3 — Report violations

Before fixing, list all violations grouped by file and severity. Ask user to confirm before applying fixes.

## Step 4 — Apply fixes

Fix all "must fix" violations. Apply "should fix" unless user said to skip.

For each fixed file, validate:

```bash
node .agents/skills/shopify-liquid/scripts/validate.mjs \
  --theme-path "f:/workSpace/template-shopify-theme" \
  --files "<relative-path>" \
  --model claude-sonnet-4-6 --client-name claude-code --client-version 1.0 \
  --artifact-id <random-id> --revision 1
```

## Step 5 — Final report

N violations fixed, N remaining (with reason if skipped). All fixed files validated.
