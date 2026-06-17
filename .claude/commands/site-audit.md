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

## Step 2 — Phân tích

- **SEO:** title/description length, số H1, structured data (JSON-LD), alt ảnh, canonical, og:image http/https, sitemap/robots.
- **Design/UX:** đọc screenshot (crop từng vùng nếu trang dài), phân cấp, mật độ, CTA.
- **QA:** HTTP status các trang lõi, viewport/zoom, dung lượng, link hỏng.

> Quan trọng: với screenshot dài, **crop từng vùng và xem hết** (header, giữa, footer) — không chỉ above-the-fold.

## Step 3 — Xuất báo cáo HTML

Tạo `audit-report/<tên-site>-audit.html`: self-contained (CSS inline), gồm điểm tổng, điểm theo hạng mục,
KPI, screenshot, các finding có mức độ + cách sửa, bảng QA, lộ trình nâng cấp. Mở bằng `xdg-open`.

Mẫu tham chiếu: `audit-report/brfashionsllc-audit.html`.
