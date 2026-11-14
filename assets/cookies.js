/* Creative Whisper · aviso de cookies y píxel de Meta (solo con permiso).
   - Mientras PIXEL esté vacío no se carga nada de terceros y el aviso no aparece (no hay cookies que pedir).
   - Con PIXEL puesto: el aviso pregunta una vez; el píxel solo se carga si la persona acepta.
   - Cualquier elemento con [data-cookies] vuelve a abrir el aviso («Configurar cookies»).
   - window.cwMedir(evento, datos) manda un evento (p. ej. "Lead") solo si hubo permiso.
   - Vista previa del aviso sin píxel: agregar ?cookies=prueba a la dirección. */
(function () {
  "use strict";
  var PIXEL = "1701308774844671"; // número del píxel de Meta (Administrador de eventos). No es secreto.
  var CLAVE = "cw-cookies";
  var en = (document.documentElement.lang || "").toLowerCase().indexOf("en") === 0;
  var T = en ? {
    t: "Cookies", p: "We use cookies to measure visits and show you relevant ads on Meta. Only if you accept.",
    si: "Accept", no: "Reject", mas: "Learn more", url: "/privacy.html#cookies"
  } : {
    t: "Cookies", p: "Usamos cookies para medir las visitas y mostrarte anuncios útiles en Meta. Solo si aceptas.",
    si: "Aceptar", no: "Rechazar", mas: "Más información", url: "/privacidad.html#cookies"
  };
  var prueba = /[?&]cookies=prueba\b/.test(location.search);
  function leer() { try { return JSON.parse(localStorage.getItem(CLAVE) || "null"); } catch (e) { return null; } }
  function guardar(si) { try { localStorage.setItem(CLAVE, JSON.stringify({ si: !!si, fecha: new Date().toISOString().slice(0, 10) })); } catch (e) {} }

  var cargado = false;
  function cargarPixel() {
    if (cargado || !PIXEL) return; cargado = true;
    !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v;
      s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    window.fbq("init", PIXEL); window.fbq("track", "PageView");
  }
  window.cwMedir = function (evento, datos) {
    var c = leer(); if (!PIXEL || !c || !c.si) return;
    cargarPixel(); try { window.fbq("track", evento, datos || {}); } catch (e) {}
  };

  var caja = null;
  function cerrar() { if (caja) { caja.remove(); caja = null; } }
  function abrir() {
    if (caja) return;
    var css = document.createElement("style");
    css.textContent = ".cw-ck{position:fixed;left:16px;bottom:16px;z-index:9999;max-width:380px;background:#FFFDF9;color:#0A0908;border:1.5px solid #0A0908;border-radius:16px;box-shadow:6px 6px 0 #F5A300;padding:16px 18px;font:15px/1.45 'Hanken Grotesk',system-ui,sans-serif}" +
      ".cw-ck b{display:block;font-size:16px;margin-bottom:4px}.cw-ck p{margin:0 0 12px}.cw-ck .f{display:flex;gap:8px;align-items:center;flex-wrap:wrap}" +
      ".cw-ck button{font:inherit;font-weight:700;border-radius:999px;padding:8px 16px;cursor:pointer;border:1.5px solid #0A0908}" +
      ".cw-ck .si{background:#F5A300}.cw-ck .no{background:#fff}.cw-ck a{color:#0A0908;font-size:14px;margin-left:4px}" +
      ".cw-ck button:focus-visible,.cw-ck a:focus-visible{outline:3px solid #3EA398;outline-offset:2px}" +
      "@media (max-width:520px){.cw-ck{left:12px;right:12px;bottom:12px;max-width:none}}";
    caja = document.createElement("div"); caja.className = "cw-ck"; caja.setAttribute("role", "dialog"); caja.setAttribute("aria-label", T.t);
    caja.innerHTML = "<b></b><p></p><div class='f'><button type='button' class='si'></button><button type='button' class='no'></button><a></a></div>";
    caja.querySelector("b").textContent = T.t; caja.querySelector("p").textContent = T.p;
    caja.querySelector(".si").textContent = T.si; caja.querySelector(".no").textContent = T.no;
    var a = caja.querySelector("a"); a.textContent = T.mas; a.href = T.url;
    caja.querySelector(".si").onclick = function () { guardar(true); cerrar(); cargarPixel(); };
    caja.querySelector(".no").onclick = function () { guardar(false); cerrar(); };
    caja.appendChild(css); document.body.appendChild(caja);
  }

  function iniciar() {
    document.addEventListener("click", function (e) { var t = e.target.closest && e.target.closest("[data-cookies]"); if (t) { e.preventDefault(); abrir(); } });
    if (!PIXEL && !prueba) { for (var x of document.querySelectorAll("[data-cookies]")) (x.closest("[data-cookies-wrap]") || x).hidden = true; return; }
    var c = leer();
    if (c && c.si) cargarPixel();
    else if (!c || prueba) abrir();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar); else iniciar();
})();
