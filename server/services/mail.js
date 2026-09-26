import { createHash } from 'node:crypto';
import { formatInquiry } from '../../shared/inquiry.js';
export async function sendInquiry({ data, config, requestId }, fetcher = fetch) { const key = createHash('sha256').update(JSON.stringify({ requestId, data })).digest('hex'); const r = await fetcher('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${config.apiKey}`, 'Content-Type': 'application/json', 'Idempotency-Key': `maximus-boats/${key}` }, body: JSON.stringify({ from: config.from, to: [config.to], reply_to: data.email, subject: `MAXIMUS.BOATS / ${data.topic.toUpperCase()}`, text: formatInquiry(data) }), signal: AbortSignal.timeout(6500) }); if (!r.ok)
    throw new Error('EMAIL_PROVIDER_REJECTED'); const d = await r.json(); if (typeof d.id !== 'string' || !d.id)
    throw new Error('EMAIL_PROVIDER_INVALID_RESPONSE'); return d.id; }
