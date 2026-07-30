/* =========================================================
   orbit.js — companies gravitating around a sphere
   Vanilla ES6+, no dependency. Projects points of a Fibonacci
   sphere on screen each frame with depth scaling + drag.
   ========================================================= */
(() => {
  const stage = document.querySelector('[data-orbit]');
  if (!stage) return;

  const names = (stage.dataset.orbit || '')
    .split(',')
    .map((n) => n.trim())
    .filter(Boolean);
  if (!names.length) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TILT = -0.32; // radians, slight top-down view

  // --- build nodes + evenly spread points (Fibonacci sphere) ---
  const golden = Math.PI * (3 - Math.sqrt(5));
  const nodes = names.map((name, i) => {
    const el = document.createElement('span');
    el.className = 'orbit__node' + (i % 4 === 0 ? ' orbit__node--accent' : '');
    el.textContent = name;
    stage.appendChild(el);

    const y = 1 - (i / (names.length - 1)) * 2;      // 1 -> -1
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    return { el, x: Math.cos(theta) * r, y, z: Math.sin(theta) * r };
  });

  let angleY = 0;      // spin around vertical axis
  let angleX = 0;      // tumble around horizontal axis
  const SPEED_Y = 0.0034;
  const SPEED_X = 0.0013; // slower, so every chip eventually faces us
  let dragging = false;
  let paused = false;
  let lastX = 0, lastY = 0;
  let velX = 0, velY = 0;

  const render = () => {
    const rect = stage.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const radius = Math.min(rect.width, rect.height) * 0.42;
    const cosY = Math.cos(angleY), sinY = Math.sin(angleY);
    const cosX = Math.cos(angleX + TILT), sinX = Math.sin(angleX + TILT);

    for (const n of nodes) {
      // rotate around Y
      const x1 = n.x * cosY + n.z * sinY;
      const z1 = -n.x * sinY + n.z * cosY;
      // rotate around X
      const y2 = n.y * cosX - z1 * sinX;
      const z2 = n.y * sinX + z1 * cosX;

      const depth = (z2 + 1) / 2;                 // 0 (back) -> 1 (front)
      const scale = 0.55 + depth * 0.55;
      const px = cx + x1 * radius;
      const py = cy + y2 * radius;

      n.el.style.transform =
        `translate3d(${px}px, ${py}px, 0) translate(-50%, -50%) scale(${scale.toFixed(3)})`;
      n.el.style.opacity = (0.24 + depth * 0.76).toFixed(3);
      n.el.style.zIndex = String(Math.round(depth * 100));
      n.el.style.filter = depth < 0.42 ? `blur(${((0.42 - depth) * 3.4).toFixed(2)}px)` : 'none';
    }
  };

  const tick = () => {
    if (!dragging && !paused) { angleY += SPEED_Y; angleX += SPEED_X; }
    if (!dragging) {
      if (Math.abs(velX) > 0.00008) { angleY += velX; velX *= 0.94; }
      if (Math.abs(velY) > 0.00008) { angleX += velY; velY *= 0.94; }
    }
    render();
    requestAnimationFrame(tick);
  };

  // --- interactions ---
  stage.addEventListener('pointerenter', () => { paused = true; });
  stage.addEventListener('pointerleave', () => { paused = false; });

  stage.addEventListener('pointerdown', (e) => {
    dragging = true;
    lastX = e.clientX; lastY = e.clientY;
    velX = velY = 0;
    stage.classList.add('is-dragging');
    stage.setPointerCapture(e.pointerId);
  });
  stage.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    lastX = e.clientX; lastY = e.clientY;
    angleY += dx * 0.006;
    angleX -= dy * 0.006;
    velX = dx * 0.006;
    velY = -dy * 0.006;
  });
  const endDrag = () => {
    dragging = false;
    stage.classList.remove('is-dragging');
  };
  stage.addEventListener('pointerup', endDrag);
  stage.addEventListener('pointercancel', endDrag);

  render();
  if (!reduced) requestAnimationFrame(tick);
})();
