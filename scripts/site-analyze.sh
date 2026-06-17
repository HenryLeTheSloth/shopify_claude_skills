#!/usr/bin/env bash
# site-analyze.sh — Map + phân loại site để biết cần clone bao nhiêu TEMPLATE
# Dùng: bash scripts/site-analyze.sh https://example.com
set -euo pipefail

SITE="${1:-}"
if [ -z "$SITE" ]; then
  echo "❌ Thiếu URL. Dùng: bash scripts/site-analyze.sh https://example.com"
  exit 1
fi

OUT=".firecrawl"
mkdir -p "$OUT"
URLS="$OUT/site-urls.txt"

echo "🔎 Mapping $SITE ..."
firecrawl map "$SITE" 2>/dev/null | grep '^http' | sort -u > "$URLS"

total=$(grep -c '^http' "$URLS" || true)
echo "────────────────────────────────────────"
echo "📊 KẾT QUẢ PHÂN TÍCH: $SITE"
echo "────────────────────────────────────────"
echo "Tổng URL tìm thấy: $total"
echo
echo "— Số URL theo loại (≈ độ lớn nội dung) —"
for t in products collections pages blogs cart account; do
  printf "  %-12s %s\n" "$t" "$(grep -c "/$t/" "$URLS" || true)"
done
printf "  %-12s %s\n" "home/khác" "$(grep -vcE '/(products|collections|pages|blogs|cart|account)/' "$URLS" || true)"
echo
echo "— TEMPLATE cần dựng (mỗi loại chỉ làm 1 lần) —"
has(){ grep -qE "$1" "$URLS" && echo "  ✅ $2" || echo "  ⬜ $2 (không thấy)"; }
echo "  ✅ home / index"
has '/products/'    "product (PDP)"
has '/collections/' "collection (PLP)"
has '/blogs/'       "blog + article"
has '/cart'         "cart"
echo "  ✅ header + footer (layout)"
echo
echo "— Pages tĩnh (mỗi page = 1 nội dung, dùng chung 1 template 'page') —"
grep "/pages/" "$URLS" | sed "s#${SITE}##; s/?.*//" | sort -u | sed 's/^/  • /'
echo "────────────────────────────────────────"
echo "👉 Danh sách URL đầy đủ: $URLS"
