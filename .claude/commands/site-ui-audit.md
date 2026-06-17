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

Đọc từng crop và đánh giá:
- **Typography** — font, phân cấp, all-caps, độ tương phản chữ trên ảnh
- **Hệ màu** — liệt kê màu nhấn đang dùng; có thống nhất không (primary/neutral)
- **Component** — nút, card, swatch, rating: có đồng nhất một style không
- **Grid & spacing** — card có cùng tỉ lệ/khoảng cách không
- **Hình ảnh** — có thể hiện đúng sản phẩm không; hero có 1 thông điệp + 1 CTA không

## Step 3 — Xuất báo cáo HTML

Tạo `audit-report/<tên-site>-ui-audit.html`: ảnh từng vùng **có chú thích đánh số**, bảng màu đang dùng,
**2 cột Tốt / Cần cải thiện**, finding ưu tiên, checklist UI. Mở bằng `xdg-open`.

Mẫu tham chiếu: `audit-report/brfashionsllc-ui-audit.html`.
