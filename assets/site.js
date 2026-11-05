/* =========================================================
   CREATIVE WHISPER — comportamiento común de las páginas internas
   Uso:  cwSite({ end: '#contacto', autoplay: true, init(k) { ...escenas propias... } })
   Todo lo que se anima con el scroll usa scrub: avanza al bajar y retrocede al subir.
   ========================================================= */
window.cwSite = function ({ end = '#contacto', autoplay = true, speed = .6, init } = {}) {
  const WA = '593969577774';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const pad = n => String(n).padStart(2, '0');
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(pointer: fine)').matches;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  const cssVar = name => getComputedStyle(root).getPropertyValue(name).trim();
  const vw = () => innerWidth, vh = () => innerHeight;

  /* ---------- lo que funciona siempre ---------- */
  $$('.js-wa').forEach(a => {
    if (a.dataset.msg) a.href = `https://wa.me/${WA}?text=${encodeURIComponent(a.dataset.msg)}`;
    a.target = '_blank'; a.rel = 'noopener';
  });
  const top = $('.top'), menuBtn = $('.js-menu'), menu = $('#menu');
  const closeMenu = () => { menu.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.textContent = 'Menú'; };
  menuBtn.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open)); menuBtn.textContent = open ? 'Cerrar' : 'Menú';
    top.classList.add('is-solid');
  });
  $$('a', menu).forEach(a => a.addEventListener('click', closeMenu));

  // palabras del enunciado: sueltas y clave con color  [palabra|color|colorDeTexto]
  $$('.js-words').forEach(st => {
    st.innerHTML = st.textContent.trim().split(/\s+/).map(w => {
      const m = w.match(/^\[(.+?)\|(\w+)\|(\w+)\](.*)$/);
      if (!m) return `<span class="w">${w}</span>`;
      return `<span class="w key" style="--c:var(--${m[2]})" data-fg="--${m[3]}"><i class="hl"></i>${m[1].replace(/_/g, ' ')}</span>${m[4] ? `<span class="w">${m[4]}</span>` : ''}`;
    }).join(' ');
  });

  // rodillos de cifras
  const odos = $$('.odo').map(el => {
    const to = el.dataset.to; el.setAttribute('aria-label', to); el.textContent = '';
    const cols = [...to].map(ch => {
      const col = document.createElement('span'); col.className = 'odo-col';
      const inner = document.createElement('span'); inner.className = 'odo-in';
      for (let k = 0; k < 3; k++) for (let d = 0; d < 10; d++) { const s = document.createElement('span'); s.textContent = d; inner.appendChild(s); }
      col.appendChild(inner); el.appendChild(col);
      return { inner, d: +ch };
    });
    return { el, cols };
  });

  // letras sueltas de la palabra grande de la portada y del cierre
  $$('.js-letters').forEach(el => { el.setAttribute('aria-label', el.textContent.trim()); el.innerHTML = [...el.textContent.trim()].map(c => `<span aria-hidden="true">${c === ' ' ? '&nbsp;' : c}</span>`).join(''); });

  const k = { $, $$, pad, root, vw, vh, cssVar, reduce, finePointer, lenis: null, gsap: window.gsap, ScrollTrigger: window.ScrollTrigger, static: false };

  /* ---------- modo estático ---------- */
  if (reduce || !hasGsap) {
    root.classList.add('static');
    const intro = $('.intro'); if (intro) intro.remove();
    $$('.st-text .key').forEach(el => el.style.color = `var(${el.dataset.fg})`);
    odos.forEach(o => o.cols.forEach(c => c.inner.style.transform = `translateY(${-(20 + c.d)}em)`));
    top.classList.add('is-solid');
    const fab = $('.js-fab'); if (fab) fab.classList.add('is-on');
    const chip = $('.sx-chip'); if (chip) chip.remove();
    k.static = true;
    if (init) init(k);
    return;
  }

  /* =====================================================
     Animación: GSAP + ScrollTrigger (+ Lenis con mouse)
     ===================================================== */
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  let lenis = null;
  if (window.Lenis && finePointer) {
    lenis = new Lenis({ lerp: .09, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  k.lenis = lenis;
  window.cwLenis = lenis;   // el asistente desplaza la página con el mismo Lenis
  const goTo = t => { if (lenis) lenis.scrollTo(t, { duration: 1.6, offset: -top.offsetHeight }); else window.scrollTo({ top: t.getBoundingClientRect().top + scrollY - top.offsetHeight + 1, behavior: 'smooth' }); };
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href'); if (id.length < 2) return;
    const t = document.querySelector(id); if (!t) return;
    e.preventDefault(); goTo(t);
  }));
  k.goTo = goTo;

  /* ---------- intro: las franjas suben y abren la página ---------- */
  const intro = $('.intro');
  const tlIn = gsap.timeline({ delay: .1 });
  if (intro) tlIn.to('.intro i', { yPercent: -112, duration: .9, ease: 'power3.inOut', stagger: .06 }).add(() => intro.remove());
  const has = s => document.querySelector(s);
  if (has('.ph-in')) tlIn.from('.ph-in > *', { y: 46, opacity: 0, duration: .9, ease: 'power3.out', stagger: .08 }, .45);
  if (has('.ph-strips i')) tlIn.from('.ph-strips i', { yPercent: i => (i % 2 ? -110 : 110), duration: 1.1, ease: 'power3.out', stagger: .07 }, .35);
  if (has('.ph-media')) tlIn.from('.ph-media', { clipPath: 'polygon(16% 100%,100% 100%,84% 100%,0% 100%)', duration: 1.1, ease: 'power3.inOut' }, .55);
  if (has('.ph-word span')) tlIn.from('.ph-word span', { yPercent: 105, duration: .9, ease: 'power3.out', stagger: .035 }, .6);

  /* ---------- portada: se desarma al bajar ---------- */
  if ($('.ph')) {
    const ht = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: '.ph', start: 'top top', end: 'bottom top', scrub: .8 } });
    if (has('.ph-word')) ht.to('.ph-word', { xPercent: -22 }, 0);
    if (has('.ph-in')) ht.to('.ph-in', { y: -90, opacity: .15 }, 0);
    if (has('.ph-strips i')) ht.to('.ph-strips i', { yPercent: i => (i % 2 ? 28 : -28) }, 0);
    if (has('.ph-media')) ht.to('.ph-media', { yPercent: -16, scale: .92 }, 0).to('.ph-media img, .ph-media video', { xPercent: 6 }, 0);
  }

  /* ---------- apariciones reversibles ---------- */
  $$('[data-rv]').forEach(el => {
    const type = el.dataset.rv || 'up';
    const st = { trigger: el, start: 'top 92%', end: 'top 58%', scrub: .6 };
    if (type === 'up') gsap.fromTo(el, { y: 56, opacity: 0 }, { y: 0, opacity: 1, ease: 'none', scrollTrigger: st });
    else if (type === 'wipe') {
      gsap.fromTo(el, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: st });
      const im = $('img, video', el); if (im) gsap.fromTo(im, { scale: 1.25 }, { scale: 1, ease: 'none', scrollTrigger: { ...st, end: 'top 30%' } });
    } else if (type === 'skew') {
      gsap.fromTo(el, { clipPath: 'polygon(0% 0%,0% 0%,0% 100%,0% 100%)' }, { clipPath: 'polygon(0% 0%,100% 0%,100% 100%,0% 100%)', ease: 'none', scrollTrigger: st });
    } else if (type === 'kids') {
      gsap.fromTo(el.children, { y: 48, opacity: 0 }, { y: 0, opacity: 1, ease: 'none', stagger: .12, scrollTrigger: { ...st, end: 'top 45%' } });
    } else if (type === 'line') {
      gsap.fromTo(el, { scaleX: 0 }, { scaleX: 1, transformOrigin: '0 50%', ease: 'none', scrollTrigger: st });
    }
  });
  // títulos grandes: cada palabra sube desde su propia línea
  $$('.js-rise').forEach(h => {
    h.innerHTML = h.innerHTML.split(/(<br\s*\/?>)/).map(part => /<br/.test(part) ? part :
      part.split(' ').filter(Boolean).map(w => `<span style="display:inline-block;overflow:hidden;vertical-align:top;padding:.24em .02em .04em;margin:-.24em -.02em -.04em"><span class="rw" style="display:inline-block">${w}</span></span>`).join(' ')).join('');
    gsap.fromTo($$('.rw', h), { yPercent: 110 }, { yPercent: 0, ease: 'none', stagger: .08, scrollTrigger: { trigger: h, start: 'top 92%', end: 'top 60%', scrub: .6 } });
  });

  /* ---------- enunciados que se pintan ---------- */
  $$('.statement').forEach(sec => {
    const ws = $$('.st-text .w', sec);
    const tl = gsap.timeline({ scrollTrigger: { trigger: sec, start: 'top top', end: () => '+=' + vh() * 1.8, pin: true, scrub: .6 } });
    ws.forEach((w, i) => {
      tl.to(w, { opacity: 1, duration: .12, ease: 'none' }, i * .1);
      if (w.classList.contains('key')) {
        const hl = $('.hl', w); gsap.set(hl, { skewX: -11, scaleX: 0 });
        tl.to(hl, { scaleX: 1, duration: .3, ease: 'power3.out' }, i * .1 + .04).to(w, { color: cssVar(w.dataset.fg), duration: .08, ease: 'none' }, i * .1 + .1);
      }
    });
    tl.to({}, { duration: .4 });
  });

  /* ---------- rodillos ---------- */
  odos.forEach((o, n) => o.cols.forEach((c, i) => {
    const to = { yPercent: -(20 + c.d) / 30 * 100 };
    if (o.el.closest('.ph')) gsap.fromTo(c.inner, { yPercent: 0 }, { ...to, duration: 1.8 + i * .25 + n * .15, ease: 'power3.out', delay: .9 });   // en la portada giran al abrir
    else gsap.fromTo(c.inner, { yPercent: 0 }, { ...to, ease: 'power2.out', scrollTrigger: { trigger: o.el, start: 'top 95%', end: 'top 55%', scrub: .6 + ((n + i) % 3) * .3 } });
  }));

  /* ---------- cierre: la paleta cae y queda la invitación ---------- */
  const endSec = $('.end');
  if (endSec) {
    const ls = $$('.end-word span', endSec);
    gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: endSec, start: 'top 85%', end: 'bottom bottom', scrub: .8 } })
      .fromTo($$('.end-strips i', endSec), { yPercent: i => (i % 2 ? 108 : -108) }, { yPercent: 0, duration: 1, ease: 'power3.out', stagger: .08 }, 0)
      .fromTo(ls, { yPercent: 120, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .5, stagger: .04, ease: 'back.out(1.6)' }, .55)
      .fromTo($$('.end-strips i', endSec), { yPercent: 0 }, { yPercent: i => (i % 2 ? -108 : 108), duration: .9, ease: 'power3.in', stagger: .06, immediateRender: false }, 1.3)
      .fromTo(ls, { color: cssVar('--ink') }, { color: cssVar('--bone'), duration: .3, stagger: .03, immediateRender: false }, 1.7)
      .fromTo($$('.end-sub, .end-ctas, .end-lines', endSec), { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: .3, stagger: .08 }, 1.9);
  }

  /* ---------- páginas: escenas propias ---------- */
  if (init) init(k);

  /* ---------- barra de avance, cabecera y botón de WhatsApp ---------- */
  const bar = $('.progress'), fab = $('.js-fab');
  gsap.ticker.add(() => {
    const H = document.documentElement.scrollHeight - vh(), y = scrollY;
    bar.style.transform = `scaleX(${H > 0 ? y / H : 0})`;
    top.classList.toggle('is-solid', y > 30 || menu.classList.contains('open'));
  });
  if (fab) ScrollTrigger.create({
    trigger: $('.ph') || document.body, start: 'bottom 70%', endTrigger: endSec || 'footer', end: 'top 70%',
    onToggle: self => fab.classList.toggle('is-on', self.isActive)
  });

  /* ---------- cursor y botones magnéticos (solo con mouse) ---------- */
  if (finePointer) {
    const cur = $('.cursor'), label = $('span', cur); cur.hidden = false;
    const cx = gsap.quickTo(cur, 'x', { duration: .35, ease: 'power3' }), cy = gsap.quickTo(cur, 'y', { duration: .35, ease: 'power3' });
    gsap.set(cur, { opacity: 0 });
    addEventListener('pointermove', e => { cx(e.clientX); cy(e.clientY); if (!cur.dataset.on) { cur.dataset.on = 1; gsap.to(cur, { opacity: 1, duration: .3 }); } });
    document.addEventListener('pointerleave', () => { delete cur.dataset.on; gsap.to(cur, { opacity: 0, duration: .2 }); });
    $$('[data-cursor]').forEach(el => {
      el.addEventListener('pointerenter', () => { label.textContent = el.dataset.cursor; cur.classList.add('big'); });
      el.addEventListener('pointerleave', () => cur.classList.remove('big'));
    });
    $$('.mag').forEach(el => {
      const mx = gsap.quickTo(el, 'x', { duration: .4, ease: 'power3' }), my = gsap.quickTo(el, 'y', { duration: .4, ease: 'power3' });
      el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(); mx((e.clientX - r.left - r.width / 2) * .3); my((e.clientY - r.top - r.height / 2) * .4); });
      el.addEventListener('pointerleave', () => { mx(0); my(0); });
    });
  }

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
  addEventListener('load', () => ScrollTrigger.refresh());

  // si llega con #ancla, baja a esa sección cuando ya está todo medido
  if (location.hash.length > 1) {
    const t = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (t) { autoplay = false; addEventListener('load', () => setTimeout(() => { ScrollTrigger.refresh(); window.scrollTo(0, t.getBoundingClientRect().top + scrollY - top.offsetHeight + 1); if (lenis) lenis.scrollTo(scrollY, { immediate: true }); }, 120)); }
  }

  /* ---------- recorrido automático ----------
     Baja sola desde que abre. Cualquier toque, clic, rueda o tecla la pausa
     y sigue después de 1 segundo sin interacción. Termina en el contacto. */
  (function play({ endEl, chip, delay }) {
    if (!autoplay || !endEl || !chip || /[?&]noauto/.test(location.search)) { if (chip) chip.remove(); return; }
    const label = chip.querySelector('[data-sx-state]'), barI = chip.querySelector('.sx-chip-bar i');
    const corto = matchMedia('(max-width:700px)');
    let acc = scrollY, last = 0, paused = true, done = false, timer = null;
    const endY = () => endEl.getBoundingClientRect().top + scrollY - top.offsetHeight;
    const ui = () => {
      chip.dataset.state = paused ? 'paused' : 'playing';
      label.textContent = paused ? (corto.matches ? 'Pausa' : 'En pausa · sigue en 1 s') : (corto.matches ? 'Bajando' : 'Reproduciendo · toca para pausar');
    };
    const evs = ['wheel', 'touchstart', 'touchmove', 'pointerdown', 'keydown'];
    const ir = y => { if (lenis) lenis.scrollTo(y, { immediate: true, force: true }); else window.scrollTo({ top: y, behavior: 'instant' }); };
    function stop() {
      if (done) return; done = true; clearTimeout(timer);
      evs.forEach(e => removeEventListener(e, interrupt));
      chip.classList.add('is-done'); setTimeout(() => chip.remove(), 700);
    }
    window.sxTour = { stop };   // el asistente lo detiene al abrirse
    function tick(t) {
      if (done) return;
      const target = endY();
      if (!paused) {
        const dt = last ? Math.min(100, t - last) : 16;
        acc += vh() * speed * dt / 1000;
        if (acc >= target) { ir(target); stop(); return; }
        ir(Math.round(acc));
      }
      last = t;
      barI.style.transform = `scaleX(${Math.min(1, Math.max(0, scrollY / Math.max(1, target)))})`;
      requestAnimationFrame(tick);
    }
    function interrupt() {
      if (done) return;
      paused = true; last = 0; ui();
      clearTimeout(timer); timer = setTimeout(resume, 1000);
    }
    function resume() {
      if (done) return;
      if (scrollY >= endY() - 4) { stop(); return; }
      acc = scrollY; paused = false; last = 0; ui();
    }
    evs.forEach(e => addEventListener(e, interrupt, { passive: true }));
    document.addEventListener('visibilitychange', () => { if (document.hidden) interrupt(); });
    addEventListener('scroll', () => { if (!done && paused && scrollY >= endY() - 4) stop(); }, { passive: true });
    chip.querySelector('.sx-skip').addEventListener('click', e => { e.preventDefault(); stop(); goTo(endEl); });
    if (corto.matches) label.textContent = 'Bajando';
    chip.dataset.state = 'playing';
    timer = setTimeout(resume, delay);
    requestAnimationFrame(tick);
  })({ endEl: $(end), chip: $('.sx-chip'), delay: 2400 });
};
