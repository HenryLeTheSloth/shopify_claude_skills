---
name: design-to-shopify-theme
description: Dựng một trang Shopify pixel-perfect từ file design HTML tĩnh, trên nền một theme vendor có sẵn (Prestige, Dawn, Impulse...). Dùng khi user nói "dựng trang X theo design", "convert design sang theme", "pixel-perfect Shopify", "implement design/*.html", hoặc khi cần đo sai lệch giữa design và storefront live.
---

# Design → Shopify Theme (pixel-parity)

Quy trình dựng trang Shopify **khớp số đo** với một file design HTML tĩnh, tái sử dụng
tối đa section của theme vendor, và **chứng minh** kết quả bằng số chứ không bằng mắt.

Đã chạy thật trên 5 trang (homepage, PLP, PDP, about, lookbook) của theme Prestige v10:
0 sai lệch / 113 · 174 · 244 thuộc tính đo tự động, 0 hồi quy chéo trang.

---

## Nguyên tắc gốc — đọc trước, đây là thứ quyết định kết quả

1. **Không so bằng screenshot. So bằng `getComputedStyle`.**
   Screenshot cho biết "trông khang khác"; computed style cho biết "`paddingTop` design 40px,
   live 36px, lệch −4px". Cái thứ hai sửa được ngay, cái thứ nhất tốn một vòng đoán.
   Screenshot chỉ dùng cho thứ **không đo được**: ảnh, đổ bóng, vị trí tương đối sau khi đã
   loại trừ khỏi bộ đo.

2. **Design tĩnh là chuẩn vàng, và phải đo được.**
   Serve `design/*.html` bằng http server, đo nó bằng đúng script đo live, lưu ra JSON
   `baseline/`. Từ đó mọi câu hỏi "đúng chưa?" trở thành một phép trừ.

3. **Không sửa bundle CSS của vendor.** Toàn bộ delta đi qua **một lớp override**
   (`base.scss` → `assets/<brand>.css`) nạp **sau** CSS vendor. Sửa vendor = mất trắng khi update theme.

4. **Tái sử dụng section trước, viết mới sau — và có trigger số học để chuyển.**
   Không "cảm thấy khó rồi viết mới". Ví dụ thật: `dynamic-grid` của Prestige đặt item trên
   lưới 16 cột; tỉ lệ design 41/32/27% không biểu diễn được bằng phần mười sáu → lệch > 2px
   **theo số học**, không cần chạy thử. Đó là lúc viết section mới.

5. **Mỗi phase đóng bằng một cổng đo được.** Không có "xong khoảng 90%".
   Cổng = `N thuộc tính · 0 ngoài dung sai` + `theme check` không tăng offence.

6. **Trang sau phải chạy lại cổng của trang trước.** Lớp override dùng chung → mọi rule mới
   là một rủi ro hồi quy. Đây là lý do bộ đo phải rẻ để chạy (10 giây/trang).

---

## Quy trình 6 phase

| Phase | Việc | Cổng đóng phase |
|---|---|---|
| **P0 — Recon** | Đọc theme: đếm section/snippet/block, tìm bundle CSS, tìm design token trong design HTML | Có bảng "sự thật nền tảng" ≥8 dòng, mỗi dòng kèm **đường dẫn:số dòng** làm bằng chứng |
| **P1 — Baseline** | Serve design tĩnh, viết `measure-<page>.json`, đo 3 viewport → `baseline/*.json` | File baseline tồn tại, ≥40 selector, 0 selector `MISSING` |
| **P2 — Mapping** | Map từng khối design → section vendor. Đánh dấu Reuse / Reuse+CSS / **Viết mới** + lý do số học | Bảng map phủ 100% khối, có tỉ lệ tái sử dụng |
| **P3 — Tokens** | Token + `@font-face` + lớp override, nạp sau CSS vendor | Body/heading font, màu nền, gutter khớp trên `cascade-harness.html` — **chưa cần store** |
| **P4 — Build** | Dựng từng khối. Sau mỗi khối chạy `compare-to-design.py` ngay | Khối đó 0 ngoài dung sai ở desktop **và** mobile |
| **P5 — Gate** | Đo lại toàn bộ trang + **mọi trang đã làm trước đó** + `theme check` + `validate-template.py` | 0 lệch mọi trang · theme check ≤ baseline vendor · template hợp lệ |

Chi tiết từng phase: [references/01-workflow.md](references/01-workflow.md)

---

## Bộ công cụ

Cài bằng một lệnh — `bash .claude/skills/design-to-shopify-theme/install.sh` (xem [INSTALL.md](INSTALL.md)). Rồi:

