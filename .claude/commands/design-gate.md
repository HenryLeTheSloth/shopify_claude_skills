---
description: Chạy cổng hồi quy pixel-parity trên mọi trang + theme check + validate template, báo cáo bằng số
---

Cổng nghiệm thu trước commit. **$ARGUMENTS** (để trống = chạy tất cả).

## 1. Điều kiện

```bash
curl -s -o /dev/null -w "%{http_code}\n" --max-time 3 http://127.0.0.1:9292/
```

Không phải `200` → dev server chưa chạy. **Dừng và báo user**, đừng chạy tiếp:
gate trên server chết cho ra `unmeasured`, không phải pass.

## 2. Hồi quy mọi trang

```bash
cd theme && python3 scripts/compare-to-design.py --all
```

Đọc dòng tổng kết: `N/M run(s) measured, X deviation(s), Y unmeasured`.
**Cả `X` và `Y` đều phải là 0.** Một run không đo được là gate đỏ, không phải pass.

## 3. Lint & template

```bash
shopify theme check
for t in theme/templates/*.json; do
  python3 theme/scripts/validate-template.py "$t" "$(basename "$t" .json)"
done
git diff --stat theme/assets/*.css | grep -v jeor   # bundle vendor PHẢI sạch
```

## 4. Báo cáo

| Kiểm | Ngưỡng | Kết quả |
|---|---|---|
| Hồi quy pixel — mọi trang × mọi viewport | 0 lệch, 0 unmeasured | |
| `shopify theme check` | ≤ baseline vendor (ghi ở P0) | |
| `validate-template.py` | ERRORS: 0 mọi template | |
| Bundle CSS vendor | `git diff` rỗng | |
| `!important` mới | 0 | |

Có mục đỏ → **liệt kê từng sai lệch cụ thể** (selector · thuộc tính · design · live · delta),
đừng tóm tắt thành "còn vài chỗ lệch". Rồi hỏi user có muốn sửa luôn không.

Tất cả xanh → nói thẳng "gate pass" kèm số, và nhắc rằng cổng này **không** phủ:
Theme Editor kéo/thả, hiệu ứng động, và mọi vùng chưa có trong `measure-*.json`.
