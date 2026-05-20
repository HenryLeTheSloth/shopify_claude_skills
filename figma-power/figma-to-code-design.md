> Thiết kế chi tiết quy trình Figma → Code cho Shopify Web Theme.
> Mục tiêu: Gen full Shopify sections/snippets từ Figma, pixel-perfect với design system.

---

# Figma → Shopify Code Design

## 1. Bối cảnh & Mục tiêu

| Yếu tố | Hiện trạng | Mục tiêu |
|---------|-----------|----------|
| Workflow | Code tay + AI rời rạc | Figma → Liquid/SCSS tự động, hệ thống hoá |
| Design System | Per project, setup qua `base.scss` | Shared token system (colors, typography, spacing) |
| Component Library | Sections + snippets | Audit → re-use được thì giữ, không thì gen mới |
| Scope | Individual components | Full page/section generation |

---

## 2. Kiến trúc tổng thể

```
Figma Design File
       │
       ▼
┌──────────────────────┐
│  Figma MCP Server    │  ← get_design_context, get_screenshot, get_variable_defs
└──────┬───────────────┘
       │ structured data (layout, colors, typography, spacing, assets)
       ▼
┌──────────────────────┐
│  Agent               │  ← base.scss (tokens) + design-system-rules.md
│  (Translation Layer) │
└──────┬───────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  Shopify Theme                  │
│  sections/*.liquid              │
│  snippets/*.liquid              │
│  assets/style.scss              │
└─────────────────────────────────┘
```

**Key insight:** `get_design_context` trả về React + Tailwind mặc định. Agent phải translate sang Liquid/SCSS dựa trên `design-system-rules.md` và tokens trong `base.scss`.

---

## 3. Phase 0 — Foundation (làm 1 lần per project)

### 3.1. Setup Token System

Extract tokens từ Figma → điền vào `base.scss`:

```
get_variable_defs(fileKey)
  → Color variables  → $color-* trong base.scss
  → Spacing scale    → $space-* trong base.scss
  → Text styles      → @mixin typography trong base.scss
  → Border radius    → $rounded-* trong base.scss
```

**Ví dụ `base.scss` sau khi setup:**

```scss
// Colors
$color-text:        #252528;
$color-background:  #ffffff;
$color-highlight:   #ff4599;
$color-button:      #ff4599;
$color-button-text: #ffffff;

// Spacing
$space-xs:  4px;
$space-sm:  8px;
$space-md:  16px;
$space-lg:  24px;
$space-xl:  32px;

// Border Radius
$rounded-button: 8px;
$rounded-card:   12px;

// Typography
@mixin heading-xl {
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: 32px;
  line-height: 1.2;
}

@mixin body-base {
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 16px;
  line-height: 1.5;
}
```

### 3.2. Component Audit

Trước khi gen mới, audit existing components:

| Bước | Action |
|------|--------|
| 1 | List tất cả snippets và sections hiện có |
| 2 | So sánh với Figma components (`search_design_system`) |
| 3 | Đánh giá: re-use / refactor / replace |
| 4 | Quyết định giữ hay gen mới |

**Tiêu chí re-use:**
- Props align với Figma variants → giữ
- Naming consistent → giữ
- Code quality thấp nhưng structure đúng → refactor
- Không match Figma structure → gen mới

---

## 4. Full Section/Page Generation Pipeline

### 4.1. Pipeline tổng quan

| Bước | Action | Tool(s) | Output |
|:----:|--------|---------|--------|
| 1 | Parse Figma URL | URL parsing | `fileKey`, `nodeId` |
| 2 | Get page structure | `get_metadata` | XML node map (sections, frames) |
| 3 | Identify sections | Agent analysis | List of sections + nodeIds |
| 4 | Fetch design per section | `get_design_context` per section | Structured data per section |
| 5 | Capture screenshot | `get_screenshot` | Visual reference |
| 6 | Download assets | Asset endpoint (localhost) | Images, SVG icons |
| 7 | Generate Liquid + SCSS | Agent + design-system-rules | section.liquid + style rules |
| 8 | Assemble full page | Agent | Page hoặc template với sections |
| 9 | Validate | Visual comparison | Checklist pass |

> **Tại sao decompose trước (bước 2-3)?**
> Full page quá lớn cho 1 lần `get_design_context` — sẽ bị truncated. Decompose theo Shopify sections rồi fetch từng phần.

