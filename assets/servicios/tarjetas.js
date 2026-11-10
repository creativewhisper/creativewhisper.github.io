/* Creative Whisper · Servicios en video para cotizaciones y páginas (v2: tarjetas tipo reel).
   Uso:
     <div data-cw-servicios></div>
     <script src="https://creativewhisper.github.io/assets/servicios/tarjetas.js" defer></script>
   Opciones del <div>:
     data-lang="es|en"          idioma (por defecto, el de la página)
     data-solo="whatsapp,escucha,automotriz,meta-ads"   solo esos servicios o grupos de video
                                (grupos: whatsapp, escucha, contenido, web, produccion, automotriz)
     data-titulo="..." | "no"   título propio, o sin título
     data-tema="claro"          para fondos claros
   Cada tarjeta muestra el cuadro real de su servicio; al pasar el mouse se mueve sin sonido
   y al tocarla abre el video grande, en el segundo de ese servicio, con sus capítulos.
   Los títulos toman la letra del último h1/h2 de la página antes de la sección. */
(function () {
  var D = {"videos":{"01":{"slug":"whatsapp","es":"Asistente de WhatsApp con IA","en":"AI WhatsApp assistant","dur":{"es":25.83,"en":24.79}},"02":{"slug":"escucha","es":"Escucha digital y tableros","en":"Social listening and dashboards","dur":{"es":22.25,"en":21.44}},"03":{"slug":"contenido","es":"Contenido y community manager con IA","en":"Content and AI community manager","dur":{"es":25.17,"en":22.59}},"04":{"slug":"web","es":"Web interactiva con asistente","en":"Interactive website with assistant","dur":{"es":23.96,"en":20.95}},"05":{"slug":"produccion","es":"Producción audiovisual","en":"Video production","dur":{"es":25.17,"en":24.55}},"06":{"slug":"automotriz","es":"Car edit y fotografía automotriz","en":"Car edits and automotive photography","dur":{"es":25.54,"en":24.3}}},"servicios":[{"id":"analisis-datos","area":1,"v":"02","t":{"es":12.23,"en":12.11},"es":"Análisis de datos y tableros","en":"Data analysis and dashboards","m":1},{"id":"conversaciones","area":1,"v":"02","t":{"es":0,"en":0},"es":"Análisis de conversaciones","en":"Conversation analysis","m":1},{"id":"video-marca","area":2,"v":"05","t":{"es":3.83,"en":3.55},"es":"Video de marca","en":"Brand video","m":0},{"id":"vertical","area":2,"v":"03","t":{"es":6.09,"en":5.55},"es":"Contenido vertical","en":"Vertical content","m":0},{"id":"testimonios","area":2,"v":"05","t":{"es":4.93,"en":4.67},"es":"Testimonios y casos","en":"Testimonials and case studies","m":0},{"id":"corporativo","area":2,"v":"05","t":{"es":5.73,"en":5.53},"es":"Video corporativo B2B","en":"B2B corporate video","m":0},{"id":"cortometrajes","area":2,"v":"05","t":{"es":6.89,"en":6.59},"es":"Cortometrajes y branded content","en":"Short films and branded content","m":0},{"id":"eventos","area":2,"v":"05","t":{"es":7.77,"en":7.43},"es":"Cobertura de eventos","en":"Event coverage","m":0},{"id":"fotografia","area":2,"v":"06","t":{"es":9.01,"en":7.91},"es":"Fotografía de producto","en":"Product photography","m":0},{"id":"car-edit","area":2,"v":"06","t":{"es":2.85,"en":2.67},"es":"Car edit","en":"Car edits","m":0},{"id":"actores","area":2,"v":"05","t":{"es":9.39,"en":8.57},"es":"Actores y creadores","en":"Actors and creators","m":0},{"id":"doblaje","area":2,"v":"05","t":{"es":10.63,"en":10.07},"es":"Doblaje, locución y ADR","en":"Dubbing, voice-over and ADR","m":0},{"id":"meta-ads","area":3,"v":"03","t":{"es":9.47,"en":8.61},"es":"Campañas en Meta Ads","en":"Meta Ads campaigns","m":1},{"id":"instagram","area":3,"v":"03","t":{"es":3.57,"en":3.65},"es":"Diseño para Instagram","en":"Instagram design","m":1},{"id":"web-pedidos","area":3,"v":"04","t":{"es":7.01,"en":6.55},"es":"Sitios web con pedido por WhatsApp","en":"Websites with WhatsApp ordering","m":0},{"id":"web-interactiva","area":3,"v":"04","t":{"es":2.83,"en":2.39},"es":"Páginas web interactivas","en":"Interactive websites","m":0},{"id":"whatsapp","area":4,"v":"01","t":{"es":0,"en":0},"es":"Automatización de WhatsApp","en":"WhatsApp automation","m":1},{"id":"asistente-web","area":4,"v":"04","t":{"es":9.89,"en":9.11},"es":"Asistente en vivo para su sitio web","en":"Live assistant for your website","m":1},{"id":"cm-ia","area":4,"v":"03","t":{"es":13.99,"en":12.59},"es":"Community manager con IA","en":"AI community manager","m":1}]};
  var TH = {"analisis-datos":{"es":14.23,"en":14.11},"conversaciones":{"es":8.0,"en":8.0},"video-marca":{"es":5.03,"en":4.75},"vertical":{"es":7.29,"en":6.75},"testimonios":{"es":5.6,"en":5.4},"corporativo":{"es":6.93,"en":6.73},"cortometrajes":{"es":7.79,"en":7.09},"eventos":{"es":8.97,"en":8.63},"fotografia":{"es":10.21,"en":9.11},"car-edit":{"es":4.85,"en":4.67},"actores":{"es":10.59,"en":9.77},"doblaje":{"es":11.83,"en":11.27},"meta-ads":{"es":12.27,"en":11.41},"instagram":{"es":5.57,"en":5.65},"web-pedidos":{"es":9.01,"en":8.55},"web-interactiva":{"es":4.03,"en":3.59},"whatsapp":{"es":7.0,"en":7.0},"asistente-web":{"es":11.89,"en":11.11},"cm-ia":{"es":15.99,"en":14.59}};   // second of each thumbnail, so the hover preview starts on the same frame
  var SRC = (document.currentScript && document.currentScript.src) || 'https://creativewhisper.github.io/assets/servicios/tarjetas.js';
  var BASE = SRC.replace(/[?#].*$/, '').replace(/[^\/]*$/, '');
  var AREAS = {
    1: { c: '#F5A300', es: 'Entender', en: 'Understand' },
    2: { c: '#E3120B', es: 'Crear', en: 'Create' },
    3: { c: '#FFD7BD', es: 'Publicar', en: 'Publish' },
    4: { c: '#3EA398', es: 'Atender', en: 'Respond' } };
  var TX = {
    es: { tit: 'Servicios en video', hint: 'Toque un servicio para verlo en acción', men: 'Mensual', cerrar: 'Cerrar', cap: 'En este video', ant: 'Anterior', sig: 'Siguiente', son: 'Activar sonido', mute: 'Silenciar', play: 'Reproducir', n: function (k) { return k + (k === 1 ? ' servicio' : ' servicios'); } },
    en: { tit: 'Services on video', hint: 'Tap a service to see it in action', men: 'Monthly', cerrar: 'Close', cap: 'In this video', ant: 'Previous', sig: 'Next', son: 'Sound on', mute: 'Mute', play: 'Play', n: function (k) { return k + (k === 1 ? ' service' : ' services'); } } };
  var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var HOVER = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;
  var CSS = '' +
    '.cwsv{--sv-line:rgba(236,230,219,.16);--sv-glass:rgba(236,230,219,.07);font-family:inherit;color:inherit;margin:0 auto;max-width:1180px;position:relative}' +
    '.cwsv[data-tema=claro]{--sv-line:rgba(10,9,8,.16);--sv-glass:rgba(10,9,8,.05)}' +
    '.cwsv-hd{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:14px 24px;margin-bottom:22px}' +
    '.cwsv-ey{display:block;font-size:12px;font-weight:600;letter-spacing:.2em;text-transform:uppercase;opacity:.62;margin-bottom:10px}' +
    '.cwsv-tt{margin:0;font-size:clamp(30px,4.2vw,54px);line-height:.98}' +
    '.cwsv-hr{display:flex;align-items:center;gap:14px}' +
    '.cwsv-hint{font-size:13px;opacity:.62}' +
    '.cwsv-nav{display:flex;gap:8px}' +
    '.cwsv-nav button{all:unset;box-sizing:border-box;cursor:pointer;width:42px;height:42px;border-radius:50%;border:1px solid var(--sv-line);display:grid;place-items:center;transition:background .2s,opacity .2s,border-color .2s}' +
    '.cwsv-nav button:hover{background:var(--sv-glass);border-color:currentColor}' +
    '.cwsv-nav button[disabled]{opacity:.28;cursor:default;background:none;border-color:var(--sv-line)}' +
    '.cwsv-nav svg{width:16px;height:16px}@media (hover:none){.cwsv-nav{display:none!important}}' +
    '.cwsv-shelf{display:flex;gap:16px;overflow-x:auto;overscroll-behavior-x:contain;scroll-snap-type:x mandatory;scroll-padding:0 2px;padding:6px 2px 18px;margin:0 -2px;scrollbar-width:none;-webkit-overflow-scrolling:touch}' +
    '.cwsv-shelf::-webkit-scrollbar{display:none}' +
    '.cwsv-fade{-webkit-mask-image:linear-gradient(90deg,#000 calc(100% - 70px),transparent);mask-image:linear-gradient(90deg,#000 calc(100% - 70px),transparent)}' +
    '.cwsv-fade.mid{-webkit-mask-image:linear-gradient(90deg,transparent,#000 70px,#000 calc(100% - 70px),transparent);mask-image:linear-gradient(90deg,transparent,#000 70px,#000 calc(100% - 70px),transparent)}' +
    '.cwsv-fade.end{-webkit-mask-image:linear-gradient(90deg,transparent,#000 70px);mask-image:linear-gradient(90deg,transparent,#000 70px)}' +
    '.cwsv-card{all:unset;box-sizing:border-box;cursor:pointer;flex:none;width:clamp(150px,16.5vw,198px);scroll-snap-align:start;display:flex;flex-direction:column;gap:12px;opacity:0;transform:translateY(18px);transition:opacity .6s cubic-bezier(.2,.7,.2,1),transform .6s cubic-bezier(.2,.7,.2,1);transition-delay:calc(var(--i) * 70ms)}' +
    '.cwsv.in .cwsv-card{opacity:1;transform:none}' +
    '.cwsv-th{position:relative;aspect-ratio:9/16;border-radius:18px;overflow:hidden;background:#0A0908;box-shadow:0 1px 0 var(--sv-line),0 18px 40px -18px rgba(0,0,0,.7);transform:translateZ(0);transition:transform .45s cubic-bezier(.2,.7,.2,1),box-shadow .45s}' +
    '.cwsv-th img,.cwsv-th video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}' +
    '.cwsv-th video{opacity:0;transition:opacity .35s}.cwsv-th video.on{opacity:1}' +
    '.cwsv-th:after{content:"";position:absolute;inset:0;border-radius:inherit;box-shadow:inset 0 0 0 1px rgba(255,255,255,.08);pointer-events:none}' +
    '.cwsv-pl{position:absolute;left:50%;top:58%;width:54px;height:54px;margin:-27px 0 0 -27px;border-radius:50%;background:rgba(10,9,8,.42);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.35);display:grid;place-items:center;opacity:0;transform:scale(.8);transition:opacity .3s,transform .3s}' +
    '.cwsv-pl:after{content:"";margin-left:4px;border-left:15px solid #fff;border-top:9px solid transparent;border-bottom:9px solid transparent}' +
    '.cwsv-card:hover .cwsv-th,.cwsv-card:focus-visible .cwsv-th{transform:translateY(-6px);box-shadow:0 0 0 2px var(--c),0 28px 50px -20px rgba(0,0,0,.8)}' +
    '.cwsv-card:hover .cwsv-pl,.cwsv-card:focus-visible .cwsv-pl{opacity:1;transform:none}' +
    '@media (hover:none){.cwsv-pl{opacity:.9;transform:none;width:44px;height:44px;margin:-22px 0 0 -22px}.cwsv-pl:after{border-left-width:12px;border-top-width:7px;border-bottom-width:7px}}' +
    '.cwsv-nm{font-size:15.5px;font-weight:600;line-height:1.25}' +
    '.cwsv-mt{display:flex;align-items:center;flex-wrap:wrap;gap:6px 8px;margin-top:6px;font-size:11px;font-weight:600;letter-spacing:.14em;text-transform:uppercase}' +
    '.cwsv-mt i{width:16px;height:6px;border-radius:2px;background:var(--c);transform:skewX(-12deg);display:block}' +
    '.cwsv-mt span{opacity:.6}' +
    '.cwsv-mb{position:absolute;left:10px;bottom:10px;z-index:1;display:flex;align-items:center;gap:6px;padding:6px 9px 6px 8px;border-radius:999px;background:rgba(10,9,8,.62);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);color:#F6EFE4;font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;line-height:1}' +
    '.cwsv-mb:before{content:"";width:7px;height:7px;border-radius:50%;background:var(--c);box-shadow:0 0 0 3px rgba(255,255,255,.08)}' +
    /* modal */
    '.cwsv-md{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:3vh 4vw;background:rgba(6,7,10,.84);-webkit-backdrop-filter:blur(18px) saturate(1.15);backdrop-filter:blur(18px) saturate(1.15);opacity:0;transition:opacity .3s;color:#F6EFE4;font-family:inherit}' +
    '.cwsv-md[hidden]{display:none}.cwsv-md.on{opacity:1}' +
    '.cwsv-st{display:flex;align-items:center;gap:clamp(24px,4vw,56px);max-width:100%;transform:translateY(16px) scale(.98);transition:transform .45s cubic-bezier(.2,.7,.2,1)}' +
    '.cwsv-md.on .cwsv-st{transform:none}' +
    '.cwsv-ph{position:relative;flex:none;height:min(88vh,820px);aspect-ratio:9/16;border-radius:26px;overflow:hidden;background:#0A0908;box-shadow:0 40px 120px -20px rgba(0,0,0,.75),0 0 0 1px rgba(255,255,255,.08)}' +
    '.cwsv-ph video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;cursor:pointer}' +
    '.cwsv-sg{position:absolute;left:12px;right:12px;top:12px;display:flex;gap:4px;z-index:2}' +
    '.cwsv-sg button{all:unset;cursor:pointer;flex:var(--w) 1 0;height:16px;display:flex;align-items:center}' +
    '.cwsv-sg button span{display:block;width:100%;height:3px;border-radius:3px;background:rgba(255,255,255,.32);overflow:hidden}' +
    '.cwsv-sg button span:after{content:"";display:block;height:100%;width:calc(var(--p,0) * 100%);background:#fff;border-radius:inherit}' +
    '.cwsv-big{position:absolute;left:50%;top:50%;width:76px;height:76px;margin:-38px 0 0 -38px;border-radius:50%;background:rgba(10,9,8,.45);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.35);display:grid;place-items:center;pointer-events:none;opacity:0;transform:scale(.85);transition:opacity .25s,transform .25s;z-index:2}' +
    '.cwsv-big:after{content:"";margin-left:6px;border-left:22px solid #fff;border-top:13px solid transparent;border-bottom:13px solid transparent}' +
    '.cwsv-ph.paused .cwsv-big{opacity:1;transform:none}' +
    '.cwsv-snd{all:unset;cursor:pointer;position:absolute;right:12px;bottom:12px;z-index:2;width:40px;height:40px;border-radius:50%;background:rgba(10,9,8,.5);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);display:grid;place-items:center}' +
    '.cwsv-snd svg{width:18px;height:18px}' +
    '.cwsv-pn{width:min(340px,30vw)}' +
    '.cwsv-pn .cwsv-mt{margin:0 0 12px}' +
    '.cwsv-pn h3{margin:0 0 24px;font-size:clamp(28px,2.8vw,40px);line-height:1}' +
    '.cwsv-pn p{margin:0 0 10px;font-size:11px;font-weight:600;letter-spacing:.2em;text-transform:uppercase;opacity:.55}' +
    '.cwsv-ch{display:flex;flex-direction:column;gap:2px;counter-reset:ch}' +
    '.cwsv-ch button{all:unset;box-sizing:border-box;cursor:pointer;position:relative;display:flex;align-items:center;gap:12px;padding:11px 12px 11px 14px;border-radius:12px;font-size:15px;line-height:1.25;opacity:.62;transition:opacity .2s,background .2s}' +
    '.cwsv-ch button:before{counter-increment:ch;content:counter(ch,decimal-leading-zero);font-size:11px;font-weight:600;letter-spacing:.1em;opacity:.7;min-width:18px}' +
    '.cwsv-ch button:hover{opacity:.9;background:rgba(255,255,255,.05)}' +
    '.cwsv-ch button.on{opacity:1;background:rgba(255,255,255,.08);font-weight:600}' +
    '.cwsv-ch button.on:after{content:"";position:absolute;left:0;top:10px;bottom:10px;width:3px;border-radius:3px;background:var(--c)}' +
    '.cwsv-ch em{margin-left:auto;font-style:normal;font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;padding:3px 7px;border-radius:999px;background:var(--c);color:#0A0908}' +
    '.cwsv-x{all:unset;cursor:pointer;position:fixed;top:18px;right:18px;z-index:3;width:46px;height:46px;border-radius:50%;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.22);display:grid;place-items:center;transition:background .2s}' +
    '.cwsv-x:hover{background:rgba(255,255,255,.2)}.cwsv-x svg{width:18px;height:18px}' +
    '.cwsv-md :focus-visible,.cwsv :focus-visible{outline:2px solid currentColor;outline-offset:3px}' +
    '@media (max-width:760px){.cwsv-md{padding:0;background:#0A0908}.cwsv-st{width:100%;height:100%}.cwsv-ph{height:100%;width:100%;aspect-ratio:auto;border-radius:0;box-shadow:none}.cwsv-ph video{object-fit:contain}.cwsv-pn{position:absolute;left:0;right:0;bottom:0;width:auto;padding:70px 0 calc(14px + env(safe-area-inset-bottom));background:linear-gradient(transparent,rgba(6,7,10,.88));pointer-events:none}' +
    '.cwsv-pn .cwsv-mt,.cwsv-pn h3,.cwsv-pn p{display:none}.cwsv-ch{flex-direction:row;overflow-x:auto;gap:8px;padding:0 14px;scrollbar-width:none;pointer-events:auto}.cwsv-ch::-webkit-scrollbar{display:none}' +
    '.cwsv-ch button{flex:none;padding:9px 13px;border-radius:999px;background:rgba(10,9,8,.55);border:1px solid rgba(255,255,255,.18);font-size:14px;opacity:.85}.cwsv-ch button:before{display:none}.cwsv-ch button.on{background:#F6EFE4;color:#0A0908;opacity:1}.cwsv-ch button.on:after{display:none}.cwsv-ch em{display:none}' +
    '.cwsv-snd{bottom:auto;top:30px;right:12px}.cwsv-x{top:30px;left:12px;right:auto;width:40px;height:40px;background:rgba(10,9,8,.5)}.cwsv-card{width:clamp(140px,42vw,180px)}.cwsv-hd{align-items:flex-start}}' +
    '@media (prefers-reduced-motion:reduce){.cwsv-card{opacity:1;transform:none;transition:none}.cwsv-th,.cwsv-st{transition:none}}' +
    '@media print{.cwsv-md{display:none!important}.cwsv-shelf{flex-wrap:wrap;overflow:visible}.cwsv-card{opacity:1;transform:none}.cwsv-nav,.cwsv-pl{display:none}}';
  var IC = {
    l: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3 5 8l5 5"/></svg>',
    r: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m6 3 5 5-5 5"/></svg>',
    x: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3.5 3.5l9 9M12.5 3.5l-9 9"/></svg>',
    on: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8v4h3l4 3.5v-11L6 8H3z" fill="currentColor"/><path d="M13.5 7.2a4 4 0 0 1 0 5.6M15.8 5a7 7 0 0 1 0 10"/></svg>',
    off: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8v4h3l4 3.5v-11L6 8H3z" fill="currentColor"/><path d="m13.5 7.5 5 5m0-5-5 5"/></svg>' };
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function vsrc(v, L) { return BASE + 'cw-' + v + '-' + D.videos[v].slug + '-' + L + '.mp4'; }
  function thumb(s, L) { return BASE + 'th/' + s.id + '-' + L + '.webp'; }
  function caps(v, L) {   // chapters of one video, sorted, each with its end
    var cs = D.servicios.filter(function (x) { return x.v === v; }).sort(function (a, b) { return a.t[L] - b.t[L]; });
    var dur = D.videos[v].dur[L];
    return cs.map(function (x, i) { var a = x.t[L], b = i + 1 < cs.length ? cs[i + 1].t[L] : dur; return { s: x, a: a, b: Math.max(b, a + .5) }; });
  }
  function headFont(box) {   // borrow the page's heading style so the section looks native
    var hs = document.querySelectorAll('h1,h2'), h = null;
    for (var i = 0; i < hs.length; i++) { if (box.contains(hs[i])) continue; if (hs[i].compareDocumentPosition(box) & 4) h = hs[i]; }
    h = h || hs[0]; if (!h) return '';
    var cs = getComputedStyle(h), ls = cs.letterSpacing, fs = parseFloat(cs.fontSize) || 16;
    if (/px$/.test(ls)) ls = (parseFloat(ls) / fs).toFixed(3) + 'em';
    return 'font-family:' + cs.fontFamily + ';font-weight:' + cs.fontWeight + ';text-transform:' + cs.textTransform + ';letter-spacing:' + (ls === 'normal' ? 'normal' : ls) + ';font-style:' + cs.fontStyle;
  }

  /* ---------- modal player (one per page) ---------- */
  var M = null;
  function modal() {
    if (M) return M;
    var md = el('div', 'cwsv-md'); md.hidden = true; md.setAttribute('role', 'dialog'); md.setAttribute('aria-modal', 'true');
    md.innerHTML = '<button class="cwsv-x" type="button">' + IC.x + '</button><div class="cwsv-st"><div class="cwsv-ph paused"><video playsinline preload="auto"></video><div class="cwsv-sg"></div><div class="cwsv-big"></div><button class="cwsv-snd" type="button"></button></div><div class="cwsv-pn"><div class="cwsv-mt"><i></i><span></span></div><h3></h3><p></p><div class="cwsv-ch"></div></div></div>';
    document.body.appendChild(md);
    M = { md: md, ph: md.querySelector('.cwsv-ph'), v: md.querySelector('video'), sg: md.querySelector('.cwsv-sg'), ch: md.querySelector('.cwsv-ch'), snd: md.querySelector('.cwsv-snd'), x: md.querySelector('.cwsv-x'), list: [], L: 'es', cur: '', back: null, raf: 0 };
    var v = M.v;
    function paint() {
      var t = v.currentTime || 0, act = -1;
      M.list.forEach(function (c, i) { var p = Math.min(1, Math.max(0, (t - c.a) / (c.b - c.a))); c.seg.style.setProperty('--p', p.toFixed(4)); if (t >= c.a - .05 && t < c.b - .05) act = i; });
      if (act < 0 && M.list.length) act = t >= M.list[M.list.length - 1].a ? M.list.length - 1 : 0;
      M.list.forEach(function (c, i) { c.btn.classList.toggle('on', i === act); });
      if (act !== M.act && act >= 0) { M.act = act; var b = M.list[act].btn; if (b.scrollIntoView && innerWidth <= 760) b.scrollIntoView({ block: 'nearest', inline: 'center', behavior: RM ? 'auto' : 'smooth' }); }
      if (!v.paused) M.raf = requestAnimationFrame(paint);
    }
    M.paint = paint;
    v.addEventListener('play', function () { M.ph.classList.remove('paused'); cancelAnimationFrame(M.raf); M.raf = requestAnimationFrame(paint); });
    v.addEventListener('pause', function () { M.ph.classList.add('paused'); paint(); });
    v.addEventListener('ended', function () { M.ph.classList.add('paused'); });
    v.addEventListener('seeked', paint);
    v.addEventListener('click', function () { if (v.paused) { if (v.ended) v.currentTime = 0; v.play().catch(function () {}); } else v.pause(); });
    function sndIcon() { M.snd.innerHTML = v.muted ? IC.off : IC.on; M.snd.setAttribute('aria-label', v.muted ? TX[M.L].son : TX[M.L].mute); }
    M.sndIcon = sndIcon;
    M.snd.onclick = function () { v.muted = !v.muted; sndIcon(); };
    M.x.onclick = close;
    md.addEventListener('click', function (e) { if (e.target === md || e.target.classList.contains('cwsv-st')) close(); });
    document.addEventListener('keydown', function (e) {
      if (md.hidden) return;
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { var i = Math.max(0, M.act || 0) + (e.key === 'ArrowRight' ? 1 : -1); if (M.list[i]) { e.preventDefault(); seek(M.list[i].a); } }
      else if (e.key === ' ' && e.target.tagName !== 'BUTTON') { e.preventDefault(); v.click(); }
      else if (e.key === 'Tab') {   // keep focus inside
        var f = [].slice.call(md.querySelectorAll('button')).filter(function (b) { return b.offsetParent; }); if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    });
    return M;
  }
  function seek(t) {
    var v = M.v;
    var go = function () { try { v.currentTime = t; } catch (e) {} var p = v.play(); if (p && p.catch) p.catch(function () { v.muted = true; M.sndIcon(); v.play().catch(function () {}); }); M.paint(); };
    if (v.readyState >= 1) go(); else v.addEventListener('loadedmetadata', go, { once: true });
  }
  function open(s, L, from) {
    modal(); M.L = L; M.back = from; M.act = -1;
    var T = TX[L], A = AREAS[s.area], V = D.videos[s.v], src = vsrc(s.v, L);
    M.md.style.setProperty('--c', A.c);
    M.md.setAttribute('aria-label', V[L]);
    M.x.setAttribute('aria-label', T.cerrar);
    M.md.querySelector('.cwsv-mt span').textContent = A[L];
    var h3 = M.md.querySelector('h3'); h3.textContent = V[L]; h3.setAttribute('style', from && from.__hf || '');
    M.md.querySelector('.cwsv-pn p').textContent = T.cap;
    M.sg.innerHTML = ''; M.ch.innerHTML = ''; M.list = caps(s.v, L);
    M.list.forEach(function (c) {
      var seg = el('button', '', '<span></span>'); seg.type = 'button'; seg.style.setProperty('--w', (c.b - c.a).toFixed(2)); seg.setAttribute('aria-label', c.s[L]);
      seg.onclick = function () { seek(c.a); }; M.sg.appendChild(seg); c.seg = seg.firstChild;
      var b = el('button', ''); b.type = 'button'; b.textContent = c.s[L]; b.style.setProperty('--c', AREAS[c.s.area].c);
      if (c.s.m) { var em = el('em'); em.textContent = T.men; b.appendChild(em); }
      b.onclick = function () { seek(c.a); }; M.ch.appendChild(b); c.btn = b;
    });
    var v = M.v; v.muted = false; M.sndIcon();
    if (M.cur !== src) { v.poster = thumb(s, L); v.src = src; M.cur = src; v.load(); }
    M.md.hidden = false; document.documentElement.style.overflow = 'hidden';
    requestAnimationFrame(function () { M.md.classList.add('on'); });
    seek(s.t[L]);
    setTimeout(function () { M.x.focus({ preventScroll: true }); }, 30);
  }
  function close() {
    if (!M || M.md.hidden) return;
    M.v.pause(); M.md.classList.remove('on'); document.documentElement.style.overflow = '';
    setTimeout(function () { M.md.hidden = true; }, RM ? 0 : 280);
    if (M.back) M.back.focus({ preventScroll: true });
  }

  /* ---------- shelf ---------- */
  function build(box) {
    if (box.__cwsv) return; box.__cwsv = 1;
    var L = (box.getAttribute('data-lang') || document.documentElement.lang || 'es').slice(0, 2) === 'en' ? 'en' : 'es';
    var T = TX[L], hf = headFont(box);
    var solo = (box.getAttribute('data-solo') || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    var lista = D.servicios.filter(function (s) { return !solo.length || solo.indexOf(s.id) >= 0 || solo.indexOf(D.videos[s.v].slug) >= 0; })
      .sort(function (a, b) { return a.area - b.area; });
    var root = el('div', 'cwsv'); if (box.getAttribute('data-tema')) root.setAttribute('data-tema', box.getAttribute('data-tema'));
    var ttl = box.getAttribute('data-titulo');
    var hd = el('div', 'cwsv-hd');
    var left = el('div');
    if (ttl !== 'no') { var ey = el('span', 'cwsv-ey'); ey.textContent = T.n(lista.length) + ' · Creative Whisper'; left.appendChild(ey); var h = el('h3', 'cwsv-tt'); h.setAttribute('style', hf); h.textContent = ttl || T.tit; left.appendChild(h); }
    var right = el('div', 'cwsv-hr'); var hint = el('span', 'cwsv-hint'); hint.textContent = T.hint; right.appendChild(hint);
    var nav = el('div', 'cwsv-nav', '<button type="button" aria-label="' + T.ant + '">' + IC.l + '</button><button type="button" aria-label="' + T.sig + '">' + IC.r + '</button>');
    right.appendChild(nav); hd.appendChild(left); hd.appendChild(right); root.appendChild(hd);
    var shelf = el('div', 'cwsv-shelf'); root.appendChild(shelf);
    var pv = null, pvCard = null, pvEnd = 0;   // one shared hover preview per shelf
    function stopPv() { if (pv) { pv.pause(); pv.classList.remove('on'); } pvCard = null; }
    lista.forEach(function (s, i) {
      var A = AREAS[s.area];
      var b = el('button', 'cwsv-card'); b.type = 'button'; b.style.setProperty('--c', A.c); b.style.setProperty('--i', i); b.__hf = hf;
      b.setAttribute('aria-label', s[L] + ' · ' + T.play);
      var th = el('span', 'cwsv-th'); var img = el('img'); img.alt = ''; img.loading = 'lazy'; img.decoding = 'async'; img.width = 360; img.height = 640; img.src = thumb(s, L);
      img.onerror = function () { img.onerror = null; img.src = BASE + 'cw-' + s.v + '-' + D.videos[s.v].slug + '-' + L + '.jpg'; };
      th.appendChild(img); th.appendChild(el('span', 'cwsv-pl'));
      if (s.m) { var mb = el('span', 'cwsv-mb'); mb.textContent = T.men; th.appendChild(mb); }
      b.appendChild(th);
      var tx = el('span'); var nm = el('span', 'cwsv-nm'); nm.textContent = s[L]; tx.appendChild(nm);
      var mt = el('span', 'cwsv-mt', '<i></i>'); var ar = el('span'); ar.textContent = A[L]; mt.appendChild(ar);
      tx.appendChild(mt); b.appendChild(tx);
      b.onclick = function () { stopPv(); open(s, L, b); };
      if (HOVER && !RM) {
        b.addEventListener('mouseenter', function () {
          if (!pv) { pv = el('video'); pv.muted = true; pv.playsInline = true; pv.setAttribute('muted', ''); pv.setAttribute('playsinline', ''); pv.preload = 'auto';
            pv.addEventListener('timeupdate', function () { if (pvCard && pv.currentTime >= pvEnd) pv.currentTime = pvCard.__t; });
            pv.addEventListener('playing', function () { if (pvCard) pv.classList.add('on'); }); }
          var c = caps(s.v, L).filter(function (k) { return k.s.id === s.id; })[0], t0 = (TH[s.id] || {})[L];
          if (t0 == null || t0 < s.t[L]) t0 = s.t[L];
          pvCard = b; b.__t = t0; pvEnd = Math.max(t0 + 2.5, Math.min(c ? c.b : t0 + 4, t0 + 5));
          pv.classList.remove('on'); th.insertBefore(pv, th.querySelector('.cwsv-pl'));
          var src = vsrc(s.v, L);
          var go = function () { if (pvCard !== b) return; try { pv.currentTime = t0; } catch (e) {} pv.play().catch(function () {}); };
          if (pv.__src !== src) { pv.__src = src; pv.src = src; pv.addEventListener('loadedmetadata', go, { once: true }); } else go();
        });
        b.addEventListener('mouseleave', function () { if (pvCard === b) stopPv(); });
      }
      shelf.appendChild(b);
    });
    var bl = nav.children[0], br = nav.children[1];
    function state() {
      var max = shelf.scrollWidth - shelf.clientWidth - 2, x = shelf.scrollLeft;
      var can = max > 4; nav.style.display = can ? '' : 'none';
      bl.disabled = x <= 2; br.disabled = x >= max;
      shelf.className = 'cwsv-shelf' + (can ? ' cwsv-fade' + (x <= 2 ? '' : x >= max ? ' end' : ' mid') : '');
    }
    function step(d) { var w = (shelf.querySelector('.cwsv-card') || {}).offsetWidth || 200; shelf.scrollBy({ left: d * Math.max(w + 16, shelf.clientWidth * .8), behavior: RM ? 'auto' : 'smooth' }); }
    bl.onclick = function () { step(-1); }; br.onclick = function () { step(1); };
    shelf.addEventListener('scroll', state, { passive: true }); addEventListener('resize', state);
    box.innerHTML = ''; box.appendChild(root); state(); setTimeout(state, 400);
    if (RM || !('IntersectionObserver' in window)) root.classList.add('in');
    else { var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { root.classList.add('in'); io.disconnect(); } }); }, { threshold: .15 }); io.observe(root); setTimeout(function () { root.classList.add('in'); }, 4000); }
  }
  function run() {
    if (!document.getElementById('cwsv-css')) { var st = document.createElement('style'); st.id = 'cwsv-css'; st.textContent = CSS; document.head.appendChild(st); }
    document.querySelectorAll('[data-cw-servicios]').forEach(build);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
  window.cwServicios = run;
})();
