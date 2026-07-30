/* =========================================================
   Shared layout: nav + footer injected on every page
   French by default, English strings in data-en (see i18n.js)
   ========================================================= */
(() => {
  const path = location.pathname.split('/').pop() || 'index.html';
  const page = path.replace('.html', '') || 'index';

  const links = [
    { href: 'index.html',    key: 'index',    fr: 'Accueil',      en: 'Home' },
    { href: 'edition.html',  key: 'edition',  fr: 'Édition 2026', en: 'Edition 2026' },
    { href: 'program.html',  key: 'program',  fr: 'Programme',    en: 'Program' },
    { href: 'partners.html', key: 'partners', fr: 'Entreprises',  en: 'Partners' },
    { href: 'contact.html',  key: 'contact',  fr: 'Contact',      en: 'Contact' },
  ];

  const linkHtml = () => links.map(l =>
    `<a href="${l.href}"${l.key === page ? ' aria-current="page"' : ''} data-en="${l.en}">${l.fr}</a>`
  ).join('');

  const langBtn = `
      <button class="langsw" data-lang-toggle aria-label="Switch to English">
        <span data-lang-opt="fr">FR</span><span data-lang-opt="en">EN</span>
      </button>`;

  const navHost = document.getElementById('site-nav');
  if (navHost) {
    navHost.innerHTML = `
<header class="nav" id="nav">
  <div class="nav__inner">
    <a href="index.html" class="nav__logo" aria-label="Career Day, accueil">
      <span class="nav__badge">CD</span>
      <span>CAREER DAY</span>
    </a>
    <nav class="nav__links" aria-label="Navigation principale">${linkHtml()}</nav>
    <div class="nav__actions">
      ${langBtn}
      <button class="btn btn--primary" data-modal-open="registerModal" data-en="Register">S’inscrire</button>
      <button class="burger" id="burger" aria-label="Ouvrir le menu" aria-expanded="false" aria-controls="mobileMenu">
        <span></span><span></span><span></span>
      </button>
    </div>
  </div>
</header>
<div class="drawer" id="mobileMenu" aria-hidden="true">
  <nav class="drawer__nav" aria-label="Menu mobile">
    ${linkHtml()}
    <button class="btn btn--primary" data-modal-open="registerModal" data-en="Register">S’inscrire</button>
    ${langBtn}
  </nav>
</div>`;
  }

  const footHost = document.getElementById('site-footer');
  if (footHost) {
    footHost.innerHTML = `
<footer class="footer">
  <div class="container footer__grid">
    <div>
      <div class="nav__logo footer__logo"><span class="nav__badge">CD</span> CAREER DAY</div>
      <p data-en="Engineering school engaged for a sustainable world.">École d’ingénieurs engagée pour un monde durable.</p>
    </div>
    <div>
      <h4 data-en="Explore">Explorer</h4>
      <ul>
        <li><a href="edition.html" data-en="Edition 2026">Édition 2026</a></li>
        <li><a href="program.html" data-en="Program">Programme</a></li>
        <li><a href="partners.html" data-en="Partners">Entreprises</a></li>
      </ul>
    </div>
    <div>
      <h4 data-en="Follow">Nous suivre</h4>
      <div class="socials">
        <a href="#" aria-label="Instagram">IG</a>
        <a href="#" aria-label="LinkedIn">IN</a>
        <a href="#" aria-label="Twitter">TW</a>
      </div>
    </div>
    <div class="footer__stamp"><div data-en="THE FUTURE<br>IS GREEN">L’AVENIR<br>EST VERT</div></div>
  </div>
  <div class="footer__bar">
    <span data-en="© 2026 Career Day CPE Lyon — All rights reserved">© 2026 Career Day CPE Lyon — Tous droits réservés</span>
    <span><a href="#" data-en="Legal">Mentions légales</a> · <a href="#" data-en="Privacy">Confidentialité</a></span>
  </div>
</footer>`;
  }

  document.dispatchEvent(new CustomEvent('layout:ready'));
})();
