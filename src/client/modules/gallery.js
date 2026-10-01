/** Progressive enhancement: original, unmodified source images in a native dialog. */
export function initGallery() {
    const candidates = [...document.querySelectorAll('.collection-image img, .detail-main-img, .detail-asset, .interior-grid img, .scene-image img, .engineering-image > img, .shipyard-visual > img')];
    if (!candidates.length) return;
    const ru = document.documentElement.lang === 'ru';
    const label = ru ? 'Просмотр изображения' : 'Image viewer';
    const dialog = document.createElement('dialog');
    dialog.className = 'gallery-dialog';
    dialog.id = 'galleryDialog';
    dialog.setAttribute('aria-label', label);
    dialog.innerHTML = `<div class="dialog-bar"><span>${ru ? 'MAXIMUS / ПРОЕКТНЫЙ АРХИВ' : 'MAXIMUS / PROJECT ARCHIVE'}</span><button class="close-dialog" type="button" aria-label="${ru ? 'Закрыть изображение' : 'Close image'}">×</button></div><div class="gallery-stage"><img alt=""></div><div class="gallery-footer"><p class="gallery-caption" aria-live="polite"></p><div class="gallery-controls"><button type="button" data-gallery-prev aria-label="${ru ? 'Предыдущее изображение' : 'Previous image'}">←</button><button type="button" data-gallery-next aria-label="${ru ? 'Следующее изображение' : 'Next image'}">→</button></div></div>`;
    document.body.append(dialog);
    const image = dialog.querySelector('img');
    const caption = dialog.querySelector('.gallery-caption');
    const previous = dialog.querySelector('[data-gallery-prev]');
    const next = dialog.querySelector('[data-gallery-next]');
    let group = [], index = 0, trigger = null;
    const render = () => {
        const source = group[index];
        image.src = source.currentSrc || source.src;
        image.alt = source.alt;
        // Use the full original source label, including variant and status qualifications.
        caption.textContent = `${index + 1} / ${group.length} · ${source.alt}`;
        previous.hidden = next.hidden = group.length < 2;
    };
    const step = delta => { index = (index + delta + group.length) % group.length; render(); };
    candidates.forEach(source => {
        const scene = source.closest('.scene-image');
        const button = scene ? document.querySelector(`[data-gallery-source="${source.id}"]`) : document.createElement('button');
        if (!button) return;
        if (!scene) {
            button.type = 'button';
            button.className = 'image-expand';
            button.setAttribute('aria-label', `${ru ? 'Открыть изображение' : 'View image'}: ${source.alt}`);
            source.before(button);
            button.append(source);
        }
        button.setAttribute('aria-haspopup', 'dialog');
        button.addEventListener('click', event => {
            event.preventDefault();
            const section = source.closest('section');
            group = candidates.filter(candidate => candidate.closest('section') === section);
            index = group.indexOf(source);
            trigger = button;
            render();
            dialog.showModal();
            document.body.classList.add('locked');
        });
    });
    previous.addEventListener('click', () => step(-1));
    next.addEventListener('click', () => step(1));
    dialog.querySelector('.close-dialog').addEventListener('click', () => dialog.close());
    dialog.addEventListener('keydown', event => {
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
            event.preventDefault();
            step(event.key === 'ArrowRight' ? 1 : -1);
        }
    });
    dialog.addEventListener('click', event => {
        if (event.target !== dialog) return;
        const r = dialog.getBoundingClientRect();
        if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
    });
    dialog.addEventListener('close', () => {
        if (!document.querySelector('dialog[open]')) document.body.classList.remove('locked');
        trigger?.focus({ preventScroll: true });
    });
}
