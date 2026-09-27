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
    const origin = /^https:\/\/[a-z0-9.-]+(?::\d+)?\/?$/i.test(process.env.SITE_URL || '') ? process.env.SITE_URL.replace(/\/$/, '') : site.url;
    // Public release policy: production is discoverable; every Vercel Preview stays noindex.
    const indexable = process.env.VERCEL_ENV !== 'preview' && (process.env.VERCEL_ENV === 'production' || process.env.PUBLIC_INDEXABLE === 'true');
    for (const locale of ['en', 'ru']) {
        const values = { ...site, locale, otherLocale: locale === 'en' ? 'ru' : 'en', otherLocaleUpper: locale === 'en' ? 'RU' : 'EN' };
        const part = async (name) => localize(await readFile(join(root, 'src/components', name + '.html'), 'utf8'), locale, values);
        const header = await part('header'), footer = await part('footer'), dialogs = await part('dialogs');
        const output = async (path, title, main, description, socialImage = '/media/storm-render.35ef3483e6.webp') => {
            const otherLocale = locale === 'en' ? 'ru' : 'en';
            const counterpart = path.replace(`/${locale}/`, `/${otherLocale}/`);
            const routeHeader = header.replace(`id="languageToggle" href="/${otherLocale}/"`, `id="languageToggle" href="${counterpart}"`);
            let body = `<a class="skip-link" href="#main">${locale === 'ru' ? 'К содержанию' : 'Skip to content'}</a>` + routeHeader + `<main id="main">${main}</main>` + footer + dialogs;
            body = body.replace(/<button\b([^>]*data-project="([^"]+)"[^>]*)>([\s\S]*?)<\/button>/g, (_, attrs, id, inner) => `<a ${attrs.replace(/type="[^"]*"/g, '')} href="/${locale}/projects/${id}/">${inner}</a>`);
            body = body.replace(/href="#([a-zA-Z0-9_-]+)"/g, (match, id) => body.includes(`id="${id}"`) ? match : `href="/${locale}/#${id}"`);
            const fullTitle = escapeHTML(title + ' | MAXIMUS.BOATS');
            const summary = escapeHTML(description || (locale === 'ru' ? 'Яхты MAXIMUS: проектирование, постройка, рефит и партнёрство по проекту верфи в ОАЭ.' : 'MAXIMUS yachts: design, construction, refit and shipyard project partnerships in the UAE.'));
            const doc = `<!doctype html><html lang="${locale}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#031e25"><meta name="robots" content="${indexable ? 'index,follow' : 'noindex,nofollow'}"><title>${fullTitle}</title><meta name="description" content="${summary}"><link rel="canonical" href="${origin}${path}"><link rel="alternate" hreflang="${locale}" href="${origin}${path}"><link rel="alternate" hreflang="${otherLocale}" href="${origin}${counterpart}"><meta property="og:type" content="website"><meta property="og:title" content="${fullTitle}"><meta property="og:description" content="${summary}"><meta property="og:url" content="${origin}${path}"><meta property="og:image" content="${origin}${socialImage}"><meta property="og:site_name" content="MAXIMUS.BOATS"><meta property="og:locale" content="${locale === 'ru' ? 'ru_RU' : 'en_GB'}"><meta name="twitter:card" content="summary_large_image"><link rel="stylesheet" href="${cssPath}"><script type="module" src="/assets/client/main.js"></script></head><body>${body}</body></html>`;
            const f = join(dist, path, 'index.html');
            await mkdir(resolve(f, '..'), { recursive: true });
            await writeFile(f, doc);
            routes.push(path);
            return doc;
        };
        let home = await part('hero') + collection(models, locale);
        for (const name of ['shipyard', 'vanuatu', 'services', 'engineering', 'interiors', 'process', 'club', 'questions', 'contact'])
            home += await part(name);
        const homeDoc = await output(`/${locale}/`, locale === 'ru' ? 'Яхты на заказ и партнёрство в судостроении' : 'Custom yachts & shipyard partnerships', home);
        if (locale === 'en')
            await writeFile(join(dist, 'index.html'), homeDoc);
        for (const [id, model] of Object.entries(models))
            await output(`/${locale}/projects/${id}/`, model.name, projectPage(model, id, locale) + await part('contact'), model[locale].description, model.image);
        const partnerContact = (await part('contact')).replace('value="Shipyard project"', 'selected value="Shipyard project"').replace(locale === 'ru' ? '>Ваша яхта.</span>' : '>Your yacht.</span>', locale === 'ru' ? '>Ваше партнёрство.</span>' : '>Your partnership.</span>');
        await output(`/${locale}/partnerships/`, locale === 'ru' ? 'Инвесторам и партнёрам — проект верфи в ОАЭ' : 'Investors & partners — UAE shipyard project', await part('partnerships') + await part('club') + partnerContact, locale === 'ru' ? 'Проект верфи MAXIMUS YACHTS в Рас-эль-Хайме: архитектурная концепция, портфель яхт и направления промышленного и инвестиционного партнёрства.' : 'The MAXIMUS YACHTS shipyard project in Ras Al Khaimah: architecture, yacht portfolio and directions for industrial and capital partnerships.', '/media/shipyard-exterior.9b83af95a4.webp');
        await output(`/${locale}/privacy/`, locale === 'ru' ? 'Конфиденциальность' : 'Privacy', localize(privacy(locale), locale, values), locale === 'ru' ? 'Обработка запросов и контактных данных на MAXIMUS.BOATS.' : 'How MAXIMUS.BOATS handles enquiries and contact information.');
    }
    await writeFile(join(dist, '404.html'), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Not found | MAXIMUS.BOATS</title><link rel="stylesheet" href="${cssPath}"></head><body><main class="section container"><h1>Page not found.</h1><a href="/en/">English</a> / <a href="/ru/">Русский</a></main></body></html>`);
    await writeFile(join(dist, 'robots.txt'), indexable ? `User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${origin}/sitemap.xml\n` : 'User-agent: *\nDisallow: /\n');
    if (indexable)
        await writeFile(join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map(r => `<url><loc>${origin}${r}</loc></url>`).join('')}</urlset>`);
    await writeFile(join(root, 'docs/build-report.json'), JSON.stringify({ version: site.version, routes, indexable, canonical: origin, images: 13, videos: 1, runtimeDependencies: 0 }, null, 2));
    console.log(`Built ${routes.length} locale-specific pages + root + 404.`);
    return { dist, routes };
}
if (process.argv[1] === fileURLToPath(import.meta.url))
    await build();
