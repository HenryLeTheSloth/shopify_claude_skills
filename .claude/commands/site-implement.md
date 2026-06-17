---
description: Clone a section (or whole page) from a live website into a Shopify section using Firecrawl evidence
argument-hint: <site-url-or-page-url> [section-name | "all"]
---

Clone giao diện từ website có sẵn thành Shopify Liquid + SCSS.

**Nguồn:** `$ARGUMENTS`

Cú pháp: `/site-implement <url> [tên-section | "all"]`
- `<url>` — URL trang cần clone (home, product, collection…).
- `[tên-section]` — section cụ thể (vd `hero`, `best-sellers`, `footer`). Bỏ trống hoặc `all` = clone toàn trang theo từng section.

---

## Step 0 — Kiểm tra token system

Đọc `base.scss`. Nếu `--color-*`, `--space-*` còn comment/rỗng → **dừng**, chạy [`/shopify-tokens-setup`](shopify-tokens-setup.md) trước
(hoặc tạo `DESIGN.md` bằng skill `firecrawl-website-design-clone` rồi nạp tokens). Không dựng khi chưa có token thật.

## Step 1 — Thu thập bằng chứng (Firecrawl)

```bash
mkdir -p .firecrawl assets
URL="<url từ $ARGUMENTS>"
firecrawl scrape "$URL" --format html,links -o .firecrawl/clone.json --pretty
firecrawl scrape "$URL" --full-page-screenshot -o .firecrawl/clone-shot.json --pretty
# → tải field .screenshot về .firecrawl/clone-shot.png
```

## Step 2 — Khoanh vùng section cần dựng (screenshot = nguồn chân lý)

Đọc `clone-shot.png`. Crop từng vùng section bằng Python/PIL để soi kỹ tỉ lệ/spacing:

```python
from PIL import Image
im = Image.open(".firecrawl/clone-shot.png")
im.crop((0, <y1>, im.width, <y2>)).save(".firecrawl/clone-<section>.png")
```

Nếu `[tên-section]` được chỉ định → chỉ crop & dựng section đó. Nếu `all` → liệt kê các section của trang
(header, hero, …, footer) và dựng tuần tự từng cái.

## Step 3 — Search Shopify docs

```bash
node .agents/skills/shopify-liquid/scripts/search_docs.mjs "<loại component>"
```

vd "image banner section", "product card", "collection grid", "newsletter section".

## Step 4 — Trích design values → map sang token

Từ HTML/CSS trong `clone.json` và quan sát screenshot, trích màu/spacing/font của section, rồi map sang token `base.scss`:

| Giá trị từ site | Token |
|------|-------|
| Color | `var(--color-*)` |
| Spacing | `var(--space-*)` |
| Border radius | `var(--rounded-*)` |
| Font family | `var(--font-*)` |

Không có token khớp → dùng gần nhất (±2px spacing, ±1px font). Lệch quá tolerance → hỏi user trước.

> ⚠️ **Clone có chọn lọc, không bê nguyên lỗi.** Nếu đã có audit (`/site-ui-audit`, `/site-structure-audit`)
> chỉ ra lỗi (vd hệ màu rời rạc, CTA ngược, ảnh lạc tông), **sửa khi dựng lại** — chuẩn hoá theo design system của dự án.

## Step 5 — Ảnh & asset

- Ảnh nội dung (logo/sản phẩm) → dùng làm placeholder hoặc tải về `assets/` nếu hợp pháp.
- Ảnh do merchant đặt → đưa thành `section.settings` (image_picker), không hardcode.

## Step 6 — Kiểm tra component đã có

Trước khi tạo file mới: tìm trong `snippets/`, `blocks/`, `sections/`. Có rồi → tái dùng/mở rộng.
Pattern lặp ≥ 2 lần → tách thành snippet.

## Step 7 — Sinh Liquid (theo đúng quy tắc dự án)

**Structure:** `sections/<tên>.liquid` có `{% schema %}` + `padding_top/bottom`; block có `{% doc %}`; snippet có `{% doc %}`.

**CSS — viết trong `style.scss`, KHÔNG inline:**
- Mọi màu `$color-*`, spacing `$space-*`, radius `$rounded-*`, typography `@include`
- Responsive `@include mobile { }` / `@include desktop { }`, BEM, không `!important`, nesting ≤ 3

**Inline `style=""` — CHỈ cho dynamic settings:**
```liquid
<section class="hero" style="--hero-pt: {{ section.settings.padding_top }}px;">
```
Đọc lại trong SCSS bằng `var(--hero-pt, 36px)`.

**Text user-facing:** viết tiếng Anh trực tiếp trong template + schema labels/defaults (không dùng `| t`, không sửa locales).

**Settings:** mọi nội dung biến đổi (heading, image, link, màu) → đưa vào `{% schema %}` settings để merchant chỉnh.

**Images:** `{{ image | image_url: width: 800 | image_tag: loading: 'lazy', class: 'name__image' }}`

## Step 8 — Validate

```bash
node .agents/skills/shopify-liquid/scripts/validate.mjs \
  --theme-path "f:/workSpace/template-shopify-theme" \
  --files "sections/<tên>.liquid" \
  --model claude-sonnet-4-6 --client-name claude-code --client-version 1.0 \
  --artifact-id <stable-random-id> --revision 1
```

Lỗi → đọc kỹ → `search_docs.mjs "<error term>"` → fix đúng lỗi → re-validate (tối đa 3 lần, tăng `--revision`).

## Step 9 — So sánh trực quan

So output với crop screenshot (`clone-<section>.png`): spacing ±2px, font ±1px. Lệch quá → sửa rồi re-validate.

## Done — Report

Liệt kê file tạo/sửa, xác nhận validate pass. Nếu `all`, nhắc section kế tiếp.
Quy trình clone toàn site: [docs/clone-to-shopify-playbook.md](../../docs/clone-to-shopify-playbook.md).
