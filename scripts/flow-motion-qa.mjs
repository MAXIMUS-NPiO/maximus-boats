/** Verify scroll enhancement and accessible fallbacks against the running dev server. */
import assert from 'node:assert/strict';
import { writeFile, mkdir } from 'node:fs/promises';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const origin = process.env.QA_ORIGIN || 'http://localhost:3000';
const browser = await chromium.launch({ executablePath: process.env.BROWSER_EXECUTABLE || undefined, headless: true });
const report = { result: 'FAIL', checks: [] };
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'no-preference' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(String(error)));
  await page.goto(origin + '/ru/', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const bounds = await page.locator('[data-dissolve]').evaluate(el => ({ top: el.offsetTop, range: el.offsetHeight - el.firstElementChild.offsetHeight }));
  for (const progress of [0, 0.5, 1]) {
    await page.evaluate(({ top, range, progress }) => scrollTo({ top: top + range * progress, behavior: 'instant' }), { ...bounds, progress });
    await page.waitForFunction(expected => Math.abs(Number(document.querySelector('[data-dissolve]').style.getPropertyValue('--dissolve')) - expected) < 0.02, progress);
    const opacity = await page.locator('.scene-second').evaluate(el => Number(getComputedStyle(el).opacity));
    assert.ok(Math.abs(opacity - progress) < 0.02);
  }
  await page.locator('[data-gallery-source]').click();
  await page.keyboard.press('ArrowRight');
  assert.match(await page.locator('#galleryDialog img').getAttribute('src'), /vanuatu-cabin/);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('[data-gallery-source]').evaluate(el => el === document.activeElement), true);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  assert.equal(await page.locator('.reveal-ready').count(), 0);
  assert.equal(await page.locator('.dissolve-stage').evaluate(el => getComputedStyle(el).position), 'relative');
  assert.equal(await page.locator('.scene-first').evaluate(el => getComputedStyle(el).opacity), '1');
  report.checks.push('Scroll crossfade at 0%, 50%, 100%; original gallery; Escape restores focus; reduced motion changes live');
  await context.close();
  const fallback = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const plain = await fallback.newPage();
  for (const locale of ['en', 'ru']) {
    await plain.goto(origin + '/' + locale + '/');
    assert.equal(await plain.locator('.reveal-ready').count(), 0);
    assert.equal(await plain.locator('.yacht-card').count(), 4);
    assert.equal(await plain.locator('h1').evaluate(el => getComputedStyle(el).opacity), '1');
    assert.match(await plain.locator('.scene-original').getAttribute('href'), /vanuatu-salon/);
    assert.equal(await plain.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  }
  report.checks.push('English and Russian content, links and photographs remain available without JavaScript');
  await fallback.close();
  assert.deepEqual(errors, []);
  report.result = 'PASS';
  console.log('PASS scroll crossfade, gallery focus, reduced motion and no-JavaScript fallback');
} catch (error) {
  report.error = String(error);
  throw error;
} finally {
  await mkdir('docs', { recursive: true });
  await writeFile('docs/flow-motion-qa.json', JSON.stringify(report, null, 2) + '\n');
  await browser.close();
}
