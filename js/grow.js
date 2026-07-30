/* =========================================================
   Grow illustration — subtle pointer/scroll parallax + replay
   ========================================================= */
(() => {
  const root = document.querySelector('.grow');
  if (!root) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  root.dataset.parallax = 'on';
  const layers = [...root.querySelectorAll('.grow__layer')];
  let raf = 0, tx = 0, ty = 0, cx = 0, cy = 0;

  const apply = () => {
    cx += (tx - cx) * 0.12;
    cy += (ty - cy) * 0.12;
    root.style.setProperty('--px', `${cx.toFixed(2)}px`);
    root.style.setProperty('--py', `${cy.toFixed(2)}px`);
    raf = Math.abs(tx - cx) > 0.1 || Math.abs(ty - cy) > 0.1 ? requestAnimationFrame(apply) : 0;
  };
  const queue = () => { if (!raf) raf = requestAnimationFrame(apply); };

  const onMove = (e) => {
    const r = root.getBoundingClientRect();
    tx = ((e.clientX - r.left) / r.width - 0.5) * 18;
    ty = ((e.clientY - r.top) / r.height - 0.5) * 14;
    queue();
  };
  root.addEventListener('mousemove', onMove);
  root.addEventListener('mouseleave', () => { tx = 0; ty = 0; queue(); });

  layers.forEach((l, i) => l.style.setProperty('--depth', String(0.4 + i * 0.45)));

  /* Replay the growth story when the illustration re-enters the viewport */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const svg = root.querySelector('.grow__svg');
      if (!svg || svg.dataset.played === '1') return;
      svg.dataset.played = '1';
    });
  }, { threshold: 0.25 });
  io.observe(root);
})();
