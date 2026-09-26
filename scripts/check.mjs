import { readFile, readdir } from 'node:fs/promises';
import { resolve, join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
let count = 0;
async function walk(dir) { for (const e of await readdir(dir, { withFileTypes: true })) {
    if (['node_modules', 'dist', '.git', 'artifacts', '__pycache__'].includes(e.name))
        continue;
    const path = join(dir, e.name);
    if (e.isDirectory())
        await walk(path);
    else if (['.js', '.mjs'].includes(extname(path))) {
        const r = spawnSync(process.execPath, ['--check', path], { encoding: 'utf8' });
        if (r.status)
            throw new Error(r.stderr);
        count++;
    }
    else if (path.includes('/src/') && ['.html', '.css'].includes(extname(path))) {
        const text = await readFile(path, 'utf8');
        if (/[★☆✦✧✩✪✫✬✭✮✯✰]/u.test(text))
            throw new Error('Decorative star ' + path);
    }
} }
await walk(root);
console.log(`Checked ${count} JavaScript modules; no decorative stars.`);
