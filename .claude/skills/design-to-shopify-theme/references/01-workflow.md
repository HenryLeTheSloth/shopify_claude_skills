# Quy trình 6 phase — chi tiết

Mỗi phase có: **đầu vào · việc làm · cổng đóng phase**. Không qua phase sau khi cổng chưa xanh.

---

## P0 — Recon: biết mình đang đứng trên cái gì

**Đầu vào:** thư mục `theme/`, thư mục `design/`.

### Việc làm

```bash
# Theme nào, phiên bản nào
sed -n '1,10p' theme/config/settings_schema.json

# Kho section có sẵn — đây là thứ quyết định tỉ lệ tái sử dụng
ls theme/sections/ | wc -l ; ls theme/snippets/ | wc -l ; ls theme/blocks/ 2>/dev/null | wc -l

# CSS là bundle biên dịch hay nhiều file?
ls -la theme/assets/*.css

# Section nào tự khai CSS riêng? (0 kết quả = phải làm lớp override toàn cục)
grep -rl "{% stylesheet %}" theme/sections/ theme/snippets/ | wc -l

# Design đã tự khai token chưa?
sed -n '/:root/,/}/p' design/index.html

# Asset thiếu?
grep -oE '(src|href)="[^"]+"' design/index.html | grep -oE 'assets/[^"]+' | sort -u | while read f; do
  [ -f "design/$f" ] || echo "MISSING: $f"
done
```

### Cổng đóng phase

Bảng "sự thật nền tảng" ≥ 8 dòng, **mỗi dòng phải có đường dẫn:số dòng**:

| # | Sự thật | Bằng chứng | Hệ quả cho plan |
|---|---|---|---|
| B1 | Theme = Prestige (Maestrooo) | `config/settings_schema.json:4` | Dùng đúng convention của nó |
| B2 | CSS là 1 bundle 177KB | `assets/theme.css`, `layout/theme.liquid:64` | Không sửa. Cần lớp override riêng |
| B3 | 0 section dùng `{% stylesheet %}` | `grep -rl` → 0 | Override global đi qua SCSS |
| … | | | |

> Một dòng không có bằng chứng đường dẫn là một giả định. Giả định trong plan là chỗ
> plan sẽ vỡ ở P4.

---

## P1 — Baseline: biến design thành số

**Đầu vào:** `design/<page>.html`.

### Việc làm

1. Serve design tĩnh — **bắt buộc qua http**, không mở `file://` (font và ảnh sẽ khác).
   ```bash
   python3 -m http.server 8080 --directory design &
   ```

2. Viết `scripts/measure-<page>.json` — danh sách selector + thuộc tính cần đo.
   **Chọn selector theo nguyên tắc "cái gì vỡ thì đo cái đó":**

   | Nhóm | Đo gì |
   |---|---|
   | `body` | fontFamily, fontSize, lineHeight, color, backgroundColor |
   | Container | paddingLeft/Right, maxWidth |
   | Mỗi section wrapper | paddingTop, paddingBottom |
   | Mỗi lưới | width, gap, gridTemplateColumns, gridTemplateRows |
   | Mỗi kiểu chữ (h1/h2/eyebrow/body/link/button) | fontFamily, fontSize, fontWeight, lineHeight, letterSpacing, textTransform, color |
   | Nút | + height, minWidth, paddingLeft, borderRadius, border |
   | Ảnh/media | width, height, aspectRatio |
   | Element định vị (badge, quick-add) | width, height, right, bottom, backgroundColor |

   40–55 selector là dải hợp lý cho một trang. Dưới 30 là đo thiếu, trên 70 là đang đo
   thứ do nội dung quyết định chứ không do CSS.

3. Với element ẩn (drawer, accordion, tab, lightbox) — thêm **bước tiền-đo**:
   ```json
   { "action": "click", "sel": ".filter-sort-btn" },
   { "action": "wait",  "ms": 500 },
   { "sel": ".facets-drawer >>> [part='content']", "props": ["width","backgroundColor"] }
   ```
   `>>>` xuyên shadow root — bắt buộc với drawer/modal/popover của theme hiện đại.

