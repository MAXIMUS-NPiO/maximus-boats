import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateInquiry, formatInquiry, inquiryMailto } from '../shared/inquiry.js';
const valid = { name: 'Alex Example', email: 'alex@example.test', topic: 'vanuatu', message: 'I would like to discuss the VANUATU project.', consent: true, website: '', locale: 'en' };
test('valid inquiry normalized', () => { const r = validateInquiry({ ...valid, name: ' Alex Example ' }); assert.equal(r.ok, true); assert.equal(r.data.name, 'Alex Example'); });
for (const [name, patch] of [['short name', { name: 'A' }], ['long name', { name: 'A'.repeat(101) }], ['name header injection', { name: 'Alex\r\nBcc: attacker' }], ['invalid email', { email: 'bad@' }], ['long email', { email: 'x'.repeat(260) + '@example.test' }], ['newline email', { email: 'a@example.test\nBcc:x@y.test' }], ['unknown topic', { topic: 'javascript:alert(1)' }], ['short message', { message: 'short' }], ['oversized message', { message: 'a'.repeat(3501) }], ['null byte', { message: 'Test message\0test' }], ['no consent', { consent: false }], ['string consent', { consent: 'true' }], ['honeypot', { website: 'bot.invalid' }], ['unknown locale', { locale: 'zz' }]])
    test(`rejects ${name}`, () => assert.equal(validateInquiry({ ...valid, ...patch }).ok, false));
for (const bad of [null, undefined, [], 42, 'bad'])
    test(`rejects non-object ${JSON.stringify(bad)}`, () => assert.equal(validateInquiry(bad).ok, false));
test('plain text remains plain text', () => assert.ok(formatInquiry({ ...valid, message: '<script>not executed</script>' }).includes('<script>not executed</script>')));
test('encoded mailto recipient', () => { const u = inquiryMailto('MaximusGroup@gmail.com', valid); assert.ok(u.startsWith('mailto:MaximusGroup@gmail.com?')); assert.ok(u.includes('subject=MAXIMUS.BOATS%20%2F%20VANUATU')); });
test('RU message labels', () => assert.ok(formatInquiry({ ...valid, locale: 'ru' }).includes('Имя:')));
