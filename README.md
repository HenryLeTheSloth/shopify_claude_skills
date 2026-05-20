# Shopify Theme Base Template

## 📦 Giới thiệu

Đây là project template cơ bản để phát triển Shopify Theme. Project đã được cấu hình sẵn các công cụ cần thiết như **SCSS** và **Prettier** giúp bạn bắt đầu nhanh chóng.

👉 Chỉ cần pull về, cài đặt và code.

---

## ⚙️ Cài đặt

### 1. Clone project

```
git clone https://github.com/litos-dev2026/shopify-template-liquid.git . && rm -rf .git
```

### 2. Cài dependencies

```
npm install
```

### 3. Chạy development

Chạy 2 command song song:

```
npm run dev
npm run sass
```

👉 Khi đó:

* Code Liquid → auto reload
* Code SCSS → auto compile + reload

---

## 🤖 Claude + Figma Workflow

Template này tích hợp Claude Code để implement pixel-perfect từ Figma → Shopify Liquid + SCSS.

### Tổng quan

```
Figma Design
    │
    ▼ get_variable_defs + get_design_context + get_screenshot
    │
    ▼ Claude maps tokens → $color-*, $space-*, @mixin
    │
    ├── sections/*.liquid   (HTML structure + schema only)
    ├── blocks/*.liquid     (block components)
    ├── snippets/*.liquid   (reusable fragments)
    └── style.scss          (tất cả CSS dùng $var + @mixin)
```

### Quy tắc CSS cốt lõi

| Loại | Viết ở đâu |
|------|-----------|
| Static styles | `style.scss` — dùng `$color-*`, `$space-*`, `@include` |
| Dynamic settings | `style=""` inline — chỉ CSS custom properties từ `section.settings` |
| Breakpoints | `@include mobile {}` trong `style.scss` |

### Slash commands

| Command | Dùng khi |
|---------|---------|
| `/shopify-tokens-setup <figma-url>` | Bắt đầu project mới — extract tokens từ Figma vào `base.scss` |
| `/figma-implement <figma-url>` | Implement 1 section/snippet từ Figma URL |
| `/shopify-new-section <tên>` | Tạo section mới không có Figma |
| `/shopify-audit` | Kiểm tra & fix violations trong toàn bộ project |
| `/shopify-audit sections/hero.liquid` | Audit 1 file cụ thể |

---

## 📋 Prompts sẵn

Copy và paste trực tiếp vào Claude. Thay `<...>` bằng giá trị thực tế.

---

### 🟦 Setup — Bắt đầu project mới

```
/shopify-tokens-setup <figma-url>
```

Hoặc nếu muốn Claude tự extract + điền luôn vào base.scss:

```
Đọc Figma file này và điền đầy đủ token values vào base.scss.
Figma URL: <figma-url>

Cần extract:
- Colors → $color-* SCSS variables
- Spacing scale → $space-* SCSS variables
- Border radius → $rounded-* SCSS variables
- Typography → @mixin trong base.scss

Đặt tên variable theo Figma variable names, convert sang kebab-case.
```

---

### 🟩 Implement section từ Figma

```
/figma-implement <figma-node-url>
```

Hoặc prompt chi tiết hơn:

```
Implement section này từ Figma thành Shopify Liquid + SCSS.
URL: <figma-node-url>

Yêu cầu:
- HTML structure trong sections/<tên>.liquid
- Toàn bộ CSS trong style.scss dùng $color-*, $space-*, @include mixin
- Schema có padding_top, padding_bottom và các settings phù hợp
- Dynamic settings dùng inline CSS custom properties
- Text user-facing dùng {{ 'key' | t }}, cập nhật locales/en.default.json
- Validate bằng scripts/validate.mjs trước khi xong
```

---

### 🟩 Implement nhiều sections cùng lúc

```
Implement các sections sau từ Figma, theo thứ tự:
1. <figma-url-section-1> → sections/hero.liquid
2. <figma-url-section-2> → sections/featured-products.liquid
3. <figma-url-section-3> → sections/testimonials.liquid

Dùng tokens đã có trong base.scss. Validate từng file trước khi sang file tiếp theo.
```

