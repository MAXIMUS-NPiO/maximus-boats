export function initDialogs() {
    const video = document.getElementById('videoDialog'), trigger = document.getElementById('playVideo');
    trigger?.addEventListener('click', () => { video.showModal(); document.body.classList.add('locked'); });
    document.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => b.closest('dialog').close()));
    document.querySelectorAll('dialog').forEach(d => { d.addEventListener('close', () => { document.body.classList.remove('locked'); d.querySelectorAll('video').forEach(v => v.pause()); }); d.addEventListener('click', event => { if (event.target !== d)
        return; const r = d.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom)
        d.close(); }); });
}