### 4.2. Decomposition Strategy

```
Full Page (Figma)
  ├── Header / Navigation → snippets/header.liquid
  ├── Hero Section        → sections/hero.liquid
  ├── Product Grid        → sections/product-grid.liquid
  ├── Feature Banner      → sections/feature-banner.liquid
  ├── Testimonials        → sections/testimonials.liquid
  └── Footer              → snippets/footer.liquid
```

**Quy tắc decompose:**
- Mỗi Figma top-level frame → 1 Shopify section
- Shared UI (header, footer, nav) → snippet
- UI lặp lại trong section → nested snippet
- Section chính compose các snippets

---

## 5. Translation Rules — Figma → Liquid/SCSS

### 5.1. Layout

| Figma | Liquid/SCSS |
|-------|-------------|
| Auto Layout (vertical) | `display: flex; flex-direction: column; gap: $space-*` |
| Auto Layout (horizontal) | `display: flex; flex-direction: row; gap: $space-*` |
| Auto Layout (wrap) | `display: flex; flex-wrap: wrap; gap: $space-*` |
| Grid | `display: grid; grid-template-columns: ...; gap: $space-*` |
| Hug Contents | `width: fit-content` |
| Fill Container | `flex: 1` hoặc `width: 100%` |
| Fixed size | named SCSS variable |
| Padding | `padding: $space-*` |
| Corner Radius | `border-radius: $rounded-*` |
| Drop Shadow | `box-shadow: ...` |
| Opacity | `opacity: 0.X` |
| Scroll | `overflow: auto` / `overflow-x: auto` |

### 5.2. Typography

| Figma | SCSS |
|-------|------|
| Text style "Heading XL" | `@include heading-xl` |
| Text style "Body Base" | `@include body-base` |
| Text style không match | Tạo mixin mới trong `base.scss` |

### 5.3. Colors

| Figma | SCSS |
|-------|------|
| Color variable "text/primary" | `$color-text` |
| Color variable "surface/brand" | `$color-highlight` |
| Color không match | Báo user, không tự thêm |

### 5.4. Component Instance → Snippet

| Figma | Shopify |
|-------|---------|
| Component instance | `{% render 'snippet-name', param: value %}` |
| Variant prop | Liquid parameter + modifier class |
| Boolean prop | `{% if param %}...{% endif %}` |
| Text prop | `{{ param }}` |
| Image prop | `{{ param | image_url: width: 800 | image_tag }}` |

### 5.5. States & Variants

| Figma variant | Shopify |
|---------------|---------|
| Default | Base styles |
| Hover | `:hover` |
| Active | `.is-active` class |
| Disabled | `.is-disabled` / `[disabled]` |
| Loading | `.is-loading` class |

---

## 6. Full Section Generation — Ví dụ thực tế

### Input: Figma URL cho section "Featured Products"

**Bước 2-3: Decompose**

```
get_metadata → XML structure:
  Frame "Featured Products"
    ├── Frame "Heading" (nodeId: 10:1)
    ├── Frame "Product Grid" (nodeId: 10:2)
    │     └── Component "Product Card" × 4 (nodeId: 10:3)
    └── Frame "CTA Button" (nodeId: 10:4)
```

**Bước 4: Fetch per section**

```
get_design_context("10:1") → Heading data
get_design_context("10:2") → Grid layout data
get_design_context("10:3") → Product Card component data
get_design_context("10:4") → CTA Button data
```

**Bước 7: Generate — Liquid**

```liquid
{{- 'featured-products.css' | asset_url | stylesheet_tag -}}

<section class="featured-products" id="shopify-section-{{ section.id }}">
  <div class="page-width">
    <h2 class="featured-products__heading">
      {{ section.settings.heading }}
    </h2>

    <div class="featured-products__grid">
      {%- for product in section.settings.collection.products limit: 4 -%}
        {% render 'product-card', product: product %}
      {%- endfor -%}
    </div>

    {%- if section.settings.button_label != blank -%}
      <a href="{{ section.settings.button_link }}" class="btn btn--primary">
        {{ section.settings.button_label }}
      </a>
    {%- endif -%}
  </div>
</section>

{% schema %}
{
  "name": "Featured Products",
  "settings": [
    { "type": "text", "id": "heading", "label": "Heading", "default": "Featured Products" },
    { "type": "collection", "id": "collection", "label": "Collection" },
    { "type": "text", "id": "button_label", "label": "Button label" },
    { "type": "url", "id": "button_link", "label": "Button link" },
    { "type": "range", "id": "padding_top", "label": "Padding top",
      "min": 0, "max": 100, "step": 4, "unit": "px", "default": 36 },
    { "type": "range", "id": "padding_bottom", "label": "Padding bottom",
      "min": 0, "max": 100, "step": 4, "unit": "px", "default": 36 }
  ],
  "presets": [{ "name": "Featured Products" }]
}
{% endschema %}
```

