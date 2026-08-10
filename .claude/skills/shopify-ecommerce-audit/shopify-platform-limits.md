# Shopify Platform Limits & Constraints — LitOS suggestion guardrails

> **Purpose:** a cheat-sheet of HARD Shopify limits so audit findings, recommendations
> and mockups never propose something the platform can't do. **Before recommending or
> mocking any feature, check it here. If a suggestion would exceed a limit, redesign the
> suggestion to fit (or mark it clearly out-of-scope).** When a number isn't listed or you
> are unsure, VERIFY against the official docs (help.shopify.com / shopify.dev) before
> suggesting — do not guess. Limits change; re-verify periodically (last checked 2026-06).

## Products & variants
- **Max 3 options per product** (e.g. Size / Color / Material). HARD limit on every plan — never raised. → Never suggest a 4th option selector. For >3 configurable attributes use: an **included component** (show it as part of the set, not a selector), a **line-item property** (non-variant per-item input), a **Combined Listing** (link separate products for the effect of a 4th option), or a **Request-a-Quote / custom** flow.
- **Max 2,048 variants per product** (raised from 100 in 2024).
- A single option can hold many values, but a storefront **filter shows ≤100 values**.
- **Product tags: 250 per product** (unlimited on Plus).

## Navigation menus
- **Max 3 tiers**: a top-level item + **2 levels** of nested drop-downs. → Never propose 4-level mega-menu nesting. (Up to 10,000 items/menu, 1,000 menus/store, but best practice ≤2 dropdown levels and ≤8–10 items per group.)

## Theme — Online Store 2.0 (what a theme dev can actually build)
- **≤25 sections per template**, **≤50 blocks per section**, **≤1,250 blocks per template** (a specific theme may set lower limits in its schema).
- Sections/blocks are JSON-template driven; **app blocks** can sit in OS 2.0 sections. Merchant-editable surface = whatever the section `{% schema %}` exposes (settings/blocks). If a change isn't a schema setting, it needs theme code.
- Build suggestions as: **theme setting / section / block** (no code = 🟢 Client), **section/block Liquid + CSS** (Dev), or an **app block** (existing app only — we don't add apps).

## Storefront filtering & search (Search & Discovery — first-party, free, no paid app)
- **≤25 filters per store**. Sources: Availability, Category, Price, Product type, Tags, Vendor + custom (**product options, metafields, metaobjects**). Each source usable once.
- A filter shows ≤100 values on storefront; a filter group ≤200 unique values; ≤1,000 filter groups.
- Filters **don't render** when a collection has >5,000 products or a search returns >100,000 results.
- → PLP filter suggestions must map to these sources (options/metafields/tags). Don't promise arbitrary facets the data can't back.

## Checkout — the biggest constraint (read before any cart/checkout suggestion)
- The checkout (Information / Shipping / Payment steps) is **NOT freely themeable**. `checkout.liquid` is **Plus-only** and is being sunset (Info/Shipping/Payment already unsupported; Thank-you / Order-status sunset **Aug 28 2025** for Plus, **Aug 26 2026** non-Plus).
- Modern checkout edits = **Checkout Extensibility**: **Checkout UI Extensions** + branding API (largely **Plus**) and **Shopify Functions** (discounts, delivery/payment rules — broader availability but constrained).
- → **Never suggest editing the checkout UI/steps for a non-Plus store.** Keep conversion work **pre-checkout**: the **cart drawer / cart page** ARE theme-editable (Liquid + AJAX Cart API) — that's where cart upsell, free-shipping bars, trust, line-item properties belong. Express-checkout/accelerated buttons are a theme/setting toggle, not a checkout edit.

## Cart (themeable — safe ground)
- Cart drawer and `/cart` page are theme-controlled. **Line item properties** (per-item custom data) and **cart attributes/notes** are native on every plan (no app). Cart cross-sell/upsell, free-shipping progress, trust rows = theme sections/blocks.

## Other (rarely the binding constraint, but verify if a suggestion leans on them)
- Metafields/metaobjects: generous limits; good for specs, swatches, filter data, badges.
- Collections: a product can be in many collections; automated collections use conditions.
- Markets/translations, gift cards, B2B (catalogs/price lists are Plus/B2B-plan features).

## The rule (apply to every finding, recommendation, mockup)
1. A suggestion is only valid if it ships as a **theme setting / section / block**, an **existing app's block (placement only)**, or native data (**metafields / tags / line-item properties**) — within the limits above.
2. **Never** suggest: >3 product options · checkout-step UI edits for non-Plus · >3 menu tiers · facets the product data can't back · "install app X" as the fix.
3. If a feature genuinely needs more, **reshape it** to fit (included component, line-item property, combined listing, quote flow) or mark it **OPTIONAL / out-of-scope** — don't present an impossible thing as the primary fix.
4. When a limit isn't listed here or you're unsure, **verify against help.shopify.com / shopify.dev before suggesting.**

## Sources (verify/refresh here)
- Options & variants: help.shopify.com/en/manual/products/variants/add-variants · changelog.shopify.com/posts/we-ve-increased-the-product-variant-limit-to-2048
- Tags: shopify.dev/changelog/product-tags-now-have-a-limit-of-250-per-product
- Sections/blocks: help.shopify.com/en/manual/online-store/themes/theme-structure/sections-and-blocks
- Menus: help.shopify.com/en/manual/online-store/menus-and-links/drop-down-menus
- Filters: help.shopify.com/en/manual/online-store/search-and-discovery/filters
- Checkout: shopify.dev/docs/storefronts/themes/architecture/layouts/checkout-liquid
