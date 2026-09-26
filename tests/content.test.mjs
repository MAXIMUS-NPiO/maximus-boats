import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { collection, projectPage, escapeHTML, localize } from '../src/components/render.js';
const models = JSON.parse(readFileSync(new URL('../src/content/projects.json', import.meta.url)));
const manifest = JSON.parse(readFileSync(new URL('../docs/asset-manifest.json', import.meta.url)));
for (const locale of ['en', 'ru']) {
    test(`${locale} model collection`, () => { const html = collection(models, locale); for (const id of Object.keys(models))
        assert.ok(html.includes(`id="panel-${id}"`)); assert.ok(!/[★☆✦✧✩✪✫✬✭✮✯✰]/u.test(html)); assert.ok(!html.includes('NOT PROVIDED')); });
    for (const [id, m] of Object.entries(models))
        test(`${locale} ${id} page preserves model`, () => { const html = projectPage(m, id, locale); assert.ok(html.includes(`<h1>${m.name}</h1>`)); assert.ok(html.includes(escapeHTML(m[locale].note))); assert.ok(html.includes('href="#contact"')); });
}
test('every model image registered', () => { const paths = new Set(manifest.map(m => m.asset)); for (const m of Object.values(models)) {
    assert.ok(paths.has(m.image));
    if (m.extra)
        assert.ok(paths.has(m.extra));
} });
test('all media are local source assets', () => { assert.equal(manifest.length, 14); for (const m of manifest)
    assert.ok(m.asset.startsWith('/media/') && m.source_sha256); });
test('HTML escaping', () => assert.equal(escapeHTML('<script>"&\''), '&lt;script&gt;&quot;&amp;&#39;'));
test('STORM dimensions not combined', () => { const s = models.storm.en.specs; assert.equal(s[0][1], '22.0 m'); assert.equal(s[1][1], '20.0 m'); });
