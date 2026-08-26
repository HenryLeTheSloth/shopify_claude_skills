# Triết lý test — vì sao đo chứ không nhìn

---

## 1. Vấn đề với "so sánh bằng mắt"

Vòng lặp mặc định khi dựng design là:

> chụp screenshot design → chụp screenshot live → nhìn → "hình như header hơi cao" → sửa đại →
> chụp lại → "vẫn hơi cao" → …

Mỗi vòng tốn 2–5 phút và **không hội tụ**, vì mắt người phân giải kém ở dải 1–8px nhưng lại
rất nhạy với thứ khác (màu, tương phản, tỉ lệ) — nên bạn sẽ sửa nhầm chỗ. Tệ hơn: khi đã
"trông giống" thì bạn dừng, và phần lệch 3–6px còn lại đi thẳng vào production.

**Thay thế:** đọc `getComputedStyle` của cả hai bên rồi trừ.

```
.pc-info   paddingTop   design 40px   live 32px   delta -8.00px
```

Một dòng này thay cho ba vòng nhìn. Nó nói **element nào**, **thuộc tính nào**, **lệch bao nhiêu**,
**theo hướng nào**. Từ đó tới bản sửa là một bước, không phải một cuộc đoán.

### Vẫn cần screenshot — nhưng cho việc khác

Screenshot dùng cho thứ computed style không nắm được:
- Ảnh có đúng ảnh không, crop có đúng không.
- Element định vị theo cơ chế khác nhau (design `absolute` vs theme grid item) — số `left`/`bottom`
  vô nghĩa, chỉ ảnh mới xác nhận được.
- Hiệu ứng: Ken Burns, wipe-fill, gạch chân chạy.
- Ấn tượng tổng thể sau khi số đã sạch.

Thứ tự đúng: **đo trước cho sạch số, rồi nhìn để bắt cái số không thấy.** Không phải ngược lại.

---

## 2. Chuẩn vàng phải là một file, không phải một ấn tượng

Design HTML tĩnh được serve qua http và đo bằng **đúng script đo live**, kết quả lưu thành
`baseline/design-metrics-<page>-<viewport>.json`.

Ba hệ quả:

1. **"Đúng chưa?" trở thành một phép trừ**, chạy trong 10 giây, không cần con người.
2. **Chuẩn vàng version-hoá được.** Design đổi → chạy lại lệnh đo → git diff cho thấy đúng
   những gì đổi. Không còn "design mới có khác gì không nhỉ".
3. **Cùng một trình đo cho cả hai bên** → mọi sai số hệ thống (device scale factor, font
   rendering, viewport) triệt tiêu. Đây là lý do phải ép `deviceScaleFactor: 1` và
   `--force-device-scale-factor=1`, và phải serve design qua http chứ không mở `file://`.

---

## 3. Dung sai — không phải mọi thuộc tính đều bằng nhau

| Nhóm | Dung sai | Vì sao |
|---|---|---|
| Khoảng cách, kích thước (padding, margin, width, height, gap) | **±2px** | Subpixel rounding của grid/flex là thật và không tránh được |
| Cỡ chữ, line-height, letter-spacing | **±1px** | Chặt hơn: chữ lệch 2px là nhìn thấy ngay |
| Màu | **khớp tuyệt đối** | Không có lý do chính đáng nào để màu lệch. Lệch màu = sai token |
| `grid-template-columns`, tỉ lệ | **khớp tuyệt đối** | Lưới sai là sai cấu trúc, không phải sai tinh chỉnh |
| `fontFamily` | **chỉ so family đầu** | Fallback stack được phép khác — chỉ family đầu thực sự render |

Dung sai lỏng hơn ở đâu thì phải **viết ra lý do**, không im lặng nới.

---

## 4. Cái gì KHÔNG đo

Đo nhầm thứ do nội dung quyết định sẽ tạo ra tiếng ồn giết chết bộ đo — sau vài lần
"lệch nhưng không sao" thì người ta ngừng đọc output.

**Không đo:**
- Chiều cao của element bọc text có độ dài khác nhau (mock tiếng Anh vs data tiếng Việt).
- Số lượng item render (mock 4 card, store có 19 sản phẩm).
- Bất cứ thứ gì phụ thuộc dữ liệu thật.

**Vẫn in ra nhưng ở mục "informational":** kích thước hộp (`box: 460x690`). Nó hữu ích để mắt
người liếc qua, nhưng không tính vào cổng.

**Khoá chiều cao lại thay vì đo nó:** `product_title_max_lines: 2` khoá card không vỡ lưới khi
title dài — đo `fontSize`/`lineHeight` của title, không đo `height` của card.

---

## 5. Cổng phải là một con số, và con số phải ghi vào tài liệu

Sai:
> "Homepage đã xong, trông khớp design."

Đúng:
> "113 thuộc tính · 0 ngoài dung sai ở cả desktop và mobile · `theme check` 161 offence / 6 error,
> bằng đúng baseline vendor gốc (162/6)."

Con số thứ hai kiểm chứng được, so sánh được giữa các phase, và **bắt được hồi quy**. Đây là lý do
mỗi handover mở đầu bằng bảng chỉ số.

Đặc biệt: ngưỡng `theme check` là **con số của bundle vendor**, không phải 0. Bundle Prestige gốc
đã có sẵn 162 offence / 6 error. Đặt ngưỡng 0 nghĩa là sẽ đi sửa code vendor — vi phạm nguyên tắc 3.
Ngưỡng đúng: *"không phát sinh offence mới"*.

