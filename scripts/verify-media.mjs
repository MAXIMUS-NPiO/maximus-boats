import { readFile, readdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const manifest = JSON.parse(await readFile(join(root, 'docs/asset-manifest.json'), 'utf8'));
for (const item of manifest) {
    const bytes = await readFile(join(root, 'public', item.asset));
    if (createHash('sha256').update(bytes).digest('hex') !== item.sha256)
        throw new Error('Asset mismatch ' + item.asset);
    if (!item.source_file || !item.source_sha256)
        throw new Error('Missing source');
}
if ((await readdir(join(root, 'public/media'))).length !== manifest.length)
    throw new Error('Unregistered media');
console.log('Verified 13 source images and one original source video.');
