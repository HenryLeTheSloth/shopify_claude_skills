# So sánh 2 cách dựng giao diện Shopify từ Figma

**Dành cho:** người đọc không chuyên kỹ thuật
**Ngày:** 2026-07-27
**Người thực hiện:** Fedor
**Báo cáo kỹ thuật đầy đủ (bản gốc, chi tiết):** [technical-figma-to-liquid-direct-vs-via-html-research-2026-07-27.md](technical-figma-to-liquid-direct-vs-via-html-research-2026-07-27.md)

---

## Câu hỏi đặt ra

Khi dựng giao diện website Shopify từ file thiết kế Figma, có 2 cách để biến bản thiết kế thành mã nguồn thật (Liquid — ngôn ngữ Shopify dùng):

- **Cách A — Đi thẳng:** Lấy dữ liệu thiết kế từ Figma rồi viết trực tiếp thành mã Shopify. **Đây là cách dự án đang dùng.**
- **Cách B — Đi vòng qua HTML:** Lấy dữ liệu thiết kế từ Figma, xuất ra một trang HTML trung gian trước, rồi mới chuyển trang HTML đó thành mã Shopify.

Câu hỏi: cách nào hiệu quả hơn?

## Kết luận ngắn gọn

**Cách A (đi thẳng) hiệu quả hơn Cách B ở gần như mọi mặt** — nhanh hơn, chính xác hơn, rẻ hơn, ít rủi ro hơn. Dự án nên **tiếp tục dùng Cách A** cho mọi công việc bắt đầu từ file Figma, **không cần đầu tư thêm** vào Cách B.

**Điểm cần nhấn mạnh:** đây không chỉ là "dùng công cụ có sẵn của Figma theo mặc định" — dự án **đã tự xây dựng riêng một bộ quy tắc và công cụ kiểm tra** (bộ tài liệu `figma-power/`) để đảm bảo kết quả chuyển đổi từ Figma sang mã Shopify **chính xác nhất có thể**: có quy tắc dịch màu/khoảng cách/font cụ thể theo đúng chuẩn của dự án, có bước bắt buộc so sánh lại với hình ảnh thiết kế gốc (sai lệch cho phép chỉ ±2px khoảng cách, ±1px cỡ chữ), và có bước kiểm tra tự động trước khi chấp nhận kết quả. Đây là lợi thế **Cách B không thể có được**, vì các công cụ bên thứ ba dùng cho Cách B hoàn toàn không biết đến các quy tắc riêng này của dự án.

> Cách B chỉ thật sự có ích cho một tình huống khác — khi nguồn thiết kế **không phải** là Figma mà là một website có sẵn đang chạy thật trên mạng. Dự án đã có sẵn công cụ (`site-implement`) phục vụ đúng tình huống đó rồi, nên không cần xây thêm gì mới.

## Vì sao Cách A tốt hơn — giải thích dễ hiểu

**1. Ít bước hơn = ít sai sót hơn**
Hãy tưởng tượng trò chơi "tam sao thất bản": thông tin truyền qua càng nhiều người/khâu trung gian, càng dễ bị lệch so với bản gốc. Cách A truyền thông tin thiết kế thẳng từ Figma sang mã nguồn trong 1 lần. Cách B phải truyền qua thêm 1 khâu nữa (Figma → HTML → mã nguồn), mỗi khâu thêm vào đều có xác suất sai lệch riêng, và các sai lệch này **cộng dồn** lại chứ không tự triệt tiêu.

**2. Cách A giữ được "tên gọi" của thiết kế, Cách B làm mất**
Trong Figma, màu sắc, khoảng cách, cỡ chữ... đều có tên gọi rõ ràng (ví dụ: "màu chính", "khoảng cách lớn"). Cách A đọc được thẳng các tên gọi này. Cách B, sau khi đi qua HTML, các tên gọi đó biến mất — chỉ còn lại con số cụ thể (ví dụ "#ff4599", "16px") gắn trên từng phần tử. Người/công cụ dựng lại giao diện phải **đoán ngược** xem con số đó tương ứng với quy ước nào của dự án — dễ đoán sai hoặc đoán không nhất quán.

