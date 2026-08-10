# UI craft heuristics — spacing, typography, layout & conversion flow

Purpose: give the auditor concrete, checkable "what good looks like" so visual/UI
findings are **specific and measurable** (numbers + evidence), not vague ("design
chưa đẹp"). Use these to surface craft issues even on an otherwise good store —
they're usually Low/Medium polish that lifts *perceived quality → willingness to
pay → conversion*. All fixes here are theme-native (CSS, design tokens, theme
settings, section reorder) — no app.

**Measured inputs (use them):** `reports/section-map.json` carries real computed-CSS
values from the live page — `uiMetrics.{desktop,mobile}` (`sectionGaps`,
`sectionPaddingsY`, `headingSizes`, `bodySizes`, `gridGaps`, `ctaBackgroundColors`,
`craftFlags`) and per-section `metrics` (`padTop/padBottom`, `gap`, `heading{px,lh}`,
`body{px,lh}`, `cta`). Cite these exact numbers instead of estimating from a
screenshot; the screenshot stays the source for line-length, alignment and focal
point. A `null`/`0` metric means the style lived elsewhere (margin/sibling) — verify
on the screenshot, don't assert a false "0px".

---

## 1. Spacing & rhythm
- **Base unit:** a 4/8px grid. Section vertical padding should follow ONE scale —
  e.g. desktop 48 / 64 / 80 / 96px, mobile 32 / 40 / 56px. **Flag:** padding that
  jumps unsystematically (one section 40px, the next 120px), cramped sections
  (<32px), or airy voids (>140px) that break the page rhythm.
- **Proximity / grouping:** related items get small gaps, unrelated get large gaps
  (proximity law). **Flag:** a label glued to the wrong field, a price floating far
  from its product, CTA crowded by neighbours.
- **Line length:** body text 60–75 characters per line; hero/short copy ≤ ~50ch.
  **Flag:** full-bleed paragraphs running >90ch (hard to read).
- **Grids:** equal gutters, aligned baselines, consistent card heights in a row.
  **Flag:** uneven gaps, cards of different heights, a lone card beside empty space.
- **Whitespace as hierarchy:** generous space around the primary CTA + price makes
  them dominant; crowding the Add-to-Cart with badges/links dilutes it.
- **Touch targets:** ≥ 44×44px on mobile, ≥ 8px between tappable items.

## 2. Typography
- **One type scale** (e.g. 12/14/16/20/24/32/44), ideally a modular ratio (1.2–
  1.333). **Flag:** ad-hoc sizes (17px here, 15px there) with no system.
- **Hierarchy:** clear H1 > H2 > body; the H1 is the single largest text and owns
  the value prop. One real (text) H1 per page — headline baked into a hero image
  loses SEO/accessibility and is itself a finding.
- **Weight + size, not colour alone,** for hierarchy. Body 15–18px desktop / 15–16px
  mobile; line-height 1.4–1.6 body, 1.05–1.2 display.
- **Font pairing:** max 2 families (display + body). **Flag:** 3+ families, or a
  decorative font used for body copy.
- **Case & tracking:** ALL-CAPS only for short labels/eyebrows (with letter-
  spacing); never long ALL-CAPS paragraphs.
- **Prices:** the selling price is prominent (size + weight); compare-at is struck +
  muted; the sale colour is consistent everywhere.
- **Readability/contrast:** min 15px body; avoid light-grey body on white (<4.5:1);
  avoid thin weights at small sizes.

## 3. Layout & visual hierarchy
- Every section answers **"where do I look first, second, third?"** — one dominant
  focal point (hero visual / H1 / CTA), then supporting elements.
- **Reading patterns:** Z-pattern for hero/landing (logo → nav → hero → CTA);
  F-pattern for text/PLP (left-edge scan). Put the CTA on that path.
- **Alignment:** strong, consistent alignment (usually left); don't ping-pong
  left/centre between sections; don't centre long paragraphs.
- **Above the fold:** the hero must convey WHAT they sell + a shopping action within
  the first screen; on PDP, price + Add-to-Cart should be reachable near the fold.
- **Chunking:** break content into scannable chunks (bullets, accordions) — but
  don't over-fragment or duplicate (e.g. two accordion blocks repeating specs).
- **Consistency across pages:** one card component, one button system, one
  header/footer. Page-to-page drift (cards with ATC on PLP but not home; different
  rhythms per template) is a finding.

## 4. Colour, contrast & imagery
- **One primary-action colour,** used ONLY for primary CTAs; secondary/tertiary
  actions are visually subordinate. **Flag:** the primary colour reused on non-CTA
  elements, or two competing "primary" colours.
- **Consistent accent** (sale badges + sale price share one colour). Rainbow / multi-
  colour headings usually clash with a disciplined palette.
- **Contrast:** text ≥ 4.5:1 (AA), large text ≥ 3:1, visible focus/hover states.
  "Invisible" text (colour ≈ background) is at least a High-severity finding.
- **Imagery:** consistent aspect ratios, backgrounds and treatment across cards;
  mixing cut-out + lifestyle + different backgrounds looks unowned. Keep product
  shots on a consistent surface.
- **Icons over emojis** for UI/feature callouts (emojis render per-device, read
  informal, and break a premium look).

## 5. Conversion flow — does the page LEAD to the product?
Section order should walk the visitor **attention → interest → desire → action:**
- **Homepage:** hook (hero value prop + shop CTA) → orient (category/collection
  entry + visible search) → prove (best-sellers/new arrivals, reviews, trust) →
  nurture (benefits/story, blog) → capture (newsletter). Discovery should start
  high — don't bury shopping under an education/explainer.
- **Collection:** short intro → visible filters/sort → scannable grid → pagination.
  Don't push the grid far below a tall hero.
- **PDP:** title + price + rating → gallery → variant + qty + Add-to-Cart (near
  fold) → trust (shipping/returns/warranty) → details (specs/description) → social
  proof (reviews) → related/cross-sell. The **buy decision (price + ATC + trust +
  proof) should cluster;** deep marketing/detail comes after.
- **Cart:** line items → progress-to-free-shipping → cross-sell → trust → dominant
  Checkout.
- Ask of every section: **"does this move the visitor toward a product/checkout, or
  is it a detour?"** Too many detours before discovery, or a buy decision scattered
  across the page, is a finding.

---

## Filing UI-craft findings
- **Specific + measurable** beats vague: "Section padding jumps ~40px → ~120px
  between the trust band and the grid, breaking rhythm" — not "spacing is off".
- **Tie to conversion / quality perception:** cramped price+ATC → weaker CTA;
  no type system → less premium → lower willingness to pay; a scattered buy
  decision → more hesitation.
- **Severity:** most craft issues are Low/Medium unless they block scanning or the
  CTA (then High). Keep scores on the 4–7 client scale.
- **Feasibility:** spacing/type/colour tokens, section reorder, one card/button
  system — all theme CSS/settings. No app, no checkout edits.
