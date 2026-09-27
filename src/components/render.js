/** Build-time rendering helpers; untrusted strings are escaped. */
export const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export function localize(html, locale, values) {
    let output = html.replace(/<([a-z][a-z0-9-]*)(\b[^>]*\bdata-en="([^"]*)"[^>]*\bdata-ru="([^"]*)"[^>]*)>[^<]*<\/\1>/gi, (all, tag, attrs, en, ru) => `<${tag}${attrs}>${locale === 'ru' ? ru : en}</${tag}>`);
    output = output.replace(/<img\b[^>]*>/gi, tag => { const alt = tag.match(new RegExp('data-alt-' + locale + '="([^"]*)"')); return alt ? tag.replace(/\balt="[^"]*"/, `alt="${alt[1]}"`) : tag; });
    if (locale === 'ru') {
        const labels = { 'MAXIMUS.BOATS — home': 'MAXIMUS.BOATS — главная', 'Main navigation': 'Основная навигация', 'Mobile navigation': 'Меню', 'Footer navigation': 'Навигация в подвале', 'Open menu': 'Открыть меню', 'Play the supplied VANUATU workshop video': 'Открыть исходное видео VANUATU из цеха', 'Close project': 'Закрыть проект', 'Close video': 'Закрыть видео', 'VANUATU workshop video': 'Видео VANUATU из цеха', 'Prepared enquiry text': 'Подготовленный текст запроса' };
        output = output.replace(/aria-label="([^"]+)"/g, (match, value) => labels[value] ? `aria-label="${escapeHTML(labels[value])}"` : match);
    }
    return output.replace(/\{\{([a-zA-Z]+)\}\}/g, (_, key) => { if (!(key in values))
        throw new Error('Missing template value ' + key); return escapeHTML(values[key]); });
}
/** Specifications are rendered directly from the unchanged project source. */
const specs = entries => `<dl class="collection-specs">${entries.map(([name, value]) => `<div><dt>${escapeHTML(name)}</dt><dd>${escapeHTML(value)}</dd></div>`).join('')}</dl>`;

export function collection(models, locale) {
    const ru = locale === 'ru';
    const titles = Object.keys(models);
    const tabs = titles.map((id, i) => `<button type="button" role="tab" id="tab-${id}" data-tab="${id}" aria-selected="${!i}" aria-controls="panel-${id}" tabindex="${i ? -1 : 0}"><span>0${i + 1}</span>${models[id].name}</button>`).join('');
    const panels = titles.map((id, i) => {
        const model = models[id], t = model[locale];
        return `<article class="collection-panel" data-panel="${id}" id="panel-${id}" role="tabpanel" aria-labelledby="tab-${id}" tabindex="0" ${i ? 'hidden' : ''}>
          <figure class="collection-image"><img src="${model.image}" alt="${model.name} — ${ru ? 'проектная визуализация' : 'project visual'}" loading="lazy"><figcaption>${model.name} / ${ru ? 'ПРОЕКТНАЯ ВИЗУАЛИЗАЦИЯ' : 'PROJECT VISUAL'}</figcaption></figure>
          <div class="collection-info"><div class="collection-copy"><span class="eyebrow">${escapeHTML(t.subtitle)}</span><h3>${model.name}</h3><p>${escapeHTML(t.description)}</p><a class="button" href="/${locale}/projects/${id}/">${ru ? 'Изучить проект' : 'Explore project'}<span aria-hidden="true" class="arrow">↗</span></a></div>${specs(t.specs.slice(0, 4))}</div>
        </article>`;
    }).join('');
    return `<section class="section" id="projects"><div class="container">
      <div class="section-heading"><div><span class="eyebrow">01 / ${ru ? 'КОЛЛЕКЦИЯ ПРОЕКТОВ' : 'THE COLLECTION'}</span><h2>${ru ? 'Разный характер.<br>Точный замысел.' : 'Distinct by design.'}</h2></div><p>${ru ? 'Парусно-моторная яхта, частные моторные яхты и многоцелевые катера. Выберите проект под вашу задачу.' : 'Motor sailers. Private yachts. Multipurpose craft. Find the project that matches your purpose.'}</p></div>
      <div data-tabs><div class="collection-tabs" role="tablist" aria-label="${ru ? 'Выбор модели' : 'Choose a model'}">${tabs}</div>${panels}</div>
      <p class="collection-note">${ru ? 'Каталожные и проектные параметры. Наличие, окончательная спецификация, цена и сроки передачи подтверждаются индивидуально.' : 'Catalogue and design particulars. Current availability, final specification, price and delivery are confirmed individually.'}</p>
      <noscript>${titles.map(id => `<a href="/${locale}/projects/${id}/">${models[id].name}</a>`).join(' / ')}</noscript>
    </div></section>`;
}

export function projectPage(model, id, locale) {
    const ru = locale === 'ru', t = model[locale];
    const visualLabel = ru ? 'Проектная визуализация' : 'Project visual';
    return `<section class="section detail-section"><div class="container">
      <a href="/${locale}/#projects" class="text-link">← ${ru ? 'Вернуться к коллекции' : 'Back to the collection'}</a>
      <div class="detail-heading"><div><span class="eyebrow">${escapeHTML(t.subtitle)}</span><h1>${model.name}</h1></div><p>${escapeHTML(t.description)}</p></div>
      <figure><img class="detail-main-img" src="${model.image}" alt="${model.name} / ${visualLabel}" fetchpriority="high"><figcaption class="detail-caption"><span>${model.name} / ${visualLabel}</span><span>${ru ? 'Изображение из проектного досье' : 'From the project dossier'}</span></figcaption></figure>
      <div class="detail-layout"><h2>${ru ? 'Параметры проекта' : 'Project particulars'}</h2>${specs(t.specs)}</div>
      <p class="source-note">${escapeHTML(t.note)}</p>
      ${model.extra ? `<figure class="detail-dossier"><img class="detail-asset" src="${model.extra}" alt="${escapeHTML(t.extraLabel)}" loading="lazy"><figcaption class="collection-note">${escapeHTML(t.extraLabel)}</figcaption></figure>` : ''}
      <div class="actions detail-actions"><a class="button primary" href="#contact" data-select-model="${model.name}">${escapeHTML(t.cta)}<span aria-hidden="true" class="arrow">↗</span></a></div>
    </div></section>`;
}

export function privacy(locale) { const ru = locale === 'ru'; return `<section class="section"><div class="container legal-copy"><h1>${ru ? 'Конфиденциальность.' : 'Privacy notice.'}</h1><p>MAXIMUS.BOATS / 26 September 2026</p><h2>${ru ? 'Ваш запрос' : 'Your enquiry'}</h2><p>${ru ? 'Коммерческие обращения адресованы MAXIMUS VEGAS L.L.C-FZ. Контакты инвестиционного клуба размещены отдельно. По умолчанию форма подготавливает письмо в вашем почтовом приложении, не отправляет и не сохраняет его автоматически.' : 'Commercial enquiries are addressed to MAXIMUS VEGAS L.L.C-FZ. The investment club has separate contacts. By default the form prepares a message in your email application; it does not send or store it automatically.'}</p><h2>${ru ? 'Серверная отправка' : 'Server delivery'}</h2><p>${ru ? 'При отдельно настроенной серверной отправке имя, email, тема, сообщение и согласие передаются серверному обработчику и почтовому сервису Resend. Cloudflare Turnstile проверяет автоматизированные запросы. Приложение не использует базу данных. Хостинг и почтовые провайдеры могут обрабатывать технические журналы; сроки хранения должны быть отдельно установлены оператором.' : 'When separately configured, server delivery transmits your name, email, topic, message and consent to the endpoint and the Resend email service. Cloudflare Turnstile checks automated requests. The application has no database. Hosting and email providers may process technical logs; retention periods must be separately established by the operator.'}</p><p>${ru ? 'Не отправляйте через открытую форму паспорта, банковские сведения или секретные чертежи. По вопросам обработки данных:' : 'Do not use the public form for passports, banking data or confidential drawings. For data-processing enquiries:'} <a href="mailto:{{commercialEmail}}">{{commercialEmail}}</a>.</p></div></section>`; }