**3. Cách B cần thêm công cụ bên ngoài, tốn thêm chi phí**
Cách A dùng công cụ đã có sẵn, không tốn thêm phí. Cách B cần dùng thêm ít nhất 2 công cụ của bên thứ ba (1 công cụ xuất Figma ra HTML, 1 công cụ khác chuyển HTML thành mã Shopify). Các công cụ này thường miễn phí ở mức rất hạn chế (vài lượt dùng mỗi ngày) rồi mới thu phí — mà một website Shopify thật thường có 15-30 phần giao diện cần dựng, nên mức miễn phí sẽ cạn rất nhanh và phát sinh chi phí thuê bao hàng tháng.

**4. Cách B chậm hơn, khó làm tự động**
Cách A có thể chạy liền mạch, tự động từ đầu đến cuối trong 1 lần thao tác. Cách B cần dừng lại giữa chừng để copy kết quả từ công cụ này, dán qua công cụ khác bằng tay — vừa mất thời gian, vừa khó lặp lại hàng loạt cho nhiều phần giao diện.

**5. Khi thiết kế thay đổi, Cách A cập nhật nhanh hơn**
Nếu team thiết kế sửa lại 1 phần trên Figma, Cách A chỉ cần lấy lại đúng phần đã sửa. Cách B nhiều khả năng phải xuất lại toàn bộ trang HTML rồi convert lại từ đầu, vì các công cụ trung gian không "nhớ" phần nào đã từng dựng rồi.

**6. Cách B khiến dữ liệu thiết kế phải rời khỏi môi trường nội bộ**
Cách A xử lý toàn bộ trong môi trường làm việc nội bộ của đội dự án. Cách B phải đưa file/link thiết kế qua các website/công cụ của bên thứ ba để xử lý — đây là một điểm rủi ro bảo mật nhỏ nhưng có thật, đặc biệt nếu thiết kế chứa nội dung chưa công bố.

## Bảng so sánh nhanh

| Tiêu chí | Cách A — Đi thẳng (đang dùng) | Cách B — Qua HTML |
|---|---|---|
| Tốc độ | Nhanh, chạy liền mạch | Chậm hơn, phải thao tác tay giữa các bước |
| Độ chính xác | Cao — giữ đúng thông tin gốc | Thấp hơn — dễ lệch do phải "đoán ngược" |
| Rủi ro sai sót cộng dồn | Thấp | Cao hơn (thêm 1 bước trung gian) |
| Chi phí | Không tốn thêm phí | Tốn phí thuê bao ≥2 công cụ ngoài |
| Cập nhật khi thiết kế đổi | Nhanh, chỉ cập nhật phần đổi | Chậm, thường phải làm lại từ đầu |
| Bảo mật dữ liệu thiết kế | Ở trong nội bộ | Phải đi qua công cụ bên ngoài |
| Có thể tự động hoá | Có | Hạn chế |

## Thử "tính" ra con số cụ thể — nhưng lưu ý đây là ước tính, không phải đo thật

Dự án **chưa từng thật sự chạy** Cách B, nên không có con số đo đạc thật để đưa vào đây. Để vẫn có hình dung cụ thể, mình dùng một công thức xác suất quen thuộc trong nghiên cứu về AI (gọi là "sai số cộng dồn"): mỗi lần thông tin đi qua 1 khâu "dịch" trung gian, khả năng giữ đúng 100% sẽ giảm đi một chút — và các lần giảm này **nhân dồn** với nhau.

Cách A có khoảng **2 khâu dịch có rủi ro** (chuyển dữ liệu Figma thành mã, rồi tinh chỉnh cho khớp hình ảnh gốc). Cách B có khoảng **5 khâu** (xuất HTML, đoán lại thông số thiết kế, chuyển HTML thành mã, dọn lại cho đúng quy ước riêng của dự án, rồi mới tinh chỉnh khớp hình ảnh gốc).

Nếu giả sử mỗi khâu có 90% khả năng làm đúng (một mức khá tốt với công cụ AI hiện nay):

- **Cách A:** 90% × 90% ≈ **81%** khả năng ra kết quả đúng hoàn toàn ngay lần đầu
- **Cách B:** 90% × 90% × 90% × 90% × 90% ≈ **59%** khả năng ra kết quả đúng hoàn toàn ngay lần đầu

→ Chênh lệch khoảng **22 điểm phần trăm**, chỉ vì Cách B có nhiều khâu trung gian hơn — chưa kể mỗi khâu bị hỏng còn có thể kéo theo khâu sau bị hỏng nặng hơn nữa (thực tế thường tệ hơn con số tính toán này).

