import assert from 'node:assert/strict';
import { mkdir, readdir, stat } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import os from 'node:os';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const origin = process.env.HANDSHAKE_TEST_ORIGIN || 'http://localhost:3142';
const output = process.env.HANDSHAKE_VISUAL_OUTPUT || path.join(os.tmpdir(), 'handshakeos-3d-verification');
const baseline = process.argv.includes('--baseline');
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}) });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
page.on('response', response => {
  if (response.url().includes('/visuals/') && ![200, 304].includes(response.status())) errors.push(`Asset HTTP ${response.status()}: ${response.url()}`);
});

async function inspect(route, width) {
  await page.setViewportSize({ width, height: width < 500 ? 844 : 1000 });
  await page.goto(origin + route, { waitUntil: 'networkidle' });
  await page.locator('h1').waitFor();
  if (!baseline) assert.equal(await page.getByRole('link', { name: 'HandshakeOS home', exact: true }).count(), 1, 'Logo needs an accessible name');
  await page.locator('img[data-visual]').evaluateAll(images => Promise.all(images.map(img => img.decode())));
  const overflow = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth }));
  assert.ok(overflow.document <= overflow.viewport, `${route} overflows at ${width}px: ${JSON.stringify(overflow)}`);
  const images = await page.locator('img[data-visual]').evaluateAll(nodes => nodes.map(img => ({ src: img.getAttribute('src'), alt: img.getAttribute('alt'), loaded: img.complete && img.naturalWidth > 0 })));
  if (!baseline) {
    const minimum = route === '/' || route === '/ms' ? 13 : route === '/versions' ? 2 : 3;
    assert.ok(images.length >= minimum, `Not enough visual placements on ${route}: ${images.length}`);
    for (const img of images) {
      assert.ok(img.loaded, `Image failed to load: ${img.src}`);
      assert.equal(img.alt, '', `Decorative image needs empty alt: ${img.src}`);
    }
    if (width < 860 && (route === '/' || route === '/ms')) {
      const art = await page.locator('.hero__artifact').boundingBox();
      const copy = await page.locator('.hero__copy').boundingBox();
      assert.ok(art && copy && art.y >= copy.y + copy.height - 1, `${route}: hero art overlaps copy at ${width}px`);
    }
  }
  await page.screenshot({ path: path.join(output, `${baseline ? 'before' : 'after'}-${route.replaceAll('/', '') || 'landing'}-${width}.png`) });
  console.log(`${baseline ? 'BASELINE' : 'PASS'} ${route} at ${width}px: ${images.length} visuals, no overflow`);
}

try {
  for (const width of [1440, 390, 320]) {
    for (const route of ['/', '/ms', '/capture', '/dashboard', ...(!baseline ? ['/versions'] : [])]) await inspect(route, width);
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
    assert.equal((await page.request.get(origin + '/favicon.ico')).status(), 200);
    assert.ok(await page.locator('link[rel="icon"][href*="icon.svg"]').count(), 'SVG favicon is missing from page metadata');
    assert.ok(await page.locator('link[rel="apple-touch-icon"]').count(), 'Touch icon is missing from page metadata');
    await page.goto(origin + '/capture', { waitUntil: 'networkidle' });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.getByRole('button', { name: /Meeting notes/ }).hover();
    await page.waitForTimeout(250);
    assert.notEqual(await page.locator('.visual-sample').first().evaluate(img => getComputedStyle(img).transform), 'none', 'Expected the optional hover treatment');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    assert.equal(await page.locator('.visual-sample').first().evaluate(img => getComputedStyle(img).transform), 'none', 'Reduced motion must remove the hover transform');
    console.log('PASS favicon metadata and reduced-motion behavior');
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
