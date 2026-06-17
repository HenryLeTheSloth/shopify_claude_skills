# 📐 Playbook: Clone Website → Shopify Theme

Quy trình **phân tích một website bất kỳ → dựng lại thành Shopify theme** bằng các slash command của dự án.

> **Nguyên tắc cốt lõi:** Một site có hàng trăm/hàng nghìn URL nhưng chỉ cần dựng **vài template** (home,
> product, collection, page, header/footer). Bạn clone *template* — Shopify tự nhân bản nội dung cho mọi URL cùng loại.

**Yêu cầu:** `firecrawl` CLI (đã login) + Node v22 + Shopify CLI — xem [README.md](../README.md#-yêu-cầu-tiên-quyết-prerequisites).
Thay `<site-url>` bằng URL site nguồn của bạn (vd `https://example.com/`).

---

## 🚀 Trình tự chạy (chạy lần lượt từ trên xuống)

```
# ── A · TÌM HIỂU SITE ─────────────────────────────────────
1. /site-analyze          <site-url>     # đếm trang & template cần dựng
2. /site-ui-audit         <site-url>     # (tùy chọn) lỗi UI cần sửa khi clone
3. /site-structure-audit  <site-url>     # (tùy chọn) lỗi cấu trúc/IA
   /site-audit            <site-url>     # (tùy chọn) audit tổng SEO+QA

# ── B · DỰNG NỀN DESIGN (1 lần / project) ─────────────────
4. /site-design           <site-url>     # → DESIGN.md (màu, font, spacing, component)
5. /shopify-tokens-setup                 # → nạp tokens từ DESIGN.md vào base.scss

# ── C · CLONE TỪNG TEMPLATE (mấu chốt) ⭐ ─────────────────
6. /site-implement <site-url> header
   /site-implement <site-url> footer
   /site-implement <site-url> all                       # home (từng section)
   /site-implement <site-url>/products/<handle> all      # product (PDP)
   /site-implement <site-url>/collections/<handle> all   # collection (PLP)
   /site-implement <site-url>/pages/<handle> all         # page / blog

# ── D · KIỂM THỬ ──────────────────────────────────────────
7. npm run dev  &  npm run sass
8. /shopify-visual-test <source-url> http://127.0.0.1:9292 desktop
9. /shopify-audit
```

> ⚠️ **Bắt buộc về thứ tự:** Bước **4–5 (DESIGN.md → tokens) phải xong trước bước 6**. `/site-implement`
> tự dừng nếu `base.scss` chưa có token. Bước 1–3 chỉ để hiểu site — có thể bỏ qua nếu vội.

---

## Chi tiết từng bước

### 1 · `/site-analyze <url>` — Phân tích site

Map toàn site → đếm tổng URL → phân loại → liệt kê **template cần dựng**. Cho bạn checklist công việc:
biết có bao nhiêu trang con và thực sự cần dựng mấy template.

### 2–3 · Audit (tùy chọn nhưng nên làm)

| Command | Soi gì | Output |
|---|---|---|
| `/site-ui-audit <url>` | Lớp nhìn: màu, font, component, grid, ảnh | `audit-report/<site>-ui-audit.html` |
| `/site-structure-audit <url>` | Bộ khung: taxonomy, điều hướng, trang chính sách | `audit-report/<site>-structure.html` |
| `/site-audit <url>` | Bề mặt: SEO + design + QA từng trang | `audit-report/<site>-audit.html` |

**Mục đích:** biết điểm yếu của site gốc để **clone có chọn lọc + cải tiến**, không bê nguyên lỗi sang theme mới.

### 4 · `/site-design <url>` — Tạo `DESIGN.md`

Scrape branding + screenshot → tổng hợp **màu, font, spacing, radius, component, layout** vào `DESIGN.md`.
Đây là nguồn chân lý cho tokens và bước clone.

### 5 · `/shopify-tokens-setup` — Nạp tokens

Dựa trên `DESIGN.md`, điền token vào `base.scss`: `$color-*`, `$space-*`, `$rounded-*`, typography `@mixin`.
Chạy 1 lần / project — mọi template sau đều dùng chung.

### 6 · `/site-implement <url> [section]` — Clone template ⭐

Bước mấu chốt. Với mỗi template, command tự: scrape screenshot+HTML → khoanh vùng section → map design
sang tokens `base.scss` → sinh `sections/*.liquid` + `style.scss` → validate. Nội dung biến đổi (heading,
ảnh, link) đưa vào `{% schema %}` settings. Nếu đã audit, nó **sửa lỗi khi dựng lại** thay vì bê nguyên.

Dựng theo thứ tự ưu tiên: **header + footer → home → product → collection → page/blog**.

### 7–9 · Kiểm thử

Chạy local (`npm run dev` + `npm run sass`), so sánh với site gốc (`/shopify-visual-test`), rồi
audit compliance toàn project (`/shopify-audit`: tokens, inline style, cấu trúc Liquid).

---

## ✅ Checklist

- [ ] `/site-analyze` — biết số URL & template cần dựng
- [ ] (tùy chọn) `/site-ui-audit` · `/site-structure-audit` · `/site-audit`
- [ ] `/site-design` → `DESIGN.md`
- [ ] `/shopify-tokens-setup` → `base.scss` có tokens
- [ ] `/site-implement` — Header + Footer
- [ ] `/site-implement` — Home
- [ ] `/site-implement` — Product (PDP)
- [ ] `/site-implement` — Collection (PLP)
- [ ] `/site-implement` — Page / Blog
- [ ] `/shopify-visual-test` + `/shopify-audit` pass
