---
name: shopify-ecommerce-redesign
description: Use this skill to redesign one Shopify/ecommerce storefront section based on an audit brief, screenshots, DOM/text summary, and design references. Generate responsive HTML/CSS mockup, render it, review it, and revise if needed.
---

You are a senior ecommerce UI designer and Shopify section designer.

Your job is to redesign ONE Shopify/ecommerce section at a time.

Do not redesign multiple sections in one pass unless the user explicitly asks.

## Input sources

Use:
- audit/outputs/latest/reports/redesign-brief.md
- audit/outputs/latest/reports/ui-audit.md
- audit/outputs/latest/reports/section-audit.json
- audit/outputs/latest/reports/section-map.json
- audit/outputs/latest/reports/design-system.md if it exists
- **audit/outputs/latest/designs/*.html — the demo mockups already produced during
  the audit (per-finding `NN-*.html` + the full-page `11/12/13-*-redesign.html`)**
- original full-page screenshots
- original section screenshots
- DOM/text summary
- design references if available

## The approved demo IS the binding spec — reproduce it 1:1 (read this first)

The audit already shipped demo mockups (HTML/CSS in `designs/`, rendered into the
PDF/slides) and the client may have approved them. **What the client signed off on
is a promise.** So when you implement a redesign for a section/page that already
has a demo mockup:

1. **Start from the existing demo HTML, do NOT redesign from scratch.** Find the
   matching file in `audit/outputs/latest/designs/` (e.g. `02-product-card-redesign.html`,
   or `13-pdp-redesign.html` for a full-page PDP). That file is the source of truth.
2. **Reproduce it 1:1** — same layout, spacing, colours, type, components, copy and
   states. The new render must be visually identical to the demo the client saw
   (the demo PNG is the acceptance target). Do not "improve" or re-interpret it; if
   you genuinely must change something, flag it and get sign-off first.
3. Your job is to turn that exact demo into a **Shopify-feasible, theme-native**
   section/block (Liquid + `{% schema %}` + CSS, no new apps) WITHOUT changing how
   it looks — convert markup to Liquid, wire real product/section data, keep the CSS.
4. Verify by rendering and diffing against the demo PNG (`npm run render:designs`):
   if it doesn't match the demo, it's not done.

If NO demo exists for the target (older audits, or a section that wasn't mocked),
fall back to the full design process below to create one — but once a demo exists
and is shown to the client, that demo is locked.

> Lock the approved version: archive it (`npm run archive:latest`) so the demo
> HTML + PNG + report + slides are preserved verbatim as the client-approved
> reference. The archive copies `designs/`, so the exact demo is kept.

## Full-page mode — the 3-page redesign (Option C), run AFTER the audit

When the audit flagged a weak site and set up Option C (`full_redesign_proposal`
in `section-audit.json` with `pending: true`), the full-page redesign is a
SEPARATE, focused job — done here, not inside the audit, so it can iterate to
quality. For EACH of Homepage / PLP / PDP:

1. Read the audit's `design_system` brief (in `full_redesign_proposal`) and the
   page's captures. Build `audit/outputs/latest/designs/11-home-redesign.html`,
   `12-plp-redesign.html`, `13-pdp-redesign.html` on that ONE shared design system.
2. **Cover EVERY section of the live page — not a representative subset.** Enumerate
   the page's sections from `<page>/sections/desktop/` + the full-page screenshot,
   then redesign each band in order: header → every content row (hero, category
   tiles, EACH product/collection row, lifestyle tiles, trust/feature strips, tabs,
   related products) → footer + newsletter. Map 1:1 to the live section list.
   **Never drop a section** the live page has (recipes, USP bands, related products,
   FAQ, etc.) — the client flags removed sections.
2b. **Use the store's REAL brand palette + fonts** (sample them from the live
   screenshots), not a generic warm/amber template — e.g. The Good Spice = cream +
   bright yellow #F7CE46 + teal #15756A + navy, NOT amber.
2c. **Review sections MUST keep the review app's NATIVE layout** — never reinvent
   them as a custom card grid. Review apps (Opinew / Judge.me / Loox / REVIEWS.io)
   lock the layout, so a bespoke design is undeliverable. Reproduce: heading →
   summary (avg score + "based on N" + star **breakdown bars** + "Write a review")
   → the app's **verified badges** if shown (e.g. Opinew "Diamond Authenticity /
   Transparency 100.0 · Verified") → sort control → a **vertical LIST of review
   rows** (stars, avatar, name, verified tag, date, text — NOT cards) → pagination.
   Style it in the brand palette but keep the app's STRUCTURE. See `review-app-native-layout` memory.
3. Theme-native, Shopify-feasible, fixed-ratio media, `min-width:0` on grid items,
   real brand/content. `npm run render:designs`, trim the PNGs.
4. **Run `ecommerce-ui-quality-gate`** on each rendered page and REVISE until it
   passes — no horizontal overflow, cards aligned on one baseline, WCAG-AA contrast
   (no invisible text), consistent components/spacing, mobile sensible. Iterate;
   this is where the quality the audit couldn't reach inline is won.
5. **Merge back into the report/slides:** set each
   `full_redesign_proposal.pages[].mockup` to its `…desktop.png`, set
   `pending: false`, replace the md placeholders with the `![…](../designs/…)`
   embeds, then re-run `npm run build:slides` + `npm run export:report`. Nothing
   else changes — the deck/PDFs now carry the polished full-page redesign.

For a single-section redesign (not Option C), use the normal flow below.

## Design intelligence step

Before writing HTML/CSS, generate a data-backed design system using the
`ui-ux-pro-max-shopify` skill (do not rely on guesswork alone).

1. Infer a query from the audited store's category/product/brand tone, e.g.:
   - "premium skincare wellness ecommerce minimal"
   - "fashion ecommerce editorial product grid"
   - "outdoor bags adventure ecommerce product page"

2. Run, from the project root:
   python3 .claude/skills/ui-ux-pro-max-shopify/scripts/search.py "<query>" --design-system -p "Shopify Ecommerce Redesign" -f markdown

3. Save the output to:
   audit/outputs/latest/reports/design-system.md

4. Use it as the benchmark for style, color palette, typography, effects, CTA
   treatment, and anti-patterns in the steps below. Adapt it to the audited
   store's brand and the section purpose — guidance, not absolute truth. Do not
   copy a style that conflicts with the original store unless the brief asks for
   a strong redesign direction.

If Python or the script is unavailable, continue without failing and rely on the
manual inference in "Design system direction" below, the quality gate, and
visible screenshot evidence.

## Design objective

The redesign must improve:
- visual hierarchy
- ecommerce clarity
- CTA prominence
- product discovery
- buying confidence
- trust/shipping/return placement
- mobile usability
- spacing rhythm
- typography
- brand consistency

## Before coding

Before writing HTML/CSS, write a short design direction in Vietnamese:

- selected section
- current problem
- target user action
- style direction
- layout structure
- typography direction
- spacing system
- color direction
- CTA treatment
- mobile behavior
- why this will improve UX/conversion

Do not jump directly into code.

## Shopify ecommerce design principles

For hero sections:
- headline/value proposition must be clear
- CTA must be obvious
- visual and copy must support product/category discovery
- avoid vague lifestyle-only messaging
- mobile above-the-fold must communicate value quickly
- **keep the text to 4 elements, no more: eyebrow/subheading → heading → one short
  description line → CTA.** Don't stack extra badges, secondary links, or a second
  paragraph into the hero — that content belongs in the section below it.
- **keep the heading and subheading SHORT** — this is the ≤~50ch "hero/short copy"
  line-length rule from `ui-craft-heuristics.md`, applied literally: a heading that
  wraps to 3-4 lines is too long, tighten it to a punchy statement (a real example:
  cut "Ausrüstung, die im Laden geprüft wird, bevor Du sie online kaufst" down to
  "Erst testen. Dann online kaufen.")

For product information sections:
- title, price, variant, CTA should have strong hierarchy
- reduce unnecessary spacing before buying action
- trust/shipping/return info should support the buying decision
- mobile CTA should be reachable without excessive scrolling

For product grid/collection sections:
- card image ratio should be consistent
- title, price, badge, CTA should be scannable
- sale/new/sold out badges should be distinct
- grid spacing should help users compare products quickly
- mobile cards should remain readable and tappable

For trust/shipping sections:
- concise copy
- useful icons only
- avoid too many badges
- place near conversion decision when possible
- make reassurance easy to scan

## Visual style rules

Prefer:
- clean ecommerce layout
- intentional whitespace
- strong but tasteful CTA
- readable type scale
- restrained shadows
- consistent border radius
- consistent card treatment
- product/content-first design
- mobile-first stacking

Avoid:
- generic SaaS landing page style
- random gradients
- random blob decorations
- centered text everywhere
- weak CTA
- excessive icons/badges
- oversized empty cards
- placeholder-heavy design
- mobile layout that is only a squeezed desktop

## Component & layout standards (apply during redesign)

Concrete defaults for the building blocks. (Adapt to the store's chosen archetype — these are
the baseline, not a straitjacket; the per-store design language can deviate with intent.)

**Grid & container**
- Columns: 12 (desktop) / 8 (tablet) / 4 (mobile).
- Container: max-width ≤1440px; content column **1200–1320px**; side padding 32px desktop /
  16px mobile.

**Spacing scale** — use an 8px-based scale (`16 · 24 · 32 · 40 · 48 · 56 · 64 · 80 · 96`); no
arbitrary values. Section vertical padding is normally **40px** (≈80px gap between two stacked
content bands) — see the governing "Section spacing & vertical rhythm" rule: the resulting gap
must stay in **[56,112]px** (target ~64–80). Do NOT double `64+64→128` into a void; bump only
hero/standout bands higher via `min-height`, not stacked padding.

**Product card** (keep ONE card component sitewide):
- Required: image · name · price · status badge. Optional: compare-at price · swatches ·
  quick-add · wishlist.
- Image dominates — ~70–80% of the card; **price has higher emphasis than the product name**.
- One image ratio across the whole grid — **4:5 preferred (or 1:1), never mixed** (enforced by
  the Fixed-ratio media rule).
- States: default (clean, border only if the system uses one) · hover (secondary image /
  quick-add / subtle elevation — no dramatic scale; see Micro-interactions) · selected (clear
  indicator) · disabled (reduced opacity, non-interactive).

**Badges**
- Max **2 per card**; priority **Sold Out > Sale > New > Bestseller**.
- Top-left (top-right alt), compact + high-contrast, scannable in ~1s. Never centred over the
  image; no large promo stickers / heavy shadows / decorative shapes.

**Typography** — max **2 families** (1 primary), scale `12 · 14 · 16 · 18 · 24 · 32 · 48`; no
random sizes. Price emphasis > product title. (Use real web fonts — see Typography quality.)

**Buttons** — only **3 types**: primary (the one conversion action) · secondary (support) ·
text (low-emphasis). Height min 44 / **pref 48px**; one shared corner-radius system.

**Colour** — 1 primary + 1 accent + a neutral grayscale; limit promo colours. Colour signals
**action / status / feedback**, not decoration.

**Collection page** — product-first priority: products > filtering > sorting > promo. Products
must dominate the viewport.

**Mobile** — mobile-first; touch targets ≥44px; **max 2-column** product grid; sticky add-to-
cart preferred; reduce clutter; avoid hover-dependent interactions (hover is an enhancement,
the core flow works without it).

**Sitewide consistency** — these stay visually identical everywhere: product card · buttons ·
badges · inputs · modals · drawers · pagination · filters. No alternative versions without a
clear design reason. **Consistency > creativity.**

**Quick heuristics** (sanity-check every section):
- Product image larger than text; price visible with no interaction; badge scannable in ~1s.
- One primary action per section; no competing same-weight CTAs in a viewport.
- Whitespace sharpens product focus — it must not read as an empty void (see the gap band).
- A user should "get" the product card within ~3s.

## HTML/CSS rules

When creating mockups:
- create one standalone HTML file in audit/outputs/latest/designs/
- put CSS inside a style tag
- use pure HTML/CSS only
- do not use external CSS frameworks
- keep text editable
- make the mockup responsive
- prefer section-level mockup, not a full-page mockup
- **Use the store's REAL on-page images — MANDATORY (no placeholders when a real
  asset exists).** Every audit ships a ready asset index at
  `audit/outputs/latest/reports/image-assets.json` (run `npm run assets:images`
  if it's missing). It lists, per page, the real image URLs (with `alt` + size)
  and the visible prices pulled from the captured DOM. Before coding a mockup,
  READ it and pick the matching real URLs (logo, hero, category tiles, product
  shots) and real prices/copy. Placeholders/`picsum`/grey boxes are only allowed
  when no real asset exists for that slot — and say so. A mockup that uses stock
  or placeholder imagery while real assets were available is a FAIL: it makes the
  demo look generic and breaks the "this is YOUR site" effect for the client.
- structure should be easy to convert into a Shopify section later

Preferred structure:
- section wrapper
- container
- grid/flex layout
- content block
- media block
- CTA group
- trust item list or product card list if relevant

## Shopify feasibility (every suggestion must be implementable on a Shopify theme)

A redesign is only useful if it can actually ship on the store's theme. Ground
every suggestion in how it would be built, and prefer the lowest-effort path.

**Respect Shopify's hard platform limits — MANDATORY.** Before mocking anything,
consult `../shopify-ecommerce-audit/shopify-platform-limits.md` (the LitOS Shopify
limits cheat-sheet) and never design something the platform can't do. Most common
traps: **max 3 product options** (a configurable PDP gets at most 3 selectors —
Size/Finish/Chair, etc.; show a 4th attribute as an included component or a
line-item property, use a Combined Listing, or route it to a quote — NEVER a 4th
option selector); **the checkout UI is not editable on non-Plus** (keep redesign work
pre-checkout — cart drawer/page only); **≤3 menu tiers**; PLP filters map only to
options / metafields / tags / metaobjects (Search & Discovery, ≤25); theme caps of
≤25 sections & ≤50 blocks per section. If a limit isn't in the cheat-sheet or you're
unsure, VERIFY against help.shopify.com / shopify.dev before building — never guess.

If the Shopify Liquid skills are installed (plugin `Shopify/liquid-skills`:
`shopify-liquid-themes`, `liquid-theme-standards`, `liquid-theme-a11y`), CONSULT
them to validate feasibility and follow theme conventions:
- `shopify-liquid-themes` — section `{% schema %}`, blocks, settings, presets,
  `app` blocks, objects/filters/translations: confirm the change maps to real
  section settings/blocks (merchant-editable) vs. requiring Liquid code.
- `liquid-theme-standards` — write the mockup CSS/JS the theme way (BEM classes,
  CSS custom-property design tokens, Web Components for behavior, defensive
  Liquid); avoid frameworks. Makes the mockup a drop-in section.
- `liquid-theme-a11y` — apply the WCAG patterns for the component (labels, focus,
  contrast, keyboard, ARIA).

Classify each suggestion by HOW it ships (and say so in redesign-result.md):
- **Theme Customizer / settings** — merchant-editable (section settings, blocks,
  banner image, button color, reorder/remove sections). No code. 🟢 Client.
- **Section / block code** — a new or edited section with `{% schema %}` settings
  + Liquid markup (e.g. standardized product card, sticky mobile ATC, trust grid).
  Dev.
- **App** — relies on a Shopify app (reviews, advanced filters via Search &
  Discovery, upsell). Config + maybe an app block.
- Note theme limits: respect Online Store 2.0 sections/blocks, don't assume
  checkout edits (Plus/Functions only), and structure the mockup so a dev can
  paste it into a section with a matching schema.

Do NOT recommend anything that cannot be built as a theme section/block, app, or
setting. If a feature needs an app, say which kind.

## Fixed-ratio media (MANDATORY — prevents uneven image heights)

Product-card and banner images MUST keep a uniform, fixed aspect ratio so every
card is exactly the same height. NEVER let an in-flow `<img>` size the box: an
`<img>` with `height:100%` inside an `aspect-ratio` container does NOT resolve
(the percentage height is against an indefinite height), so the image falls back
to its intrinsic height and the container grows unevenly per image.

Always use this pattern — the image is absolutely positioned so the ratio box
(not the image's natural size) controls the height:

```css
.media { position: relative; aspect-ratio: 4/5; overflow: hidden; } /* 1/1, 4/5, 3/4… */
.media img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
```

Equivalently, give each card's media a fixed `height` (or `padding-top` ratio
trick) with `object-fit: cover`. Verify in the render that all card images line
up on one straight bottom edge before finalizing.

The same idea applies to ALL images in mockups (heroes, banners): set the box
ratio/size and let `object-fit: cover` crop — never let the image's intrinsic
dimensions decide the layout box.

## No layout overflow — every section fits the viewport (MANDATORY, desktop AND mobile)

NO section may overflow the layout horizontally — there must be **zero horizontal
scroll** at every width, on desktop AND mobile. A section that pushes past the
viewport is a hard FAIL.

Rules to guarantee it:
- **Never use fixed/min widths wider than the container.** No `width:1500px`, no
  un-wrapping fixed rows that exceed the viewport.
- **`min-width:0` on every grid/flex child** that holds text or inputs (grid/flex
  items default to `min-width:auto`, so a long title or a `<select>`/`nowrap`
  element expands the track and overflows). Use `minmax(0,1fr)` for flexible tracks.
- **Collapse multi-column layouts on mobile** with `@media (max-width:760px)`:
  product grids 4→2 (or 1), PDP buy box →1 column, PLP sidebar stacks, footer →1–2
  columns, hero/vehicle/selector rows stack. Selectors and inputs go full width.
- **Long horizontal strips** (nav, tabs, chip rows) get `overflow-x:auto;
  white-space:nowrap` so they scroll *inside themselves* instead of widening the page.
- Watch images/emoji/decoration positioned near the right edge — keep them inside
  the box (`overflow:hidden` on the parent).
- **Verify, don't assume.** After rendering, check `document.documentElement.scrollWidth <= window.innerWidth`
  at BOTH desktop (1440) and a strict mobile width (≤390). If `scrollWidth >
  innerWidth`, find the offending element (its `getBoundingClientRect().right >
  innerWidth`) and fix it before finalizing. The quality gate "no horizontal
  scroll" check must pass for every page.

## Section spacing & vertical rhythm — controlled gaps, no touch & no void (MANDATORY, verify)

Section spacing must land in a controlled BAND — NEITHER touching NOR a big empty void.
Both extremes are a recurring failure and a hard FAIL — fix them before finalizing.

Rules:
- **One spacing scale, applied consistently.** Use a single rhythm token for content
  bands — `section { padding: 40px 0 }` desktop, `~30px 0` mobile — and reuse it. Do NOT
  hand-tune every section to a different value, and NEVER ship a content section with `0`
  vertical padding (no `style="padding:0"` on a content band).
- **Keep the gap in the band: ~56–112px between two CONTENT bands** (desktop). Two
  failure modes, both wrong:
  - **Too little (<56px)** — sections touch / cramped (8–24px). A buy box must clear its
    accordions; a PLP grid must clear the next band.
  - **Too much (>112px void)** — usually **doubled symmetric padding**: two adjacent
    `padding:64px 0` sections stack into a ~128px white void that reads as broken. Size
    the per-section padding so the *sum of two adjacent* lands in the band (`40px 0` →
    80px gap). Blocks that are NOT `<section>` (accordion groups, etc.) don't inherit the
    rhythm — tune their own margins to the same ~56–80px on BOTH sides.
  Aim for a consistent ~64–80px rhythm everywhere; never a 0px touch, never a >112px void.
- **Pad the inner wrapper, then check the EDGES.** When a full-width band pads an inner
  `.wrap`/grid, make sure the band's content still clears the next band — e.g. a PLP
  grid/pagination must have bottom padding before a full-bleed trust strip, and a PDP buy
  box must have a real gap before the spec/accordion block (≥56px, not 24px).
- **Full-bleed bands may stack flush** (header → nav → hero → trust strip → footer) —
  their separation comes from the colour change + their OWN internal padding, so each such
  band must carry its own consistent vertical padding (e.g. trust strip `16px`, hero via
  `min-height` + centered content). A content (white-space) section must never sit flush
  against another content section.
- **Content never touches its own box edge — especially CONTAINED coloured banner bands.**
  Card info ≥`14px` padding, buy-box blocks ≥`16px`, container side padding ≥`16px` mobile /
  `32px` desktop. A **contained colour/gradient band** (an editorial/promo banner that sits
  inside the container, narrower than the viewport with the page colour showing around it)
  must carry its OWN horizontal padding (≥`24px`, typically `48–56px` desktop) — its copy/CTA
  must NOT hug the band's left/right edge. (A full-bleed band is fine because its inner
  `.wrap` provides the inset; a contained band has no `.wrap`, so YOU must pad it.) Text/price
  flush to a card, section, or banner edge is a FAIL.
- **Verify, don't eyeball.** Run the spacing audit after rendering and fix every flag:
  ```
  node audit/scripts/spacing-check.mjs audit/outputs/latest/designs/11-home-redesign.html \
       audit/outputs/latest/designs/12-plp-redesign.html audit/outputs/latest/designs/13-pdp-redesign.html
  ```
  It checks BOTH: (a) vertical gaps between bands — flags any content pair OUTSIDE `[56,112]px`
  (`CRAMPED` <56 / `AIRY void` >112); and (b) horizontal **EDGE** padding — flags a contained
  coloured banner band whose flow text hugs its left/right edge (inset `<20px`). It must
  report "OK — vertical gaps in [56,112]px and no edge-hugging text" before exporting.
- **Watch column-height voids too** (e.g. PDP gallery much taller than the buy box leaves
  a big empty right column). Balance it — shorter image ratio, wider buy box, and/or real
  reassurance content (payment/Klarna, delivery ETA) so columns end near each other.

## Icons — use the LitOS icon set, NEVER emoji (MANDATORY)

All UI icons (cart, search, account, trust badges, chevrons, social, etc.) use the
**LitOS icon set** in `audit/assets/icons/` (Lucide, ISC — uniform 24×24, stroke 2,
`currentColor`, round). Emoji (🚚 ★ 🌿 ⌕ 🛒 …) render inconsistently and look
unprofessional — do NOT use them for icons.

- In mockups: paste the inline `<svg>` from `audit/assets/icons/lucide/<name>.svg`,
  size with width/height, and let colour come from the parent's `color`
  (`stroke="currentColor"`). Catalog: `audit/assets/icons/litos-icons.html`.
- Keep it **dev-shippable**: the SAME plain SVG drops into the Shopify theme with
  no library import — a ready `snippets/icon.liquid` is provided at
  `audit/assets/icons/icons.liquid` (`{% render 'icon', icon: 'cart' %}`). So the
  mockup icon and the shipped icon are identical (demo matches 1:1). See
  `audit/assets/icons/README.md`.
- Need an icon not in the curated set? Copy it from `node_modules/lucide-static/
  icons/` into `audit/assets/icons/lucide/`. (Brand/social marks aren't in Lucide —
  use the brand's own SVG.)
- The faint product-image placeholder can use the `leaf`/`flower`/brand monogram —
  still no emoji.

## Micro-interactions — hover / focus / motion (MANDATORY, every mockup, every site)

Every redesign mockup must feel alive and clickable, not a flat static page. Bake
in a consistent **interaction layer** — it's part of the binding spec the dev
reproduces 1:1. A canonical block lives at `audit/scripts/apply-hover.mjs` (run it
to inject into existing mockups; for new mockups write the equivalent inline).
Minimum set, tuned to the site's palette:

- **Transitions everywhere** — `transition: … .2s ease` on links, buttons, cards,
  tiles, inputs, icons. No instant state jumps.
- **Links** — nav links get an animated underline (grow 0→100% width on hover, no
  markup change: `background-image:linear-gradient(currentColor,currentColor);
  background-size:0 1px;background-position:0 100%` → `:hover{background-size:100% 1px}`);
  secondary "see all / Découvrir →" links shift colour/opacity.
- **Buttons** — darken on hover (`filter:brightness(.95)` or a `--green-dk` token)
  and a subtle press on `:active` (`transform:translateY(1px)`).
- **Product / collection cards** — lift on hover (`transform:translateY(-3/-4px)`)
  with a soft shadow (`box-shadow:0 12px 30px rgba(<dark>,.10)`). Transform/shadow
  must not cause horizontal overflow — safe alongside the no-overflow rule.
- **Icon buttons (header search/account/cart)** — colour shift to the brand colour.
- **Inputs** — `:focus` changes border to the brand colour; remove the default
  outline but keep a visible `:focus-visible` ring.
- **Accessibility** — wrap motion in `@media (prefers-reduced-motion: no-preference)`
  and gate hovers in `@media (hover:hover)` so touch devices don't get stuck states;
  always provide a `:focus-visible` outline.

Hover/focus states are NOT captured in the static PNGs — they live in the HTML (the
binding spec). So adding/refreshing them does not require re-rendering or
re-exporting; only re-render when the default (un-hovered) visual actually changes.

## Stay faithful to the live site's sections & features (MANDATORY — applies to EVERY audit)

A redesign **restructures the store's own content — it does NOT invent a new store from
scratch, and it must NEVER drop the site's real features.** The live page is the source of
truth for WHAT exists; the redesign changes HOW it looks and is ordered, not WHAT the store
can do. This is the counterweight to "Design differentiation" below: differentiate the
*visual language & skeleton style*, but preserve the *feature inventory*.

Process (before building, for each page):
1. **Inventory the live sections first.** From the screenshots / section-map, list every
   real section and feature the page has (announcement, hero, USP/trust strip, category
   tiles, product rails, brand strip, blog/Instagram feed, reviews, newsletter, rewards,
   filters, variant picker, size guide, accordions, related/upsell, cart drawer, etc.).
   The rebuild must account for each — re-styled and re-ordered, not deleted.
2. **Keep every real feature.** If the live PDP has a size guide, reviews, accordions,
   Klarna, a wishlist — the redesign keeps them (restyled to the new system). Do NOT remove
   functionality the store relies on just because the new layout looks cleaner without it.
   Removing a feature is only allowed if the audit explicitly recommends removing it.
3. **Consolidate duplicates / redundancy.** If the site repeats the same thing (two near-
   identical hero banners, three overlapping "shop by category" strips, repeated trust rows),
   MERGE them into one stronger version — that's an improvement, not a feature loss.
4. **Add new sections only to fill genuine gaps.** If a page is too thin (e.g. a homepage
   with almost no content, or a PDP missing trust/cross-sell), add sections that fit the
   store and category (more banners/image bands, reviews, brand strip, cross-sell). New
   sections should extend the store's own world, not import an unrelated template's.
5. **Map it explicitly.** In `redesign-brief.md` / `design_system`, note for each page:
   sections KEPT (restyled), MERGED (which duplicates → one), and ADDED (and why). A
   reviewer should see the redesign is the *same store, improved* — same features, better
   structure & look — never a generic skeleton that quietly dropped what the store had.

> Reconcile with differentiation: the SKELETON STYLE (grid, hero type, density, card
> anatomy, signature motif) is what differs per store; the FEATURE SET stays faithful to the
> live site. Distinct look, same (or better-consolidated) capabilities — never fewer.

## Design differentiation — a distinct identity per store (MANDATORY, do this BEFORE building)

Every redesign must feel built **for this brand and this product category** — not a
recolored copy of the last store. Swapping color + font on the same wireframe is NOT
differentiation; the **skeleton** must change. Before writing any HTML, do this and record
it in `full_redesign_proposal.design_system`:

1. **Classify the store** — industry/category AND personality (luxury / value / playful /
   technical / heritage), catalogue size, who buys and why. (e.g. "used golf gear, technical,
   spec-driven, scarcity" vs "women's fashion outlet, value, brand-led, image-first".)
2. **Reference real sites** — name 2–3 best-in-class storefronts in that *exact* niche; note
   their layout archetype, card anatomy, hero, imagery treatment, and one signature element
   worth adapting. List them in the design-system brief (they also feed `reference_examples`).
3. **Pick / blend an archetype** from `redesign-archetypes.md` (Editorial Lookbook ·
   Hype/Drop · Utility/Spec-first · Warm Catalogue · Heritage/Boutique · Marketplace/Filter-
   first · Bold DTC). The archetype sets the SKELETON — grid ratios, hero type, section
   shapes, density, card anatomy, navigation feel — not just the palette.
4. **Diverge the bones** — deliberately differ from the last LitOS redesign in a different
   industry: change the **grid ratio** (e.g. 4-col uniform vs 2–3-col portrait vs filter-rail),
   the **hero type** (offer banner vs lifestyle editorial vs product/spec), **section shapes**
   (bordered/rounded vs borderless/sharp), **density**, **card anatomy** (what the card leads
   with — condition+specs vs brand+%off vs swatches vs scarcity), and add **≥1 signature motif**
   unique to the brand/category (e.g. golf-ball brand chips, condition grade, fabric/fit cues,
   botanical watermark, drop countdown, brand strip).
5. **Sanity check** — imagine this redesign side-by-side with the previous store's: would a
   stranger believe two different studios made them? If they look like siblings, differentiate
   harder (usually the grid + hero + card anatomy are the giveaways).

Record in `design_system`: the chosen **archetype**, the **2–3 reference sites**, and the
**signature element**, alongside the color/type/spacing tokens. The per-finding mockups AND
the full-page rebuild must follow this chosen language — consistently within the store,
distinctly from other stores.

### Vary the HERO layout — don't reuse one pattern (the giveaway)

The hero is the most visible "bone" and the easiest tell that two redesigns came from one
template. **Do NOT default to the same hero every time** (the recurring offender: text
left-aligned in a left/centre column over a diagonal gradient). Pick the hero layout that fits
THIS store's archetype + brand, and reconcile with the live hero (fidelity). A menu to choose
from (not exhaustive — invent others):
- **Centered statement** — big centred headline + CTAs over a full-bleed image + scrim. Bold,
  sale-forward; good for marketplace/outlet/DTC. (Secret Label uses this.)
- **Split** — offer/copy/CTA one side, a framed product/lifestyle image the other. Editorial,
  balanced; good for fashion/heritage/warm-catalogue.
- **Text over full-bleed image, corner-anchored** — minimal copy block bottom-left (or another
  corner) with a scrim. Quiet, editorial; good for premium/lookbook.
- **Product/spec-led** — hero features the product or a category/selector (e.g. fitment, size,
  vehicle) instead of lifestyle. Good for utility/spec-first.
- **Collage / multi-tile** — 2–3 promo tiles (categories or drops) instead of one banner.
  Good for warm-catalogue/marketplace with several entry points.
- **Slideshow / carousel** — the classic full-width hero rotator: 2-4 slides, each
  following the same eyebrow → heading → description → CTA composition (see the hero
  composition rule above), with icon-button prev/next arrows (a Lucide `chevron-left`/
  `chevron-right` in a circular ghost button, not text links) and a row of dot
  indicators for slide position. Good for a store with several distinct campaigns/
  drops to rotate, or when one static hero can't carry the message alone. If the
  store doesn't have enough distinct real images to fill every slide, build the first
  slide with the real hero photo and use a clearly-labeled placeholder image for the
  remaining slide(s) (see "Use the store's REAL images" — placeholders are allowed
  for a slot with no real asset, just label it as an example).
Legibility is mandatory: any text over imagery needs a scrim/overlay (WCAG AA). Choose a hero
that differs from the last LitOS redesign; note the chosen hero layout in `design_system`.

## Design system direction

If `audit/outputs/latest/reports/design-system.md` exists (from the Design
intelligence step), use it as the primary source for style, color, typography,
effects and CTA — reconciled with the store's real brand and screenshots.

Otherwise (script unavailable), infer a simple design system from:
- current store screenshots
- product category
- brand tone
- existing colors
- existing typography feel
- target section purpose

Either way, define:
- design style name
- primary/secondary color direction
- surface/background treatment
- type scale
- spacing scale
- radius/shadow direction
- CTA style

Do not introduce a random style that conflicts with the original store unless the audit brief asks for a strong redesign direction.

## Typography quality — real web fonts, never system defaults (MANDATORY, every site)

Mockups must use a deliberate **Google Fonts pairing**, not `system-ui`/`Segoe
UI`/bare `Georgia`. Load it in `<head>` with preconnect + a `fonts.googleapis.com/
css2` link, and apply micro-typography:

- **Pairing tuned to the brand** — a display/serif for headings + a clean grotesk
  for body. Botanical / artisanal / heritage → *Cormorant Garamond* + *DM Sans*
  (used for Maison Bonnes Herbes). Modern / tech / sport → e.g. *Sora*/*Space
  Grotesk* + *Inter*. Luxury/fashion → a high-contrast serif + a neutral sans.
  Pick what fits; don't reuse one pairing blindly.
- **Import only the weights you use** (e.g. `300;400;500;600;700`) so nothing
  falls back / synthesizes bold. Keep serif headings ≤ ~500–600 (most display
  serifs have no 800).
- **Micro-typography** — uppercase + wide tracking (`.2em`) on eyebrows/kickers;
  uppercase + `.05em` tracking on buttons; slight negative tracking (`-.01em`) on
  large serif headings; comfortable body line-height (1.6–1.8).
- A canonical transform that retrofits this onto existing mockups lives at
  `audit/scripts/upgrade-typography.mjs` (Cormorant + DM Sans variant). Re-render
  after applying — type changes the static PNGs (unlike the hover layer).

## Render and review process

After creating the HTML file:

1. Run:
npm run render:designs

2. Inspect the generated desktop and mobile PNG files.

3. Apply ecommerce-ui-quality-gate.

4. If the mockup looks generic, weak, or not clearly better than the original:
- revise HTML/CSS once
- improve spacing, typography, CTA, image usage, and hierarchy
- run npm run render:designs again

Only finalize when the redesign is clearly better than the original section.

## Output requirements

Create or update:
- HTML file in audit/outputs/latest/designs/
- desktop PNG and mobile PNG through render script
- audit/outputs/latest/reports/redesign-result.md
- In `audit/outputs/latest/reports/section-audit.json`, set `mockup_image` on the
  finding(s) covering the redesigned section, e.g.
  `"mockup_image": { "desktop": "audit/outputs/latest/designs/<name>.desktop.png", "mobile": "audit/outputs/latest/designs/<name>.mobile.png" }`.
  The slide builder then shows this mockup on the client's own site in that
  finding's SUGGESTION slide (re-run `npm run build:slides`).

Final summary should include:
- selected section
- old issue
- new design direction
- generated HTML path
- generated desktop PNG path
- generated mobile PNG path
- what improved and why

## Redesign levels

Use different redesign depth depending on severity and client-presentation value.

### full_redesign

Use for critical/high sections or medium sections with strong conversion impact.

Requirements:
- meaningful layout improvement
- stronger hierarchy
- polished CTA treatment
- responsive desktop/mobile
- clear ecommerce value
- must pass quality gate

### partial_redesign

Use for medium sections.

Requirements:
- preserve the original section purpose
- improve spacing, typography, CTA, card hierarchy, trust layout, or mobile stacking
- make the improvement visually clear for client approval
- avoid over-changing brand direction
- must still be implementable as Shopify section

### quick_visual

Use for lower-impact medium sections or visual-only improvements.

Requirements:
- create a simple before/after-style concept
- show the main improvement clearly
- do not over-polish
- focus on communicating the idea to the client