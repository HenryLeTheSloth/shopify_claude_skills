#!/usr/bin/env python3
"""
Diff a live theme page against its design baseline, property by property.

    python3 scripts/compare-to-design.py <page> [desktop|mobile|tablet]
    python3 scripts/compare-to-design.py --all            # every page x every viewport
    python3 scripts/compare-to-design.py <page> desktop --url http://127.0.0.1:9292/custom

Everything is driven by scripts/pixel-parity.config.json — no page is hardcoded here.
Adding a page means adding one entry to that file, not editing this script.

Output is the DEVIATION LIST, not a dump: a clean page prints "No deviations."
Exit code is the number of out-of-tolerance properties, so CI can gate on it.

Tolerances (override per-project in the config):
  lengths +/-2px   font sizes / line heights / letter spacing +/-1px   colors exact
"""

import json
import os
import re
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)  # the theme directory

CONFIG_PATH = os.path.join(HERE, "pixel-parity.config.json")
if not os.path.exists(CONFIG_PATH):
    sys.exit(f"missing {CONFIG_PATH} — copy templates/pixel-parity.config.json and fill it in")
CFG = json.load(open(CONFIG_PATH, encoding="utf-8"))

BASE_URL = CFG.get("liveBaseUrl", "http://127.0.0.1:9292")
BASELINE_DIR = os.path.join(ROOT, CFG.get("baselineDir", "../baseline"))
PAGES = CFG["pages"]
TOL = CFG.get("tolerances", {})
LENGTH_TOL = TOL.get("length", 2.0)
TYPO_TOL = TOL.get("typography", 1.0)
TYPO_PROPS = set(TOL.get("typographyProps", ["fontSize", "lineHeight", "letterSpacing"]))


def resolve(page, viewport, url_override=None):
    """Return (url, mapping, ignore, props_by_sel, steps, baseline) for one page+viewport."""
    if page not in PAGES:
        sys.exit(f"unknown page '{page}' — config has: {', '.join(PAGES)}")
    p = PAGES[page]

    url = url_override or (BASE_URL.rstrip("/") + p.get("livePath", "/"))

    cfg = json.load(open(os.path.join(HERE, p["map"]), encoding="utf-8"))
    mapping, ignore = cfg["map"], cfg.get("ignore", {})

    entries = json.load(open(os.path.join(HERE, p["measure"]), encoding="utf-8"))
    steps = [e for e in entries if e.get("action")]
    props_by_sel = {t["sel"]: t["props"] for t in entries if not t.get("action")}

    bpath = os.path.join(BASELINE_DIR, p["baseline"].format(v=viewport))
    if not os.path.exists(bpath):
        sys.exit(f"missing baseline {bpath} — capture it first (see init-page.py)")
    # A baseline is captured by redirecting measure.mjs stdout into this file, so a
    # failed capture leaves a 0-byte file behind rather than no file. Say that plainly
    # instead of dying on a JSON traceback.
    if os.path.getsize(bpath) == 0:
        sys.exit(
            f"baseline {bpath} is EMPTY — the capture run failed and the shell redirect\n"
            f"still created the file. Re-run the measure.mjs command WITHOUT redirecting\n"
            f"stderr, fix what it reports, then capture again."
        )
    try:
        baseline = {r["sel"]: r for r in json.load(open(bpath, encoding="utf-8"))}
    except json.JSONDecodeError as e:
        sys.exit(f"baseline {bpath} is not valid JSON ({e}) — re-capture it.")

    return url, mapping, ignore, props_by_sel, steps, baseline


NUM = re.compile(r"^-?[\d.]+px$")


def first_family(stack):
    return stack.split(",")[0].strip().strip("\"'").lower()


def compare_prop(prop, want, got):
    """None when within tolerance, else a short reason string."""
    if want == got:
        return None
    # Only the first family in the stack actually renders; the fallbacks after it
    # are allowed to differ from the design's.
    if prop == "fontFamily":
        return None if first_family(want) == first_family(got) else "family differs"
    if NUM.match(want or "") and NUM.match(got or ""):
        delta = float(got[:-2]) - float(want[:-2])
        tol = TYPO_TOL if prop in TYPO_PROPS else LENGTH_TOL
        if abs(delta) <= tol:
            return None
        return f"delta {delta:+.2f}px"
    return "differs"


