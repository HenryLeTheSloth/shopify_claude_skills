#!/usr/bin/env bash
# Cài harness pixel-parity vào một dự án Shopify.
#
#   bash .claude/skills/design-to-shopify-theme/install.sh [theme-dir] [baseline-dir]
#
# Mặc định: theme-dir = ./theme, baseline-dir = ./docs_output/planning-artifacts/baseline
# Chạy lại được nhiều lần — không ghi đè config hay measure/map đã có.
set -euo pipefail

SKILL="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
THEME="${1:-theme}"
BASELINE="${2:-docs_output/planning-artifacts/baseline}"

[ -d "$THEME" ] || { echo "✗ không thấy thư mục theme: $THEME"; echo "  dùng: bash install.sh <theme-dir> [baseline-dir]"; exit 1; }

echo "→ theme:    $THEME"
echo "→ baseline: $BASELINE"
echo

mkdir -p "$THEME/scripts" "$BASELINE"

# 1. Script — luôn ghi đè, đây là code của module
for f in measure.mjs screenshot.mjs compare-to-design.py validate-template.py init-page.py; do
  cp "$SKILL/scripts/$f" "$THEME/scripts/$f"
  echo "  ✓ scripts/$f"
done
chmod +x "$THEME/scripts/"*.py

# 2. Harness cascade — chỉ copy nếu chưa có (dự án có thể đã sửa)
if [ ! -f "$THEME/scripts/cascade-harness.html" ]; then
  cp "$SKILL/templates/cascade-harness.html" "$THEME/scripts/"
  echo "  ✓ scripts/cascade-harness.html   (sửa 2 dòng <link> cho đúng tên file CSS)"
else
  echo "  - scripts/cascade-harness.html   đã có, giữ nguyên"
fi

# 3. Config — KHÔNG ghi đè, đây là thứ dự án tự khai
CFG="$THEME/scripts/pixel-parity.config.json"
if [ ! -f "$CFG" ]; then
  REL=$(python3 -c "import os,sys; print(os.path.relpath(sys.argv[1], sys.argv[2]))" "$BASELINE" "$THEME")
  python3 - "$SKILL/templates/pixel-parity.config.json" "$CFG" "$REL" <<'PY'
import json, sys
src, dst, rel = sys.argv[1], sys.argv[2], sys.argv[3]
cfg = json.load(open(src, encoding="utf-8"))
cfg["baselineDir"] = rel
cfg["pages"] = {}          # dự án tự đăng ký bằng init-page.py
json.dump(cfg, open(dst, "w", encoding="utf-8"), indent=2, ensure_ascii=False)
PY
  echo "  ✓ scripts/pixel-parity.config.json  (baselineDir=$REL, chưa có page nào)"
else
  echo "  - scripts/pixel-parity.config.json  đã có, giữ nguyên"
fi

# 4. Dependency
echo
if [ -f "$THEME/package.json" ]; then
  if node -e "process.exit(require('$PWD/$THEME/package.json').devDependencies?.playwright?0:1)" 2>/dev/null; then
    echo "  - playwright đã khai trong package.json"
  else
    echo "  ! chưa có playwright — chạy:  (cd $THEME && npm i -D playwright sass)"
  fi
else
  echo "  ! $THEME/package.json chưa có — chạy:  (cd $THEME && npm init -y && npm i -D playwright sass)"
fi

if [ -x /usr/bin/google-chrome-stable ]; then
  echo "  ✓ Chrome hệ thống có sẵn — export CHROME_PATH=/usr/bin/google-chrome-stable"
else
  echo "  ! chưa thấy Chrome hệ thống — chạy:  (cd $THEME && npx playwright install chromium)"
fi

cat <<TXT

Xong. Bước tiếp:

  1. Sửa liveBaseUrl trong $THEME/scripts/pixel-parity.config.json
  2. Đăng ký trang đầu tiên:
       cd $THEME
       python3 scripts/init-page.py homepage ../design/index.html --path /
  3. Tỉa measure-homepage.json còn 40-55 selector, rồi thay vế phải
     của compare-to-design.homepage.json bằng selector LIVE của theme
  4. Chụp chuẩn vàng (lệnh init-page.py in ra), kiểm 0 MISSING
  5. python3 scripts/compare-to-design.py homepage desktop

Quy trình đầy đủ: $SKILL/references/01-workflow.md
TXT
