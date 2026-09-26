import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from './build.mjs';
import { handleContact } from '../server/contact-handler.js';
const root = resolve(fileURLToPath(new URL('..', import.meta.url))), dist = join(root, 'dist');
if (!process.argv.includes('--no-build'))
    await build();
const config = JSON.parse(await readFile(join(root, 'vercel.json'), 'utf8'));
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.webp': 'image/webp', '.mp4': 'video/mp4', '.txt': 'text/plain', '.xml': 'application/xml' };
const port = Number(process.env.PORT || 3000);
createServer(async (req, res) => {
    try {
        const url = new URL(req.url, `http://localhost:${port}`);
        if (url.pathname === '/api/contact') {
            let count = 0;
            const chunks = [];
            for await (const chunk of req) {
                count += chunk.length;
                if (count > 20000) {
                    res.writeHead(413);
                    res.end();
                    return;
                }
                chunks.push(chunk);
            }
            const init = { method: req.method, headers: req.headers };
            if (!['GET', 'HEAD'].includes(req.method))
                init.body = Buffer.concat(chunks);
            const result = await handleContact(new Request(url, init));
            res.writeHead(result.status, Object.fromEntries(result.headers));
            res.end(Buffer.from(await result.arrayBuffer()));
            return;
        }
        if (!['GET', 'HEAD'].includes(req.method)) {
            res.writeHead(405);
            res.end();
            return;
        }
        let file = resolve(dist, '.' + decodeURIComponent(url.pathname));
        if (file !== dist && !file.startsWith(dist + sep)) {
            res.writeHead(403);
            res.end();
            return;
        }
        let code = 200;
        try {
            if ((await stat(file)).isDirectory())
                file = join(file, 'index.html');
            await stat(file);
        }
        catch {
            file = join(dist, '404.html');
            code = 404;
        }
        const bytes = await readFile(file), headers = { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' };
        for (const h of config.headers[0].headers)
            headers[h.key] = h.value;
        if (extname(file) === '.mp4' && req.headers.range) {
            const m = /^bytes=(\d+)-(\d*)$/.exec(req.headers.range);
            if (!m) {
                res.writeHead(416);
                res.end();
                return;
            }
            const start = +m[1], end = Math.min(m[2] ? +m[2] : bytes.length - 1, bytes.length - 1);
            if (start > end || start >= bytes.length) {
                res.writeHead(416);
                res.end();
                return;
            }
            res.writeHead(206, { ...headers, 'Content-Range': `bytes ${start}-${end}/${bytes.length}`, 'Accept-Ranges': 'bytes', 'Content-Length': end - start + 1 });
            res.end(bytes.subarray(start, end + 1));
            return;
        }
        res.writeHead(code, { ...headers, 'Content-Length': bytes.length });
        res.end(req.method === 'HEAD' ? undefined : bytes);
    }
    catch {
        res.writeHead(500);
        res.end('Internal error');
    }
}).listen(port, '127.0.0.1', () => console.log(`MAXIMUS.BOATS http://localhost:${port}/ru/ | /en/`));
