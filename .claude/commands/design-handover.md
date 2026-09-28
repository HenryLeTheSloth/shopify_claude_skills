---
description: Viết tài liệu bàn giao cho trang vừa dựng, theo template có sẵn — số liệu, ràng buộc cắn ngược, việc còn treo
---

Viết handover cho trang: **$ARGUMENTS**

## 1. Thu số thật, không nhớ lại

Chạy lại, đừng lấy số từ context — số có thể đã cũ:

```bash
cd theme
python3 scripts/compare-to-design.py <page> desktop | head -3
python3 scripts/compare-to-design.py <page> mobile  | head -3
python3 scripts/compare-to-design.py --all | tail -12
shopify theme check 2>&1 | tail -3
git diff --stat theme/ | tail -3
grep -rnE '(#|//|/\*) ?ponytail:' theme/ --include=*.liquid --include=*.css --include=*.scss --include=*.js
```

Mỗi dòng `ponytail:` là một chỗ đi tắt có chủ ý (ledger theo `/ponytail-debt`) → ghi vào
§8 SAI LỆCH CÒN LẠI CÓ CHỦ Ý. Dòng nào không nêu điều kiện nâng cấp → thêm vào việc còn treo 🟡.

## 2. Viết file

`docs_output/implementation-artifacts/<page>-handover.md`, theo
`.claude/skills/design-to-shopify-theme/templates/handover.md`.

## 3. Bốn mục dễ viết cho có — đừng

**§4 RÀNG BUỘC SẼ CẮN NGƯỢC** — phần giá trị nhất. Chỉ ghi thứ sẽ **cắn người làm trang sau**,
mỗi mục theo dạng *dấu hiệu nhận biết → nguyên nhân → cách đúng*. Không phải mục lục lại việc đã làm.
Bẫy nào đã có trong `references/03-pitfall-catalog.md` thì trỏ sang, chỉ ghi phần riêng của dự án này.

**§3 THAY ĐỔI SO VỚI PLAN** — mọi quyết định đã đảo: plan định làm gì · thực tế làm gì · **vì sao**.
Đừng bỏ trống vì "cuối cùng cũng xong" — đây là tri thức đắt nhất của phase.

**§8 SAI LỆCH CÒN LẠI CÓ CHỦ Ý** — đánh đổi đã cân nhắc, tách riêng khỏi §1. Không gộp vào "đã xong",
cũng không giấu xuống "việc còn treo".

**§10 ĐÍNH CHÍNH** — kết luận sai đã sửa trong lúc làm. Ghi cả **suy luận nào dẫn tới sai**, để lần
sau không lặp lại kiểu suy luận đó, không chỉ tránh đúng một sự kiện đó.

## 4. Trung thực

- §1 phải có **số**, không tính từ.
- Vùng bộ đo **không phủ** thì nói thẳng "chưa đo", đừng ngầm hiểu là đạt.
- `--all` cho thấy trang cũ đã lệch → ghi rõ *"con số N/M trong bàn giao trước không còn đúng tại
  thời điểm này"*, kèm cách đã xác nhận.
- Việc còn treo phân mức 🔴 chặn go-live · 🟡 ảnh hưởng trải nghiệm · 🟢 hoàn thiện, và ghi **ai làm**.
