# Catalog bẫy — 18 cái đã trả giá thật

Mỗi mục: **dấu hiệu** → **nguyên nhân** → **cách xử lý**.

---

## A. CSS & cascade

### A1. Custom property chứa `%` được thay dạng token, không phải giá trị đã tính ⚠️ đắt nhất

**Dấu hiệu:** cùng một biến cho ra chiều rộng đúng ở `grid-template-columns` nhưng hàng ra sai
hoàn toàn ở `grid-template-rows` (523px thay vì 688px).

**Nguyên nhân:** `--split-column: round(down, calc((100% + 1.5px)/4), 1px)` được thay vào **dưới
dạng chuỗi token**. Ở `grid-template-columns`, `100%` = chiều rộng. Ở `grid-template-rows`,
`100%` = chiều **cao**.

**Cách xử lý:** đừng dùng lại biến chứa `%` ở trục khác. Để hàng tự do, đẩy chiều cao bằng
`padding-block-start` **trên chính element con** — nơi `%` luôn quy chiếu theo inline size:
```css
padding-block-start: calc(round(down, 150%, 1px) - 1.5px);
```

---

### A2. Section trong section group có id sinh động

**Dấu hiệu:** mọi selector `#shopify-section-header` đều trượt, im lặng.

**Nguyên nhân:** id thật là `sections--21090534883430__header`, sinh theo store/theme. Và
**không lượng class nào thắng được một ID** — nên không thể đè bằng cách tăng class.

**Cách xử lý:** đặt biến CSS lên chính element **tiêu thụ** nó, để che giá trị thừa kế. Bỏ qua
hoàn toàn cuộc đua specificity:
```scss
.header { --header-padding-block: 22.5px; }        // ✅
#shopify-section-header { … }                       // ❌ không bao giờ khớp
```
Áp dụng cho `.header`, `.announcement-bar`, `.content-over-media`, `.product-list`.

---

### A3. `{% stylesheet %}` của section nạp TRƯỚC lớp override toàn cục

**Dấu hiệu:** CSS viết trong section thua CSS global ở **cùng specificity**.
`.collection-feature__title` (trong section) thua `.h1` (trong global).

**Cách xử lý:** nâng specificity qua phần tử cha:
```scss
.collection-feature__copy .collection-feature__title { … }   // 0,2,0
```

---

### A4. CSS `round()` không viết được trong SCSS

**Dấu hiệu:** Sass báo lỗi hoặc tự tính ra số sai.

**Nguyên nhân:** Sass chiếm tên hàm `round()`.

**Cách xử lý:** mọi `round(down, …)` để snap pixel phải nằm trong `{% stylesheet %}` của section
hoặc thẻ `<style>` — tức CSS thuần. Ghi chú việc này ở đầu file SCSS.

---

### A5. Theme kẹp gap sản phẩm ở một giá trị sàn

**Dấu hiệu:** hạ `horizontal_spacing_factor` xuống 0.2 hay đổi `--product-list-default-column-gap`
đều không xuống được dưới 8.75px.

**Nguyên nhân:** Prestige kẹp sàn ở `--container-gutter / 4`.

**Cách xử lý:** ghi đè thẳng biến **đã tính** (`--product-list-calculated-column-gap`), không phải
biến đầu vào.

---

### A6. Carousel `bleed` — `100%` không phải viewport

**Dấu hiệu:** card lệch đúng 17px ở mobile.

**Nguyên nhân:** `.product-list--carousel` tràn mép màn hình bằng **padding**, nên `100%` của nó
vẫn là content box (đã trừ padding), không phải 390px.

**Cách xử lý:** cộng lại padding vào cơ sở tính, hoặc dùng `100vw` khi thực sự muốn viewport.

---

### A7. Ảnh không có `aspect-ratio` giành quyền quyết chiều cao hàng

**Dấu hiệu:** ở mobile, hàng cao hơn dự kiến; ảnh thứ hai "thắng" ảnh thứ nhất.

