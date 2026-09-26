export function initTabs() {
    document.querySelectorAll('[data-tabs]').forEach(root => {
        const tabs = Array.from(root.querySelectorAll('[data-tab]')), panels = Array.from(root.querySelectorAll('[data-panel]'));
        const select = tab => { tabs.forEach(t => { const on = t === tab; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; }); panels.forEach(p => p.hidden = p.dataset.panel !== tab.dataset.tab); };
        tabs.forEach((tab, i) => { tab.addEventListener('click', () => select(tab)); tab.addEventListener('keydown', event => { let target = i; if (event.key === 'ArrowRight')
            target = (i + 1) % tabs.length;
        else if (event.key === 'ArrowLeft')
            target = (i + tabs.length - 1) % tabs.length;
        else if (event.key === 'Home')
            target = 0;
        else if (event.key === 'End')
            target = tabs.length - 1;
        else
            return; event.preventDefault(); select(tabs[target]); tabs[target].focus(); }); });
    });
}
