export function initNavigation() {
    const toggle = document.getElementById('menuToggle'), nav = document.getElementById('mobileNav');
    if (!toggle || !nav)
        return;
    const close = () => { nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); toggle.textContent = '☰'; };
    toggle.addEventListener('click', () => { const open = nav.classList.toggle('open'); toggle.setAttribute('aria-expanded', String(open)); toggle.textContent = open ? '×' : '☰'; });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') {
        close();
    } });
    window.addEventListener('resize', () => { if (window.innerWidth > 900)
        close(); });
    document.querySelectorAll('[data-interest]').forEach(a => a.addEventListener('click', () => { const input = document.getElementById('interest'); if (input)
        input.value = a.dataset.interest; }));
    document.querySelectorAll('[data-select-model]').forEach(a => a.addEventListener('click', () => { const input = document.getElementById('model'); if (input)
        input.value = a.dataset.selectModel; }));
}
