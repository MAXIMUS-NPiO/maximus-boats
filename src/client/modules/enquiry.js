import { validateInquiry, formatInquiry, inquiryMailto } from '../../shared/inquiry.js';
export function initEnquiry() {
    const form = document.getElementById('enquiryForm');
    if (!form)
        return;
    const ru = document.documentElement.lang === 'ru', email = form.dataset.email, button = document.getElementById('prepareEmail'), status = document.getElementById('formStatus'), preview = document.getElementById('preparedMessage');
    button.disabled = false;
    const field = id => document.getElementById(id);
    let mode = 'mailto', token = '', widget = null, sending = false, requestId = '';
    const selected = document.querySelector('[data-select-model]');
    if (selected)
        field('model').value = selected.dataset.selectModel;
    const collect = () => { const model = field('model').value.toLowerCase(), interest = field('interest').value; return { name: field('fullName').value, email: field('email').value, topic: ['vanuatu', 'storm', 'family', 'hunter'].includes(model) ? model : interest.includes('Refit') ? 'refit' : interest.includes('Shipyard') ? 'shipyard' : 'other', message: field('message').value, consent: form.elements.consent.checked, website: form.elements.website.value, locale: ru ? 'ru' : 'en' }; };
    const validate = () => { const result = validateInquiry(collect()); form.querySelectorAll('[aria-invalid]').forEach(e => e.removeAttribute('aria-invalid')); if (!result.ok) {
        status.textContent = ru ? 'Заполните обязательные поля и подтвердите согласие.' : 'Complete the required fields and consent.';
        const ids = { name: 'fullName', email: 'email', message: 'message' };
        for (const key of Object.keys(result.errors)) {
            const el = field(ids[key]);
            if (el)
                el.setAttribute('aria-invalid', 'true');
        }
        form.querySelector('[aria-invalid=true]')?.focus();
        return null;
    } status.textContent = ''; return result.data; };
    const show = data => { preview.value = (ru ? 'Кому: ' : 'To: ') + email + '\n\n' + formatInquiry(data); preview.hidden = false; };
    document.getElementById('copyEnquiry').addEventListener('click', async () => { const data = validate(); if (!data)
        return; show(data); try {
        await navigator.clipboard.writeText(preview.value);
        status.textContent = ru ? 'Запрос скопирован. Ничего не отправлено.' : 'Enquiry copied. Nothing sent.';
    }
    catch {
        preview.focus();
        preview.select();
        status.textContent = ru ? 'Текст выделен ниже. Скопируйте его командой устройства.' : 'Text selected below. Use your device’s copy command.';
    } });
    form.addEventListener('input', () => { requestId = ''; });
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (sending)
            return;
        const data = validate();
        if (!data)
            return;
        show(data);
        if (mode !== 'resend') {
            status.textContent = ru ? 'Письмо подготовлено. Проверьте и отправьте его в почтовом приложении.' : 'Message prepared. Review and send it in your email app.';
            window.location.href = inquiryMailto(email, data);
            return;
        }
        if (!token) {
            status.textContent = ru ? 'Пройдите проверку.' : 'Complete verification.';
            return;
        }
        sending = true;
        button.disabled = true;
        requestId = requestId || crypto.randomUUID();
        status.textContent = ru ? 'Отправка…' : 'Sending…';
        try {
            const r = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, token, requestId }), signal: AbortSignal.timeout(14000) });
            const result = await r.json();
            if (!r.ok || result.code !== 'ACCEPTED')
                throw new Error('FAILED');
            status.textContent = ru ? 'Почтовый сервис принял запрос. Это не подтверждает доставку во входящие.' : 'The email provider accepted the enquiry. Inbox delivery is not confirmed.';
            form.reset();
            requestId = '';
        }
        catch {
            status.textContent = ru ? 'Не удалось отправить запрос. Скопируйте его или используйте email.' : 'Could not send. Copy your enquiry or use the email link.';
        }
        finally {
            sending = false;
            button.disabled = false;
            token = '';
            if (widget !== null && window.turnstile)
                window.turnstile.reset(widget);
        }
    });
    const configure = async () => { if (!['http:', 'https:'].includes(location.protocol))
        return; try {
        const r = await fetch('/api/contact', { signal: AbortSignal.timeout(3500) });
        if (!r.ok)
            return;
        const config = await r.json();
        if (config.mode !== 'resend' || !config.siteKey)
            return;
        const script = document.createElement('script');
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
        script.async = true;
        script.onload = () => { if (!window.turnstile)
            return; widget = window.turnstile.render(form.querySelector('[data-captcha-slot]'), { sitekey: config.siteKey, action: 'enquiry', theme: 'dark', callback: value => token = value, 'expired-callback': () => token = '' }); mode = 'resend'; button.querySelector('span').textContent = ru ? 'Отправить запрос' : 'Send enquiry'; form.querySelector('.form-note').textContent = ru ? 'Запрос отправляется через настроенный почтовый сервис. Не включайте чувствительные документы.' : 'The enquiry uses the configured email service. Do not include sensitive documents.'; };
        document.head.append(script);
    }
    catch { /* Explicit mailto mode remains available. */ } };
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(entries => { if (entries.some(e => e.isIntersecting)) {
            observer.disconnect();
            configure();
        } }, { rootMargin: '250px' });
        observer.observe(form);
    }
    else
        configure();
}
