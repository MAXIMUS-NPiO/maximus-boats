/** Browser release check. Optional Playwright tooling; never sends a real email. */
import { spawn } from 'node:child_process';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = resolve(new URL('..', import.meta.url).pathname);
const out = resolve(root, 'artifacts/arc');
await mkdir(out, { recursive: true });
const origin = 'http://127.0.0.1:3100';
const server = spawn(process.execPath, ['scripts/dev.mjs', '--no-build'], {
    cwd: root, env: { ...process.env, PORT: '3100', CONTACT_MODE: 'mailto' }, stdio: ['ignore', 'pipe', 'pipe']
});
let browser;
const report = { method: 'Real local HTTP routes and original media, headless Chromium; API forced to existing mailto mode; all non-GET and external requests blocked.', node: process.version, browser: '', pages: [], checks: [], pageErrors: [], consoleErrors: [], blockedRequests: [], screenshots: [] };
try {
    await new Promise((done, reject) => {
        const timer = setTimeout(() => reject(new Error('Dev server start timed out')), 15000);
        server.stdout.on('data', text => { if (String(text).includes('MAXIMUS.BOATS http')) { clearTimeout(timer); done(); } });
        server.once('error', reject);
        server.once('exit', code => { clearTimeout(timer); reject(new Error(`Dev server exited ${code}`)); });
    });
    browser = await chromium.launch({ executablePath: process.env.BROWSER_EXECUTABLE || undefined, headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'] });
    report.browser = browser.version();
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    await context.route('**/*', route => {
        const request = route.request();
        if (!request.url().startsWith(origin + '/') || !['GET', 'HEAD'].includes(request.method())) {
            report.blockedRequests.push({ method: request.method(), url: request.url() });
            return route.abort();
        }
        return route.continue();
    });
    const page = await context.newPage();
    page.on('pageerror', error => report.pageErrors.push(String(error)));
    page.on('console', message => { if (message.type() === 'error') report.consoleErrors.push(message.text()); });
    const loaded = async () => {
        await page.evaluate(async () => {
            await document.fonts.ready;
            const images = [...document.querySelectorAll('img[src]')];
            images.forEach(image => image.loading = 'eager');
            await Promise.all(images.map(image => image.decode()));
        });
    };
    const capture = async (name, fullPage = false) => {
        await page.evaluate(() => document.activeElement?.blur());
        await page.screenshot({ path: resolve(out, name), fullPage });
        report.screenshots.push(`artifacts/arc/${name}`);
    };
    const models = JSON.parse(await readFile(resolve(root, 'src/content/projects.json')));
    const routes = JSON.parse(await readFile(resolve(root, 'docs/build-report.json'))).routes;
    const links = new Map();
    for (const path of routes) {
        const response = await page.goto(origin + path, { waitUntil: 'networkidle' });
        assert.equal(response.status(), 200, path);
        await loaded();
        const locale = path.split('/')[1], other = locale === 'en' ? 'ru' : 'en';
        assert.equal(await page.locator('html').getAttribute('lang'), locale);
        assert.equal(await page.locator('h1').count(), 1);
        assert.equal(await page.locator('#languageToggle').getAttribute('href'), path.replace(`/${locale}/`, `/${other}/`));
        for (const href of await page.locator('a[href]').evaluateAll(anchors => anchors.map(a => a.getAttribute('href')))) {
            const url = new URL(href, origin + path);
            if (url.origin === origin) links.set(url.pathname + url.hash, url);
        }
        const routeReport = { route: path, widths: [], images: await page.locator('img[src]').count() };
        for (const width of [320, 390, 768, 1024, 1440, 1920]) {
            await page.setViewportSize({ width, height: 1000 });
            const overflow = await page.evaluate(() => ({
                document: document.documentElement.scrollWidth > innerWidth,
                elements: [...document.querySelectorAll('h1,h2,h3,p,a,button,dt,dd,input,select,textarea')].filter(e => {
                    const r = e.getBoundingClientRect();
                    return r.width > 0 && r.height > 0 && (r.right > innerWidth + 1 || r.left < -1) && !e.closest('dialog:not([open]),.hp-field') && !e.classList.contains('skip-link');
                }).map(e => ({ tag: e.tagName, class: e.className, text: e.textContent.slice(0, 100) }))
            }));
            assert.equal(overflow.document, false, `${path} ${width}: horizontal document overflow ${JSON.stringify(overflow.elements)}`);
            assert.deepEqual(overflow.elements, [], `${path} ${width}: clipped element`);
            if (path === `/${locale}/`) {
                for (const id of Object.keys(models)) {
                    assert.ok(await page.locator('#panel-' + id).isVisible());
                    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${path} ${width} card ${id}`);
                }
            }
            routeReport.widths.push(width);
        }
        await page.setViewportSize({ width: 1440, height: 1000 });
        if (path === `/${locale}/`) {
            await page.evaluate(() => scrollTo(0, 0));
            await capture(`${locale}-desktop.png`);
            assert.equal(await page.locator('.yacht-card').count(), 4);
            const partnership = page.locator('.sales-hero a[href="/' + locale + '/partnerships/"]');
            assert.ok(await partnership.isVisible());
            await page.locator('#playVideo').click();
            assert.ok(await page.locator('#videoDialog').isVisible());
            await page.locator('video').evaluate(async video => { video.muted = true; await video.play(); });
            await page.waitForFunction(() => document.querySelector('video').currentTime > 0.2);
            await page.keyboard.press('Escape');
            await page.waitForFunction(() => !document.getElementById('videoDialog').open && document.querySelector('video').paused);
            await page.locator('#interiors .image-expand').first().click();
            assert.ok(await page.locator('#galleryDialog').isVisible());
            await page.keyboard.press('ArrowRight');
            assert.match(await page.locator('#galleryDialog img').getAttribute('alt'), locale === 'ru' ? /Каюта/ : /cabin/);
            await page.keyboard.press('Escape');
            report.checks.push({ locale, visibleYachtCollection: true, investorEntry: true, sourceVideoPlaybackAndPause: true, interiorGallery: true });
        }
        if (path.includes('/projects/')) {
            const id = path.split('/')[3];
            for (const [name, value] of models[id][locale].specs) {
                assert.ok((await page.locator('.detail-layout').innerText()).includes(name));
                assert.ok((await page.locator('.detail-layout').innerText()).includes(value));
            }
            assert.equal(await page.locator('#model').inputValue(), models[id].name);
            await page.locator('.detail-main-img').click();
            assert.ok(await page.locator('#galleryDialog').isVisible());
            await page.keyboard.press('Escape');
            await page.evaluate(() => scrollTo(0, 0));
            await capture(`${locale}-${id}-desktop.png`);
        }
        if (await page.locator('#enquiryForm').count()) {
            await page.locator('#copyEnquiry').click();
            assert.equal(await page.locator('#fullName').getAttribute('aria-invalid'), 'true');
            await page.locator('#fullName').fill('Local QA');
            await page.locator('#email').fill('qa@example.test');
            await page.locator('#message').fill('Local check only: <script>window.unsafe = true</script>');
            await page.locator('[name="consent"]').check();
            await page.locator('#copyEnquiry').click();
            assert.match(await page.locator('#preparedMessage').inputValue(), /<script>/);
            assert.equal(await page.evaluate(() => window.unsafe), undefined);
            await page.locator('#enquiryForm').evaluate(form => form.reset());
            await page.locator('#preparedMessage').evaluate(el => { el.hidden = true; el.value = ''; });
            await page.locator('#formStatus').evaluate(el => el.textContent = '');
            report.checks.push({ route: path, formValidationAndCopy: true, realSubmission: false });
        }
        await page.setViewportSize({ width: 390, height: 844 });
        await page.evaluate(() => scrollTo(0, 0));
        await page.locator('#menuToggle').click();
        assert.equal(await page.locator('#menuToggle').getAttribute('aria-expanded'), 'true');
        assert.ok(await page.locator('#mobileNav').isVisible());
        await page.keyboard.press('Escape');
        assert.equal(await page.locator('#menuToggle').getAttribute('aria-expanded'), 'false');
        if (path === `/${locale}/`) {
            await capture(`${locale}-mobile.png`);
            await capture(`${locale}-mobile-full.png`, true);
            await page.setViewportSize({ width: 1440, height: 1000 });
            await page.evaluate(() => scrollTo(0, 0));
            await capture(`${locale}-desktop.png`);
            await capture(`${locale}-desktop-full.png`, true);
            for (const id of ['projects', 'engineering', 'interiors', 'contact']) {
                const name = `${locale}-${id}-section.png`;
                await page.locator('#' + id).screenshot({ path: resolve(out, name) });
                report.screenshots.push(`artifacts/arc/${name}`);
            }
        }
        // Exercise the real alternate route, then return to the next route in the loop.
        await page.locator('#languageToggle').click();
        await page.waitForURL(origin + path.replace(`/${locale}/`, `/${other}/`));
        report.pages.push(routeReport);
        console.log(`PASS ${path} · six widths · menu · language${path.includes('privacy') ? '' : ' · form'}`);
    }
    for (const [target, url] of links) {
        const response = await page.request.get(url.href);
        assert.equal(response.status(), 200, `Broken local link ${target}`);
        if (url.hash) assert.ok((await response.text()).includes(`id="${decodeURIComponent(url.hash.slice(1))}"`), `Missing anchor ${target}`);
    }
    report.internalLinksChecked = links.size;
    const api = await page.request.get(origin + '/api/contact');
    assert.equal(api.status(), 200);
    assert.deepEqual(await api.json(), { mode: 'mailto', siteKey: null });
    assert.deepEqual(report.pageErrors, []);
    assert.deepEqual(report.consoleErrors, []);
    assert.deepEqual(report.blockedRequests, [], 'QA must not attempt external delivery');
    report.result = 'PASS';
} catch (error) {
    report.result = 'FAIL';
    report.error = String(error);
    throw error;
} finally {
    await writeFile(resolve(root, 'docs/arc-browser-qa.json'), JSON.stringify(report, null, 2) + '\n');
    await browser?.close();
    server.kill('SIGTERM');
}
