---
description: Screenshot full page local dev + get full Figma page, then compare section by section
---

Compare toàn bộ trang live với Figma design và báo cáo mọi sai lệch.

**$ARGUMENTS**

Format: `<figma-page-url> <local-url> [viewport]`

Examples:
- `/shopify-visual-test https://figma.com/design/ABC?node-id=1-2 http://127.0.0.1:9292`
- `/shopify-visual-test https://figma.com/design/ABC?node-id=1-2 http://127.0.0.1:9292 mobile`

---

## Step 1 — Parse arguments

- `figmaUrl` — Figma URL trỏ vào **page frame** (toàn bộ trang, không phải 1 section)
- `localUrl` — local dev URL (default: `http://127.0.0.1:9292`)
- `viewport` — `desktop` (default) | `tablet` | `mobile`

Parse `fileKey` và `nodeId` từ Figma URL (convert `-` → `:`).

## Step 2 — Lấy ảnh song song

Chạy cả 2 cùng lúc:

**Figma full page:**
```
get_screenshot(fileKey, nodeId)
```

**Local full page:**
```bash
node scripts/screenshot.mjs <localUrl> "" fullpage <viewport>
```

Nếu Playwright chưa install:
```bash
npx playwright install chromium
```
Rồi retry.

## Step 3 — Phân tích cấu trúc trang

Nhìn vào Figma screenshot, xác định các sections theo thứ tự từ trên xuống:

```
Ví dụ:
1. Header / Navigation
2. Hero Banner
3. Featured Collection
4. Testimonials
5. Newsletter
6. Footer
```

## Step 4 — So sánh từng vùng

Với mỗi section, so sánh Figma vs Live theo các tiêu chí:

**Spacing** (tolerance ±2px):
- Padding top/bottom của section
- Gap giữa các elements
- Margin giữa text elements

**Typography** (tolerance ±1px):
- Font size
- Font weight
- Line height
- Text alignment

**Colors** (exact match):
- Background
- Text color
- Button color
- Border color

**Layout & Sizing**:
- Số cột (grid)
- Tỷ lệ image
- Alignment (left/center/right)
- Border radius

**Responsive** (nếu viewport là mobile/tablet):
- Layout thay đổi đúng chưa
- Font size scale đúng chưa
- Các element bị ẩn/hiện đúng chưa

## Step 5 — Báo cáo

Trả về theo format này, nhóm theo section:

```
## Hero Banner
✅ Background color: #ffffff
✅ Heading font-weight: 700
❌ Heading font-size: Figma=48px, Live=40px (delta: 8px) — MustFix
❌ padding-top: Figma=80px, Live=64px (delta: 16px) — MustFix
⚠️  Button border-radius: Figma=8px, Live=6px (delta: 2px) — Minor

## Featured Collection
✅ Grid: 4 columns
❌ Gap between cards: Figma=24px, Live=16px (delta: 8px) — MustFix
✅ Card background: #ffffff

---
Tổng: X MustFix | Y Minor
```

Severity:
- `❌ MustFix` — vượt tolerance hoặc sai hoàn toàn
- `⚠️ Minor` — trong tolerance nhưng đáng chú ý
- `✅` — đúng

## Step 6 — Fix (nếu user đồng ý)

Fix tất cả MustFix trong `base.scss` hoặc `style.scss`. Re-screenshot để confirm sau khi fix:

```bash
node scripts/screenshot.mjs <localUrl> "" fullpage <viewport>
```

So sánh lại và confirm resolved.
