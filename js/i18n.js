/* =========================================================
   i18n.js — French by default, one-click switch to English.
   Any element carrying data-en holds its English string; the
   French version is the markup itself. Attributes can be
   translated with data-en-placeholder / data-en-aria-label.
   ========================================================= */
(() => {
  const KEY = 'cd-lang';
  const ATTRS = ['placeholder', 'aria-label', 'title', 'content'];

  const store = {
    get: () => {
      try { return localStorage.getItem(KEY); } catch { return null; }
    },
    set: (v) => {
      try { localStorage.setItem(KEY, v); } catch { /* ignore */ }
    },
  };

  let lang = store.get() === 'en' ? 'en' : 'fr';

  const snapshot = (el) => {
    if (el.dataset.fr === undefined) el.dataset.fr = el.innerHTML;
    for (const a of ATTRS) {
      const en = el.dataset['en' + a.replace(/(^|-)(\w)/g, (_, __, c) => c.toUpperCase())];
      if (en !== undefined && el.dataset['fr' + a] === undefined) {
        el.dataset['fr' + a] = el.getAttribute(a) || '';
      }
    }
  };

  const apply = (root = document) => {
    const nodes = root.querySelectorAll('[data-en], [data-en-placeholder], [data-en-aria-label]');
    nodes.forEach((el) => {
      snapshot(el);
      if (el.dataset.en !== undefined) {
        el.innerHTML = lang === 'en' ? el.dataset.en : el.dataset.fr;
      }
      if (el.dataset.enPlaceholder !== undefined) {
        el.setAttribute('placeholder', lang === 'en' ? el.dataset.enPlaceholder : el.dataset.frplaceholder || '');
      }
      if (el.dataset.enAriaLabel !== undefined) {
        el.setAttribute('aria-label', lang === 'en' ? el.dataset.enAriaLabel : el.dataset['fraria-label'] || el.getAttribute('aria-label'));
      }
    });
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-lang-toggle]').forEach((btn) => {
      btn.setAttribute('aria-label', lang === 'fr' ? 'Switch to English' : 'Passer en français');
      btn.querySelectorAll('[data-lang-opt]').forEach((opt) => {
        opt.classList.toggle('is-active', opt.dataset.langOpt === lang);
      });
    });
  };

  const setLang = (next) => {
    lang = next === 'en' ? 'en' : 'fr';
    store.set(lang);
    apply();
  };

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-lang-toggle]');
    if (!btn) return;
    setLang(lang === 'fr' ? 'en' : 'fr');
  });

  document.addEventListener('layout:ready', () => apply());
  if (document.readyState !== 'loading') apply();
  else document.addEventListener('DOMContentLoaded', () => apply());

  window.CDLang = { get: () => lang, set: setLang };
})();