**Nhắc lại:** đây là một phép tính minh hoạ dựa trên công thức xác suất phổ biến, áp vào số bước của 2 quy trình — **không phải kết quả đo trên dự án thật**. Muốn có con số đo thật 100% chính xác, cần chạy thử nghiệm thật với 1 phần giao diện cụ thể theo cả 2 cách rồi đếm lại.

## Khuyến nghị

1. **Tiếp tục dùng Cách A** cho toàn bộ công việc dựng giao diện từ Figma — đây vẫn nên là cách làm mặc định của dự án. Đồng thời **tiếp tục đầu tư hoàn thiện bộ quy tắc/công cụ tự xây (`figma-power/`)**, vì đó chính là thứ tạo ra độ chính xác vượt trội của Cách A — đầu tư vào đây có lợi ích cao hơn nhiều so với việc bỏ tiền mua công cụ ngoài cho Cách B.
2. **Không cần mua hay thử thêm công cụ mới** cho hướng "đi qua HTML" — chưa thấy lợi ích nào đủ lớn để bù lại chi phí và rủi ro tăng thêm.
3. Nếu sau này có nhu cầu dựng giao diện từ **một website có sẵn** (không phải từ Figma), đó là một việc khác — dự án đã có công cụ riêng cho việc đó rồi, dùng công cụ có sẵn thay vì cách "qua HTML" nói ở trên.

## Làm rõ thêm: "Liquid" thực chất cũng chính là HTML

Có một điểm cần nói rõ để khỏi hiểu lầm: mã nguồn Shopify (file `.liquid`) **không phải là một thứ khác biệt hoàn toàn với HTML**. Trên thực tế, file `.liquid` chính là 1 trang HTML bình thường, chỉ được chèn thêm một số "chỗ trống thông minh" để lấy dữ liệu tự động (ví dụ: tên sản phẩm, giá, ảnh...). Khi trang web chạy thật, các "chỗ trống" đó được điền dữ liệu và trả về đúng là 1 trang HTML cho trình duyệt hiển thị. Tài liệu chính thức của Shopify xác nhận Liquid là "ngôn ngữ template phía server, render ra HTML" ([shopify.dev](https://shopify.dev/docs/api/liquid)), và quy ước riêng của dự án cũng ghi rõ: "file Liquid chứa HTML cấu trúc" (`figma-power/design-system-rules.md`).

Vậy nên phần so sánh ở trên **không phải** là "Cách A tránh HTML, Cách B mới cần HTML" — vì cuối cùng cả 2 cách đều phải cho ra HTML giống nhau. Khác biệt thật sự là:

- **Cách A** viết ra HTML (kèm phần "chỗ trống thông minh") **ngay từ đầu, dựa trên hiểu đúng ý đồ thiết kế gốc trong Figma** — biết chỗ nào nên để merchant chỉnh sửa được (ví dụ: tiêu đề, ảnh), chỗ nào giữ cố định.
- **Cách B** tạo ra một trang HTML "cứng" (không có chỗ trống nào) trước, rồi phải dùng thêm 1 công cụ khác để **đoán lại** xem chỗ nào trong trang HTML đó nên biến thành "chỗ trống thông minh" — công cụ này không hề biết quy ước riêng của dự án, nên dễ đoán thiếu hoặc đoán sai.

Nói ngắn gọn: cả 2 cách đều phải làm ra cùng một sản phẩm cuối cùng. Cách B chỉ là đi đường vòng — làm ra một bản "cứng" trước rồi mới sửa lại cho "mềm", thay vì làm đúng ngay từ đầu như Cách A.

## Lưu ý về độ tin cậy

Phần đánh giá về "Cách A" dựa trên quy trình đã có thật và đang chạy trong dự án, nên độ tin cậy cao. Phần đánh giá về "Cách B" dựa trên phân tích nguyên lý và khảo sát các công cụ đang có trên thị trường (chưa từng thử nghiệm thật trong dự án này), nên mang tính suy luận có căn cứ chứ không phải số đo thực tế. Muốn chắc chắn tuyệt đối, có thể thử nghiệm nhỏ (1 phần giao diện) theo Cách B rồi đo lại.
