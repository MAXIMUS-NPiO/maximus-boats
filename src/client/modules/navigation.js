export function initNavigation() {
    const toggle = document.getElementById('menuToggle'), nav = document.getElementById('mobileNav');
    if (!toggle || !nav)
        return;
    const ru = document.documentElement.lang === 'ru';
    const setLabel = open => toggle.setAttribute('aria-label', ru ? (open ? 'Закрыть меню' : 'Открыть меню') : (open ? 'Close menu' : 'Open menu'));
    const close = () => { nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); setLabel(false); };
    setLabel(false);
    toggle.addEventListener('click', () => { const open = nav.classList.toggle('open'); toggle.setAttribute('aria-expanded', String(open)); setLabel(open); });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') {
        if (nav.classList.contains('open')) { close(); toggle.focus(); }
    } });
    document.addEventListener('click', event => { if (!event.target.closest('.site-header')) close(); });
    const language = document.getElementById('languageToggle');
    language?.addEventListener('click', () => { const route = language.getAttribute('href').split('#')[0]; language.setAttribute('href', route + location.hash); });
    document.querySelectorAll('[data-interest]').forEach(a => a.addEventListener('click', () => { const input = document.getElementById('interest'); if (input)
        input.value = a.dataset.interest; }));
    document.querySelectorAll('[data-select-model]').forEach(a => a.addEventListener('click', () => { const input = document.getElementById('model'); if (input)
        input.value = a.dataset.selectModel; }));
}