def run(page, viewport, url_override=None, quiet=False):
    url, mapping, ignore, props_by_sel, steps, baseline = resolve(page, viewport, url_override)

    # Ask the live page for the same properties, under the mapped selectors.
    targets, back = [], {}
    for step in steps:
        live_step = dict(step)
        live_step["sel"] = mapping.get(step["sel"], step["sel"])
        targets.append(live_step)
    for design_sel, live_sel in mapping.items():
        if design_sel not in props_by_sel or design_sel not in baseline:
            continue
        targets.append({"sel": live_sel, "props": props_by_sel[design_sel]})
        back[live_sel] = design_sel

    tmp = os.path.join(HERE, f".compare-targets-{page}-{viewport}.json")
    with open(tmp, "w", encoding="utf-8") as fh:
        json.dump(targets, fh, indent=1)
    try:
        out = subprocess.run(
            ["node", os.path.join(HERE, "measure.mjs"), url, tmp, viewport],
            capture_output=True, text=True, cwd=ROOT,
        )
        if out.returncode != 0:
            print(f"\n=== {page} · {viewport} · {url} ===")
            print("MEASURE FAILED — the page could not be read at all. This is a gate")
            print("failure, not a pass. Last output from measure.mjs:\n")
            print(out.stderr.strip()[-1200:])
            return None
        live = {r["sel"]: r for r in json.loads(out.stdout)}
    finally:
        os.remove(tmp)

    rows, missing, checked = [], [], 0
    for live_sel, design_sel in back.items():
        l, b = live.get(live_sel), baseline[design_sel]
        if not l or l.get("MISSING"):
            missing.append((design_sel, live_sel))
            continue
        for prop in props_by_sel[design_sel]:
            if prop in ignore.get(design_sel, []):
                continue
            want, got = b.get(prop), l.get(prop)
            if want is None or got is None:
                continue
            checked += 1
            why = compare_prop(prop, want, got)
            if why:
                rows.append((design_sel, prop, want, got, why))

    print(f"\n=== {page} · {viewport} · {url} ===")
    print(f"{checked} properties compared, {len(rows)} out of tolerance")

    if missing:
        print("\nNOT FOUND on the live page (a MISSING selector silently drops from the")
        print("comparison, so it inflates the pass rate — fix these before trusting the number):")
        for d, l in missing:
            print(f"  {d:38} -> {l}")

    if rows:
        print()
        print(f"{'DESIGN SELECTOR':38} {'PROPERTY':16} {'DESIGN':26} {'LIVE':26} WHY")
        print("-" * 132)
        last = None
        for sel, prop, want, got, why in rows:
            print(f"{sel if sel != last else '':38} {prop:16} {want[:25]:26} {got[:25]:26} {why}")
            last = sel
    elif not missing:
        print("No deviations.")

    # Box sizes are informational: they depend on content length, which differs between
    # the design's mock copy and the store's real data. Never gate on these.
    if not quiet:
        print("\nBox sizes (design -> live), informational:")
        for live_sel, design_sel in back.items():
            l = live.get(live_sel)
            if l and not l.get("MISSING"):
                print(f"  {design_sel:38} {baseline[design_sel]['box']:>14}  ->  {l['box']}")

    return len(rows) + len(missing)


def main(argv):
    url_override = None
    if "--url" in argv:
        i = argv.index("--url")
        url_override = argv[i + 1]
        argv = argv[:i] + argv[i + 2:]

    if "--all" in argv:
        viewports = CFG.get("viewports", ["desktop", "mobile"])
        total, broken, failed = 0, 0, []
        for page in PAGES:
            for vp in viewports:
                n = run(page, vp, quiet=True)
                if n is None:
                    broken += 1
                    failed.append(f"{page}/{vp} — MEASURE FAILED (not measured, not a pass)")
                    continue
                total += n
                if n:
                    failed.append(f"{page}/{vp}: {n} deviation(s)")
        print("\n" + "=" * 64)
        runs = len(PAGES) * len(viewports)
        print(f"REGRESSION GATE: {runs - broken}/{runs} run(s) measured, "
              f"{total} deviation(s), {broken} unmeasured")
        for f in failed:
            print(f"  ✗ {f}")
        if not failed:
            print("  ✓ all pages clean")
        # An unmeasured run is a red gate, never a green one.
        return total + broken

    page = argv[0] if argv else next(iter(PAGES))
    viewport = argv[1] if len(argv) > 1 else "desktop"
    n = run(page, viewport, url_override)
    return 1 if n is None else n


if __name__ == "__main__":
    sys.exit(min(main(sys.argv[1:]), 250))
