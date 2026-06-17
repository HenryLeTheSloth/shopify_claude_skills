# Shopify Theme Base Template

## 📦 Giới thiệu

Đây là project template cơ bản để phát triển Shopify Theme. Project đã được cấu hình sẵn các công cụ cần thiết như **SCSS** và **Prettier** giúp bạn bắt đầu nhanh chóng.

👉 Chỉ cần pull về, cài đặt và code.

---

## ✅ Yêu cầu tiên quyết (Prerequisites)

Trước khi cài đặt, máy bạn cần có sẵn các công cụ sau:

| Công cụ | Phiên bản | Ghi chú |
|---------|-----------|---------|
| **Node.js** | **v22.x** (LTS) | Khuyến nghị cài qua [nvm](https://github.com/nvm-sh/nvm) |
| **npm** | v10+ | Đi kèm khi cài Node.js |
| **Shopify CLI** | v4+ | Develop / pull / push theme |
| **Firecrawl CLI** | v1+ | Cho các command `/site-*` (audit & clone website) |
| **Git** | mới nhất | Để clone project |
| **Tài khoản Shopify** | — | Có quyền truy cập store (Partner hoặc Staff) để `pull` / `push` theme |
| **API key Firecrawl** | — | Lấy tại [firecrawl.dev](https://www.firecrawl.dev) (dạng `fc-...`) |

### 1. Cài Node.js v22 (qua nvm)

```bash
# Cài nvm (nếu chưa có) — xem https://github.com/nvm-sh/nvm
nvm install 22
nvm use 22

# Kiểm tra
node -v   # v22.x.x
npm -v    # 10.x.x
```

> 💡 Có thể thêm file `.nvmrc` chứa nội dung `22` vào project để tự động chọn đúng version với `nvm use`.

### 2. Cài Shopify CLI

```bash
npm install -g @shopify/cli

# Kiểm tra
shopify version   # 4.x.x
```

> ⚠️ Shopify CLI cần Node.js để chạy — hãy cài Node v22 trước.

### 3. Cài Firecrawl CLI

Cần cho các command `/site-*` (audit & clone website).

```bash
npm install -g firecrawl-cli

# Kiểm tra
firecrawl --version   # 1.x.x
```

**Đăng nhập (1 lần)** — dán API key (`fc-...`) lấy từ [firecrawl.dev](https://www.firecrawl.dev):

```bash
firecrawl config        # nhập API key khi được hỏi → lưu vào ~/.config/firecrawl-cli

# Kiểm tra đã xác thực & còn credit
firecrawl --status
```

> 💡 Sau khi `firecrawl config`, key được lưu sẵn nên **không cần** set biến môi trường `FIRECRAWL_API_KEY`.

### 4. (Tùy chọn) Playwright — cho Visual Test

Chỉ cần nếu bạn dùng tính năng [Visual test](#-visual-test--so-sánh-full-page-live-vs-figma):

```bash
npx playwright install chromium
```

---

## ⚙️ Cài đặt

### 1. Clone project

**HTTPS:**

```
git clone https://github.com/litos-dev2026/shopify-template-liquid.git . && rm -rf .git
```

**SSH:**

```
git clone git@github.com:litos-dev2026/shopify-template-liquid.git . && rm -rf .git
```

### 2. Cài dependencies

```
npm install
```

### 3. Cấu hình store URL

Mở `package.json` và thay `store-url.myshopify.com` bằng store thực tế của bạn trong các script `pull`, `push`, `dev`:

```
"pull": "shopify theme pull --store your-store.myshopify.com",
"push": "shopify theme push --store your-store.myshopify.com",
"dev": "shopify theme dev --store your-store.myshopify.com",
```

### 4. Chạy development

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

### Slash commands — Audit & Clone website (Firecrawl)

Phân tích một website bất kỳ trước khi clone sang Shopify. Đầu ra báo cáo là file HTML trong `audit-report/`.

| Command | Dùng khi |
|---------|---------|
| `/site-analyze <url>` | Map site — đếm số trang con & **số template** cần dựng |
| `/site-audit <url>` | Audit tổng (SEO + Design + QA) → báo cáo HTML |
| `/site-structure-audit <url>` | Audit **cấu trúc/IA** (taxonomy, điều hướng, trang chính sách) → HTML |
| `/site-ui-audit <url>` | Audit **UI/giao diện** (màu, font, component, grid, ảnh) → HTML |
| `/site-design <url>` | Trích design system của site → **`DESIGN.md`** (màu, font, spacing, component) |
| `/site-implement <url> [section]` | **Clone section/trang** từ site có sẵn → Shopify Liquid + SCSS ⭐ |

**Thứ tự chạy:** `/site-analyze` → (audit tùy chọn) → `/site-design` → `/shopify-tokens-setup` → `/site-implement`. Chi tiết: [docs/clone-to-shopify-playbook.md](docs/clone-to-shopify-playbook.md#-quick-start--chạy-theo-đúng-thứ-tự).

> Yêu cầu: đã cài & login `firecrawl` CLI. Quy trình clone đầy đủ: [docs/clone-to-shopify-playbook.md](docs/clone-to-shopify-playbook.md).

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

### 🔴 Visual test — So sánh full page live vs Figma

**Setup lần đầu (chỉ 1 lần):**
```
npm install
npx playwright install chromium
```

**Chạy test toàn trang:**
```
/shopify-visual-test <figma-page-url> http://127.0.0.1:9292 desktop
```

Hoặc prompt thủ công:
```
So sánh toàn bộ trang đang chạy local với Figma design.

Figma URL: <figma-page-url>   ← node-id trỏ vào page frame (toàn trang)
Local URL: http://127.0.0.1:9292
Viewport: desktop

Bước 1: get_screenshot từ Figma (full page frame)
Bước 2: node scripts/screenshot.mjs http://127.0.0.1:9292 "" fullpage desktop
Bước 3: Phân tích cấu trúc trang (Header, Hero, Products, Footer...)
Bước 4: So sánh từng section và báo cáo sai lệch:
  - Spacing > ±2px → MustFix
  - Font size > ±1px → MustFix
  - Màu sắc khác → MustFix
  - Layout/grid sai → MustFix
Bước 5: Fix tất cả MustFix, re-screenshot để confirm.
```

Kết quả Claude trả về dạng:
```
## Hero Banner
❌ padding-top: Figma=80px, Live=64px (delta: 16px) — MustFix
❌ font-size h1: Figma=48px, Live=40px (delta: 8px) — MustFix
✅ background: #ffffff

## Featured Products
❌ grid gap: Figma=24px, Live=16px — MustFix
✅ 4 columns layout

Tổng: 3 MustFix | 0 Minor
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
