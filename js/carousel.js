/* =========================================================
   Vanilla carousel — drag / swipe / arrows / dots / keyboard
   Usage: <div class="carousel" data-carousel data-autoplay="5000">
   ========================================================= */
(() => {
  const initCarousel = (root) => {
    const track = root.querySelector('.carousel__track');
    const viewport = root.querySelector('.carousel__viewport');
    const slides = [...root.querySelectorAll('.carousel__slide')];
    const dotsHost = root.querySelector('.carousel__dots');
    const counter = root.querySelector('.carousel__count');
    if (!track || slides.length === 0) return;

    let index = 0;
    let timer = null;
    const autoplay = +(root.dataset.autoplay || 0);

    // dots
    const dots = slides.map((_, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', `Go to photo ${i + 1}`);
      b.addEventListener('click', () => go(i));
      dotsHost?.appendChild(b);
      return b;
    });

    const render = () => {
      track.style.transform = `translate3d(${-index * 100}%,0,0)`;
      dots.forEach((d, i) => d.classList.toggle('is-active', i === index));
      slides.forEach((s, i) => s.setAttribute('aria-hidden', String(i !== index)));
      if (counter) counter.textContent = `${index + 1} / ${slides.length}`;
    };

    const go = (i) => { index = (i + slides.length) % slides.length; render(); restart(); };
    const next = () => go(index + 1);
    const prev = () => go(index - 1);

    root.querySelector('[data-carousel-next]')?.addEventListener('click', next);
    root.querySelector('[data-carousel-prev]')?.addEventListener('click', prev);

    // keyboard
    root.tabIndex = 0;
    root.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
    });

    // autoplay
    const stop = () => timer && clearInterval(timer);
    const restart = () => {
      stop();
      if (autoplay > 0) timer = setInterval(() => go(index + 1), autoplay);
    };
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', restart);
    root.addEventListener('focusin', stop);
    document.addEventListener('visibilitychange', () => document.hidden ? stop() : restart());

    // drag / swipe (ignore taps that start on a control)
    let startX = 0, startY = 0, delta = 0, dragging = false, captured = false, pid = null;
    const isControl = (t) => !!(t && t.closest && t.closest('.carousel__btn, .carousel__dots'));

    const down = (e) => {
      if (isControl(e.target) || e.button > 0) return;
      dragging = true; captured = false; pid = e.pointerId;
      startX = e.clientX; startY = e.clientY; delta = 0; stop();
    };
    const move = (e) => {
      if (!dragging) return;
      delta = e.clientX - startX;
      if (!captured) {
        // only hijack the gesture once it is clearly horizontal
        if (Math.abs(delta) < 8 || Math.abs(delta) < Math.abs(e.clientY - startY)) return;
        captured = true;
        try { viewport.setPointerCapture(pid); } catch (_) {}
        track.style.transition = 'none';
        viewport.classList.add('is-dragging');
      }
      e.preventDefault();
      track.style.transform = `translate3d(calc(${-index * 100}% + ${delta}px),0,0)`;
    };
    const up = () => {
      if (!dragging) return;
      const wasDrag = captured;
      dragging = false; captured = false;
      viewport.classList.remove('is-dragging');
      track.style.transition = '';
      if (!wasDrag) { restart(); return; }
      const threshold = Math.min(120, viewport.offsetWidth * 0.18);
      if (delta < -threshold) next();
      else if (delta > threshold) prev();
      else { render(); restart(); }
    };

    viewport.addEventListener('pointerdown', down);
    viewport.addEventListener('pointermove', move);
    viewport.addEventListener('pointerup', up);
    viewport.addEventListener('pointercancel', up);
    viewport.addEventListener('dragstart', (e) => e.preventDefault());


    render();
    restart();
  };

  document.querySelectorAll('[data-carousel]').forEach(initCarousel);
})();
