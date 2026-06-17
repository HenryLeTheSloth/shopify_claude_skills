---
description: Audit a website's structure / information architecture (IA) with Firecrawl, output a visual HTML report
argument-hint: <site-url>
---

Audit **cấu trúc / kiến trúc thông tin (IA)** cho website e-commerce và xuất HTML: **$ARGUMENTS**

## Step 1 — Thu thập cấu trúc

```bash
mkdir -p .firecrawl audit-report
SITE="$ARGUMENTS"
firecrawl map "$SITE" 2>/dev/null | grep '^http' | sort -u > .firecrawl/site-urls.txt
```

Từ danh sách URL, trích:
- Taxonomy collection (tên các `/collections/...`)
- Phân bố độ sâu URL (số segment path)
- Có/không các trang nền tảng: about, contact, faq, size, **shipping, returns/refund, privacy, terms**
- Menu điều hướng (đọc từ `.firecrawl/home.json` nếu đã scrape)

## Step 2 — Phân tích IA

- Sơ đồ cây site (home → collections → products → pages → blog)
- Taxonomy: collection trùng/chồng chéo, handle lỗi, sản phẩm lạc tông
- Điều hướng: có mega-menu/phân cấp danh mục không
- **Trang chính sách thiếu** (bắt buộc cho e-commerce)

## Step 3 — Xuất báo cáo HTML

Tạo `audit-report/<tên-site>-structure.html`: sơ đồ cây site, KPI, **2 cột Điểm tốt / Cần cải thiện**,
finding chi tiết, **checklist IA**, và **sơ đồ cấu trúc đề xuất (mục tiêu)**. Mở bằng `xdg-open`.

Mẫu tham chiếu: `audit-report/brfashionsllc-structure.html`.
