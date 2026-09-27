import { readFile, writeFile, mkdir, cp, rm } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { site } from '../src/content/site.js';
import { localize, collection, projectPage, privacy, escapeHTML } from '../src/components/render.js';
const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
export async function build() {
    const dist = join(root, 'dist');
    await rm(dist, { recursive: true, force: true });
    await mkdir(join(dist, 'assets'), { recursive: true });
    await cp(join(root, 'public'), dist, { recursive: true });
    const cssOrder = JSON.parse(await readFile(join(root, 'src/styles/order.json'), 'utf8'));
    const css = (await Promise.all(cssOrder.map(x => readFile(join(root, 'src/styles', x), 'utf8')))).join('\n');
    const hash = createHash('sha256').update(css).digest('hex').slice(0, 10);
    const cssPath = `/assets/site.${hash}.css`;
    await writeFile(join(dist, cssPath), css);
    await cp(join(root, 'src/client'), join(dist, 'assets/client'), { recursive: true });
    await cp(join(root, 'shared'), join(dist, 'assets/shared'), { recursive: true });
    const models = JSON.parse(await readFile(join(root, 'src/content/projects.json'), 'utf8'));
    const routes = [];
    const origin = /^https:\/\/[a-z0-9.-]+(?::\d+)?\/?$/i.test(process.env.SITE_URL || '') ? process.env.SITE_URL.replace(/\/$/, '') : '';
    const indexable = !!origin && process.env.PUBLIC_INDEXABLE === 'true';
    for (const locale of ['en', 'ru']) {
        const values = { ...site, locale, otherLocale: locale === 'en' ? 'ru' : 'en', otherLocaleUpper: locale === 'en' ? 'RU' : 'EN' };
        const part = async (name) => localize(await readFile(join(root, 'src/components', name + '.html'), 'utf8'), locale, values);
        const header = await part('header'), footer = await part('footer'), dialogs = await part('dialogs');
        const output = async (path, title, main) => {
            const otherLocale = locale === 'en' ? 'ru' : 'en';
            const counterpart = path.replace(`/${locale}/`, `/${otherLocale}/`);
            const routeHeader = header.replace(`id="languageToggle" href="/${otherLocale}/"`, `id="languageToggle" href="${counterpart}"`);
            let body = `<a class="skip-link" href="#main">${locale === 'ru' ? 'К содержанию' : 'Skip to content'}</a>` + routeHeader + `<main id="main">${main}</main>` + footer + dialogs;
            body = body.replace(/<button\b([^>]*data-project="([^"]+)"[^>]*)>([\s\S]*?)<\/button>/g, (_, attrs, id, inner) => `<a ${attrs.replace(/type="[^"]*"/g, '')} href="/${locale}/projects/${id}/">${inner}</a>`);
            body = body.replace(/href="#([a-zA-Z0-9_-]+)"/g, (match, id) => body.includes(`id="${id}"`) ? match : `href="/${locale}/#${id}"`);
            const doc = `<!doctype html><html lang="${locale}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#031e25"><meta name="robots" content="${indexable ? 'index,follow' : 'noindex,nofollow'}"><title>${escapeHTML(title)} | MAXIMUS.BOATS</title><meta name="description" content="${locale === 'ru' ? 'Яхты, проектирование, судостроение и модернизация.' : 'Yachts, marine design, shipbuilding and refit.'}">${origin ? `<link rel="canonical" href="${origin}${path}">` : ''}<link rel="stylesheet" href="${cssPath}"><script type="module" src="/assets/client/main.js"></script></head><body>${body}</body></html>`;
            const f = join(dist, path, 'index.html');
            await mkdir(resolve(f, '..'), { recursive: true });
            await writeFile(f, doc);
            routes.push(path);
            return doc;
        };
        let home = await part('hero') + await part('disciplines') + collection(models, locale);
        for (const name of ['engineering', 'vanuatu', 'interiors', 'services', 'shipyard', 'club', 'questions', 'contact'])
            home += await part(name);
        const homeDoc = await output(`/${locale}/`, locale === 'ru' ? 'Яхты и судостроение' : 'Yachts & marine engineering', home);
        if (locale === 'en')
            await writeFile(join(dist, 'index.html'), homeDoc);
        for (const [id, model] of Object.entries(models))
            await output(`/${locale}/projects/${id}/`, model.name, projectPage(model, id, locale) + await part('contact'));
        await output(`/${locale}/privacy/`, locale === 'ru' ? 'Конфиденциальность' : 'Privacy', localize(privacy(locale), locale, values));
    }
    await writeFile(join(dist, '404.html'), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Not found | MAXIMUS.BOATS</title><link rel="stylesheet" href="${cssPath}"></head><body><main class="section container"><h1>Page not found.</h1><a href="/en/">English</a> / <a href="/ru/">Русский</a></main></body></html>`);
    await writeFile(join(dist, 'robots.txt'), indexable ? `User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${origin}/sitemap.xml\n` : 'User-agent: *\nDisallow: /\n');
    if (indexable)
        await writeFile(join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map(r => `<url><loc>${origin}${r}</loc></url>`).join('')}</urlset>`);
    await writeFile(join(root, 'docs/build-report.json'), JSON.stringify({ version: '2.0.0', routes, indexable, canonical: origin || 'NOT PROVIDED', images: 13, videos: 1, runtimeDependencies: 0 }, null, 2));
    console.log(`Built ${routes.length} locale-specific pages + root + 404.`);
    return { dist, routes };
}
if (process.argv[1] === fileURLToPath(import.meta.url))
    await build();
