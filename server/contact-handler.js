import { validateInquiry } from '../shared/inquiry.js';
import { getServerConfig, publicContactConfig } from './config.js';
import { verifyTurnstile } from './services/turnstile.js';
import { sendInquiry } from './services/mail.js';
const response = (status, body, extra = {}) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...extra } });
export async function readBoundedJson(request) { if (Number(request.headers.get('content-length') || 0) > 20000)
    throw new Error('TOO_LARGE'); const reader = request.body?.getReader(); if (!reader)
    throw new Error('INVALID_JSON'); let n = 0; const chunks = []; try {
    while (true) {
        const { done, value } = await reader.read();
        if (done)
            break;
        n += value.byteLength;
        if (n > 20000) {
            await reader.cancel();
            throw new Error('TOO_LARGE');
        }
        chunks.push(value);
    }
}
finally {
    reader.releaseLock();
} const bytes = new Uint8Array(n); let offset = 0; for (const c of chunks) {
    bytes.set(c, offset);
    offset += c.byteLength;
} try {
    return JSON.parse(new TextDecoder().decode(bytes));
}
catch {
    throw new Error('INVALID_JSON');
} }
export async function handleContact(request, { env = process.env, fetcher = fetch } = {}) {
    if (request.method === 'GET')
        return response(200, publicContactConfig(env));
    if (request.method !== 'POST')
        return response(405, { code: 'METHOD_NOT_ALLOWED' }, { Allow: 'GET, POST' });
    const config = getServerConfig(env);
    if (!config.enabled)
        return response(503, { code: 'DELIVERY_NOT_CONFIGURED' });
    const origin = request.headers.get('origin');
    if (!origin || !config.origins.includes(origin) || request.headers.get('sec-fetch-site') === 'cross-site')
        return response(403, { code: 'ORIGIN_NOT_ALLOWED' });
    if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get('content-type') || ''))
        return response(415, { code: 'JSON_REQUIRED' });
    let input;
    try {
        input = await readBoundedJson(request);
    }
    catch (e) {
        return response(e.message === 'TOO_LARGE' ? 413 : 400, { code: e.message === 'TOO_LARGE' ? 'BODY_TOO_LARGE' : 'INVALID_JSON' });
    }
    const checked = validateInquiry(input);
    if (!checked.ok)
        return response(400, { code: 'INVALID_FIELDS', fields: Object.keys(checked.errors) });
    if (typeof input.requestId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(input.requestId))
        return response(400, { code: 'INVALID_REQUEST_ID' });
    try {
        if (!await verifyTurnstile({ token: input.token, secret: config.secret, hostname: new URL(origin).hostname }, fetcher))
            return response(400, { code: 'VERIFICATION_FAILED' });
        await sendInquiry({ data: checked.data, config, requestId: input.requestId }, fetcher);
        return response(200, { code: 'ACCEPTED', requestId: input.requestId });
    }
    catch {
        return response(502, { code: 'DELIVERY_FAILED' });
    }
}
