export async function verifyTurnstile({ token, secret, hostname }, fetcher = fetch) { if (typeof token !== 'string' || token.length < 1 || token.length > 2048)
    return false; const r = await fetcher('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ secret, response: token }), signal: AbortSignal.timeout(4500) }); if (!r.ok)
    return false; const d = await r.json(); return d.success === true && d.hostname === hostname && d.action === 'enquiry'; }
