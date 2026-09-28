---
description: Dựng một trang Shopify pixel-perfect từ design HTML tĩnh, chạy đúng P0→P5 với cổng đo được ở mỗi phase
---

Dựng trang theo quy trình của skill `design-to-shopify-theme`.

**$ARGUMENTS**

Format: `<page> <design-file> [livePath]`

Ví dụ:
- `/design-page homepage design/index.html /`
- `/design-page collection design/02-collection.html /collections/new-in`
- `/design-page product design/03-product.html /products/jeor-v014`

---

## Bước 0 — Nạp skill và tự định vị

1. Đọc `.claude/skills/design-to-shopify-theme/SKILL.md` và `references/01-workflow.md`.
2. Parse `$ARGUMENTS`. Thiếu `livePath` thì mặc định `/`.
3. Kiểm harness đã cài chưa:
   ```bash
   ls theme/scripts/compare-to-design.py theme/scripts/pixel-parity.config.json 2>&1
   ```
   Chưa có → chạy `bash .claude/skills/design-to-shopify-theme/install.sh` rồi báo user
   cài dependency, **dừng ở đây**.
4. **Nếu đã có trang khác trong config** — đọc handover của trang gần nhất trong
   `docs_output/implementation-artifacts/`, mục "RÀNG BUỘC SẼ CẮN NGƯỢC". Đây là điều kiện
   bắt buộc, không phải tuỳ chọn: những ràng buộc đó là lý do trang này sẽ không phá trang trước.
5. Nạp skill `ponytail` (mức `full`) — áp cho P2 và P4. **Số đo thắng ponytail**: bản rút gọn nào
   làm tăng sai lệch thì bỏ, không tranh luận.

---

## P0 — Recon

Chạy các lệnh trong `references/01-workflow.md` §P0. Ghi con số `shopify theme check`
**trước khi sửa gì** — đó là ngưỡng của dự án, không phải 0.

**Cổng:** bảng "sự thật nền tảng" ≥8 dòng, mỗi dòng có `đường-dẫn:số-dòng`.
Dòng không có bằng chứng là giả định — xoá hoặc đi tìm bằng chứng, không để lại.

---

## P1 — Baseline

```bash
python3 scripts/init-page.py <page> ../<design-file> --path <livePath>
```

Rồi **tỉa `measure-<page>.json` còn 40–55 selector**. Chọn theo nguyên tắc "cái gì vỡ thì đo cái đó"
(bảng nhóm thuộc tính ở §P1 của workflow). Bỏ mọi selector đo thứ do **nội dung** quyết định —
chiều cao khối chứa text, số item render. Đo chúng sẽ tạo tiếng ồn giết chết bộ đo.

Element ẩn (drawer, tab, accordion, lightbox) → thêm bước tiền-đo `{"action":"click"}` và
dùng `>>>` nếu nằm trong shadow DOM.

Chụp chuẩn vàng 2 viewport theo lệnh init-page in ra.

**Cổng:** `grep -c MISSING <baseline>/*.json` = **0**. Một MISSING trong baseline là selector
viết sai, và nó sẽ âm thầm rơi khỏi phép so → cho ra "0 lệch" giả.

---

## P2 — Mapping · DỪNG LẠI CHỜ DUYỆT

Viết `docs_output/planning-artifacts/<page>-implementation-plan.md` theo
`templates/implementation-plan.md`.

Bảng bản đồ khối → section, mỗi khối chọn 1 trong 4: Reuse · Reuse+CSS · Reuse+hunk · **Viết mới**.

Mỗi ô "Viết mới" phải có **một câu lý do kiểm chứng được**, tốt nhất là số học. Đây chính là thang của
ponytail: dừng ở bậc đầu tiên đứng được — section/snippet/block có sẵn → setting của theme → CSS
trong `custom.css` → hunk Liquid → mới tới viết mới. Không thêm thư viện JS cho thứ CSS hoặc HTML
native làm được (`<details>`, `<dialog>`, `scroll-snap`, `aspect-ratio`...). Nếu chọn
"thử reuse trước" thì ghi rõ **trigger chuyển** kèm số.

Điền vế phải của `compare-to-design.<page>.json` bằng selector **live** thật của theme.

