---
description: Scaffold a new Shopify section with correct Liquid structure, schema, and stylesheet
---

Create a new Shopify section named: **$ARGUMENTS**

## Step 1 — Search docs

```bash
node .agents/skills/shopify-liquid/scripts/search_docs.mjs "$ARGUMENTS section"
```

Use the results to confirm the correct Liquid patterns for this type of section.

## Step 2 — Check for duplicates

Search `sections/` for any existing section with a similar name or purpose. If found, ask the user whether to extend it or create a new one.

## Step 3 — Read base.scss

Read `base.scss` to confirm available tokens (`--color-*`, `--space-*`, `--rounded-*`, `--font-*`).

## Step 4 — Create sections/name.liquid

File: `sections/$ARGUMENTS.liquid` (kebab-case)

```liquid
<section
  class="section-name"
  style="--section-pt: {{ section.settings.padding_top }}px; --section-pb: {{ section.settings.padding_bottom }}px;"
>
  <div class="page-width">
    {%- content_for 'blocks' -%}
  </div>
</section>

{% stylesheet %}
  .section-name {
    padding-top: var(--section-pt, 36px);
    padding-bottom: var(--section-pb, 36px);
  }
{% endstylesheet %}

{% schema %}
{
  "name": "Section Name",
  "settings": [
    { "type": "range", "id": "padding_top", "label": "Padding top",
      "min": 0, "max": 100, "step": 4, "unit": "px", "default": 36 },
    { "type": "range", "id": "padding_bottom", "label": "Padding bottom",
      "min": 0, "max": 100, "step": 4, "unit": "px", "default": 36 }
  ],
  "presets": [{ "name": "Section Name" }]
}
{% endschema %}
```

Rules:
- All CSS inside `{% stylesheet %}` — no separate CSS file
- All colors/spacing/radius use `var(--token)` from `base.scss`
- Responsive: `@media (max-width: 767px)` directly inside `{% stylesheet %}`
- User-facing text written directly as plain English in templates and schema labels/defaults
- Use `{% render %}` not `{% include %}`
- `{{ block.shopify_attributes }}` on each block wrapper

## Step 5 — Validate

```bash
node .agents/skills/shopify-liquid/scripts/validate.mjs \
  --theme-path "f:/workSpace/template-shopify-theme" \
  --files "sections/$ARGUMENTS.liquid" \
  --model claude-sonnet-4-6 --client-name claude-code --client-version 1.0 \
  --artifact-id <random-id> --revision 1
```

Fix any errors, re-validate if needed.

## Step 6 — Report

List files created and any schema settings the user should customize.
