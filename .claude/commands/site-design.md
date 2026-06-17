---
description: Extract a website's design system into DESIGN.md using Firecrawl (colors, fonts, spacing, components)
argument-hint: <site-url>
---

Trích **design system** của website thành `DESIGN.md`: **$ARGUMENTS**

`DESIGN.md` là nguồn chân lý cho bước nạp tokens (`/shopify-tokens-setup`) và dựng section (`/site-implement`).

## Step 1 — Scrape branding + screenshot (Firecrawl)

```bash
mkdir -p .firecrawl
SITE="$ARGUMENTS"
firecrawl scrape "$SITE" --format branding,images -o .firecrawl/design-branding.json --pretty &
firecrawl scrape "$SITE" --full-page-screenshot -o .firecrawl/design-shot.json --pretty &
wait
# → tải field .screenshot về .firecrawl/design-shot.png
```

> Có thể dùng trực tiếp skill `firecrawl-website-design-clone` nếu muốn quy trình chuẩn của Firecrawl.

## Step 2 — Tổng hợp design system

Từ `branding`, HTML/CSS và screenshot, trích và ghi vào `DESIGN.md`:

- **Colors** — primary / secondary / neutral / accent (hex). Đánh dấu màu nào là CTA chính.
- **Typography** — font family (display + body), scale (h1/h2/body/caption), weight.
- **Spacing** — thang spacing quan sát được (4/8/12/16/24/32…).
- **Border radius** — bo góc nút/card.
- **Components** — nút (primary/secondary), card, swatch, rating, form.
- **Layout** — grid, max-width, nhịp section.

Giá trị nào không đo chính xác được → ghi rõ "inferred" + ước lượng thực tế.

## Step 3 — Lưu evidence

Giữ `.firecrawl/design-shot.png` để các bước sau (`/site-implement`) so sánh trực quan.

## Done

Báo cáo `DESIGN.md` đã tạo. Bước kế: nạp tokens bằng `/shopify-tokens-setup` (dựa trên `DESIGN.md`).
Quy trình đầy đủ: [docs/clone-to-shopify-playbook.md](../../docs/clone-to-shopify-playbook.md).