> **Đưa plan cho user duyệt. KHÔNG viết dòng code nào trước khi được duyệt.**
> Đây là phase quyết định toàn bộ effort còn lại — sai ở đây thì P4 phải làm lại.

---

## P3 — Tokens

Chỉ chạy nếu đây là trang **đầu tiên** của dự án. Trang thứ 2 trở đi bỏ qua, lớp override đã có.

Token copy **nguyên văn, giữ nguyên tên** của design. `@font-face` self-host nếu cần.
Đầu file SCSS dán `templates/base.scss.header`.

**Mọi chỉnh sửa CSS đi vào MỘT file `assets/custom.css`** (build từ `base.scss`/`style.scss`), nạp
**sau** CSS vendor trong `layout/theme.liquid`. Không sửa thẳng CSS của theme gốc — kể cả file
`assets/*.css` của vendor hay khối `<style>` inline trong layout. Section viết mới dùng
`{% stylesheet %}` của chính nó; override section vendor cũng đi qua `custom.css`, scope theo class/
`data-ui-component`, không `!important`.

**Cổng:** đo `scripts/cascade-harness.html` — không cần store.

---

## P4 — Build

**Một khối = một vòng đo.** Không dựng 3 khối rồi mới đo — lệch sẽ không biết rule nào gây ra.

```bash
python3 scripts/compare-to-design.py <page> desktop
python3 scripts/compare-to-design.py <page> mobile
```

Thuộc tính không so được (design và theme định vị bằng cơ chế khác nhau) → đưa vào `ignore`
**kèm lý do viết ra** trong `_ignore_comment`. Mục ignore không có lý do là chỗ giấu lỗi.

Gặp bẫy → tra `references/03-pitfall-catalog.md` trước khi tự chẩn đoán.

**Cổng mỗi khối:** 0 ngoài dung sai ở desktop **và** mobile.

Qua cổng rồi → chạy `/ponytail-review` trên diff của khối đó. Áp từng mục cắt, **đo lại 2 viewport**;
mục nào làm lệch thì hoàn tác mục đó. Không cắt: selector/`ignore` của bộ đo, marker `<BRAND> HUNK`,
thuộc tính a11y, schema setting mà merchant cần chỉnh.

---

## P5 — Gate

```bash
python3 scripts/compare-to-design.py <page> desktop
python3 scripts/compare-to-design.py <page> mobile
python3 scripts/compare-to-design.py --all          # HỒI QUY, bắt buộc
shopify theme check                                  # ngưỡng = con số ghi ở P0
python3 scripts/validate-template.py templates/<page>.json <kind>
git diff --stat theme/assets/<vendor>.css            # PHẢI rỗng
```

Thêm: không `!important` mới · file vendor sửa thì mỗi hunk có marker `<BRAND> HUNK` ·
CSS mới chỉ nằm trong `assets/custom.css` (`git diff` các file CSS vendor và khối `<style>` inline PHẢI rỗng) ·
`/ponytail-review` trên toàn bộ diff của trang ra `Lean already. Ship.` hoặc mọi mục còn lại có lý do.

Rồi chạy `/design-handover <page>`.

---

## Quy tắc xuyên suốt

- **Báo cáo bằng số, không bằng tính từ.** "113 thuộc tính · 0 ngoài dung sai" chứ không
  "trông khớp design".
- **Không tuyên bố đạt cổng P4/P5 bằng cascade harness** — nó chỉ đóng được P3.
- **Số của phase trước có thể hết đúng.** Nếu `--all` cho thấy trang cũ đã lệch, ghi thẳng vào
  handover kèm nguyên nhân, đừng im lặng sửa rồi báo như chưa có gì.
- **Phát hiện ngoài phạm vi thì báo, đừng tự sửa** — sửa sẽ phải chạy lại cổng của phase trước.
- **CSS chỉ được thêm vào `assets/custom.css`** (qua `base.scss`), không bao giờ sửa thẳng CSS của theme gốc.
  Cần markup mới → hunk có marker trong Liquid; cần style → `custom.css`.
- **Ponytail rút gọn code, không rút gọn cổng.** Chỗ đi tắt có trần đã biết → comment
  `ponytail: <trần>, <khi nào nâng cấp>` để handover gom lại — Liquid `{% # ponytail: ... %}`,
  CSS/SCSS `/* ponytail: ... */`, JS `// ponytail: ...`.