4. Đo 2 viewport (desktop 1920, mobile 390). Tablet chỉ đo khi design có breakpoint riêng.
   ```bash
   node scripts/measure.mjs http://127.0.0.1:8080/index.html \
     scripts/measure-homepage.json desktop > baseline/design-metrics-homepage-desktop.json
   ```

### Cổng đóng phase

- File baseline tồn tại cho mọi viewport.
- **0 selector có `MISSING: true`.** Một `MISSING` trong baseline nghĩa là selector viết sai —
  và nó sẽ âm thầm biến mất khỏi phép so, cho ra "0 lệch" giả.

```bash
grep -c MISSING baseline/*.json   # phải là 0
```

---

## P2 — Mapping: quyết định tái sử dụng hay viết mới

**Đầu vào:** baseline + kho section từ P0.

### Việc làm

Duyệt design từ trên xuống, mỗi khối một dòng:

| # | Khối design | CSS anchor | Section vendor | Chiến lược | Effort |
|---|---|---|---|---|---|
| 1 | Announcement bar | `.announce` | `announcement-bar` | Reuse + CSS | XS |
| 4 | New Arrivals (feature 2×2 + 4 card) | `.arrivals-grid` | ❌ không có | **Viết mới** | L |

Bốn chiến lược, theo thứ tự ưu tiên:

1. **Reuse** — chỉ đổi setting trong `templates/*.json`.
2. **Reuse + CSS** — thêm override vào lớp global, scope dưới `.shopify-section--<type>`.
3. **Reuse + hunk** — sửa file vendor, **đánh dấu `JEOR HUNK` / `<BRAND> HUNK`** ở mỗi đầu hunk
   để lần update theme sau còn tìm lại được. Dùng khi cần markup mà setting không mở ra.
4. **Viết mới** — section riêng, CSS trong `{% stylesheet %}` của chính nó.

### Trigger chuyển sang "viết mới" — phải là số, không phải cảm giác

Ghi rõ trong plan **trước khi làm**:

> Thử `dynamic-grid` trước. Trigger đổi sang viết mới: sau 1 vòng CSS override mà sai lệch
> còn > 2px ở tỉ lệ ảnh, hoặc không khoá được gutter 1.5px.

Và đôi khi trigger chạm được **bằng phép tính**, không cần chạy thử:

> `dynamic-grid` đặt item trên lưới 16 cột. Tỉ lệ 41/32/27% không biểu diễn được bằng phần
> mười sáu (6/16 = 37.5%, 7/16 = 43.75%) → lệch quá 2px theo số học.

### Cổng đóng phase

- Bảng map phủ **100%** khối trong design.
- Có tỉ lệ tái sử dụng (`7/8 = 87.5%`).
- Mỗi ô "Viết mới" có **một câu lý do kiểm chứng được**.
- Mọi rủi ro đã lượng hoá: font thiếu license? data thật dài hơn mock? currency/i18n?

---

## P3 — Tokens: dựng lớp override

**Đầu vào:** `:root` của design.

### Việc làm

1. Copy token **nguyên văn, giữ nguyên tên** từ design sang SCSS. Giữ nguyên tên để khi diff
   còn trace ngược 1-1. Không đổi `--ivory` thành `--color-bg`.

2. `@font-face` self-host nếu font không có trong Shopify font library.
   - Ô `font_picker` của theme trỏ vào **system font** (`arial_n4`) để Shopify không tải file thừa.
   - Family thật ép bằng biến của theme (`--text-font-family`, `--heading-font-family`) trong lớp override.
   - ⚠️ "Font không nằm trong danh sách deprecated" **≠** "handle hợp lệ". Verify bằng dev server.

