/* =========================================================
   Career Day 2026 — vanilla ES6+ interactions (light-only)
   Runs after layout.js injects shared nav/footer.
   ========================================================= */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const on = (el, ev, fn, o) => el && el.addEventListener(ev, fn, o);

  /* ---- Loader ---- */
  window.addEventListener('load', () => {
    const loader = $('#loader');
    if (loader) setTimeout(() => loader.classList.add('is-hidden'), 250);
  });

  /* ---- Scroll progress + sticky nav + back-to-top ---- */
  const progress = $('#scrollProgress');
  const toTop = $('#toTop');
  const onScroll = () => {
    const y = window.scrollY;
    $('#nav')?.classList.toggle('is-scrolled', y > 20);
    toTop?.classList.toggle('is-visible', y > 500);
    if (progress) {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = `${Math.max(0, Math.min(100, (y / h) * 100))}%`;
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  on(toTop, 'click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ---- Reveal on scroll ---- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => e.isIntersecting && (e.target.classList.add('is-in'), io.unobserve(e.target)));
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
  $$('[data-reveal]').forEach(el => io.observe(el));

  /* ---- Animated counters ---- */
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = +el.dataset.count;
      const suffix = el.dataset.suffix || (target >= 1000 ? '+' : '');
      const dur = 1600;
      const start = performance.now();
      const step = (t) => {
        const p = Math.min(1, (t - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.floor(target * eased).toLocaleString() + (p === 1 ? suffix : '');
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      countIO.unobserve(el);
    });
  }, { threshold: 0.5 });
  $$('[data-count]').forEach(el => countIO.observe(el));

  /* ---- Tabs ---- */
  const tabs = $$('.tab');
  tabs.forEach(tab => {
    on(tab, 'click', () => {
      tabs.forEach(t => (t.classList.remove('is-active'), t.setAttribute('aria-selected', 'false')));
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');
      $$('.tab-panel').forEach(p => p.classList.toggle('is-active', p.dataset.panel === tab.dataset.tab));
    });
    on(tab, 'keydown', (e) => {
      if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
      e.preventDefault();
      const i = tabs.indexOf(tab);
      const next = e.key === 'ArrowRight' ? tabs[(i + 1) % tabs.length] : tabs[(i - 1 + tabs.length) % tabs.length];
      next.focus(); next.click();
    });
  });

  /* ---- Modals ---- */
  let lastFocus = null;
  const openModal = (id) => {
    const m = document.getElementById(id);
    if (!m) return;
    lastFocus = document.activeElement;
    m.classList.add('is-open');
    m.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(() => m.querySelector('input,select,textarea,button')?.focus(), 50);
  };
  const closeModal = (m) => {
    m.classList.remove('is-open');
    m.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    lastFocus?.focus();
  };
  const wireModalTriggers = () => {
    $$('[data-modal-open]').forEach(b => on(b, 'click', () => openModal(b.dataset.modalOpen)));
    $$('[data-modal-close]').forEach(b => on(b, 'click', () => closeModal(b.closest('.modal'))));
  };
  wireModalTriggers();
  document.addEventListener('layout:ready', wireModalTriggers);
  on(document, 'keydown', (e) => {
    if (e.key === 'Escape') $$('.modal.is-open').forEach(closeModal);
  });

  /* ---- Toasts ---- */
  const toastHost = $('#toasts');
  function toast(msg, type = 'ok') {
    if (!toastHost) return;
    const el = document.createElement('div');
    el.className = 'toast' + (type === 'error' ? ' is-error' : '');
    el.textContent = msg;
    toastHost.appendChild(el);
    setTimeout(() => {
      el.classList.add('is-out');
      el.addEventListener('animationend', () => el.remove(), { once: true });
    }, 3200);
  }

  /* ---- Form validation ---- */
  const validators = {
    name: v => v.trim().length >= 2 || 'Please enter your name.',
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || 'Enter a valid email.',
    message: v => v.trim().length >= 10 || 'Message should be at least 10 characters.',
    role: v => !!v || 'Choose an option.',
    subject: v => v.trim().length >= 3 || 'Add a subject.',
  };
  const validateField = (input) => {
    const rule = validators[input.name];
    const res = rule ? rule(input.value) : true;
    const field = input.closest('.field');
    const err = field?.querySelector('.err');
    if (res !== true) { field.classList.add('has-error'); if (err) err.textContent = res; return false; }
    field.classList.remove('has-error'); if (err) err.textContent = ''; return true;
  };
  const handleForm = (form, successMsg) => {
    $$('input, select, textarea', form).forEach(i => on(i, 'blur', () => validateField(i)));
    on(form, 'submit', (e) => {
      e.preventDefault();
      const ok = $$('input, select, textarea', form).map(validateField).every(Boolean);
      if (!ok) { toast('Please fix the highlighted fields.', 'error'); return; }
      const btn = form.querySelector('button[type="submit"]');
      const orig = btn?.textContent;
      if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
      setTimeout(() => {
        toast(successMsg);
        form.reset();
        if (btn) { btn.disabled = false; btn.textContent = orig; }
        const modal = form.closest('.modal'); if (modal) closeModal(modal);
      }, 700);
    });
  };
  $$('form[data-form]').forEach(f => handleForm(f, f.dataset.success || 'Sent!'));

  /* ---- Mobile drawer (wire after layout:ready) ---- */
  const wireDrawer = () => {
    const burger = $('#burger');
    const drawer = $('#mobileMenu');
    if (!burger || !drawer) return;
    const closeDrawer = () => {
      drawer.classList.remove('is-open');
      burger.classList.remove('is-open');
      document.body.classList.remove('nav-open');
      burger.setAttribute('aria-expanded', 'false');
      drawer.setAttribute('aria-hidden', 'true');
    };
    on(burger, 'click', () => {
      const open = drawer.classList.toggle('is-open');
      burger.classList.toggle('is-open', open);
      document.body.classList.toggle('nav-open', open);
      burger.setAttribute('aria-expanded', open);
      drawer.setAttribute('aria-hidden', !open);
    });
    $$('#mobileMenu a, #mobileMenu button').forEach(el => on(el, 'click', closeDrawer));
    onScroll();
  };
  document.addEventListener('layout:ready', wireDrawer);
  wireDrawer();

  /* ---- Tilt hover ---- */
  $$('[data-tilt]').forEach(el => {
    on(el, 'mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5;
      const y = (e.clientY - r.top) / r.height - .5;
      el.style.transform = `perspective(700px) rotateX(${(-y * 6).toFixed(2)}deg) rotateY(${(x * 6).toFixed(2)}deg) translateY(-4px)`;
    });
    on(el, 'mouseleave', () => { el.style.transform = ''; });
  });

  /* ---- Keyboard shortcut: "/" opens registration ---- */
  on(document, 'keydown', (e) => {
    if (e.key === '/' && !/input|textarea|select/i.test(e.target.tagName)) {
      e.preventDefault(); openModal('registerModal');
    }
  });
})();
