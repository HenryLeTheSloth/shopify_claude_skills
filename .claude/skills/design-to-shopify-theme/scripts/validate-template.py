#!/usr/bin/env python3
"""Validate a Shopify JSON template against the REAL schemas of its sections/blocks.

Catches what `theme check` does not: a setting id that does not exist, a range out of
bounds OR off-step (Shopify rejects the WHOLE FILE for this one), a select outside its
option set, an invalid block type, more blocks than max_blocks, a section not enabled_on
the template it is used on, and block_order out of sync with blocks.

    python3 scripts/validate-template.py templates/index.json index
    python3 scripts/validate-template.py templates/product.json product
"""
import json, re, os, sys

def schema_of(path):
    s = open(path, encoding='utf-8').read()
    m = re.search(r'{%\s*schema\s*%}(.*?){%\s*endschema\s*%}', s, re.S)
    return json.loads(m.group(1)) if m else None

def by_id(settings):
    return {x['id']: x for x in settings if x.get('id')}

def main(tpl_path, template_kind):
    errs, checked = [], 0
    tpl = json.load(open(tpl_path, encoding='utf-8'))

    def check(where, defs, values):
        nonlocal checked
        for k, v in values.items():
            checked += 1
            d = defs.get(k)
            if d is None:
                errs.append(f"{where}: setting '{k}' does not exist in the schema"); continue
            t = d['type']
            if t == 'range':
                if not isinstance(v, (int, float)):
                    errs.append(f"{where}.{k}: range wants a number, got {v!r}")
                elif not (d['min'] <= v <= d['max']):
                    errs.append(f"{where}.{k}: {v} out of bounds {d['min']}..{d['max']}")
                elif (v - d['min']) % d.get('step', 1) != 0:
                    errs.append(f"{where}.{k}: {v} is off-step {d.get('step',1)} (from {d['min']}) — Shopify REJECTS the whole file")
            elif t == 'select':
                opts = [o['value'] for o in d['options']]
                if v not in opts:
                    errs.append(f"{where}.{k}: '{v}' is not one of {opts}")
            elif t == 'checkbox' and not isinstance(v, bool):
                errs.append(f"{where}.{k}: checkbox wants a bool, got {v!r}")
            elif t == 'image_picker' and v and not str(v).startswith('shopify://shop_images/'):
                errs.append(f"{where}.{k}: image must be shopify://shop_images/..., got {v!r}")

    for skey, sec in tpl['sections'].items():
        stype = sec['type']
        spath = f"sections/{stype}.liquid"
        if not os.path.exists(spath):
            errs.append(f"section '{skey}': {spath} not found"); continue
        sch = schema_of(spath)
        if sch is None:
            errs.append(f"section '{skey}': {spath} has no schema block"); continue

        check(f"{skey}({stype})", by_id(sch.get('settings', [])), sec.get('settings', {}))

        en = sch.get('enabled_on')
        if en and 'templates' in en and template_kind not in en['templates']:
            errs.append(f"section '{skey}' ({stype}) enabled_on {en['templates']} — cannot be used on template '{template_kind}'")

        allowed = {b['type'] for b in sch.get('blocks', [])} if sch.get('blocks') else set()
        blocks = sec.get('blocks', {})
        maxb = sch.get('max_blocks')
        if maxb and len(blocks) > maxb:
            errs.append(f"section '{skey}': {len(blocks)} blocks > max_blocks {maxb}")
        if set(sec.get('block_order', [])) != set(blocks):
            errs.append(f"section '{skey}': block_order out of sync with blocks")

        sec_bdefs = {b['type']: by_id(b['settings']) for b in sch.get('blocks', []) if 'settings' in b}

        def walk(prefix, bkey, blk, allowed_types, defs_map):
            bt = blk['type']
            if allowed_types and bt not in allowed_types:
                errs.append(f"{prefix}.{bkey}: block '{bt}' is not allowed (allowed: {sorted(allowed_types)})")
            if bt in defs_map:
                check(f"{prefix}.{bkey}({bt})", defs_map[bt], blk.get('settings', {}))
                return
            bpath = f"blocks/{bt}.liquid"
            if not os.path.exists(bpath):
                errs.append(f"{prefix}.{bkey}: {bpath} not found, and it is not a section-local block either"); return
            bsch = schema_of(bpath)
            check(f"{prefix}.{bkey}({bt})", by_id(bsch.get('settings', [])), blk.get('settings', {}))
            nested = {x['type'] for x in (bsch.get('blocks') or [])}
            for nk, nb in (blk.get('blocks') or {}).items():
                walk(f"{prefix}.{bkey}", nk, nb, nested, {})

        for bkey, blk in blocks.items():
            walk(skey, bkey, blk, allowed, sec_bdefs)

    if set(tpl['order']) != set(tpl['sections']):
        errs.append("order out of sync with sections")

    print(f"{tpl_path}: checked {checked} value(s) across {len(tpl['sections'])} section(s)")
    if errs:
        print(f"ERRORS: {len(errs)}")
        for e in errs:
            print("  ✗", e)
        return 1
    print("ERRORS: 0")
    return 0

if __name__ == '__main__':
    sys.exit(main(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else 'page'))
