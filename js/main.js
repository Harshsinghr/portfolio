(() => {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Header: blur on scroll + mobile menu ------------------------------ */
  const header = $('#site-header');
  const menuBtn = $('#menu-toggle');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const setMenu = (open) => {
    header.classList.toggle('nav-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  menuBtn.addEventListener('click', () => setMenu(!header.classList.contains('nav-open')));
  $$('#site-nav a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  /* Scroll-spy -------------------------------------------------------- */
  const links = $$('.nav-links a');
  const sections = links.map((a) => $(a.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((a) => {
          if (a.getAttribute('href') === `#${entry.target.id}`) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach((s) => spy.observe(s));

    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) links.forEach((a) => a.removeAttribute('aria-current'));
    }, { rootMargin: '-40% 0px -40% 0px' }).observe($('#top'));
  }

  /* Reveal on scroll + LeetCode bars --------------------------------- */
  const growBars = () => $$('.seg').forEach((s) => { s.style.width = `${s.dataset.w}%`; });

  if ('IntersectionObserver' in window && !reduceMotion) {
    // Above-the-fold content staggers in on a timer so it never waits on the observer.
    $$('.hero .reveal').forEach((el, i) => setTimeout(() => el.classList.add('in'), 80 + i * 90));

    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        if (entry.target.id === 'leet') growBars();
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    $$('.reveal').filter((el) => !el.closest('.hero')).forEach((el) => io.observe(el));
  } else {
    $$('.reveal').forEach((el) => el.classList.add('in'));
    growBars();
  }

  /* Card spotlight follows the pointer -------------------------------- */
  if (matchMedia('(hover: hover)').matches && !reduceMotion) {
    document.addEventListener('pointermove', (e) => {
      const card = e.target.closest && e.target.closest('.card');
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    }, { passive: true });
  }

  /* Local time in Kanpur --------------------------------------------- */
  const timeEl = $('#local-time');
  if (timeEl) {
    const fmt = new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' });
    const tick = () => { timeEl.textContent = `${fmt.format(new Date()).toLowerCase()} IST`; };
    tick();
    setInterval(tick, 30000);
  }

  /* Copy email -------------------------------------------------------- */
  const copyBtn = $('#copy-mail');
  const status = $('#copy-status');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const addr = $('#mail-link').textContent.trim();
      try {
        await navigator.clipboard.writeText(addr);
      } catch (e) {
        const ta = document.createElement('textarea');
        ta.value = addr; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); } catch (_) {}
        ta.remove();
      }
      copyBtn.textContent = 'Copied';
      status.textContent = 'Email address copied';
      setTimeout(() => { copyBtn.textContent = 'Copy'; status.textContent = ''; }, 1800);
    });
  }

  /* Footer year ------------------------------------------------------- */
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
})();
