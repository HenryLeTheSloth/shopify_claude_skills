#!/usr/bin/env bash
# LitGroup ai-usage: báo % giới hạn gói (rate limit) qua statusline hook.
INPUT=$(cat)
INGEST_TOKEN=$(python3 -c '
import json
try:
    with open("'"$HOME"'/.claude/settings.json") as f:
        d = json.load(f)
    h = (d.get("env") or {}).get("OTEL_EXPORTER_OTLP_HEADERS", "")
    for part in h.split(","):
        part = part.strip()
        if part.startswith("Authorization=Bearer "):
            print(part[len("Authorization=Bearer "):])
            break
except Exception:
    pass
')
STAMP=/tmp/.lg-ai-usage-limits-last
NOW=$(date +%s)
LAST=$(cat "$STAMP" 2>/dev/null || echo 0)
if [ -n "$INGEST_TOKEN" ] && [ $((NOW - LAST)) -ge 60 ]; then
  BODY=$(echo "$INPUT" | python3 -c '
import json, sys
try:
    d = json.load(sys.stdin)
except Exception:
    sys.exit(0)
rl = d.get("rate_limits") or {}
out = {}
fh = rl.get("five_hour")
if fh:
    out["session"] = {"utilization": fh.get("used_percentage"), "resets_at": fh.get("resets_at")}
sd = rl.get("seven_day")
if sd:
    out["weekly"] = {"utilization": sd.get("used_percentage"), "resets_at": sd.get("resets_at")}
print(json.dumps(out) if out else "")
' 2>/dev/null)
  if [ -n "$BODY" ]; then
    curl -s -m 3 -X POST "https://ai-usage.litgroup.io/api/otel/v1/limits" \
      -H "Authorization: Bearer $INGEST_TOKEN" -H "Content-Type: application/json" \
      -d "$BODY" >/dev/null 2>&1 &
    echo "$NOW" > "$STAMP"
  fi
fi
echo "$INPUT" | python3 -c '
import json, sys, os
try:
    d = json.load(sys.stdin)
except Exception:
    print("Claude Code")
    sys.exit(0)
model = (d.get("model") or {}).get("display_name", "Claude Code")
cwd = (d.get("workspace") or {}).get("current_dir") or d.get("cwd") or ""
base = os.path.basename(cwd.rstrip("/")) if cwd else ""
rl = d.get("rate_limits") or {}
parts = [model]
if base:
    parts.append(base)
fh = rl.get("five_hour")
sd = rl.get("seven_day")
if fh and fh.get("used_percentage") is not None:
    parts.append("5h:" + str(fh.get("used_percentage")) + "%")
if sd and sd.get("used_percentage") is not None:
    parts.append("7d:" + str(sd.get("used_percentage")) + "%")
print(" · ".join(parts))
'