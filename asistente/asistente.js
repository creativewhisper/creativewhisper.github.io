/* Asistente de chat y voz para las webs de Creative Whisper y sus marcas.
   Es el mismo de las cotizaciones: al primer toque pide el micrófono y conversa por voz (ElevenLabs);
   si no hay micrófono o la persona prefiere, sigue por escrito. Mientras conversa, lleva la página a la
   parte de la que habla y la resalta. Cuelga solo cuando la persona se despide.

   Uso en cada web (antes de cerrar </body>):
     <script>window.CW_ASISTENTE = { sitio: "torote", tema: {...}, textos: {...}, ... };</script>
     <script src="https://creativewhisper.github.io/asistente/asistente.js" defer></script>

   Opciones de CW_ASISTENTE:
     sitio       id de la web en la tabla asistentes_web (cw, torote, jabones, bataka)
     tema        colores y letras: fondo, panel, panel2, texto, suave, acento, sobreAcento, linea, fuente, titulo
     textos      titulo, subtitulo, saludo, sugerencias[], nota (los demás tienen valor por defecto)
     cabecera    selector de la cabecera fija: el panel empieza debajo y las secciones quedan bajo ella
     evitar      selectores de botones fijos abajo (WhatsApp, carrito…): el botón del asistente sube sobre ellos
     resolver    function(id) → elemento (o promesa) para ids que no son un id del HTML
     avance      { id: 0…1 } punto del tramo animado (pin de GSAP) al que se llega; avancePin = valor por defecto (0.5)
     contexto    function() → texto corto de lo que se ve (p. ej. la marca activa)
     desplazar   function(y) para webs con scroll propio (Lenis)
     alAbrir     function() al abrir el panel (por defecto detiene window.sxTour, el recorrido automático)
*/
(function () {
  "use strict";
  if (window.__cwAsistente) return;
  window.__cwAsistente = true;

  var C = window.CW_ASISTENTE || {};
  var yo = document.currentScript;
  var SITIO = C.sitio || (yo && yo.getAttribute("data-sitio"));
  if (!SITIO) return;

  var URL_F = "https://jlyrymgbykhpktabvlkl.supabase.co/functions/v1/asistente-web";
  var SDK = "https://cdn.jsdelivr.net/npm/@elevenlabs/client@1.30.0/+esm";
  var mm = function (q) { return window.matchMedia ? matchMedia(q).matches : false; };
  var tactil = mm("(pointer: coarse)");
  var quieto = mm("(prefers-reduced-motion: reduce)");

  var BASE = {
    fondo: "#0A0908", panel: "#14120F", panel2: "#1F1C18", texto: "#ECE6DB", suave: "#A39A8D",
    acento: "#3EA398", acentoTexto: "", sobreAcento: "#0A0908", linea: "rgba(236,230,219,.16)",
    fuente: "system-ui,-apple-system,'Segoe UI',sans-serif", titulo: ""
  };
  function temaDe(t) {
    var o = Object.assign({}, BASE, (typeof t === "function" ? t() : t) || {});
    if (!o.titulo) o.titulo = o.fuente;
    if (!o.acentoTexto) o.acentoTexto = o.acento;
    return o;
  }
  var T = temaDe(C.tema);

  var X = Object.assign({
    boton: tactil ? "Toca aquí y sorpréndete" : "Haz clic aquí y sorpréndete",
    titulo: "Asistente", subtitulo: "Responde al instante",
    saludo: "Hola. Soy el asistente virtual. ¿En qué te ayudo?",
    permiso: "Para conversar por voz contigo, estamos pidiendo permiso para usar tu micrófono. Solo se usa mientras esta conversación esté abierta.",
    sinMic: "Sin acceso al micrófono, seguimos por escrito. Si cambias de opinión, toca el micrófono junto al campo de texto.",
    sinVoz: "No pudimos conectar la voz en este momento. Seguimos por escrito.",
    finAgente: "La llamada terminó. Si te surge otra pregunta, escríbela aquí o toca el micrófono.",
    finPersona: "Terminó la conversación por voz. Puedes seguir por escrito o volver a hablar con el micrófono.",
    error: "No pude responder en este momento. Escríbenos con el botón de WhatsApp de la página.",
    placeholder: "Escribe tu pregunta",
    nota: "Asistente automático. Para pedir, usa el botón de WhatsApp de la página.",
    sugerencias: []
  }, C.textos || {});

  /* ---------- estilos fuera del panel: resaltado y espacio para el panel ---------- */
  var raiz = document.documentElement;
  raiz.style.setProperty("--cwa-acento", T.acento);
  var g = document.createElement("style");
  g.id = "cwa-global";
  g.textContent =
    ".cwa-resaltado{animation:cwa-anillo 2.8s ease-out}" +
    "@keyframes cwa-anillo{0%,60%{outline:2px solid var(--cwa-acento);outline-offset:6px}100%{outline:2px solid transparent;outline-offset:6px}}" +
    "html.cwa-abierto.cwa-hoja body{padding-bottom:var(--cwa-alto,52vh)!important}" +
    "html.cwa-abierto.cwa-lado body{padding-right:432px!important}" +
    "@media print{#cw-asistente{display:none!important}}";
  document.head.appendChild(g);

  /* ---------- panel (Shadow DOM: los estilos de la web no lo afectan) ---------- */
  var host = document.createElement("div");
  host.id = "cw-asistente";
  host.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;z-index:2147483000";
  var sh = host.attachShadow ? host.attachShadow({ mode: "open" }) : host;
  var MIC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v3"/></svg>';
  sh.innerHTML =
    "<style>" +
    ":host{all:initial}" +
    "*{box-sizing:border-box;margin:0}" +
    "button,textarea{font:inherit;color:inherit;cursor:pointer}" +
    ".fab,.chat{font-family:var(--fuente);-webkit-font-smoothing:antialiased;cursor:auto}" +
    ".fab{position:fixed;right:max(16px,env(safe-area-inset-right,0px));bottom:calc(max(16px,env(safe-area-inset-bottom,0px)) + var(--sube,0px));display:inline-flex;align-items:center;gap:10px;min-height:52px;max-width:calc(100vw - 32px);padding:0 22px;border:0;border-radius:999px;background:var(--acento);color:var(--sobre);font-weight:600;font-size:15px;line-height:1.2;text-align:left;box-shadow:0 10px 30px rgba(0,0,0,.35);transition:bottom .25s ease,transform .2s ease;cursor:pointer}" +
    ".fab:hover{transform:translateY(-2px)}" +
    ".fab.arriba{top:var(--arriba,16px);bottom:auto}" +
    ".fab:focus-visible{outline:2px solid var(--texto);outline-offset:3px}" +
    ".fab .punto{width:9px;height:9px;flex:none;border-radius:50%;background:currentColor;animation:late 2.4s ease-in-out infinite}" +
    "@keyframes late{0%,100%{opacity:1}50%{opacity:.35}}" +
    ".fab[hidden]{display:none}" +
    ".chat{position:fixed;right:16px;top:var(--arriba,16px);bottom:16px;width:400px;display:flex;flex-direction:column;background:var(--panel);color:var(--texto);border:1px solid var(--linea);border-top:4px solid var(--acento);border-radius:14px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.45);font-size:15px;line-height:1.5}" +
    ".chat[hidden]{display:none}" +
    ".cab{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;padding:14px 16px;border-bottom:1px solid var(--linea)}" +
    ".cab b{display:block;font-family:var(--titulo);font-weight:700;font-size:19px;line-height:1.1}" +
    ".cab span{display:block;margin-top:3px;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--acento-txt)}" +
    ".cab button{background:none;border:0;font-size:26px;line-height:1;padding:0 6px;color:var(--suave)}" +
    ".cab button:hover{color:var(--texto)}" +
    ".msgs{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;overscroll-behavior:contain}" +
    ".b{max-width:88%;padding:10px 13px;border-radius:12px;font-size:14.5px;line-height:1.5;overflow-wrap:anywhere}" +
    ".b.bot{align-self:flex-start;background:var(--panel2);border-left:3px solid var(--acento);border-radius:4px 12px 12px 4px}" +
    ".b.bot strong{font-weight:700}" +
    ".b.yo{align-self:flex-end;background:var(--texto);color:var(--panel)}" +
    ".esc{display:inline-flex;gap:5px;padding:14px}" +
    ".esc span{width:7px;height:7px;border-radius:50%;background:var(--acento);animation:salto 1s infinite ease-in-out}" +
    ".esc span:nth-child(2){animation-delay:.15s}.esc span:nth-child(3){animation-delay:.3s}" +
    "@keyframes salto{0%,80%,100%{opacity:.3;transform:translateY(0)}40%{opacity:1;transform:translateY(-4px)}}" +
    ".sug{display:flex;flex-wrap:wrap;gap:6px;padding:0 16px 12px}" +
    ".sug[hidden]{display:none}" +
    ".sug button{background:none;border:1px solid var(--linea);border-radius:999px;padding:6px 12px;font-size:13px;text-align:left}" +
    ".sug button:hover{border-color:var(--acento);color:var(--acento-txt)}" +
    ".form{display:flex;gap:8px;padding:12px 16px 6px;border-top:1px solid var(--linea)}" +
    ".form[hidden]{display:none}" +
    ".form textarea{flex:1;min-width:0;resize:none;background:var(--fondo);color:var(--texto);border:1px solid var(--linea);border-radius:10px;padding:11px 12px;font-size:16px;line-height:1.35;min-height:46px;max-height:130px;cursor:text}" +
    ".form textarea:focus{outline:none;border-color:var(--acento)}" +
    ".form button{border:0;border-radius:10px;background:var(--acento);color:var(--sobre);font-weight:600;padding:0 16px;min-height:46px}" +
    ".form button:disabled{opacity:.5}" +
    ".form .mic{width:46px;padding:0;display:grid;place-items:center;background:transparent;color:var(--acento-txt);border:1px solid var(--acento)}" +
    ".form .mic:hover{background:var(--acento);color:var(--sobre)}" +
    ".form .mic[hidden]{display:none}" +
    ".form .mic svg{width:18px;height:18px}" +
    ".nota{padding:4px 16px 12px;font-size:11.5px;color:var(--suave)}" +
    ".voz{display:grid;justify-items:center;gap:12px;padding:20px 16px 16px;border-bottom:1px solid var(--linea);background:var(--fondo);text-align:center}" +
    ".voz[hidden]{display:none}" +
    ".orbe{width:80px;height:80px;border-radius:50%;background:radial-gradient(circle at 35% 32%,rgba(255,255,255,.55) 0,var(--acento) 58%,var(--acento) 100%);transform:scale(var(--k,1));transition:transform .08s linear;box-shadow:0 0 0 10px color-mix(in srgb,var(--acento) 16%,transparent),0 0 0 22px color-mix(in srgb,var(--acento) 7%,transparent)}" +
    ".estado{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--acento-txt)}" +
    ".acc{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}" +
    ".acc button{background:none;border:1px solid var(--linea);border-radius:999px;min-height:36px;padding:0 14px;font-size:13.5px;font-weight:600}" +
    ".acc button:hover{border-color:var(--texto)}" +
    "@media (max-width:1199px){" +
    ".chat{left:0;right:0;top:auto;bottom:0;width:auto;height:var(--cwa-alto,52vh);border-left:0;border-right:0;border-bottom:0;border-radius:16px 16px 0 0;padding-bottom:env(safe-area-inset-bottom,0px);box-shadow:0 -16px 40px rgba(0,0,0,.45)}" +
    ".cab{padding:10px 16px}.cab b{font-size:17px}" +
    ".voz{grid-template-columns:auto 1fr;justify-items:start;align-items:center;gap:6px 14px;padding:12px 16px;text-align:left}" +
    ".orbe{grid-row:span 2;width:54px;height:54px;box-shadow:0 0 0 6px color-mix(in srgb,var(--acento) 16%,transparent)}" +
    ".acc{justify-content:flex-start}.acc button{min-height:32px;padding:0 12px;font-size:13px}" +
    ".msgs{padding:12px 16px}.nota{display:none}" +
    "}" +
    "@media (prefers-reduced-motion:reduce){.orbe,.fab{transition:none}.esc span,.fab .punto{animation:none}}" +
    "</style>" +
    '<button class="fab" type="button" aria-controls="cwa-chat" aria-expanded="false"><span class="punto"></span><span class="txt"></span></button>' +
    '<aside class="chat" id="cwa-chat" hidden>' +
    '<div class="cab"><div><b class="tit"></b><span class="sub"></span></div><button type="button" class="cerrar" aria-label="Cerrar">×</button></div>' +
    '<div class="voz" hidden><div class="orbe" aria-hidden="true"></div><p class="estado" aria-live="polite">Conectando…</p>' +
    '<div class="acc"><button type="button" class="fin">Terminar</button><button type="button" class="escribir">Prefiero escribir</button></div></div>' +
    '<div class="msgs" role="log" aria-live="polite"></div>' +
    '<div class="sug"></div>' +
    '<form class="form" autocomplete="off"><textarea rows="1" maxlength="600" aria-label="Tu pregunta"></textarea>' +
    '<button type="button" class="mic" aria-label="Hablar por voz" title="Hablar por voz" hidden>' + MIC + '</button>' +
    '<button type="submit" class="enviar">Enviar</button></form>' +
    '<p class="nota"></p>' +
    "</aside>";

  function aplicarTema(t) {
    T = temaDe(t);
    var v = { fondo: T.fondo, panel: T.panel, panel2: T.panel2, texto: T.texto, suave: T.suave, acento: T.acento,
      "acento-txt": T.acentoTexto, sobre: T.sobreAcento, linea: T.linea, fuente: T.fuente, titulo: T.titulo };
    Object.keys(v).forEach(function (k) { host.style.setProperty("--" + k, v[k]); });
    raiz.style.setProperty("--cwa-acento", T.acento);
  }
  aplicarTema(C.tema);

  var q = function (s) { return sh.querySelector(s); };
  var fab = q(".fab"), panel = q(".chat"), msgs = q(".msgs"), sug = q(".sug"), form = q(".form");
  var txt = q("textarea"), btnEnviar = q(".enviar"), mic = q(".mic"), vozEl = q(".voz"), orbe = q(".orbe"), vozEstado = q(".estado");
  q(".fab .txt").textContent = X.boton;
  if (C.posicion === "arriba") fab.classList.add("arriba");
  q(".tit").textContent = X.titulo;
  q(".sub").textContent = X.subtitulo;
  q(".nota").textContent = X.nota;
  txt.placeholder = X.placeholder;
  panel.setAttribute("aria-label", X.titulo);
  (X.sugerencias || []).forEach(function (t) {
    var b = document.createElement("button"); b.type = "button"; b.textContent = t;
    b.addEventListener("click", function () { enviar(t); });
    sug.appendChild(b);
  });

  function montar() { document.body.appendChild(host); medir(); }
  if (document.body) montar(); else document.addEventListener("DOMContentLoaded", montar);

  /* ---------- medidas: cabecera fija, alto de la hoja, botones fijos que hay que esquivar ---------- */
  var ancho = mm("(min-width:1200px)");
  function altoCabecera() {
    var h = C.cabecera ? document.querySelector(C.cabecera) : null;
    if (!h) return 0;
    var r = h.getBoundingClientRect();
    return r.bottom > 0 && r.top <= 1 ? Math.round(r.bottom) : 0;
  }
  function medir() {
    ancho = mm("(min-width:1200px)");
    var alto = Math.round(Math.min(innerHeight * 0.52, 540));
    raiz.style.setProperty("--cwa-alto", alto + "px");
    panel.style.setProperty("--cwa-alto", alto + "px");
    panel.style.setProperty("--arriba", (altoCabecera() + 12) + "px");
    fab.style.setProperty("--arriba", (altoCabecera() + 12) + "px");
    raiz.classList.toggle("cwa-lado", ancho);
    raiz.classList.toggle("cwa-hoja", !ancho);
  }
  addEventListener("resize", function () { clearTimeout(medir.t); medir.t = setTimeout(function () { medir(); refrescar(); }, 150); });

  function esquivar() {
    if (fab.hidden || C.posicion === "arriba" || !C.evitar || !C.evitar.length) return;
    // posición natural del botón (sin lo que ya subió) y lo que tapa cada elemento fijo de abajo
    var f = fab.getBoundingClientRect(), fondo = f.bottom + (parseFloat(fab.style.getPropertyValue("--sube")) || 0);
    var sube = 0;
    C.evitar.forEach(function (sel) {
      [].forEach.call(document.querySelectorAll(sel), function (el) {
        if (host.contains(el)) return;
        var r = el.getBoundingClientRect();
        if (!r.width || !r.height || r.top >= fondo || r.bottom < innerHeight - 220) return;
        var cs = getComputedStyle(el);
        if (cs.visibility === "hidden" || cs.display === "none" || parseFloat(cs.opacity) < 0.05) return;
        if (r.right < f.left - 4 || r.left > f.right + 4) return;
        sube = Math.max(sube, Math.ceil(fondo - r.top + 10));
      });
    });
    fab.style.setProperty("--sube", Math.max(0, sube) + "px");
  }
  setInterval(esquivar, 500);

  function refrescar() {
    try { if (window.ScrollTrigger && ScrollTrigger.refresh) ScrollTrigger.refresh(); } catch (e) {}
  }

  /* ---------- llevar la página a una parte ---------- */
  var ultimo = null, quitar = 0;
  // Desplaza la página. En saltos largos llega casi de golpe y solo el último tramo es suave,
  // para no atravesar toda la historia animada.
  function aY(y) {
    y = Math.max(0, Math.round(y));
    if (C.desplazar) return C.desplazar(y);
    var l = window.lenis || window.cwLenis, d = y - window.pageYOffset, lejos = Math.abs(d) > innerHeight * 2.5;
    var cerca = Math.round(y - Math.sign(d) * innerHeight * 0.6);
    if (l && l.scrollTo) {
      if (lejos && !quieto) l.scrollTo(cerca, { immediate: true, force: true });
      return l.scrollTo(y, { duration: quieto ? 0 : 1.1, force: true, immediate: quieto });
    }
    if (lejos && !quieto) window.scrollTo({ top: cerca, behavior: "instant" });
    window.scrollTo({ top: y, behavior: quieto ? "auto" : "smooth" });
  }
  function destino(el, id) {
    // En las historias que se arman al bajar (GSAP), la sección vive dentro de un pin-spacer: se llega a un
    // punto del tramo donde el contenido ya se ve (C.avance[id], o 0.5 por defecto), no al inicio.
    var sp = el.parentElement && el.parentElement.classList.contains("pin-spacer") ? el.parentElement : null;
    if (sp) {
      var r = sp.getBoundingClientRect(), a = C.avance && C.avance[id] != null ? C.avance[id] : (C.avancePin != null ? C.avancePin : 0.5);
      return r.top + window.pageYOffset + Math.max(0, r.height - innerHeight) * a;
    }
    return el.getBoundingClientRect().top + window.pageYOffset - altoCabecera() - 16;
  }
  var corregir = 0;
  function irA(id) {
    id = String(id || "");
    if (!/^[a-z0-9-]{1,40}$/.test(id)) return;
    Promise.resolve(C.resolver ? C.resolver(id) : null).then(function (el) {
      el = el || document.getElementById(id);
      if (!el || host.contains(el)) return;
      aY(destino(el, id));
      // si algo cambió de alto mientras bajaba (fotos que cargan), se corrige al llegar
      clearTimeout(corregir);
      corregir = setTimeout(function () { var y2 = destino(el, id); if (Math.abs(window.pageYOffset - y2) > 40) aY(y2); }, 1600);
      if (el.getBoundingClientRect().height < innerHeight * 0.8) {
        if (ultimo) ultimo.classList.remove("cwa-resaltado");
        clearTimeout(quitar); void el.offsetWidth;
        el.classList.add("cwa-resaltado"); ultimo = el;
        quitar = setTimeout(function () { el.classList.remove("cwa-resaltado"); }, 3000);
      }
    }).catch(function () {});
  }

  /* ---------- conversación ---------- */
  var SS = "cwa-" + SITIO, hist = [], ocupado = false, vozIntentada = false;
  var conv = null, conectando = false, vozLog = [], vozDisp = null, animId = 0, consulta = null;
  var sesion = ((window.crypto && crypto.randomUUID) ? crypto.randomUUID() : (Date.now().toString(36) + Math.random().toString(36).slice(2))).replace(/[^a-zA-Z0-9-]/g, "");
  try { var gu = JSON.parse(sessionStorage.getItem(SS) || "null"); if (gu) { if (Array.isArray(gu.hist)) hist = gu.hist; if (gu.sesion) sesion = gu.sesion; vozIntentada = !!gu.voz; } } catch (e) {}
  function guardar() { try { sessionStorage.setItem(SS, JSON.stringify({ hist: hist.slice(-30), sesion: sesion, voz: vozIntentada })); } catch (e) {} }

  function cuerpo(extra) {
    return Object.assign({ sitio: SITIO, sesion: sesion, pagina: location.pathname.slice(0, 120) }, extra);
  }
  function post(extra) {
    return fetch(URL_F, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(cuerpo(extra)) })
      .then(function (r) { return r.json().catch(function () { return {}; }); });
  }
  function esc(t) { return String(t).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function formato(t) { return esc(t).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br>"); }
  function burbuja(rol, texto) {
    var d = document.createElement("div");
    d.className = "b " + (rol === "user" ? "yo" : "bot");
    d.innerHTML = formato(texto);
    msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight;
    return d;
  }
  function aviso(t) { return burbuja("assistant", t); }
  function pintar() { msgs.innerHTML = ""; aviso(X.saludo); hist.forEach(function (m) { burbuja(m.role, m.content); }); }
  function ajustar() { txt.style.height = "auto"; txt.style.height = Math.min(txt.scrollHeight, 130) + "px"; }
  function modoTexto() { vozEl.hidden = true; form.hidden = false; mic.hidden = vozDisp !== true; sug.hidden = hist.length > 0 || !sug.children.length; }
  function modoVoz(t) { vozEl.hidden = false; form.hidden = true; sug.hidden = true; vozEstado.textContent = t; }
  function enfocar() { if (!tactil) txt.focus(); }

  function hayVoz() {
    if (!consulta) consulta = post({ accion: "voz_estado" }).then(function (j) { vozDisp = !!(j && j.voz); return vozDisp; }).catch(function () { vozDisp = false; return false; });
    return consulta;
  }

  function animar() {
    cancelAnimationFrame(animId);
    (function paso() {
      if (!conv) { orbe.style.setProperty("--k", "1"); return; }
      var v = 0;
      try { v = Math.max(conv.getOutputVolume ? conv.getOutputVolume() : 0, conv.getInputVolume ? conv.getInputVolume() : 0); } catch (e) {}
      orbe.style.setProperty("--k", (1 + Math.min(v, 1) * 0.35).toFixed(3));
      animId = requestAnimationFrame(paso);
    })();
  }
  function enviarLog(beacon) {
    if (!vozLog.length) return;
    var lote = vozLog.slice(); vozLog = [];
    var b = JSON.stringify(cuerpo({ accion: "voz_log", mensajes: lote }));
    if (beacon && navigator.sendBeacon) { try { navigator.sendBeacon(URL_F, new Blob([b], { type: "text/plain" })); return; } catch (e) {} }
    fetch(URL_F, { method: "POST", headers: { "content-type": "text/plain" }, body: b, keepalive: true }).catch(function () {});
  }
  function terminado(porAgente) {
    if (!conv && !conectando) return;
    conv = null; conectando = false;
    cancelAnimationFrame(animId);
    enviarLog(false);
    if (!panel.hidden) aviso(porAgente ? X.finAgente : X.finPersona);
    modoTexto();
  }
  function noHayVoz(t) { conectando = false; conv = null; aviso(t); modoTexto(); enfocar(); }

  function iniciarVoz() {
    if (conv || conectando) return;
    conectando = true; vozIntentada = true; guardar();
    modoVoz("Pidiendo permiso del micrófono…");
    aviso(X.permiso);
    var pedirMic = (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) ? navigator.mediaDevices.getUserMedia({ audio: true }) : Promise.reject(new Error("sin micrófono"));
    pedirMic.then(function (stream) {
      stream.getTracks().forEach(function (t) { t.stop(); });
      if (!conectando) return null;
      modoVoz("Conectando…");
      return Promise.all([post({ accion: "voz" }), import(SDK)]);
    }, function () { noHayVoz(X.sinMic); return null; })
    .then(function (res) {
      if (!res || !conectando) return null;
      var cred = res[0], mod = res[1];
      if (!cred || (!cred.token && !cred.signed_url)) { noHayVoz(cred && cred.error ? String(cred.error).replace(/\*\*/g, "") : X.sinVoz); return null; }
      var op = {
        clientTools: { mostrar_seccion: function (p) { irA(p && p.seccion); return "ok"; } },
        onConnect: function () { modoVoz("Te escucho"); },
        onDisconnect: function (d) { terminado(!!(d && d.reason === "agent")); },
        onError: function (m) { console.warn("asistente voz", m); },
        onModeChange: function (p) { vozEstado.textContent = p && p.mode === "speaking" ? "Hablando…" : "Te escucho"; },
        onMessage: function (m) {
          var t = (m && m.message ? String(m.message) : "").trim(); if (!t) return;
          var rol = (m.role === "user" || m.source === "user") ? "user" : "assistant";
          hist.push({ role: rol, content: t }); vozLog.push({ role: rol, content: t });
          burbuja(rol, t); guardar();
        }
      };
      var intento = cred.token
        ? mod.Conversation.startSession(Object.assign({ conversationToken: cred.token, connectionType: "webrtc" }, op))
        : Promise.reject(new Error("sin token"));
      return intento.catch(function (e) {
        if (!cred.signed_url) throw e;
        return mod.Conversation.startSession(Object.assign({ signedUrl: cred.signed_url, connectionType: "websocket" }, op));
      }).then(function (c) {
        if (!conectando) { try { c.endSession(); } catch (e) {} return; }
        conv = c; conectando = false; animar();
      });
    }).catch(function (e) { console.warn("asistente voz", e); noHayVoz(X.sinVoz); });
  }
  function terminarVoz() {
    if (conv) { conv.endSession().catch(function () { terminado(false); }); }
    else if (conectando) { conectando = false; modoTexto(); }
    else modoTexto();
  }

  function detenerRecorrido() {
    try { if (C.alAbrir) C.alAbrir(); } catch (e) {}
    try { if (window.sxTour && window.sxTour.stop) window.sxTour.stop(); } catch (e) {}
  }
  function abrir() {
    detenerRecorrido();
    medir();
    panel.hidden = false; fab.hidden = true; fab.setAttribute("aria-expanded", "true");
    raiz.classList.add("cwa-abierto"); setTimeout(refrescar, 60);
    msgs.scrollTop = msgs.scrollHeight;
    if (!vozIntentada) {
      form.hidden = true; sug.hidden = true;
      hayVoz().then(function (ok) {
        if (ok && !panel.hidden) iniciarVoz();
        else { vozIntentada = true; guardar(); modoTexto(); enfocar(); }
      });
      return;
    }
    if (!conv && !conectando) { modoTexto(); enfocar(); hayVoz().then(function () { if (!conv && !conectando) mic.hidden = vozDisp !== true; }); }
  }
  function cerrar() {
    if (conv || conectando) terminarVoz();
    panel.hidden = true; fab.hidden = false; fab.setAttribute("aria-expanded", "false");
    raiz.classList.remove("cwa-abierto"); setTimeout(refrescar, 60);
    fab.focus();
  }

  function enviar(texto) {
    texto = (texto || "").trim();
    if (!texto || ocupado) return;
    ocupado = true; btnEnviar.disabled = true; sug.hidden = true;
    hist.push({ role: "user", content: texto.slice(0, 600) });
    burbuja("user", texto);
    txt.value = ""; ajustar();
    var esp = document.createElement("div");
    esp.className = "b bot esc"; esp.innerHTML = "<span></span><span></span><span></span>";
    msgs.appendChild(esp); msgs.scrollTop = msgs.scrollHeight;
    var seccion = null, ctx = "";
    try { ctx = C.contexto ? String(C.contexto() || "") : ""; } catch (e) {}
    post({ mensajes: hist.slice(-14), contexto: ctx })
      .then(function (j) { seccion = j && j.seccion ? String(j.seccion) : null; return j && j.respuesta ? j.respuesta : null; })
      .catch(function () { return null; })
      .then(function (resp) {
        esp.remove();
        if (resp) { hist.push({ role: "assistant", content: resp }); burbuja("assistant", resp); if (seccion) irA(seccion); }
        else { hist.pop(); aviso(X.error); }
        guardar();
        ocupado = false; btnEnviar.disabled = false; enfocar();
      });
  }

  fab.addEventListener("pointerenter", hayVoz);
  fab.addEventListener("touchstart", hayVoz, { passive: true });
  fab.addEventListener("focus", hayVoz);
  fab.addEventListener("click", abrir);
  q(".cerrar").addEventListener("click", cerrar);
  mic.addEventListener("click", iniciarVoz);
  q(".fin").addEventListener("click", terminarVoz);
  q(".escribir").addEventListener("click", function () { terminarVoz(); setTimeout(function () { txt.focus(); }, 50); });
  sh.addEventListener("keydown", function (e) { if (e.key === "Escape" && !panel.hidden) cerrar(); });
  form.addEventListener("submit", function (e) { e.preventDefault(); enviar(txt.value); });
  txt.addEventListener("input", ajustar);
  txt.addEventListener("keydown", function (e) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); enviar(txt.value); } });
  addEventListener("pagehide", function () { enviarLog(true); if (conv) { try { conv.endSession(); } catch (e) {} } });

  // Para pruebas y para que cada web pueda abrirlo desde un enlace propio.
  window.cwAsistente = { abrir: abrir, cerrar: cerrar, irA: irA, tema: aplicarTema, conversacion: function () { return conv; } };

  pintar(); modoTexto();
})();
