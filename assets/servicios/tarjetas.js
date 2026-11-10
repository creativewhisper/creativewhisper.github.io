/* Creative Whisper · Servicios en video para cotizaciones y páginas.
   Uso:
     <div data-cw-servicios></div>
     <script src="https://creativewhisper.github.io/assets/servicios/tarjetas.js" defer></script>
   Opciones del <div>:
     data-lang="es|en"          idioma (por defecto, el de la página)
     data-solo="whatsapp,escucha,automotriz,meta-ads"   solo esos servicios o grupos de video
                                (grupos: whatsapp, escucha, contenido, web, produccion, automotriz)
     data-tema="claro"          para fondos claros
   Cada tarjeta abre el video de su grupo en el segundo donde aparece ese servicio. */
(function () {
  var D = {"videos": {"01": {"slug": "whatsapp", "es": "Asistente de WhatsApp con IA", "en": "AI WhatsApp assistant", "dur": {"es": 25.83, "en": 24.79}}, "02": {"slug": "escucha", "es": "Escucha digital y tableros", "en": "Social listening and dashboards", "dur": {"es": 22.25, "en": 21.44}}, "03": {"slug": "contenido", "es": "Contenido y community manager con IA", "en": "Content and AI community manager", "dur": {"es": 25.17, "en": 22.59}}, "04": {"slug": "web", "es": "Web interactiva con asistente", "en": "Interactive website with assistant", "dur": {"es": 23.96, "en": 20.95}}, "05": {"slug": "produccion", "es": "Producción audiovisual", "en": "Video production", "dur": {"es": 25.17, "en": 24.55}}, "06": {"slug": "automotriz", "es": "Car edit y fotografía automotriz", "en": "Car edits and automotive photography", "dur": {"es": 25.54, "en": 24.3}}}, "servicios": [{"id": "analisis-datos", "area": 1, "v": "02", "t": {"es": 12.23, "en": 12.11}, "es": "Análisis de datos y tableros", "en": "Data analysis and dashboards", "m": 1}, {"id": "conversaciones", "area": 1, "v": "02", "t": {"es": 0, "en": 0}, "es": "Análisis de conversaciones", "en": "Conversation analysis", "m": 1}, {"id": "video-marca", "area": 2, "v": "05", "t": {"es": 3.83, "en": 3.55}, "es": "Video de marca", "en": "Brand video", "m": 0}, {"id": "vertical", "area": 2, "v": "03", "t": {"es": 6.09, "en": 5.55}, "es": "Contenido vertical", "en": "Vertical content", "m": 0}, {"id": "testimonios", "area": 2, "v": "05", "t": {"es": 4.93, "en": 4.67}, "es": "Testimonios y casos", "en": "Testimonials and case studies", "m": 0}, {"id": "corporativo", "area": 2, "v": "05", "t": {"es": 5.73, "en": 5.53}, "es": "Video corporativo B2B", "en": "B2B corporate video", "m": 0}, {"id": "cortometrajes", "area": 2, "v": "05", "t": {"es": 6.89, "en": 6.59}, "es": "Cortometrajes y branded content", "en": "Short films and branded content", "m": 0}, {"id": "eventos", "area": 2, "v": "05", "t": {"es": 7.77, "en": 7.43}, "es": "Cobertura de eventos", "en": "Event coverage", "m": 0}, {"id": "fotografia", "area": 2, "v": "06", "t": {"es": 9.01, "en": 7.91}, "es": "Fotografía de producto", "en": "Product photography", "m": 0}, {"id": "car-edit", "area": 2, "v": "06", "t": {"es": 2.85, "en": 2.67}, "es": "Car edit", "en": "Car edits", "m": 0}, {"id": "actores", "area": 2, "v": "05", "t": {"es": 9.39, "en": 8.57}, "es": "Actores y creadores", "en": "Actors and creators", "m": 0}, {"id": "doblaje", "area": 2, "v": "05", "t": {"es": 10.63, "en": 10.07}, "es": "Doblaje, locución y ADR", "en": "Dubbing, voice-over and ADR", "m": 0}, {"id": "meta-ads", "area": 3, "v": "03", "t": {"es": 9.47, "en": 8.61}, "es": "Campañas en Meta Ads", "en": "Meta Ads campaigns", "m": 1}, {"id": "instagram", "area": 3, "v": "03", "t": {"es": 3.57, "en": 3.65}, "es": "Diseño para Instagram", "en": "Instagram design", "m": 1}, {"id": "web-pedidos", "area": 3, "v": "04", "t": {"es": 7.01, "en": 6.55}, "es": "Sitios web con pedido por WhatsApp", "en": "Websites with WhatsApp ordering", "m": 0}, {"id": "web-interactiva", "area": 3, "v": "04", "t": {"es": 2.83, "en": 2.39}, "es": "Páginas web interactivas", "en": "Interactive websites", "m": 0}, {"id": "whatsapp", "area": 4, "v": "01", "t": {"es": 0, "en": 0}, "es": "Automatización de WhatsApp", "en": "WhatsApp automation", "m": 1}, {"id": "asistente-web", "area": 4, "v": "04", "t": {"es": 9.89, "en": 9.11}, "es": "Asistente en vivo para su sitio web", "en": "Live assistant for your website", "m": 1}, {"id": "cm-ia", "area": 4, "v": "03", "t": {"es": 13.99, "en": 12.59}, "es": "Community manager con IA", "en": "AI community manager", "m": 1}]};
  var SRC = (document.currentScript && document.currentScript.src) || 'https://creativewhisper.github.io/assets/servicios/tarjetas.js';
  var BASE = SRC.replace(/[^\/]*$/, '');
  var AREAS = {
    1: { c: '#F5A300', ink: '#0A0908', es: '01 · Entender', en: '01 · Understand' },
    2: { c: '#E3120B', ink: '#F6EFE4', es: '02 · Crear', en: '02 · Create' },
    3: { c: '#FFD7BD', ink: '#0A0908', es: '03 · Publicar', en: '03 · Publish' },
    4: { c: '#3EA398', ink: '#0A0908', es: '04 · Atender', en: '04 · Respond' } };
  var TX = {
    es: { tit: 'Servicios en video', hint: 'Toque un servicio para ver cómo funciona.', ver: 'Ver video', men: 'Mensual', cerrar: 'Cerrar video', cap: 'En este video' },
    en: { tit: 'Services on video', hint: 'Tap a service to see how it works.', ver: 'Watch', men: 'Monthly', cerrar: 'Close video', cap: 'In this video' } };
  var CSS = '' +
    '.cwsv{--sv-line:rgba(236,230,219,.14);--sv-card:rgba(236,230,219,.045);--sv-card2:rgba(236,230,219,.09);--sv-txt:inherit;--sv-mute:rgba(236,230,219,.62);font-family:"Hanken Grotesk",system-ui,sans-serif;color:var(--sv-txt);margin:0 auto;max-width:1180px}' +
    '.cwsv[data-tema=claro]{--sv-line:rgba(10,9,8,.14);--sv-card:rgba(10,9,8,.035);--sv-card2:rgba(10,9,8,.07);--sv-mute:rgba(10,9,8,.6)}' +
    '.cwsv-hd{display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:8px 20px;margin-bottom:22px}' +
    '.cwsv-hd b{font:800 clamp(30px,4.4vw,56px)/.92 "Big Shoulders Display",Impact,sans-serif;text-transform:uppercase;letter-spacing:.01em}' +
    '.cwsv-hd span{font:500 12px/1.4 "IBM Plex Mono",ui-monospace,monospace;letter-spacing:.14em;text-transform:uppercase;color:var(--sv-mute)}' +
    '.cwsv-area{border-top:1px solid var(--sv-line);padding:18px 0 22px}' +
    '.cwsv-at{display:flex;align-items:center;gap:10px;font:500 12px/1 "IBM Plex Mono",ui-monospace,monospace;letter-spacing:.16em;text-transform:uppercase;margin-bottom:14px}' +
    '.cwsv-at i{width:22px;height:8px;border-radius:2px;background:var(--c);transform:skewX(-11deg);display:block}' +
    '.cwsv-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:10px}' +
    '.cwsv-card{all:unset;box-sizing:border-box;cursor:pointer;display:flex;align-items:center;gap:12px;min-height:64px;padding:12px 14px 12px 12px;border-radius:14px;background:var(--sv-card);border:1px solid var(--sv-line);transition:background .2s,border-color .2s,transform .2s}' +
    '.cwsv-card:hover{background:var(--sv-card2);transform:translateY(-1px)}' +
    '.cwsv-card:focus-visible{outline:2px solid var(--c);outline-offset:2px}' +
    '.cwsv-card[aria-expanded=true]{border-color:var(--c);background:var(--sv-card2)}' +
    '.cwsv-pl{flex:none;width:38px;height:38px;border-radius:50%;background:var(--c);display:flex;align-items:center;justify-content:center}' +
    '.cwsv-pl:after{content:"";margin-left:3px;border-left:11px solid var(--ink);border-top:7px solid transparent;border-bottom:7px solid transparent}' +
    '.cwsv-nm{flex:1;font:600 15.5px/1.25 "Hanken Grotesk",system-ui,sans-serif}' +
    '.cwsv-nm small{display:block;font:500 11px/1.4 "IBM Plex Mono",ui-monospace,monospace;letter-spacing:.1em;text-transform:uppercase;color:var(--sv-mute);margin-top:3px}' +
    '.cwsv-mb{flex:none;font:600 10.5px/1 "IBM Plex Mono",ui-monospace,monospace;letter-spacing:.1em;text-transform:uppercase;padding:6px 7px;border-radius:6px;background:var(--c);color:var(--ink)}' +
    '.cwsv-player{display:grid;grid-template-columns:minmax(0,360px) minmax(0,1fr);gap:22px;align-items:start;margin-top:14px;padding:16px;border-radius:18px;background:var(--sv-card);border:1px solid var(--sv-line)}' +
    '.cwsv-player[hidden]{display:none}' +
    '.cwsv-vw{position:relative;aspect-ratio:9/16;max-height:78vh;border-radius:14px;overflow:hidden;background:#0A0908}' +
    '.cwsv-vw video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}' +
    '.cwsv-side h4{margin:4px 0 6px;font:800 clamp(24px,3vw,36px)/.95 "Big Shoulders Display",Impact,sans-serif;text-transform:uppercase}' +
    '.cwsv-side p{margin:0 0 14px;font:500 11.5px/1.4 "IBM Plex Mono",ui-monospace,monospace;letter-spacing:.12em;text-transform:uppercase;color:var(--sv-mute)}' +
    '.cwsv-ch{display:flex;flex-wrap:wrap;gap:8px}' +
    '.cwsv-ch button{all:unset;cursor:pointer;box-sizing:border-box;font:500 14px/1.2 "Hanken Grotesk",system-ui,sans-serif;padding:9px 12px;border-radius:999px;border:1px solid var(--sv-line);display:inline-flex;gap:8px;align-items:center}' +
    '.cwsv-ch button em{font:500 11px/1 "IBM Plex Mono",ui-monospace,monospace;font-style:normal;color:var(--sv-mute)}' +
    '.cwsv-ch button.on{background:var(--c);color:var(--ink);border-color:var(--c)}.cwsv-ch button.on em{color:inherit;opacity:.7}' +
    '.cwsv-x{all:unset;cursor:pointer;margin-top:16px;font:500 12px/1 "IBM Plex Mono",ui-monospace,monospace;letter-spacing:.12em;text-transform:uppercase;color:var(--sv-mute);border-bottom:1px solid currentColor;padding-bottom:3px}' +
    '@media (max-width:700px){.cwsv-player{grid-template-columns:1fr;padding:12px}.cwsv-vw{max-height:none;width:100%;max-width:420px;margin:0 auto}.cwsv-grid{grid-template-columns:1fr}}' +
    '@media print{.cwsv-player{display:none!important}.cwsv-pl{display:none}}';
  function mmss(t) { t = Math.max(0, Math.round(t)); return Math.floor(t / 60) + ':' + ('0' + (t % 60)).slice(-2); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function build(box) {
    if (box.__cwsv) return; box.__cwsv = 1;
    var L = (box.getAttribute('data-lang') || document.documentElement.lang || 'es').slice(0, 2) === 'en' ? 'en' : 'es';
    var T = TX[L];
    var solo = (box.getAttribute('data-solo') || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    var lista = D.servicios.filter(function (s) { return !solo.length || solo.indexOf(s.id) >= 0 || solo.indexOf(D.videos[s.v].slug) >= 0; });
    var root = el('div', 'cwsv'); if (box.getAttribute('data-tema')) root.setAttribute('data-tema', box.getAttribute('data-tema'));
    if (box.getAttribute('data-titulo') !== 'no') root.appendChild(el('div', 'cwsv-hd', '<b>' + (box.getAttribute('data-titulo') || T.tit) + '</b><span>' + T.hint + '</span>'));
    [1, 2, 3, 4].forEach(function (a) {
      var sv = lista.filter(function (s) { return s.area === a; }); if (!sv.length) return;
      var A = AREAS[a], sec = el('div', 'cwsv-area'); sec.style.setProperty('--c', A.c); sec.style.setProperty('--ink', A.ink);
      sec.appendChild(el('div', 'cwsv-at', '<i></i>' + A[L]));
      var grid = el('div', 'cwsv-grid'); sec.appendChild(grid);
      var pl = el('div', 'cwsv-player'); pl.hidden = true;
      pl.innerHTML = '<div class="cwsv-vw"><video playsinline controls preload="none"></video></div><div class="cwsv-side"><p></p><h4></h4><div class="cwsv-ch"></div><button class="cwsv-x" type="button">' + T.cerrar + '</button></div>';
      sec.appendChild(pl);
      var vid = pl.querySelector('video'), cur = null;
      function abrir(s, btn) {
        var V = D.videos[s.v], src = BASE + 'cw-' + s.v + '-' + V.slug + '-' + L + '.mp4';
        grid.querySelectorAll('.cwsv-card').forEach(function (b) { b.setAttribute('aria-expanded', String(b === btn)); });
        pl.hidden = false;
        pl.querySelector('p').textContent = T.cap + ' · ' + mmss(V.dur[L]);
        pl.querySelector('h4').textContent = V[L];
        var ch = pl.querySelector('.cwsv-ch'); ch.innerHTML = '';
        D.servicios.filter(function (x) { return x.v === s.v; }).forEach(function (x) {
          var b = el('button', x.id === s.id ? 'on' : '', x[L] + ' <em>' + mmss(x.t[L]) + '</em>'); b.type = 'button';
          b.onclick = function () { ch.querySelectorAll('button').forEach(function (k) { k.classList.toggle('on', k === b); }); ir(x.t[L]); };
          ch.appendChild(b);
        });
        if (cur !== src) { vid.poster = BASE + 'cw-' + s.v + '-' + V.slug + '-' + L + '.jpg'; vid.src = src; cur = src; }
        ir(s.t[L]);
        var r = pl.getBoundingClientRect(); if (r.top < 60 || r.top > innerHeight * .55) pl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      function ir(t) {
        var go = function () { try { vid.currentTime = t; } catch (e) {} var p = vid.play(); if (p && p.catch) p.catch(function () {}); };
        if (vid.readyState >= 1) go(); else { vid.preload = 'auto'; vid.addEventListener('loadedmetadata', go, { once: true }); vid.load(); }
      }
      pl.querySelector('.cwsv-x').onclick = function () { vid.pause(); pl.hidden = true; grid.querySelectorAll('.cwsv-card').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); }); };
      sv.forEach(function (s) {
        var b = el('button', 'cwsv-card', '<span class="cwsv-pl" aria-hidden="true"></span><span class="cwsv-nm">' + s[L] + '<small>' + T.ver + ' · ' + mmss(s.t[L]) + '</small></span>' + (s.m ? '<span class="cwsv-mb">' + T.men + '</span>' : ''));
        b.type = 'button'; b.setAttribute('aria-expanded', 'false');
        b.onclick = function () { abrir(s, b); };
        grid.appendChild(b);
      });
      root.appendChild(sec);
    });
    box.innerHTML = ''; box.appendChild(root);
  }
  function run() {
    if (!document.getElementById('cwsv-css')) { var st = document.createElement('style'); st.id = 'cwsv-css'; st.textContent = CSS; document.head.appendChild(st); }
    document.querySelectorAll('[data-cw-servicios]').forEach(build);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
  window.cwServicios = run;
})();
