import assert from 'node:assert/strict';
import { mkdir, stat } from 'node:fs/promises';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const origin = process.env.HANDSHAKE_TEST_ORIGIN || 'http://127.0.0.1:3165';
const output = path.join(os.tmpdir(), 'handshakeos-blender-verification');
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}) });
const errors = [];

async function openPage(options = {}) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, ...options });
  page.on('pageerror', error => errors.push(error.message));
  return page;
}

async function checkPoster(page) {
  const poster = page.locator('.hero__animation-poster');
  assert.equal(await poster.count(), 1, 'Blender hero poster must exist');
  await poster.evaluate(img => img.decode());
  assert.ok(await poster.isVisible(), 'The poster must remain visible without playback');
}

try {
  const reduced = await openPage({ reducedMotion: 'reduce' });
  const reducedMedia = [];
  reduced.on('request', request => {
    if (request.url().includes('handshake-hero.mp4')) reducedMedia.push(request.url());
  });
  await reduced.goto(origin, { waitUntil: 'networkidle' });
  await checkPoster(reduced);
  assert.equal(await reduced.locator('.hero__copy').evaluate(el => getComputedStyle(el).opacity), '1', 'Reduced motion must keep the heading and CTA readable');
  assert.deepEqual(reducedMedia, [], 'Reduced motion must not download the animation');
  assert.equal(await reduced.locator('.hero__animation video').evaluate(video => video.paused), true);
  console.log('PASS reduced motion: visible poster, no video download');
  await reduced.close();

  const saver = await openPage();
  const saverMedia = [];
  await saver.addInitScript(() => Object.defineProperty(navigator, 'connection', { value: { saveData: true }, configurable: true }));
  saver.on('request', request => { if (request.url().includes('handshake-hero.mp4')) saverMedia.push(request.url()); });
  await saver.goto(origin, { waitUntil: 'networkidle' });
  await checkPoster(saver);
  assert.deepEqual(saverMedia, [], 'Data-saving visitors must not download the animation');
  await saver.close();
  console.log('PASS data saving: no video download');

  const page = await openPage({ reducedMotion: 'no-preference' });
  for (const route of ['/', '/ms']) {
    await page.goto(origin + route, { waitUntil: 'networkidle' });
    const video = page.locator('.hero__animation video');
    await page.waitForFunction(() => {
      const v = document.querySelector('.hero__animation video');
      return v && !v.paused && v.currentTime > 0.1;
    });
    assert.ok(await video.evaluate(v => v.muted && v.loop && v.playsInline), 'Video must be a muted inline loop');
    assert.ok(await video.evaluate(v => Math.abs(v.duration - 6) < 0.05), 'The loop must last six seconds');
    assert.equal(await page.locator('.hero__net').count(), 0, 'The replaced WebGL renderer must be removed');
    const pause = route === '/' ? 'Pause animation' : 'Jeda animasi';
    const play = route === '/' ? 'Play animation' : 'Mainkan animasi';
    await page.getByRole('button', { name: pause, exact: true }).click();
    assert.equal(await video.evaluate(v => v.paused), true, 'Explicit pause must stop the video');
    const pausedAt = await video.evaluate(v => v.currentTime);
    await page.waitForTimeout(250);
    assert.equal(await video.evaluate(v => v.currentTime), pausedAt, 'Explicit pause must hold the frame');
    await page.getByRole('button', { name: play, exact: true }).click();
    await page.waitForFunction(() => !document.querySelector('.hero__animation video').paused);
    await page.locator('#start').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => document.querySelector('.hero__animation video').paused);
    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForFunction(() => !document.querySelector('.hero__animation video').paused);
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { value: true, configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await page.waitForFunction(() => document.querySelector('.hero__animation video').paused);
    await page.evaluate(() => {
      delete document.hidden;
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await page.waitForFunction(() => !document.querySelector('.hero__animation video').paused);

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForFunction(() => !document.querySelector('.hero__animation video').hasAttribute('src'));
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.waitForFunction(() => !document.querySelector('.hero__animation video').paused);

    for (const [width, height] of [[1440, 1000], [1024, 768], [768, 1000], [390, 844], [320, 844], [320, 568], [390, 667]]) {
      await page.setViewportSize({ width, height });
      await page.evaluate(() => scrollTo(0, 0));
      await page.waitForTimeout(150);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
      assert.equal(overflow, false, `${route}: horizontal overflow at ${width}px`);
      const art = await page.locator('.hero__animation').boundingBox();
      const copy = await page.locator('.hero__copy').boundingBox();
      assert.ok(art && copy && art.width > 80 && art.height > 150, `Art must not collapse at ${width}x${height}`);
      if (width <= 860) assert.ok(art.y >= copy.y + copy.height - 1, `${route}: art overlaps copy at ${width}px`);
      const control = await page.locator('.hero__motion').boundingBox();
      if (control) {
        assert.ok(control.y >= art.y && control.y + control.height <= art.y + art.height, 'Motion control must stay inside the artwork');
        if (width <= 860) assert.ok(control.y >= copy.y + copy.height, 'Motion control must not cover the copy');
        if (await page.locator('.chip--a').isVisible()) {
          const chip = await page.locator('.chip--a').boundingBox();
          assert.ok(control.x + control.width <= chip.x || control.x >= chip.x + chip.width || control.y + control.height <= chip.y || control.y >= chip.y + chip.height, `Motion control overlaps quote card at ${width}x${height}`);
        }
      }
      const cta = page.locator('.hero__actions .btn--accent');
      assert.equal(await cta.getAttribute('href'), '/capture?sample=en&run=1');
      await cta.click({ trial: true });
      await page.screenshot({ path: path.join(output, `${route === '/' ? 'en' : 'ms'}-${width}x${height}.png`) });
    }
    console.log(`PASS ${route}: playback, pause/resume, live motion preference, seven viewport sizes, control placement and CTA`);
  }
  await page.close();

  const restricted = await openPage();
  await restricted.addInitScript(() => {
    const play = HTMLMediaElement.prototype.play;
    let blocked = false;
    HTMLMediaElement.prototype.play = function () {
      if (!blocked) { blocked = true; return Promise.reject(new DOMException('Autoplay blocked', 'NotAllowedError')); }
      return play.call(this);
    };
  });
  await restricted.goto(origin, { waitUntil: 'networkidle' });
  await restricted.getByRole('button', { name: 'Play animation', exact: true }).click();
  await restricted.waitForFunction(() => !document.querySelector('.hero__animation video').paused);
  console.log('PASS restricted autoplay: manual play is available');
  await restricted.close();

  const failed = await openPage();
  await failed.route('**/handshake-hero.mp4', route => route.abort());
  await failed.goto(origin, { waitUntil: 'networkidle' });
  await checkPoster(failed);
  assert.equal(await failed.locator('.hero__animation').getAttribute('data-ready'), null, 'Failed video must not hide its poster');
  console.log('PASS failed video: poster fallback');
  await failed.close();

  const staticPage = await openPage({ javaScriptEnabled: false });
  await staticPage.goto(origin, { waitUntil: 'networkidle' });
  await checkPoster(staticPage);
  assert.equal(await staticPage.locator('.hero__copy').evaluate(el => getComputedStyle(el).opacity), '1', 'No-JavaScript copy must stay readable');
  assert.ok(await staticPage.locator('.hero__actions .btn--accent').isVisible());
  console.log('PASS no JavaScript: visible poster and CTA');
  await staticPage.close();
  const movie = await stat('public/landing/handshake-hero.mp4');
  const poster = await stat('public/landing/handshake-hero.webp');
  assert.ok(movie.size < 3_000_000 && poster.size < 150_000, 'Hero assets must stay within their loading budget');
  assert.deepEqual(errors, [], 'Browser runtime errors');
  console.log(`PASS asset budget: video ${movie.size} bytes, poster ${poster.size} bytes`);
  console.log(`PASS all hero checks. Screenshots: ${output}`);
} finally {
  await browser.close();
}
