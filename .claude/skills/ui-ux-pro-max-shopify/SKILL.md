---
name: ui-ux-pro-max-shopify
license: MIT (derived/adapted from nextlevelbuilder/ui-ux-pro-max-skill)
description: Use this skill as design intelligence for Shopify/ecommerce UI audit and redesign. It provides searchable style, color, typography, landing, product, and UX guideline data, plus design token references. Use it to generate a design system before redesigning ecommerce sections.
---

You are using UI/UX Pro Max design intelligence adapted for Shopify/ecommerce storefront audit and redesign.

This skill should NOT replace Shopify ecommerce reasoning. Use it to support visual quality, design-system choices, typography, color, spacing, CTA treatment, responsive layout, and UX quality gates.

## Important

The included data/search scripts are local and should be run from the project root.

Preferred command pattern:

python3 .claude/skills/ui-ux-pro-max-shopify/scripts/search.py "<industry product tone ecommerce>" --design-system -p "Shopify Ecommerce Redesign" -f markdown

For focused searches:

python3 .claude/skills/ui-ux-pro-max-shopify/scripts/search.py "premium ecommerce wellness" --domain product
python3 .claude/skills/ui-ux-pro-max-shopify/scripts/search.py "minimal premium ecommerce" --domain style
python3 .claude/skills/ui-ux-pro-max-shopify/scripts/search.py "ecommerce premium" --domain color
python3 .claude/skills/ui-ux-pro-max-shopify/scripts/search.py "luxury ecommerce readable" --domain typography
python3 .claude/skills/ui-ux-pro-max-shopify/scripts/search.py "CTA mobile accessibility spacing" --domain ux

If Python or the script is unavailable, do not fail the task. Fall back to:
- audit/rubrics/redesign-quality-gate.md
- ecommerce-ui-quality-gate skill
- visible screenshots and section-map evidence

## When to use

Use this skill in the redesign phase when:
- the user wants a Shopify/ecommerce section redesigned
- the previous redesign looked generic or weak
- you need a stronger design direction before coding
- you need color/typography/style guidance
- you need to validate spacing, CTA, interaction, and responsive choices

## Workflow for redesign

1. Infer the store category from:
   - redesign-brief.md
   - section-map.json
   - DOM/text summary
   - screenshots

2. Build a query like:
   - "premium skincare ecommerce minimal"
   - "sleep wellness mattress premium ecommerce"
   - "fashion ecommerce editorial product grid"
   - "outdoor bags adventure ecommerce product page"

3. Run a design-system search:

python3 .claude/skills/ui-ux-pro-max-shopify/scripts/search.py "<query>" --design-system -p "Shopify Ecommerce Redesign" -f markdown

4. Save the output to:

 audit/outputs/latest/reports/design-system.md

5. Use the design system as a benchmark for:
   - style direction
   - color palette
   - typography
   - effects/shadows/radius
   - CTA treatment
   - anti-patterns to avoid

6. Then create the redesign HTML/CSS.

7. Render using:

npm run render:designs

8. Review the PNG output against:
   - design-system.md
   - audit/rubrics/redesign-quality-gate.md
   - ecommerce-ui-quality-gate skill

## Design-system use rules

Use the search output as guidance, not as absolute truth.

Always adapt it to:
- the audited store's brand/category
- original screenshots
- ecommerce conversion goal
- mobile layout constraints
- Shopify section implementation realism

Do not copy references exactly.
Do not create generic SaaS layouts for ecommerce sections.
Do not use random gradients/blobs just because a style dataset mentions them.

## Useful included references

Read these when creating HTML/CSS mockups:

- references/token-architecture.md
- references/primitive-tokens.md
- references/semantic-tokens.md
- references/component-tokens.md
- references/component-specs.md
- references/states-and-variants.md

Use them to make mockups easier to convert into Shopify sections later.