**Nguyên nhân:** ảnh không khai `aspect-ratio` giữ tỉ lệ gốc, ở bề ngang hẹp nó cao hơn 7:10.

**Cách xử lý:** đưa cả hai ảnh ra khỏi luồng (`position: absolute`) trong khung đã khoá tỉ lệ.

---

### A8. Một rule không scope theo id sẽ ảnh hưởng toàn theme

**Dấu hiệu:** style của story band xuất hiện ở trang khác.

**Nguyên nhân:** CSS scope theo `.shopify-section--image-with-text-overlay` (bắt buộc, xem A2)
nên **mọi** section cùng type ở mọi trang đều nhận.

**Cách xử lý:** coi đó là **chủ ý** — "đây là kiểu overlay duy nhất của thương hiệu" — và ghi vào
handover. Nếu sau cần kiểu thứ hai, tách bằng class riêng đặt trong template.

---

### A9. Thu hẹp một rule toàn cục là thay đổi ngoài phạm vi

**Dấu hiệu:** đổi `.product-title` → `.product-card__info .product-title` để PDP hết bị ép 12px.

**Nguyên nhân:** `.product-title` còn dùng ở line item giỏ hàng và quick-buy — **không nằm trong
bộ đo nào**, nên hồi quy sẽ không bị bắt.

**Cách xử lý:** đừng thu hẹp. **Out-specify**: `.product-info .product-title` (0,2,0 thắng 0,1,0).
Rủi ro hồi quy = 0. Và grep xem rule mới còn chạm section nào khác, ghi vào handover.

---

## B. Liquid & schema

### B1. Khoá dịch `t:` phải có thật — không thì là error

**Dấu hiệu:** `theme check` báo 7 error sau khi thêm section mới.

**Nguyên nhân:** tự đặt `t:global.section.separate_with_border`, `t:global.text.heading_size`…
Khoá hợp lệ nằm trong `locales/en.default.schema.json`.

**Cách xử lý:** grep khoá trong file đó trước khi dùng. Khoá tự đặt là **error**, không phải warning.

---

### B2. `range` lệch step làm Shopify từ chối cả file

**Dấu hiệu:** push template thất bại, thông báo mơ hồ.

**Nguyên nhân:** `logo_max_width` bước 5px, đặt 73 → không hợp lệ.

**Cách xử lý:** `validate-template.py` bắt được. Và khi giá trị không đặt được đúng, **bù ở chỗ khác**:
đặt 75 (cao 31px) rồi bù `--header-padding-block` 22.5px để tổng chiều cao vẫn đúng 76px.

---

### B3. Default của schema lọt ra mặt trước

**Dấu hiệu:** hero hiện chữ "Tell your story", Best Sellers hiện "Featured collection".

**Cách xử lý:** set rỗng **tường minh** trong template JSON. Không dựa vào "không khai báo".
Bắt bằng cách screenshot full page rồi đọc chữ.

---

### B4. Handle font không nằm trong danh sách deprecated ≠ hợp lệ

**Dấu hiệu:** dev server báo lỗi font sau khi theme check đã xanh.

**Nguyên nhân:** `cormorant_garamond_n4` không deprecated, nhưng cũng không tồn tại. Shopify chỉ có
family `cormorant` — khác metrics.

**Cách xử lý:** verify bằng dev server thật. Nếu không có → self-host (chú ý license + subset
`vietnamese` nếu nội dung tiếng Việt).

---

### B5. `<details>` bị bọc trong custom element

**Dấu hiệu:** selector `li > details` trượt.

**Nguyên nhân:** mega menu bọc trong `<mega-menu-disclosure>`.

**Cách xử lý:** `li > * > .header__menu-disclosure > summary`. Kiểm bằng devtools trước khi viết CSS.

---

### B6. Block render thẻ trần không class

**Dấu hiệu:** không có gì để bám selector.

**Nguyên nhân:** block `link` của `image-with-text-overlay` render `<a>` trần.

**Cách xử lý:** tách kiểu thành **mixin SCSS** rồi áp cho selector cấu trúc
(`.content-over-media > .content a`).

