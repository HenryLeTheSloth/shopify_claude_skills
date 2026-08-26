# <PROJECT> <PAGE> — Tài liệu bàn giao

- **Ngày:** <YYYY-MM-DD> · **Người thực hiện:** <ai>
- **Nguồn design:** `design/<file>.html` · **Theme:** <Theme> v<X> · **Store:** <store>
- **Kế hoạch gốc:** [<page>-implementation-plan.md](../planning-artifacts/<page>-implementation-plan.md)
- **Bắt buộc đọc trước:** [<trang trước>-handover.md](<trang-truoc>-handover.md) §4

---

## 1. Trạng thái một dòng

<Một câu, có số. Không "trông khớp design".>

| Chỉ số | Giá trị |
|---|---|
| Thuộc tính đo tự động | |
| Lệch ngoài dung sai — desktop / mobile | **0 / 0** |
| Hồi quy <trang trước> — desktop / mobile | **0 / 0** (N thuộc tính) |
| `shopify theme check` | N offence / M error — **bằng baseline vendor** (gốc N'/M') |
| Section viết mới / tái sử dụng | |
| Tỉ lệ tái sử dụng | |
| Việc còn treo | N (xem §5) |

Dung sai: khoảng cách ±2px · cỡ chữ/line-height/letter-spacing ±1px · màu khớp tuyệt đối.

---

## 2. ĐÃ LÀM

### 2.1 Nền tảng
### 2.2 Bản đồ khối → section
### 2.3 Dữ liệu đã tạo trên store
### 2.4 Công cụ để lại

| File | Dùng để |
|---|---|

---

## 3. THAY ĐỔI SO VỚI PLAN

Mỗi quyết định đã đảo: **plan định làm gì · thực tế làm gì · vì sao**. Đây là chỗ ghi lại tri thức
đắt nhất của phase — đừng bỏ trống vì "cuối cùng cũng xong".

---

## 4. RÀNG BUỘC SẼ CẮN NGƯỢC ⚠️

> Phần giá trị nhất của tài liệu này. Nó là thứ duy nhất ngăn người làm trang tiếp theo
> (kể cả chính bạn ở context sau) phá lại đúng cái bẫy cũ. **Đọc trước khi sửa bất cứ thứ gì.**

### 4.1 Không bao giờ sửa `assets/<vendor>.css`
### 4.2 <bẫy cascade cụ thể của dự án>
### 4.3 …

Mỗi mục: **dấu hiệu nhận biết** → **nguyên nhân** → **cách đúng**.

---

## 5. VIỆC CÒN TREO

Phân mức theo mức độ chặn, không phải theo thứ tự phát hiện.

### 🔴 P1 — Chặn go-live
| # | Vấn đề | Cách xử lý | Ai làm |
|---|---|---|---|

### 🟡 P2 — Ảnh hưởng trải nghiệm
### 🟢 P3 — Hoàn thiện

---

## 6. PHÁT HIỆN NGOÀI PHẠM VI — cần quyết

Thứ phát hiện được nhưng **không tự sửa** vì nằm ngoài phạm vi phase, hoặc vì sửa sẽ phải chạy lại
cổng nghiệm thu của phase trước. Báo cáo + đề xuất, không im lặng sửa.

---

## 7. CÁCH CHẠY & KIỂM TRA

```bash
cd theme
npm run dev
npm run sass                                    # watch

python3 scripts/compare-to-design.py <page> desktop
python3 scripts/compare-to-design.py <page> mobile
python3 scripts/compare-to-design.py --all      # HỒI QUY — bắt buộc trước commit
shopify theme check                             # ngưỡng: N offence / M error
python3 scripts/validate-template.py templates/<page>.json <kind>
```

### Dựng lại chuẩn vàng (chỉ khi design đổi)
```bash
python3 -m http.server 8080 --directory ../design &
node scripts/measure.mjs http://127.0.0.1:8080/<file>.html scripts/measure-<page>.json desktop \
  > <baselineDir>/design-metrics-<page>-desktop.json
```

---

## 8. SAI LỆCH CÒN LẠI — CÓ CHỦ Ý

| Hạng mục | Trạng thái & lý do |
|---|---|

Đây là **đánh đổi đã cân nhắc**, không phải lỗi bỏ sót. Không gộp vào §1.

---

## 9. VIỆC TIẾP THEO

1.

---

## 10. Ghi chú đính chính

Kết luận sai đã sửa trong lúc làm, ghi lại để không lặp:

1. **"<kết luận sai>"** — sai vì <lý do>. Bài học: <suy luận nào không được phép lặp>.
