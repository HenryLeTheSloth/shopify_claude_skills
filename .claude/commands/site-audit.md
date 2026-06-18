---
description: Full website audit (SEO + design + QA) with Firecrawl, output a visual HTML report
argument-hint: <site-url>
---

Audit toàn diện website (SEO · Design · QA) và xuất **báo cáo HTML trực quan**: **$ARGUMENTS**

## Step 1 — Thu thập bằng chứng (Firecrawl)

```bash
mkdir -p .firecrawl audit-report/assets
SITE="$ARGUMENTS"

# Map + đếm
firecrawl map "$SITE" 2>/dev/null | grep '^http' > .firecrawl/site-urls.txt

# Scrape homepage: markdown + links + html + metadata
firecrawl scrape "$SITE" --format markdown,links,html -o .firecrawl/home.json --pretty

# Full-page screenshot (rồi tải ảnh từ field .screenshot về .firecrawl/home-shot.png)
firecrawl scrape "$SITE" --full-page-screenshot -o .firecrawl/home-shot.json --pretty
```

Tải ảnh screenshot: lấy URL trong `.screenshot` của file json rồi `curl` về `.firecrawl/home-shot.png`.

## Step 2 — Phân tích theo checklist chuẩn

**Khung đánh giá chính:** dùng [docs/audit-checklist.md](../../docs/audit-checklist.md) — 15 mục e-commerce
(Header & Nav · Homepage · PLP · PDP · Recommendation · Cart · Search · Account · Wishlist · Compare ·
Mobile · Conversion · Footer · Performance/UX). Với mỗi item: chấm **PASS / PARTIAL / FAIL + score 0-5 + Notes + Improvement**.

**Lớp kỹ thuật bổ sung** (ngoài checklist UX — quan trọng cho SEO/QA):
- **SEO:** title/description length, số H1 (đúng 1, không phải popup), structured data (JSON-LD), alt ảnh, canonical, og:image http/https, sitemap/robots.
- **QA:** HTTP status các trang lõi, viewport/zoom (`user-scalable=no`?), dung lượng, link hỏng.
- **Trang chính sách:** verify trực tiếp `/policies/{privacy,refund,shipping,terms}` (HTTP 200) — **không chỉ tin map**.

> Quan trọng: với screenshot dài, **crop từng vùng và xem hết** (header, giữa, footer) — không chỉ above-the-fold.

## Step 3 — Xuất báo cáo HTML

Tạo `audit-report/<tên-site>-audit.html`: self-contained (CSS inline), gồm:
- **Bảng điểm theo 15 mục checklist** (0-10 mỗi mục) + **Final Grade** theo thang trong checklist
  (90-100 Excellent · 80-89 Very Good · 70-79 Good · 60-69 Needs Improvement · <60 Major).
- KPI, screenshot, các finding có mức độ + cách sửa, bảng kỹ thuật (SEO/QA), lộ trình nâng cấp.
- Mỗi đề xuất ưu tiên theo tác động: **Conversion Rate · AOV · Retention · UX** (theo Auditor Instructions cuối checklist).

Mở bằng `xdg-open`. Mẫu tham chiếu: `audit-report/brfashionsllc-audit.html`.
