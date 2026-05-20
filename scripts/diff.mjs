/**
 * Pixel-level diff giữa Figma screenshot và live screenshot.
 *
 * Usage:
 *   node scripts/diff.mjs [figma-img] [live-img] [output-diff]
 *
 * Defaults:
 *   figma → screenshots/figma-desktop.png
 *   live  → screenshots/fullpage-desktop.png
 *   diff  → screenshots/diff-desktop.png
 *
 * Output:
 *   - screenshots/diff-desktop.png  (đỏ = sai, xanh = match)
 *   - Console: % sai lệch per section (chia theo chiều cao)
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const [
  figmaPath = 'screenshots/figma-desktop.png',
  livePath  = 'screenshots/fullpage-desktop.png',
  diffPath  = 'screenshots/diff-desktop.png',
] = process.argv.slice(2);

// Load images
const figmaRaw = PNG.sync.read(readFileSync(figmaPath));
const liveRaw  = PNG.sync.read(readFileSync(livePath));

const figmaW = figmaRaw.width;
const figmaH = figmaRaw.height;
const liveW  = liveRaw.width;
const liveH  = liveRaw.height;

console.log(`Figma: ${figmaW}×${figmaH}px`);
console.log(`Live:  ${liveW}×${liveH}px`);

// Normalize both to Figma width (1920px).
// Live screenshot may be larger due to system DPI — scale it down proportionally.
// Compare only the overlapping height to avoid blank padding at the bottom.
const targetW = figmaW; // 1920
const liveScaledH = Math.round(liveH * (figmaW / liveW)); // scale live height proportionally
const targetH = Math.min(figmaH, liveScaledH); // compare only overlapping region

console.log(`Normalized to: ${targetW}×${targetH}px (live scaled: ${liveW}×${liveH} → ${targetW}×${liveScaledH})`);

function scalePNG(src, targetW, targetH) {
  const dst = new PNG({ width: targetW, height: targetH });
  const scaleX = src.width / targetW;
  const scaleY = src.height / targetH;
  for (let y = 0; y < targetH; y++) {
    for (let x = 0; x < targetW; x++) {
      const srcX = Math.min(Math.floor(x * scaleX), src.width - 1);
      const srcY = Math.min(Math.floor(y * scaleY), src.height - 1);
      const srcIdx = (srcY * src.width + srcX) * 4;
      const dstIdx = (y * targetW + x) * 4;
      dst.data[dstIdx]     = src.data[srcIdx];
      dst.data[dstIdx + 1] = src.data[srcIdx + 1];
      dst.data[dstIdx + 2] = src.data[srcIdx + 2];
      dst.data[dstIdx + 3] = src.data[srcIdx + 3];
    }
  }
  return dst;
}

const figmaScaled = scalePNG(figmaRaw, targetW, targetH);
const liveScaled  = scalePNG(liveRaw,  targetW, targetH);

// Full diff
const diff = new PNG({ width: targetW, height: targetH });
const totalPixels = targetW * targetH;

const diffPixels = pixelmatch(
  figmaScaled.data,
  liveScaled.data,
  diff.data,
  targetW,
  targetH,
  {
    threshold: 0.1,       // 0 = exact, 1 = anything matches
    alpha: 0.3,
    diffColor: [255, 50, 50],    // red = different
    aaColor: [255, 200, 0],      // yellow = anti-alias
    diffColorAlt: [0, 200, 100], // green = matched
  }
);

mkdirSync('screenshots', { recursive: true });
writeFileSync(diffPath, PNG.sync.write(diff));

const pct = ((diffPixels / totalPixels) * 100).toFixed(2);
console.log(`\nOverall diff: ${diffPixels.toLocaleString()} / ${totalPixels.toLocaleString()} pixels (${pct}%)`);

// Section-by-section breakdown (divide height into equal sections)
const SECTIONS = [
  { name: 'Header / Nav',           from: 0.00, to: 0.06 },
  { name: 'Hero Banner',            from: 0.06, to: 0.22 },
  { name: 'Feature Strip',          from: 0.22, to: 0.34 },
  { name: 'New GraphiX',            from: 0.34, to: 0.52 },
  { name: 'Popular GraphiX',        from: 0.52, to: 0.66 },
  { name: 'Middle / XTM',           from: 0.66, to: 0.76 },
  { name: 'Tank / Color Options',   from: 0.76, to: 0.86 },
  { name: 'Custom & Stickers',      from: 0.86, to: 0.94 },
  { name: 'Footer',                 from: 0.94, to: 1.00 },
];

console.log('\n--- Section breakdown ---');

for (const section of SECTIONS) {
  const y0 = Math.floor(section.from * targetH);
  const y1 = Math.floor(section.to   * targetH);
  let sectionDiff = 0;
  const sectionPixels = (y1 - y0) * targetW;

  for (let y = y0; y < y1; y++) {
    for (let x = 0; x < targetW; x++) {
      const idx = (y * targetW + x) * 4;
      // diff image: red pixels (R>200, G<100) = different
      if (diff.data[idx] > 200 && diff.data[idx + 1] < 100) {
        sectionDiff++;
      }
    }
  }

  const sectionPct = ((sectionDiff / sectionPixels) * 100).toFixed(1);
  const status = sectionPct > 10 ? '❌' : sectionPct > 3 ? '⚠️ ' : '✅';
  console.log(`${status} ${section.name.padEnd(24)} ${sectionPct.padStart(5)}% diff`);
}

console.log(`\nDiff image saved: ${diffPath}`);
console.log('Legend: Red = different | Yellow = anti-alias | Dark = match');