```bash
# 1. Đo design tĩnh -> chuẩn vàng
python3 -m http.server 8080 --directory design &
node scripts/measure.mjs http://127.0.0.1:8080/index.html scripts/measure-homepage.json desktop \
  > baseline/design-metrics-homepage-desktop.json

# 2. So live vs chuẩn vàng — chạy sau MỖI lần sửa CSS
python3 scripts/compare-to-design.py homepage desktop
python3 scripts/compare-to-design.py homepage mobile

# 3. Cổng hồi quy — chạy TẤT CẢ trang đã làm
python3 scripts/compare-to-design.py --all

# 4. Kiểm template JSON đối chiếu schema thật (bắt thứ theme check không bắt)
python3 scripts/validate-template.py templates/index.json index

# 5. Ảnh — chỉ cho thứ không đo được
node scripts/screenshot.mjs http://127.0.0.1:9292 "" live-fullpage desktop
```

| Script | Dùng để | Ghi chú |
|---|---|---|
| `measure.mjs` | Đọc computed style + box của N selector | Hỗ trợ **bước tiền-đo** (click mở drawer) và **xuyên shadow DOM** bằng `>>>` |
| `compare-to-design.py` | In **danh sách sai lệch**, không phải bảng dump | Config-driven qua `pixel-parity.config.json` |
| `validate-template.py` | Bắt setting không tồn tại, range lệch step, block type sai | Shopify **từ chối cả file** nếu range lệch step — theme check im lặng |
| `screenshot.mjs` | Ảnh full page / theo selector, có scroll để kích lazy-load | |
| `init-page.py` | Scaffold measure + map + baseline cho một trang mới | |

Triết lý test đầy đủ: [references/02-testing-doctrine.md](references/02-testing-doctrine.md)

---

## Catalog bẫy đã trả giá

18 bẫy kỹ thuật gặp thật, mỗi cái kèm dấu hiệu nhận biết và cách xử lý:
[references/03-pitfall-catalog.md](references/03-pitfall-catalog.md)

Ba cái đắt nhất, đọc ngay cả khi bỏ qua phần còn lại:
- **Custom property chứa `%` được thay dạng token, không phải giá trị đã tính** — cùng một biến
  cho ra chiều rộng ở `grid-template-columns` và chiều cao ở `grid-template-rows`.
- **Section trong section group có id sinh động** (`sections--21090534883430__header`) →
  mọi selector `#shopify-section-header` đều trượt, và không lượng class nào thắng một ID.
  Cách đúng: đặt biến CSS lên chính element **tiêu thụ** nó.
- **`{% stylesheet %}` của section nạp TRƯỚC lớp override toàn cục** → thua ở cùng specificity.

---

## Artifact bắt buộc

Hai file cho mỗi trang, không phải một:

| File | Viết khi | Nội dung |
|---|---|---|
| `planning-artifacts/<page>-implementation-plan.md` | Sau P2, **trước khi gõ dòng code đầu tiên** | Bảng chứng cứ · bản đồ khối→section · gap & rủi ro lượng hoá · phase + acceptance |
| `implementation-artifacts/<page>-handover.md` | Sau P5 | Trạng thái 1 dòng có số · đã làm · **ràng buộc sẽ cắn ngược** · việc còn treo phân mức 🔴🟡🟢 · đính chính |

Template: [templates/implementation-plan.md](templates/implementation-plan.md) · [templates/handover.md](templates/handover.md)

> Mục "ràng buộc sẽ cắn ngược" là phần giá trị nhất của handover. Nó là thứ duy nhất ngăn
> người làm trang tiếp theo (kể cả chính bạn ở context sau) phá lại đúng cái bẫy cũ.

---

## Chống hồi quy chéo trang

Lớp override dùng chung → sửa cho PDP có thể phá PLP. Ba quy tắc:

1. **Scope mọi rule dưới `.shopify-section--<type>`**, không dùng id.
2. **Trước khi thu hẹp một rule toàn cục, grep xem còn ai dùng.** Ví dụ thật: định đổi
   `.product-title` thành `.product-card__info .product-title` — nhưng `.product-title` còn
   dùng ở line item giỏ hàng và quick-buy, hai chỗ **không nằm trong bộ đo nào**. Thay vì thu hẹp,
   ghi rule mới **out-specify** (`.product-info .product-title`, 0,2,0 thắng 0,1,0). Rủi ro hồi quy = 0.
3. **`--all` là cổng bắt buộc trước commit**, không phải tuỳ chọn.

---

## Khi bị chặn quyền truy cập store

`cascade-harness.html` cho phép verify lớp override thắng cascade **mà không cần store**:
một file HTML nhúng CSS vendor + CSS override + markup mẫu. Nó **không thay thế** được render
Liquid thật, nhưng đóng được P3 khi Shopify CLI hết token.
