---
description: Map a website with Firecrawl and report how many pages and Shopify templates need cloning
argument-hint: <site-url>
---

Phân tích cấu trúc URL của site: **$ARGUMENTS**

Mục tiêu: biết site có bao nhiêu trang con và **cần dựng bao nhiêu TEMPLATE Shopify** (không clone từng URL).

## Step 1 — Map site

```bash
bash scripts/site-analyze.sh "$ARGUMENTS"
```

Nếu chưa có script, chạy thủ công:

```bash
firecrawl map "$ARGUMENTS" 2>/dev/null | grep '^http' | sort -u > .firecrawl/site-urls.txt
```

## Step 2 — Phân loại & báo cáo

Từ `.firecrawl/site-urls.txt`, tổng hợp:

- Tổng số URL
- Số URL theo loại: `products`, `collections`, `pages`, `blogs`, `cart`, `account`
- **Danh sách TEMPLATE cần dựng** (mỗi loại 1 lần): home, product (PDP), collection (PLP), blog/article, page, header+footer
- Danh sách pages tĩnh

## Step 3 — Kết luận

Nêu rõ: "X URL nhưng chỉ cần dựng ~N template". Đây là checklist cho bước clone
(xem [docs/clone-to-shopify-playbook.md](../../docs/clone-to-shopify-playbook.md)).