---

### 🟨 Tạo section mới (không có Figma)

```
/shopify-new-section <tên-section>
```

Hoặc:

```
Tạo section "<tên>" cho Shopify với:
- Layout: <mô tả layout — ví dụ: 2 cột, trái là text phải là image>
- Settings cần có: <liệt kê — ví dụ: heading, description, image, button>
- Dùng tokens từ base.scss
- CSS trong style.scss
- i18n đầy đủ
```

---

### 🟨 Tạo snippet

```
Tạo snippet "<tên>" để render <mô tả>.

Parameters:
- <param_name>: <type> — <mô tả>
- <param_name>: <type> (optional) — <mô tả>

Dùng {% doc %} header. CSS viết trong style.scss với class BEM.
```

---

### 🟧 Audit & fix

```
/shopify-audit
```

Hoặc cho 1 file:

```
Audit file sections/<tên>.liquid và fix tất cả violations:
- Hardcoded colors → $color-*
- Hardcoded spacing → $space-*
- Inline styles tĩnh → chuyển vào style.scss
- Text không có i18n → {{ 'key' | t }}
- Validate sau khi fix
```

---

### 🟧 Fix nhanh 1 vấn đề cụ thể

```
Trong file sections/<tên>.liquid, chuyển toàn bộ inline styles tĩnh
sang style.scss. Giữ lại chỉ các style="" có giá trị từ section.settings.
```

```
Thêm i18n cho tất cả hardcoded strings trong sections/<tên>.liquid.
Tạo translation keys theo format sections.<tên>.<element>.
Cập nhật locales/en.default.json.
```

---

### 🔵 Figma utilities

```
Lấy design tokens từ Figma file này và liệt kê ra:
- Colors (hex values + variable names)
- Spacing values
- Typography styles (font, size, weight, line-height)
- Border radius values

Figma URL: <figma-url>
Chưa cần viết code, chỉ cần list ra để review.
```

```
So sánh section sections/<tên>.liquid đã implement với Figma design này: <figma-url>
Chỉ ra những điểm lệch về spacing, color, typography. Tolerance: ±2px spacing, ±1px font.
```

---

## 🚀 Tính năng đã tích hợp

### ✅ SCSS (Sass)

* Sử dụng SCSS để viết CSS dễ quản lý
* Hỗ trợ nesting, variables, mixins
* Tự động compile sang CSS bằng script

### ✅ Prettier

* Format code tự động (Liquid, HTML, JS, SCSS)
* Giữ code đồng nhất giữa các dev
* Cấu hình sẵn trong `.prettierrc`

### ✅ Shopify CLI

* Develop theme local
* Hot reload
* Pull / Push theme nhanh chóng

---

## 📁 Cấu trúc thư mục

```
├── assets/        # CSS, JS, images (style.css được build từ SCSS)
├── config/        # settings_schema.json, settings_data.json
├── layout/        # theme.liquid
├── locales/       # đa ngôn ngữ
├── sections/      # section liquid
├── snippets/      # reusable components
├── templates/     # template pages
├── base.scss      # design tokens + breakpoint mixins
├── style.scss     # entry point SCSS
├── .prettierrc    # config prettier
├── package.json
```

---

## 💻 Scripts

```
"scripts": {
  "pull": "shopify theme pull --store name_here.myshopify.com",
  "push": "shopify theme push --store name_here.myshopify.com",
  "dev": "shopify theme dev --store name_here.myshopify.com",
  "sass": "sass --watch ./style.scss:./assets/style.css"
}
```

* `npm run pull` → Lấy theme từ store về local
* `npm run push` → Đẩy code lên Shopify
* `npm run dev` → Chạy local dev (hot reload)
* `npm run sass` → Watch SCSS và build ra CSS

---

## 📤 Deploy

```
npm run push
```

---

## 🧠 Lưu ý

* SCSS compile từ: `style.scss → assets/style.css`
* Shopify chỉ đọc file CSS trong `assets`
* Không commit file nhạy cảm
* Luôn format code trước khi commit

---

Happy coding 🚀
