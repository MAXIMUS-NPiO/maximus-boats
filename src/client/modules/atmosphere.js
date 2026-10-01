export function initAtmosphere() {
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let dispose = () => {};
  const setup = () => {
    dispose();
    if (preference.matches) return;
    const targets = [...document.querySelectorAll('.story-intro-grid > *, .section-heading, .yacht-card-body, .case-text, .engineering-title, .service, .partner-teaser-grid > div, .process-grid > li, .club-grid > div, .contact-heading, .contact-grid > *, .detail-heading, .evidence-grid > article')];
    const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' }) : null;
    if (observer) targets.forEach(el => { el.classList.add('reveal-ready'); observer.observe(el); });
    const story = document.querySelector('[data-dissolve]');
    const hero = document.querySelector('.ocean-hero');
    let frame = 0;
    const paint = () => {
      frame = 0;
      if (story) {
        const rect = story.getBoundingClientRect();
        const stageHeight = story.querySelector('.dissolve-stage').offsetHeight;
        const progress = Math.min(1, Math.max(0, -rect.top / Math.max(1, rect.height - stageHeight)));
        story.style.setProperty('--dissolve', progress.toFixed(3));
      }
      if (hero && scrollY < hero.offsetHeight) hero.style.setProperty('--drift', `${Math.min(scrollY * 0.07, 65)}px`);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(paint); };
    const focus = event => event.target.closest('.reveal-ready')?.classList.add('is-visible');
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    document.addEventListener('focusin', focus);
    paint();
    dispose = () => {
      observer?.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      document.removeEventListener('focusin', focus);
      targets.forEach(el => el.classList.remove('reveal-ready', 'is-visible'));
      story?.style.removeProperty('--dissolve');
      hero?.style.removeProperty('--drift');
    };
  };
  preference.addEventListener('change', setup);
  setup();
}
