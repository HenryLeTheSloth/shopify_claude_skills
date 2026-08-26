#!/usr/bin/env python3
"""
Scaffold the pixel-parity harness for one new page, then capture its baseline.

    python3 scripts/init-page.py <page> <design-file.html> [--path /collections/new-in]

Does three things:
  1. writes scripts/measure-<page>.json      — a starter selector list, scraped from the design
  2. writes scripts/compare-to-design.<page>.json — an identity map for you to fill in
  3. registers the page in scripts/pixel-parity.config.json

Then run the baseline capture it prints. Nothing here guesses at the live theme's selectors —
mapping design -> live is the part that needs a human, and the file is laid out so that
filling it in is the only work left.
"""

import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
CONFIG = os.path.join(HERE, "pixel-parity.config.json")

# Property groups by element role — the same taxonomy the workflow doc describes.
TYPO = ["fontFamily", "fontSize", "fontWeight", "lineHeight", "letterSpacing", "textTransform", "color"]
BOX = ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "marginTop", "marginBottom"]
GRID = ["width", "gap", "gridTemplateColumns", "gridTemplateRows"]
MEDIA = ["width", "height", "aspectRatio"]


def props_for(sel):
    """A reasonable starting property set, inferred from the class name."""
    s = sel.lower()
    if sel == "body":
        return ["fontFamily", "fontSize", "fontWeight", "lineHeight", "color", "backgroundColor"]
    if "grid" in s or "row" in s or "track" in s or "list" in s:
        return GRID
    if "img" in s or "media" in s or "image" in s or "photo" in s:
        return MEDIA
    if "btn" in s or "button" in s:
        return TYPO + ["height", "minWidth", "paddingLeft", "borderRadius", "border", "backgroundColor"]
    if "section" in s or "wrap" in s or "container" in s:
        return BOX + ["maxWidth"]
    if re.search(r"h[1-6]$|title|heading|eyebrow|name|price|label|link", s):
        return TYPO
    return TYPO + ["backgroundColor"]


def harvest(design_path, limit=60):
    """Pull candidate selectors out of the design's own stylesheet, in source order."""
    html = open(design_path, encoding="utf-8").read()
    css = "\n".join(re.findall(r"<style[^>]*>(.*?)</style>", html, re.S))
    seen, out = set(), ["body"]
    for block in re.findall(r"([^{}]+)\{[^{}]*\}", css):
        for sel in block.split(","):
            sel = sel.strip()
            # keep simple, stable selectors; skip pseudo/at-rules/state
            if not sel or sel.startswith(("@", "%", ":", "*")) or len(sel) > 48:
                continue
            if any(c in sel for c in (":", ">", "[", "~", "+")):
                continue
            if not sel.startswith("."):
                continue
            if sel in seen:
                continue
            seen.add(sel)
            out.append(sel)
            if len(out) >= limit:
                return out
    return out


def main(argv):
    if len(argv) < 2:
        sys.exit(__doc__)
    page, design_file = argv[0], argv[1]
    live_path = "/"
    if "--path" in argv:
        live_path = argv[argv.index("--path") + 1]

    if not os.path.exists(design_file):
        sys.exit(f"design file not found: {design_file}")

    sels = harvest(design_file)
    measure = [{"sel": s, "props": props_for(s)} for s in sels]
    mfile = os.path.join(HERE, f"measure-{page}.json")
    with open(mfile, "w", encoding="utf-8") as fh:
        fh.write("[\n" + ",\n".join(" " + json.dumps(e) for e in measure) + "\n]\n")

    mapfile = os.path.join(HERE, f"compare-to-design.{page}.json")
    with open(mapfile, "w", encoding="utf-8") as fh:
        json.dump(
            {
                "_comment": "design selector -> LIVE theme selector. Left keys must match "
                            "measure-%s.json. Replace every right-hand value; identity is a placeholder." % page,
                "map": {s: s for s in sels},
                "_ignore_comment": "Properties that cannot be compared because design and theme "
                                   "position the element differently. EVERY entry needs a written reason.",
                "ignore": {},
            },
            fh,
            indent=2,
        )

    cfg = json.load(open(CONFIG, encoding="utf-8")) if os.path.exists(CONFIG) else {
        "liveBaseUrl": "http://127.0.0.1:9292",
        "designBaseUrl": "http://127.0.0.1:8080",
        "baselineDir": "../baseline",
        "viewports": ["desktop", "mobile"],
        "pages": {},
    }
    cfg["pages"][page] = {
        "designFile": os.path.basename(design_file),
        "livePath": live_path,
        "map": f"compare-to-design.{page}.json",
        "measure": f"measure-{page}.json",
        "baseline": f"design-metrics-{page}-{{v}}.json",
    }
    with open(CONFIG, "w", encoding="utf-8") as fh:
        json.dump(cfg, fh, indent=2)

    design_url = cfg["designBaseUrl"].rstrip("/") + "/" + os.path.basename(design_file)
    bdir = cfg["baselineDir"]
    if len(sels) < 20:
        print(f"!! only {len(sels)} selector(s) harvested from {design_file}.")
        print("   The design's CSS is probably in a linked stylesheet rather than an inline")
        print("   <style> block, or it uses element/nested selectors this scraper skips on")
        print("   purpose. Write measure-%s.json by hand — see" % page)
        print("   templates/measure-page.example.json for the property groups to use.\n")
    print(f"wrote  {mfile}   ({len(measure)} selectors — prune to the 40-55 that matter)")
    print(f"wrote  {mapfile}  (identity map — REPLACE the right-hand side with live selectors)")
    print(f"wrote  {CONFIG}   (page '{page}' registered)")
    print("\nNext:")
    print(f"  python3 -m http.server 8080 --directory <design-dir> &")
    for vp in cfg["viewports"]:
        print(f"  node scripts/measure.mjs {design_url} scripts/measure-{page}.json {vp} \\")
        print(f"    > {bdir}/design-metrics-{page}-{vp}.json")
    print(f"  grep -c MISSING {bdir}/design-metrics-{page}-*.json   # must be 0")


if __name__ == "__main__":
    main(sys.argv[1:])
