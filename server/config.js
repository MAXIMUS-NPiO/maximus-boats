import { site } from '../src/content/site.js';
export const provided = v => typeof v === 'string' && v.trim() !== '' && v.trim() !== 'NOT PROVIDED';
export function canonicalOrigin(value) { if (!provided(value))
    return ''; try {
    const u = new URL(value);
    return ['https:', 'http:'].includes(u.protocol) && !u.username && !u.password ? u.origin : '';
}
catch {
    return '';
} }
export function getServerConfig(env = process.env) { const origins = (env.ALLOWED_ORIGINS || '').split(',').map(x => canonicalOrigin(x.trim())).filter(Boolean); const enabled = env.CONTACT_MODE === 'resend' && ['RESEND_API_KEY', 'CONTACT_FROM', 'TURNSTILE_SITE_KEY', 'TURNSTILE_SECRET_KEY'].every(k => provided(env[k])) && origins.length > 0; return { enabled, mode: enabled ? 'resend' : 'mailto', origins, apiKey: env.RESEND_API_KEY || '', from: env.CONTACT_FROM || '', to: site.commercialEmail, siteKey: env.TURNSTILE_SITE_KEY || '', secret: env.TURNSTILE_SECRET_KEY || '' }; }
export function publicContactConfig(env = process.env) { const c = getServerConfig(env); return { mode: c.mode, siteKey: c.enabled ? c.siteKey : null }; }