---

## 6. Hồi quy chéo trang là rủi ro số một

Lớp override **dùng chung cho mọi trang**. Một rule thêm cho PDP có thể phá PLP mà không ai biết,
vì không ai mở lại PLP.

Ba biện pháp:

1. **`--all` là cổng bắt buộc trước commit.** 4 trang × 2 viewport ≈ 80 giây. Rẻ hơn nhiều lần
   so với phát hiện ở production.
2. **Trước khi thu hẹp scope một rule toàn cục — grep xem còn ai dùng.**
   Ca thật: định đổi `.product-title { font-size: 12px }` thành `.product-card__info .product-title`.
   Grep ra `.product-title` còn dùng ở `product-card-horizontal.liquid` (line item giỏ hàng) và
   `product-quick-buy.liquid` — **hai chỗ không nằm trong bộ đo nào**, nên lưới an toàn sẽ không bắt.
   Cách xử lý: **không thu hẹp**. Ghi rule mới out-specify (`.product-info .product-title`, 0,2,0
   thắng 0,1,0). Rủi ro hồi quy = 0.
3. **Khi bộ đo không phủ một vùng, nói thẳng là chưa đo** — đừng ngầm hiểu là đã đạt.
   "Drawer mobile chưa được style riêng. Chưa đo lệch vì baseline không phủ."

---

## 7. Test cái mà `theme check` không test

`theme check` là linter Liquid. Nó **không** đọc `templates/*.json` đối chiếu schema thật của section.
Nghĩa là những lỗi sau lọt qua sạch sẽ, và Shopify **từ chối cả file** khi push:

| Lỗi | theme check | `validate-template.py` |
|---|---|---|
| Setting id không tồn tại trong schema | im lặng | ✗ bắt |
| `range` ngoài biên | im lặng | ✗ bắt |
| **`range` lệch step** (vd step 5, đặt 73) | im lặng | ✗ bắt — Shopify TỪ CHỐI cả file |
| `select` sai tập giá trị | im lặng | ✗ bắt |
| Block type không hợp lệ / vượt `max_blocks` | im lặng | ✗ bắt |
| Section không `enabled_on` template đang dùng | im lặng | ✗ bắt |
| `block_order` lệch với `blocks` | im lặng | ✗ bắt |
| `image_picker` không phải `shopify://shop_images/…` | im lặng | ✗ bắt |

Ngược lại `theme check` bắt thứ script không bắt: khoá dịch `t:` không tồn tại (là **error**,
không phải warning), filter deprecated, Liquid syntax. **Chạy cả hai.**

---

## 8. Ba loại default âm thầm lọt ra mặt trước

Không dựa vào "không khai báo thì không hiện". Phải set rỗng **tường minh**:

- `slideshow` block → `subheading` mặc định `"Tell your story"`
- `featured-collections` → `subheading` mặc định `"Featured collection"`
- Section demo trong `overlay-group.json` (newsletter popup) vẫn bật

Cách bắt: sau khi wiring template, **screenshot full page rồi đọc chữ**. Đây là một trong số ít
việc mà mắt nhanh hơn số.

---

## 9. Cái gì đo bằng harness, cái gì bắt buộc store thật

| Kiểm | Cần store? | Công cụ |
|---|---|---|
| Lớp override có thắng cascade không | ❌ | `cascade-harness.html` |
| Token, `@font-face`, kiểu chữ nguyên tố | ❌ | harness + `measure.mjs` |
| Template JSON hợp lệ với schema | ❌ | `validate-template.py` |
| Liquid render đúng, section id thật, biến theme | ✅ | `shopify theme dev` |
| Lưới với dữ liệu thật, độ dài title thật | ✅ | `compare-to-design.py` |
| Theme Editor kéo/thả không vỡ | ✅ | thủ công |

Khi store bị chặn (token hết hạn — chuyện xảy ra thật giữa chừng dự án), P0→P3 vẫn chạy được
đầy đủ. **Đừng dừng cả dự án vì một token.** Nhưng cũng đừng tuyên bố đạt cổng P4/P5 bằng harness.

---

## 10. Báo cáo trung thực — vài quy tắc học được

- **Số ở phase trước có thể hết đúng ở phase sau.** Đo lại, và nếu đã hết đúng thì ghi rõ:
  *"con số 0/174 trong bàn giao Phase 2 không còn đúng tại thời điểm này"*, kèm cách đã xác nhận.
- **Sai lệch có chủ ý phải liệt kê riêng**, kèm lý do. Không gộp vào "đã xong".
  Ví dụ: breakpoint gallery mobile design chuyển ở 768px, bản dựng chuyển ở 1000px theo breakpoint
  `md` của theme — để không phải viết đè hàng loạt utility class. Đây là đánh đổi, không phải lỗi.
- **Kết luận sai đã sửa thì ghi lại**, mục "đính chính" cuối handover. Ca thật:
  *"`cormorant_garamond_n4` là handle hợp lệ"* — suy ra từ việc nó không nằm trong danh sách
  deprecated. Nhưng "không deprecated" ≠ "tồn tại". Ghi lại để không ai suy luận kiểu đó lần nữa.
- **Phát hiện ngoài phạm vi thì báo, đừng tự sửa.** Ca thật: phát hiện 2 hunk lạ nằm trong bundle
  vendor từ phase trước — vi phạm ràng buộc số 1. Báo cáo + đề xuất, không sửa, vì sửa sẽ phải
  chạy lại cổng nghiệm thu của 2 phase trước.
