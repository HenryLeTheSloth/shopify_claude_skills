---
description: Audit a website's UI / visual design with Firecrawl screenshots, output a visual HTML report
argument-hint: <site-url>
---

Audit **UI / giao diện trực quan** và xuất HTML có ảnh chú thích: **$ARGUMENTS**

## Step 1 — Re-scrape & crop screenshot

```bash
mkdir -p .firecrawl audit-report/assets
SITE="$ARGUMENTS"
firecrawl scrape "$SITE" --full-page-screenshot -o .firecrawl/home-shot.json --pretty
# → tải field .screenshot về .firecrawl/home-shot.png
```

Crop từng vùng UI để soi kỹ (dùng Python/PIL):
- `ui-header.png` — header + hero
- `ui-cards.png` — grid sản phẩm/collection
- `ui-footer.png` — footer + popup

## Step 2 — Nhận xét UI

Đọc từng crop và đánh giá. **Khung tham chiếu:** các mục thiên về UI/UX trong
[docs/audit-checklist.md](../../docs/audit-checklist.md) — chấm **PASS / PARTIAL / FAIL + score 0-5** mỗi item:

| Vùng | Mục checklist liên quan |
|---|---|
| Header & Nav | Header Structure · Navigation Experience (sticky, mega-menu) |
| Hero | Hero Section (CTA rõ, value proposition, ảnh chất lượng, mobile) |
| Product cards | Product Card Features (badge, rating, swatch) · grid nhất quán |
| PDP (nếu có) | Product Media · Variants · Sticky Add-to-Cart |
| Footer | Footer Content (nav, social, payment, trust) |
| Tổng thể | UX Quality: design language nhất quán · CTA rõ · typography đọc được · spacing · visual hierarchy |

**Lớp visual soi thêm** (điểm rút từ audit thật):
- **Hệ màu** — liệt kê màu nhấn; có primary/neutral thống nhất không (lỗi: 3 hệ rời rạc)
- **Component** — nút (đặc/ghost), swatch có trạng thái chọn rõ, **sao review vàng vs đen**, có đồng nhất không
- **Hình ảnh** — hero/card có thể hiện đúng sản phẩm không (lỗi: ảnh lifestyle lạc tông)
- **Review block** — có ảnh khách + verified hay avatar mặc định

## Step 3 — Xuất báo cáo HTML

Tạo `audit-report/<tên-site>-ui-audit.html`: ảnh từng vùng **có chú thích đánh số**, bảng màu đang dùng,
**2 cột Tốt / Cần cải thiện**, finding ưu tiên, và **bảng checklist UI** (PASS/PARTIAL/FAIL + score) theo
các mục ở trên. Xếp loại theo thang trong checklist (90-100 Excellent … <60 Major). Mở bằng `xdg-open`.

Mẫu tham chiếu: `audit-report/brfashionsllc-ui-audit.html`.
