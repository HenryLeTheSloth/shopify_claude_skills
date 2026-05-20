> Design System Rules — Shopify Liquid + SCSS
> Mục đích: Hướng dẫn Claude implement pixel-perfect từ Figma → Shopify Liquid
> Cập nhật: 2026-05-20

---

# Shopify Design System Rules

## Mandatory steps (Shopify skill)

Mỗi response tạo Liquid code PHẢI chạy đủ 2 bước:

```bash
# 1. Search trước khi viết
node .agents/skills/shopify-liquid/scripts/search_docs.mjs "<component type>"

# 2. Validate sau khi viết
node .agents/skills/shopify-liquid/scripts/validate.mjs \
  --theme-path <abs-path> --files <rel-paths> \
  --model claude-sonnet-4-6 --client-name claude-code --client-version 1.0 \
  --artifact-id <stable-id> --revision <n>
```

❌ Không trả code cho user nếu chưa pass validate.

---

## Kiến trúc file

```
base.scss              ← Tokens ($color-*, $space-*, mixins) + breakpoints
style.scss             ← Entry: @use base.scss + tất cả component styles
sections/*.liquid      ← Layout + schema (không có style inline)
blocks/*.liquid        ← Block components + schema + {% doc %}
snippets/*.liquid      ← Reusable fragments + {% doc %}
locales/en.default.json ← i18n strings
```

---

## Quy tắc CSS

### Static styles → SCSS trong `style.scss`

Tất cả styles viết trong `style.scss` (hoặc file SCSS riêng import vào `style.scss`). Không dùng `{% stylesheet %}` trong file Liquid.

```scss
// style.scss
@use "./base.scss" as *;

.hero {
  background: $color-bg;
  padding: $space-xl $space-lg;

  &__title {
    @include heading-xl;
    color: $color-text;
  }

  @include mobile {
    padding: $space-md;
  }
}
```

### Dynamic settings → inline CSS custom properties (ngoại lệ duy nhất)

Chỉ dùng `style=""` khi giá trị đến từ `section.settings` hoặc `block.settings`:

```liquid
{{- Đúng: giá trị do merchant config -}}
<section class="hero" style="--hero-height: {{ section.settings.height }}px;">

{{- Sai: giá trị static -}}
<section class="hero" style="padding: 36px;">
```

Trong SCSS, đọc lại bằng `var()` với fallback:

```scss
.hero {
  height: var(--hero-height, 600px);
}
```

---

## 1. Colors — `$color-*`

Điền values từ Figma vào `base.scss`:

```scss
$color-text:        #252528;
$color-bg:          #ffffff;
$color-highlight:   #ff4599;
$color-button:      #ff4599;
$color-button-text: #ffffff;
```

Dùng trong `style.scss`:

```scss
.btn { background: $color-button; color: $color-button-text; }
```

**Rules:**
- ❌ Không hardcode hex trong `style.scss`
- ✅ Luôn dùng `$color-*`
- Màu Figma không map được → báo user, không tự thêm variable

---

## 2. Spacing — `$space-*`

```scss
$space-xs:  4px;
$space-sm:  8px;
$space-md:  16px;
$space-lg:  24px;
$space-xl:  32px;
$space-2xl: 48px;
```

**Rules:**
- ❌ Không hardcode px trong SCSS
- ✅ Luôn dùng `$space-*`
- ❌ `margin` để tạo gap giữa items → ✅ `gap`
- Figma value không có token → dùng nearest (±2px tolerance)
- Fixed design constant ngoài scale → named variable: `$banner-height: 413px`

---

## 3. Typography — SCSS mixins

Mỗi Figma text style → 1 mixin trong `base.scss`:

```scss
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

Dùng trong `style.scss`:

```scss
.hero__title { @include heading-xl; }
.product__desc { @include body-base; }
```

**Rules:**
- ❌ Không hardcode `font-size`, `font-weight`, `line-height` inline
- ✅ Luôn dùng `@include mixin-name`
- Không match mixin nào → tạo mixin mới trong `base.scss`

---

## 4. Border Radius — `$rounded-*`

```scss
$rounded-sm: 4px;
$rounded-md: 8px;
$rounded-lg: 12px;
```

Dùng: `border-radius: $rounded-md;`

---

## 5. Breakpoints — SCSS mixins (trong `style.scss`)

❌ Không viết `@media` raw trong `style.scss`. ✅ Dùng mixin.

```scss
.hero {
  padding: $space-xl;

  @include mobile    { padding: $space-md; }
  @include tablet-down { padding: $space-lg; }
}
```

| Mixin | Breakpoint |
|-------|-----------|
| `@include mobile` | `max-width: 767px` |
| `@include tablet-only` | `768px – 1024px` |
| `@include tablet-down` | `max-width: 1024px` |
| `@include desktop` | `min-width: 768px` |
| `@include wide-down` | `max-width: 1200px` |

---

## 6. Auto Layout → CSS

| Figma | SCSS |
|-------|------|
| Auto Layout vertical | `display: flex; flex-direction: column; gap: $space-*` |
| Auto Layout horizontal | `display: flex; flex-direction: row; gap: $space-*` |
| Auto Layout wrap | `display: flex; flex-wrap: wrap; gap: $space-*` |
| Grid | `display: grid; gap: $space-*` |
| Hug Contents | `width: fit-content` |
| Fill Container | `flex: 1` hoặc `width: 100%` |
| Fixed size | named SCSS variable |
| Corner Radius | `border-radius: $rounded-*` |

---

## 7. Component Rules

### Liquid file — chỉ HTML + schema

Liquid file chứa HTML cấu trúc và `{% schema %}`. Không có style inline (ngoại lệ: dynamic settings).

```liquid
{%- liquid
  assign section_id = section.id
-%}