---

### B7. Element ẩn trong shadow DOM

**Dấu hiệu:** đo drawer/modal ra `MISSING`.

**Cách xử lý:** `measure.mjs` hỗ trợ `>>>` xuyên shadow root, cộng bước tiền-đo:
```json
{ "action": "click", "sel": ".filter-sort-btn" },
{ "action": "wait", "ms": 500 },
{ "sel": ".facets-drawer >>> [part='content']", "props": ["width"] }
```

---

### B8. Section có `enabled_on` giới hạn template

**Dấu hiệu:** section không hiện trên template đang dùng, không báo lỗi.

**Cách xử lý:** `validate-template.py` bắt được.

---

## C. Quy trình & dữ liệu

### C1. Bundle CSS vendor bị sửa lén ở phase trước

**Dấu hiệu:** `git diff assets/theme.css` ra 2 hunk lạ.

**Hệ quả:** lần update theme tiếp theo **âm thầm nuốt mất** cả hai.

**Cách xử lý:** thêm vào cổng P5:
```bash
git diff --stat assets/theme.css   # phải rỗng
```
Nếu đã lỡ: **báo cáo, đề xuất, đừng tự sửa** — vì sửa phải chạy lại cổng của phase trước.

---

### C2. Data thật khác mock — pixel chuẩn chốt trên bản tiếng Anh

**Dấu hiệu:** title tiếng Việt viết hoa dài wrap 2–3 dòng, vỡ chiều cao card.

**Cách xử lý:**
- Nghiệm thu pixel trên **bản tiếng Anh** (khớp design).
- Bản tiếng Việt nghiệm thu theo tiêu chí **"không vỡ layout"**.
- Khoá `product_title_max_lines: 2`.
- Ghi vào handover — nếu không, người sau sẽ tưởng là lỗi.

---

### C3. Section phụ thuộc điều kiện store mới render

**Dấu hiệu:** country selector "USD $ + cờ" của design không hiện.

**Nguyên nhân:** Prestige chỉ render khi `localization.available_countries.size > 1`; store mới có
1 quốc gia.

**Cách xử lý:** **không phải lỗi code.** Ghi vào "việc còn treo", gắn với việc bật Markets.
Tương tự: payment icon chỉ hiện theo cổng thanh toán đã bật.

---

### C4. Ký tự đặc biệt trong title sinh handle xấu, không sửa được bằng tool

**Dấu hiệu:** collection ra handle `dresses-amp-sets`.

**Nguyên nhân:** truyền `&amp;` vào title.

**Cách xử lý:** escape trước khi tạo. Nếu đã lỡ — handle **không đổi được** qua API thông thường,
phải vào Admin sửa tay, rồi sửa **mọi tham chiếu** trong template JSON.

---

### C5. Setting mặc định của theme cho spacing sai hẳn một bậc

**Dấu hiệu:** section cách nhau 80px thay vì 48px.

**Nguyên nhân:** `section_vertical_spacing` để `lg`. Prestige map `xs` → 32px mobile / 48px desktop.

**Cách xử lý:** đo trước, chọn bậc sau. Đừng đoán theo tên.

---

### C6. Hiệu ứng của theme có thể đã trùng design

**Dấu hiệu:** định viết lại animation nút.

**Sự thật:** nút Prestige đã có wipe-fill trùng khớp — cùng `0.45s`, cùng
`cubic-bezier(.785,.135,.15,.86)`. Design vốn được vẽ **từ chính theme đó**.

**Cách xử lý:** đọc CSS vendor trước khi viết. Chỉ chỉnh kích thước hộp, không viết lại animation.

---

### C7. Font `font_picker` tải file thừa

**Cách xử lý:** trỏ 2 ô `font_picker` vào **system font** (`arial_n4`, `times_new_roman_n4`) để
Shopify không tải file, rồi ép family thật trong lớp override.
⚠️ `helvetica_n4` nằm trong danh sách deprecated → dùng `arial_n4`.
