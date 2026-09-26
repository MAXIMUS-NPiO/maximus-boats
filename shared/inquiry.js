export const topicIds = Object.freeze(['vanuatu', 'storm', 'family', 'hunter', 'refit', 'shipyard', 'other']);
/** The server repeats validation; browser validation is not a trust boundary. */
export function validateInquiry(input) {
    const errors = {};
    if (!input || typeof input !== 'object' || Array.isArray(input))
        return { ok: false, errors: { form: 'invalid' } };
    const get = key => typeof input[key] === 'string' ? input[key].trim() : '';
    const name = get('name'), email = get('email'), topic = get('topic'), message = get('message'), website = get('website');
    if (name.length < 2 || name.length > 100 || /[\r\n\x00-\x1f]/.test(name))
        errors.name = 'invalid';
    if (email.length > 254 || !/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(email) || /[\r\n]/.test(email))
        errors.email = 'invalid';
    if (!topicIds.includes(topic))
        errors.topic = 'invalid';
    if (message.length < 10 || message.length > 3500 || /\x00/.test(message))
        errors.message = 'invalid';
    if (input.consent !== true)
        errors.consent = 'required';
    if (website)
        errors.website = 'invalid';
    if (!['en', 'ru'].includes(input.locale))
        errors.locale = 'invalid';
    return Object.keys(errors).length ? { ok: false, errors } : { ok: true, data: { name, email, topic, message, consent: true, website: '', locale: input.locale } };
}
export function formatInquiry(d) { return ['MAXIMUS.BOATS / ' + d.topic.toUpperCase(), '', (d.locale === 'ru' ? 'Имя' : 'Name') + ': ' + d.name, 'Email: ' + d.email, '', d.message, '', d.locale === 'ru' ? 'Согласие на обработку запроса подтверждено.' : 'Consent to handle this enquiry was confirmed.'].join('\n'); }
export function inquiryMailto(email, d) { return `mailto:${email}?subject=${encodeURIComponent('MAXIMUS.BOATS / ' + d.topic.toUpperCase())}&body=${encodeURIComponent(formatInquiry(d))}`; }
