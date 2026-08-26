# <PROJECT> — Kế hoạch triển khai <PAGE> theo `design/<file>.html`

- **Người lập:** <ai> · **Ngày:** <YYYY-MM-DD>
- **Nguồn design:** `design/<file>.html` (<N> dòng, <N> assets)
- **Theme đích:** `theme/` — <Theme> v<X> by <Vendor> (`config/settings_schema.json:4`)
- **Mục tiêu:** <PAGE> pixel-perfect, code đúng cấu trúc theme, tận dụng tối đa section có sẵn

---

## 1. Kết luận trước (BLUF)

Ba đến bốn câu. Cái gì tái sử dụng được, cái gì phải viết mới **và vì sao**, rủi ro tồn dư lớn nhất,
ước lượng công.

---

## 2. Bằng chứng nền tảng

Mỗi dòng phải có **đường dẫn:số dòng**. Dòng không có bằng chứng là một giả định — và giả định
trong plan là chỗ plan sẽ vỡ ở P4.

| # | Sự thật | Bằng chứng | Hệ quả cho plan |
|---|---|---|---|
| B1 | | | |
| B2 | | | |

---

## 3. Bản đồ Design → Section

| # | Khối design | CSS anchor | Section vendor | Chiến lược | Effort |
|---|---|---|---|---|---|
| 1 | | `.` | | Reuse / Reuse+CSS / Reuse+hunk / **Viết mới** | XS·S·M·L |

> **Tỉ lệ tái sử dụng: x/y (z%).**

Mỗi ô "Viết mới" cần một câu lý do **kiểm chứng được** (tốt nhất là số học), không phải cảm giác.

### Trigger fallback
Nếu chọn "thử reuse trước", ghi rõ **điều kiện chuyển** sang viết mới, kèm số:
> Thử `<section>` trước. Trigger đổi: sau 1 vòng CSS override mà sai lệch còn > 2px ở <chỗ nào>.

---

## 4. Kiến trúc code

```
theme/
├─ assets/<vendor>.css      ← KHÔNG ĐỘNG (bundle vendor)
├─ assets/<brand>.css       ← build từ base.scss, nạp SAU bundle vendor
├─ base.scss                ← token + override global
├─ sections/<new>.liquid    ← MỚI, CSS trong {% stylesheet %}
└─ templates/<page>.json    ← wiring
```

**Nguyên tắc:** không sửa bundle vendor · section mới → CSS trong `{% stylesheet %}` của nó ·
override section vendor → `base.scss` · token giữ **nguyên tên của design** để trace 1-1 ·
không `!important` · sửa file vendor thì mỗi hunk có marker `<BRAND> HUNK`.

---

## 5. Gap & rủi ro — phải lượng hoá

### 5.1 <Rủi ro 1, vd font/license>
### 5.2 <Rủi ro 2, vd data thật vs mock>

### 5.3 Sai lệch kỹ thuật đã lượng hoá

| Hạng mục | Design | Theme mặc định | Cách xử lý |
|---|---|---|---|
| | | | |

### 5.4 Dữ liệu cần chuẩn bị trước
Collection, ảnh lên Files, menu, page, metafield…

---

## 6. Kế hoạch theo phase

| Phase | Nội dung | Deliverable | Acceptance **đo được** | Effort |
|---|---|---|---|---|
| P0 | Setup & baseline | `baseline/design-metrics-<page>-*.json` | 0 selector MISSING | |
| P1 | | | | |

**Tổng: ~X ngày công.**

---

## 7. Quy trình pixel-perfect

```bash
python3 -m http.server 8080 --directory design &
node scripts/measure.mjs http://127.0.0.1:8080/<file>.html scripts/measure-<page>.json desktop \
  > <baselineDir>/design-metrics-<page>-desktop.json

python3 scripts/compare-to-design.py <page> desktop
python3 scripts/compare-to-design.py --all      # hồi quy, bắt buộc
shopify theme check                             # ngưỡng = baseline vendor
python3 scripts/validate-template.py templates/<page>.json <kind>
```

**Dung sai:** khoảng cách ±2px · cỡ chữ/line-height/letter-spacing ±1px · màu khớp tuyệt đối ·
lưới/tỉ lệ khớp tuyệt đối.

**Definition of Done mỗi khối:** 0 ngoài dung sai ở desktop **và** mobile · theme check không tăng ·
template hợp lệ · chỉnh được trong Theme Editor không vỡ · không `!important` mới.

---

## 8. Ngoài phạm vi

Liệt kê thẳng, để không ai tưởng là đã làm.

---

## 9. Quyết định cần chốt

| # | Vấn đề | Lựa chọn | Khuyến nghị |
|---|---|---|---|
| Q1 | | A / B | |
