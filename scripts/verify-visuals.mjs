import assert from 'node:assert/strict';
import { mkdir, readdir, readFile, stat } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import os from 'node:os';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'E:/Developer-Storage/npm-cache/_npx/31e32ef8478fbf80/node_modules/playwright');
const origin = process.env.HANDSHAKE_TEST_ORIGIN || 'http://localhost:3142';
const output = process.env.HANDSHAKE_VISUAL_OUTPUT || path.join(os.tmpdir(), 'handshakeos-3d-verification');
const baseline = process.argv.includes('--baseline');
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_PATH || 'C:/Users/thinkpad/AppData/Local/ms-playwright/chromium-1248/chrome-win64/chrome.exe' });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
page.on('response', response => {
  if (response.url().includes('/visuals/') && response.status() !== 200) errors.push(`Asset HTTP ${response.status()}: ${response.url()}`);
});

async function inspect(route, width) {
  await page.setViewportSize({ width, height: width < 500 ? 844 : 1000 });
  await page.goto(origin + route, { waitUntil: 'networkidle' });
  await page.locator('h1').waitFor();
  const overflow = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth }));
  assert.ok(overflow.document <= overflow.viewport, `${route} overflows at ${width}px: ${JSON.stringify(overflow)}`);
  const images = await page.locator('img[data-visual]').evaluateAll(nodes => nodes.map(img => ({ src: img.getAttribute('src'), alt: img.getAttribute('alt'), loaded: img.complete && img.naturalWidth > 0 })));
  if (!baseline) {
    assert.ok(images.length >= (route === '/' || route === '/ms' ? 9 : 3), `Not enough visual placements on ${route}: ${images.length}`);
    for (const img of images) {
      assert.ok(img.loaded, `Image failed to load: ${img.src}`);
      assert.equal(img.alt, '', `Decorative image needs empty alt: ${img.src}`);
    }
  }
  await page.screenshot({ path: path.join(output, `${baseline ? 'before' : 'after'}-${route.replaceAll('/', '') || 'landing'}-${width}.png`) });
  console.log(`${baseline ? 'BASELINE' : 'PASS'} ${route} at ${width}px: ${images.length} visuals, no overflow`);
}

try {
  for (const width of [1440, 390, 320]) {
    for (const route of ['/', '/ms', '/capture', '/dashboard']) await inspect(route, width);
  }
  if (baseline) {
    console.log('BASELINE: new visual placements absent; browser screenshots recorded.');
  } else {
    const files = (await readdir('public/visuals')).filter(file => file.endsWith('.svg'));
    assert.ok(files.length >= 8, `Expected at least eight assets; got ${files.length}`);
    let total = 0;
    for (const file of files) {
      const bytes = (await stat(path.join('public/visuals', file))).size;
      assert.ok(bytes < 20_000, `${file} exceeds 20 KB`);
      total += bytes;
    }
    assert.ok(total < 100_000, `SVG collection exceeds 100 KB: ${total}`);
    const icon = await page.request.get(origin + '/icon.svg');
    assert.equal(icon.status(), 200);
    assert.match(await icon.text(), /<svg/);
    assert.equal((await page.request.get(origin + '/apple-icon.png')).status(), 200);
    await page.goto(origin + '/capture', { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: /Meeting notes/ }).click();
    await page.waitForURL('**/opportunity/**', { timeout: 70000 });
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: "Verify Sarah's reply", exact: true }).click();
    await page.getByRole('button', { name: 'Confirm: POC launched', exact: true }).click({ timeout: 70000 });
    await page.getByRole('button', { name: 'Send the rumour', exact: true }).click();
    await page.getByRole('button', { name: 'Reject it', exact: true }).click({ timeout: 70000 });
    await page.getByRole('heading', { name: 'That is a pipeline you can trust.', exact: true }).waitFor();
    console.log('PASS sample analysis, evidence confirmation, and hearsay rejection');
    for (const width of [1440, 390, 320]) {
      const route = new URL(page.url()).pathname;
      await inspect(route, width);
    }
    assert.deepEqual(errors, [], 'Browser errors');
    console.log(`PASS ${files.length} original assets, ${total} bytes total. Screenshots: ${output}`);
  }
} finally {
  await browser.close();
}