<section
  class="hero"
  style="--hero-pt: {{ section.settings.padding_top }}px; --hero-pb: {{ section.settings.padding_bottom }}px;"
>
  <div class="page-width">
    <!-- content -->
  </div>
</section>

{% schema %}
{
  "name": "t:sections.hero.name",
  "settings": [
    { "type": "range", "id": "padding_top", "label": "t:labels.padding_top",
      "min": 0, "max": 100, "step": 4, "unit": "px", "default": 36 },
    { "type": "range", "id": "padding_bottom", "label": "t:labels.padding_bottom",
      "min": 0, "max": 100, "step": 4, "unit": "px", "default": 36 }
  ],
  "presets": [{ "name": "t:sections.hero.name" }]
}
{% endschema %}
```

Trong `style.scss`:

```scss
.hero {
  padding-top: var(--hero-pt, 36px);
  padding-bottom: var(--hero-pb, 36px);
}
```

### File Naming

| Type | Location | Convention |
|------|----------|------------|
| Section | `sections/` | `kebab-case.liquid` |
| Block | `blocks/` | `kebab-case.liquid` |
| Snippet | `snippets/` | `kebab-case.liquid` |

### CSS Naming — BEM trong `style.scss`

```scss
.product-card { }              // block — theo Figma frame name
.product-card__title { }       // element
.product-card__price { }
.product-card--sale { }        // modifier
.is-active { }                 // state
```

❌ Nested SCSS > 3 cấp | ❌ `!important` tùy tiện

### Re-use Rules

- UI lặp ≥ 2 lần → bắt buộc tách snippet
- Check `snippets/`, `blocks/`, `sections/` trước khi tạo mới
- `{% render 'name', param: value %}` — ❌ không dùng `{% include %}`
- ❌ Không rely vào global variables — truyền params explicit
- Blocks: `{{ block.shopify_attributes }}` trên wrapper element

### LiquidDoc — bắt buộc cho snippets và static blocks

```liquid
{% doc %}
  Renders a product card.
  @param {product} product - The product object
  @param {boolean} [show_price] - Show price (default: true)
  @example
  {% render 'product-card', product: product %}
{% enddoc %}
```

---

## 8. i18n — Bắt buộc cho mọi text hiển thị

```liquid
{{- 'sections.hero.heading' | t -}}
{{- 'sections.hero.slide_label' | t: number: forloop.index -}}
```

Update `locales/en.default.json` với mọi key mới:

```json
{
  "sections": {
    "hero": { "heading": "Welcome" }
  },
  "labels": {
    "padding_top": "Padding top"
  }
}
```

---

## 9. Asset Rules

### Images

```liquid
{{- image | image_url: width: 800 | image_tag: loading: 'lazy', class: 'component__image' -}}
```

- `image_url` + `image_tag` — ❌ không dùng deprecated `img_url` / `img_tag`
- `loading: 'lazy'` cho ảnh below-the-fold
- ❌ Không hardcode image paths

### Icons

- SVG inline qua snippet: `{% render 'icon-name' %}`
- Size control qua SCSS

---

## 10. Figma → Code Workflow

| Bước | Action | Tool |
|:----:|--------|------|
| **0** | Setup tokens → điền `base.scss` | `get_variable_defs(fileKey)` |
| 1 | Parse URL → `fileKey`, `nodeId` | URL parsing |
| 2 | Search docs | `scripts/search_docs.mjs "<query>"` |
| 3 | Fetch layout + visual reference | `get_design_context` + `get_screenshot` (parallel) |
| 4 | Truncated → node map | `get_metadata()` |
| 5 | Download assets | Asset endpoint (localhost) |
| 6 | Map Figma values → SCSS tokens | Code generation |
| 7 | Gen Liquid (HTML + schema) | Liquid file |
| 8 | Gen SCSS trong `style.scss` | SCSS |
| 9 | Validate | `scripts/validate.mjs` |
| 10 | So sánh vs screenshot → adjust | Visual comparison |

**Tolerance:** spacing ±2px | font ±1px → vượt = fix + validate lại

---

## 11. Validation Checklist

- [ ] `search_docs.mjs` đã chạy trước khi viết
- [ ] `validate.mjs` đã pass
- [ ] `base.scss` đã có đủ tokens
- [ ] Mọi color → `$color-*` trong SCSS
- [ ] Mọi spacing → `$space-*` trong SCSS
- [ ] Typography → `@include mixin-name`
- [ ] Border radius → `$rounded-*`
- [ ] Breakpoints → `@include mobile/desktop/...`
- [ ] Style inline trong Liquid: chỉ dynamic settings, không có gì khác
- [ ] i18n: mọi text → `{{ 'key' | t }}` + cập nhật `locales/en.default.json`
- [ ] Snippets + static blocks có `{% doc %}`
- [ ] Sections có `{% schema %}` với `padding_top`, `padding_bottom`
- [ ] Blocks có `{{ block.shopify_attributes }}`
- [ ] Ảnh dùng `image_url` + `image_tag` + `loading: lazy`
- [ ] `{% render %}` — không `{% include %}`
- [ ] CSS class theo BEM, phản ánh Figma names
- [ ] UI lặp ≥ 2 lần → tách snippet
- [ ] Visual so sánh vs Figma screenshot — tolerance met
- [ ] ❌ Không `!important` tùy tiện
- [ ] ❌ Không SCSS nested > 3 cấp