**Bước 7: Generate — SCSS (`style.scss`)**

```scss
@use "./base.scss" as *;

.featured-products {
  padding-top: var(--section-padding-top);
  padding-bottom: var(--section-padding-bottom);
  background: $color-background;

  &__heading {
    @include heading-xl;
    color: $color-text;
    margin-bottom: $space-lg;
    text-align: center;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: $space-md;

    @include tablet-down {
      grid-template-columns: repeat(2, 1fr);
    }

    @include mobile {
      grid-template-columns: 1fr;
    }
  }
}
```

---

## 7. Performance Optimization

### 7.1. Parallel Fetch

Sau khi decompose, fetch tất cả sections song song:

```
Parallel:
  get_design_context("10:1") ─┐
  get_design_context("10:2") ─┤→ Merge results → Generate
  get_design_context("10:3") ─┤
  get_design_context("10:4") ─┘
  get_screenshot(parent)     ─┘
```

### 7.2. Shared Components

Nếu page A và page B share snippet (e.g. `product-card`), gen 1 lần rồi re-use trong cả hai.

### 7.3. Incremental Update

Khi design thay đổi 1 section:
- Chỉ re-fetch `get_design_context` cho nodeId của section đó
- Chỉ re-gen Liquid/SCSS cho section đó
- Không re-gen toàn bộ page

---

## 8. Asset Handling

### Icons

| Strategy | Shopify |
|----------|---------|
| Download SVG từ Figma | Store vào `assets/icon-name.svg` |
| Inline icon | `{% render 'icon-name' %}` (snippet) |
| Asset tag | `{{ 'icon-name.svg' | asset_url }}` |

- Naming: `icon-kebab-case.svg`
- ❌ Không install icon packages mới

### Images

| Type | Shopify |
|------|---------|
| Remote / product image | `{{ image | image_url: width: 800 | image_tag: loading: 'lazy' }}` |
| Section setting image | `{% render 'background-image', image: section.settings.image %}` |
| Static asset | `{{ 'image.jpg' | asset_url | img_tag: 'Alt', 'class-name' }}` |

---

## 9. Quality Gates

Trước khi claim "done" cho mỗi section/page:

| Gate | Check |
|------|-------|
| **Tokens** | Không hardcode color/spacing/font — dùng `$color-*`, `$space-*`, `@include` |
| **Breakpoints** | Mobile/tablet/desktop layouts đúng với Figma |
| **Visual** | So sánh screenshot vs. Figma (±2px spacing, ±1px font) |
| **Snippets** | UI lặp ≥ 2 lần đã tách snippet |
| **Schema** | Section có `padding_top`, `padding_bottom`, settings phù hợp |
| **Assets** | Ảnh dùng Shopify Image URL API + `loading: lazy` |
| **BEM** | CSS class đúng convention, phản ánh Figma names |
| **Liquid** | Dùng `render` không `include`, không global variables |

---

## 10. Rollout Plan

| Phase | Scope | Deliverable |
|-------|-------|-------------|
| **Phase 0** | Foundation | `base.scss` tokens, component audit |
| **Phase 1** | 1 simple section (ít dynamic data) | Gen + validate → refine rules |
| **Phase 2** | 3-5 sections (mix complexity) | Gen + validate → stabilize pipeline |
| **Phase 3** | All remaining sections/pages | Full production rollout |
| **Phase 4** | Maintenance | Design change → incremental re-gen |

**Phase 1 recommendation:** Chọn section đơn giản như "Hero Banner" hoặc "Text + Image" để test pipeline end-to-end trước khi scale.

---

*Tài liệu cập nhật: 2026-05-20 | Scope: Shopify Web Theme (Liquid + SCSS)*
