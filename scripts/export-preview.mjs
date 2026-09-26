/** Self-contained viewing artifact; production deployment uses the source project. */
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(fileURLToPath(new URL('..', import.meta.url))), dist = join(root, 'dist');
const report = JSON.parse(await readFile(join(root, 'docs/build-report.json'), 'utf8'));
const pages = {};
for (const route of report.routes)
    pages[route] = await readFile(join(dist, route, 'index.html'), 'utf8');
const cssPath = pages['/en/'].match(/<link rel="stylesheet" href="([^"]+)">/)[1], css = await readFile(join(dist, cssPath), 'utf8'), assets = {};
for (const name of await readdir(join(root, 'public/media'))) {
    const content = await readFile(join(root, 'public/media', name));
    assets['/media/' + name] = `data:${name.endsWith('.mp4') ? 'video/mp4' : 'image/webp'};base64,${content.toString('base64')}`;
}
const modules = ['shared/inquiry.js', 'src/client/modules/navigation.js', 'src/client/modules/tabs.js', 'src/client/modules/dialogs.js', 'src/client/modules/enquiry.js', 'src/client/main.js'];
const client = (await Promise.all(modules.map(file => readFile(join(root, file), 'utf8')))).map(text => text.replace(/^import .+?;\s*/gm, '').replace(/\bexport /g, '')).join('\n');
const encode = data => JSON.stringify(data).replace(/</g, '\\u003c');
const code = `
const pages=${encode(pages)},media=${encode(assets)},css=${encode(css)},client=${encode(client)};const frame=document.getElementById('preview-frame');
function show(route,hash=''){
 let html=pages[route]||pages['/ru/'];html=html.replace(/<link rel="stylesheet" href="[^\"]+">/,'<style>'+css+'</style>').replace(/<script type="module" src="[^\"]+"><\\/script>/,'');for(const [path,data] of Object.entries(media))html=html.split(path).join(data);
 const bridge=\`\n document.addEventListener('click',event=>{const link=event.target.closest('a');if(!link)return;const href=link.getAttribute('href')||'';if(href.startsWith('#')){event.preventDefault();document.getElementById(href.slice(1))?.scrollIntoView();return;}if(href.startsWith('/')){event.preventDefault();const u=new URL(href,'https://preview.invalid');parent.postMessage({type:'maximus-route',route:u.pathname,hash:u.hash},'*');}});\n\`;
 const scroll=hash?'\\ndocument.getElementById('+JSON.stringify(hash.slice(1))+')?.scrollIntoView({behavior:"instant"});':'';
 frame.srcdoc=html.replace('</body>','<scr'+'ipt type="module">'+client+bridge+scroll+'</scr'+'ipt></body>');
}
window.addEventListener('message',event=>{if(event.source!==frame.contentWindow||event.data?.type!=='maximus-route')return;const{route,hash}=event.data;if(typeof route!=='string'||!Object.hasOwn(pages,route))return;show(route,typeof hash==='string'&&/^#[a-z0-9-]{1,80}$/i.test(hash)?hash:'');});show('/ru/');`;
const html = `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>MAXIMUS.BOATS / preview v2</title><style>html,body{margin:0;height:100%;background:#08090a}iframe{display:block;width:100%;height:100dvh;border:0}</style></head><body><iframe id="preview-frame" title="MAXIMUS.BOATS"></iframe><script>${code}</script></body></html>`;
const output = process.argv[2] ? resolve(process.argv[2]) : join(root, 'artifacts/MAXIMUS_BOATS_PREVIEW.html');
await mkdir(resolve(output, '..'), { recursive: true });
await writeFile(output, html);
console.log(output);
