/**
 * Dump computed styles for a list of selectors — the numeric ground truth for pixel-perfect work.
 *
 * Usage:
 *   node scripts/measure.mjs <url> [selectors-file.json] [viewport]
 *
 *   node scripts/measure.mjs http://127.0.0.1:8080/index.html scripts/measure-homepage.json desktop
 *   node scripts/measure.mjs http://127.0.0.1:9292 scripts/measure-homepage.json desktop
 *
 * The selectors file is  [{ "sel": ".hero", "props": ["height","paddingTop"] }, ... ]
 *
 * A selector may pierce a shadow root with `>>>`, which is how Prestige's drawers, modals
 * and popovers have to be reached — their visual panel is a ::part() inside shadow DOM:
 *   ".facets-drawer >>> [part='content']" 
 *
 * An entry may instead be a step that is performed before anything is measured — used to
 * open a drawer or a disclosure so its contents have a real box:
 *   { "action": "click", "sel": ".filter-sort-btn" }
 *   { "action": "wait",  "ms": 500 }
 * Steps run in file order and produce no output row.
 * Viewport: desktop (1920) | tablet (768) | mobile (390)
 * Output: JSON on stdout — diff two runs to see every deviation at once.
 */

import { chromium } from 'playwright';
import { readFileSync } from 'fs';

const [url, selectorsFile, viewport = 'desktop'] = process.argv.slice(2);

if (!url || !selectorsFile) {
  console.error('Usage: node scripts/measure.mjs <url> <selectors-file.json> [desktop|tablet|mobile]');
  process.exit(1);
}

const VIEWPORTS = {
  desktop: { width: 1920, height: 1080 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 390, height: 844 },
};

const entries = JSON.parse(readFileSync(selectorsFile, 'utf8'));
const steps = entries.filter((e) => e.action);
const targets = entries.filter((e) => !e.action);

// CHROME_PATH lets a project point at a system Chrome; unset falls back to
// Playwright's bundled Chromium, which is what a fresh `npx playwright install` gives.
const launch = () => chromium.launch({
  ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}),
  args: ['--force-device-scale-factor=1', '--no-sandbox'],
});

const browser = await launch().catch((e) => {
  console.error(
    `Could not start a browser: ${e.message}\n` +
      (process.env.CHROME_PATH
        ? `CHROME_PATH points at ${process.env.CHROME_PATH} — check that it exists.`
        : 'Run `npx playwright install chromium`, or point CHROME_PATH at a system Chrome:\n' +
          '  export CHROME_PATH=/usr/bin/google-chrome-stable')
  );
  process.exit(2);
});
const context = await browser.newContext({
  viewport: VIEWPORTS[viewport] ?? VIEWPORTS.desktop,
  deviceScaleFactor: 1,
});
const page = await context.newPage();
await page.goto(url, { waitUntil: 'load', timeout: 30000 }).catch(async (e) => {
  // A dev server that is not running is the single most common cause. Say so plainly
  // instead of dumping a Playwright stack trace into the gate output.
  console.error(`Could not load ${url}\n${e.message.split('\n')[0]}`);
  await browser.close();
  process.exit(3);
});
await page.waitForTimeout(1500);

// Run the pre-measure steps (open drawers, expand disclosures) in file order.
for (const step of steps) {
  if (step.action === 'wait') {
    await page.waitForTimeout(step.ms ?? 300);
  } else if (step.action === 'click') {
    const el = page.locator(step.sel.split('>>>').map((x) => x.trim()).join(' >> ')).first();
    if ((await el.count()) === 0) {
      console.error(`step: click ${step.sel} -> no match, skipped`);
      continue;
    }
    await el.click({ force: true, timeout: 5000 }).catch((e) => console.error(`step: click ${step.sel} -> ${e.message}`));
    await page.waitForTimeout(step.ms ?? 400);
  }
}

// Park the pointer away from the page so no :hover state leaks into the measurement.
await page.mouse.move(0, 0);
await page.waitForTimeout(200);

const result = await page.evaluate((targets) => {
  // `a >>> b` walks into a's shadow root before matching b, repeatedly.
  const find = (sel) =>
    sel.split('>>>').reduce((root, part) => {
      if (!root) return null;
      const scope = root.shadowRoot ?? root;
      return scope.querySelector(part.trim());
    }, document);

  return targets.map(({ sel, props }) => {
    const el = find(sel);
    if (!el) return { sel, MISSING: true };
    const cs = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    const out = { sel, box: `${Math.round(rect.width)}x${Math.round(rect.height)}` };
    props.forEach((p) => (out[p] = cs[p]));
    return out;
  });
}, targets);

console.log(JSON.stringify(result, null, 1));

await context.close();
await browser.close();
