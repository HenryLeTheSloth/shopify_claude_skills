/**
 * Usage:
 *   node scripts/screenshot.mjs <url> [selector] [output-name] [viewport]
 *
 * Full page:
 *   node scripts/screenshot.mjs http://127.0.0.1:9292 "" fullpage desktop
 *   node scripts/screenshot.mjs http://127.0.0.1:9292 "" fullpage mobile
 *
 * Per-section:
 *   node scripts/screenshot.mjs http://127.0.0.1:9292 .hero hero desktop
 *
 * Viewport: desktop (1440px) | tablet (768px) | mobile (375px)
 * Output:   screenshots/<output-name>-<viewport>.png
 */

import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { join } from 'path';

const [url, selector = '', outputName = 'fullpage', viewport = 'desktop'] = process.argv.slice(2);

if (!url) {
  console.error('Usage: node scripts/screenshot.mjs <url> [selector] [output-name] [desktop|tablet|mobile]');
  process.exit(1);
}

const VIEWPORTS = {
  desktop: { width: 1920, height: 1080 },
  tablet:  { width: 768,  height: 1024 },
  mobile:  { width: 390,  height: 844 },
};

const viewportSize = VIEWPORTS[viewport] ?? VIEWPORTS.desktop;
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
  deviceScaleFactor: 1,
  viewport: viewportSize,
  userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
});
const page = await context.newPage();

console.log(`Navigating to ${url} [${viewport} ${viewportSize.width}×${viewportSize.height}]...`);
await page.goto(url, { waitUntil: 'load', timeout: 30000 });

// Scroll through entire page to trigger scroll animations & lazy images
const pageHeight = await page.evaluate(() => document.body.scrollHeight);
const step = 300;
for (let y = 0; y < pageHeight; y += step) {
  await page.evaluate((scrollY) => window.scrollTo(0, scrollY), y);
  await page.waitForTimeout(150);
}
// Make sure we hit the very bottom
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(800);
// Scroll back to top, wait for everything to settle
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(2500);

mkdirSync('screenshots', { recursive: true });
const filename = `${outputName}-${viewport}.png`;
const outputPath = join('screenshots', filename);

if (selector && selector !== '""' && selector !== "''") {
  const element = page.locator(selector).first();
  await element.waitFor({ timeout: 5000 });
  await element.screenshot({ path: outputPath });
  console.log(`Section "${selector}" → ${outputPath}`);
} else {
  await page.screenshot({ path: outputPath, fullPage: true });
  console.log(`Full page → ${outputPath}`);
}

await context.close();
await browser.close();
console.log(`Done: ${outputPath}`);