3. Nạp CSS override **sau** CSS vendor trong `layout/theme.liquid`, + `preload` cho font.

4. Ghi 5 quy tắc vào đầu file SCSS (xem `templates/base.scss.header`).

### Cổng đóng phase — chạy được KHÔNG CẦN STORE

`cascade-harness.html`: một file HTML nhúng CSS vendor + CSS override + markup mẫu của
các nguyên tố (body, h1/h2, eyebrow, button, link, input). Mở bằng http server, đo bằng
chính `measure.mjs`, so với baseline.

| Hạng mục | Design | Sau P3 | |
|---|---|---|---|
| Body font | `"Avenir Next",…` | giống hệt | ✅ |
| Nút | 10.5px/500/1.47px, cao 52px | giống hệt | ✅ |

---

## P4 — Build: dựng từng khối, đo ngay

**Quy tắc vàng: một khối = một vòng đo.** Không dựng 3 khối rồi mới đo — khi lệch sẽ không
biết rule nào gây ra.

### Vòng lặp

```bash
npm run sass                                    # watch, terminal riêng
# sửa base.scss hoặc sections/<new>.liquid
python3 scripts/compare-to-design.py homepage desktop
python3 scripts/compare-to-design.py homepage mobile
```

Output là **danh sách sai lệch**, không phải bảng dump:

```
113 properties compared, 2 out of tolerance

DESIGN SELECTOR      PROPERTY      DESIGN     LIVE      WHY
.arrivals-grid       gap           1.5px      8.75px    delta +7.25px
.pc-info             paddingTop    40px       32px      delta -8.00px
```

### Khi một thuộc tính "không thể so được"

Không phải mọi lệch đều là lỗi. Design định vị `.story-overlay` bằng `position:absolute`,
theme đặt nó làm grid item → `left`/`bottom` **không mang nghĩa gì**.

Cách xử lý đúng: đưa vào `ignore` của map file **kèm lý do viết ra**, và verify bằng ảnh:

```json
"ignore": {
  ".story-overlay": ["left", "bottom"]
}
```

> Mỗi mục `ignore` không có lý do là một chỗ giấu lỗi. Bắt buộc ghi `_ignore_comment`.

### Cổng đóng phase (mỗi khối)

Khối đó 0 ngoài dung sai ở **cả desktop và mobile**.

---

## P5 — Gate: chứng minh, rồi bàn giao

```bash
# 1. Trang hiện tại
python3 scripts/compare-to-design.py <page> desktop
python3 scripts/compare-to-design.py <page> mobile

# 2. HỒI QUY — mọi trang đã làm trước đó. Bắt buộc.
python3 scripts/compare-to-design.py --all

# 3. Lint theme — ngưỡng là con số baseline vendor, không phải 0
shopify theme check

# 4. Template JSON đối chiếu schema thật
python3 scripts/validate-template.py templates/<page>.json <kind>

# 5. Theme Editor — kéo/thả block, section không được vỡ
```

### Cổng đóng phase

| Kiểm | Ngưỡng |
|---|---|
| Trang hiện tại, cả 2 viewport | 0 ngoài dung sai |
| Mọi trang trước đó | 0 ngoài dung sai (**không tăng so với lần bàn giao trước**) |
| `shopify theme check` | ≤ số offence của bundle vendor gốc |
| `validate-template.py` | LỖI: 0 |
| `!important` mới thêm | 0 |
| File vendor sửa | mỗi hunk có marker `<BRAND> HUNK` |

Rồi viết handover theo `templates/handover.md`.

> Nếu con số "0 lệch" của trang trước **không còn đúng** tại thời điểm này — ghi thẳng vào
> handover, kèm nguyên nhân và cách xác nhận. Đây là chuyện đã xảy ra thật: PLP báo 0/174 ở
> phase 2, đến phase 3 đo lại thì lệch 1 desktop / 3 mobile do một rule chèn giữa chừng.
