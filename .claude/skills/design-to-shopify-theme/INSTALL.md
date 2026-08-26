# Cài vào một dự án mới — 10 phút

## 1. Copy module

```bash
cp -r <path>/design-to-shopify-theme  <new-project>/.claude/skills/
```

Skill tự xuất hiện trong danh sách skill của Claude Code ở lần chạy sau.

## 2. Cài harness — một lệnh

```bash
cd <new-project>
bash .claude/skills/design-to-shopify-theme/install.sh
```

Mặc định `theme-dir = ./theme`, `baseline-dir = ./docs_output/planning-artifacts/baseline`.
Khác thì truyền vào:

```bash
bash .claude/skills/design-to-shopify-theme/install.sh shopify-theme docs/baseline
```

Installer copy 5 script + cascade harness vào `<theme>/scripts/`, sinh
`pixel-parity.config.json` với `baselineDir` đã tính sẵn, và báo còn thiếu dependency nào.
Chạy lại nhiều lần được — **không ghi đè** config, measure hay map đã có.

Sau đó cài dependency theo lệnh nó in ra:

```bash
cd theme && npm i -D playwright sass
npx playwright install chromium      # hoặc: export CHROME_PATH=/usr/bin/google-chrome-stable
```

Thêm vào `theme/package.json`:

```json
"scripts": {
  "dev":        "shopify theme dev --store <store>.myshopify.com",
  "sass":       "sass --watch ./style.scss:./assets/<brand>.css",
  "sass:build": "sass ./style.scss:./assets/<brand>.css --no-source-map --style=expanded",
  "parity":     "python3 scripts/compare-to-design.py",
  "gate":       "python3 scripts/compare-to-design.py --all"
}
```

Rồi sửa `liveBaseUrl` trong `theme/scripts/pixel-parity.config.json`.

## 3. Đăng ký trang đầu tiên

```bash
python3 scripts/init-page.py homepage ../design/index.html --path /
```

Script sẽ:
- sinh `scripts/measure-homepage.json` (danh sách selector rút từ CSS của design — **tỉa còn 40–55 cái quan trọng**)
- sinh `scripts/compare-to-design.homepage.json` (**map identity — bắt buộc thay vế phải bằng selector live**)
- đăng ký page vào config
- in ra lệnh chụp baseline

## 4. Chụp chuẩn vàng

```bash
python3 -m http.server 8080 --directory ../design &
node scripts/measure.mjs http://127.0.0.1:8080/index.html scripts/measure-homepage.json desktop \
  > ../docs_output/planning-artifacts/baseline/design-metrics-homepage-desktop.json
node scripts/measure.mjs http://127.0.0.1:8080/index.html scripts/measure-homepage.json mobile \
  > ../docs_output/planning-artifacts/baseline/design-metrics-homepage-mobile.json

grep -c MISSING ../docs_output/planning-artifacts/baseline/design-metrics-homepage-*.json   # PHẢI là 0
```

`MISSING` trong baseline = selector viết sai. Nó sẽ **âm thầm biến mất** khỏi phép so và cho ra
"0 lệch" giả. Sửa hết rồi mới đi tiếp.

## 5. Chạy

```bash
npm run dev            # terminal 1
npm run sass           # terminal 2
npm run parity homepage desktop     # terminal 3, sau mỗi lần sửa CSS
npm run gate                        # trước commit
```

---

## Checklist thích ứng theme khác Prestige

| Việc | Kiểm bằng |
|---|---|
| Bundle CSS vendor tên gì | `ls theme/assets/*.css` |
| Section có tự khai CSS không | `grep -rl "{% stylesheet %}" sections/ \| wc -l` |
| Section group có id sinh động không | devtools trên storefront thật |
| Biến CSS của theme tên gì | `grep -rn "^\s*--" snippets/css-variables.liquid` (hoặc tương đương) |
| Theme kẹp gap ở sàn nào | grep `calc(` quanh `column-gap` |
| Class product card / product list | đọc `snippets/product-card.liquid` |
| `theme check` baseline bao nhiêu | `shopify theme check` **trước khi sửa gì** — ghi lại con số |

Ghi con số `theme check` gốc vào handover ngay từ đầu. Ngưỡng của dự án là con số đó,
không phải 0.

---

## Không dùng Shopify?

Ba script lõi không biết gì về Shopify:

- `measure.mjs` — Playwright + `getComputedStyle`, chạy trên URL bất kỳ
- `compare-to-design.py` — chỉ đọc JSON, không import gì của Shopify
- `screenshot.mjs` — Playwright thuần

Chỉ `validate-template.py` là riêng Shopify. Toàn bộ triết lý ở
[references/02-testing-doctrine.md](references/02-testing-doctrine.md) áp dụng được cho
WordPress, Webflow, Next.js — bất cứ đâu có "design tĩnh" và "bản dựng thật" cần khớp nhau.
