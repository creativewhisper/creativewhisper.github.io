/* Chat del asistente para la web de un cliente de «Susurro digital» (Creative Whisper).
   Se pega en la web del cliente con UNA línea (la da su cuenta, en Conexiones → Chat en tu web):
     <script src="https://creativewhisper.net/asistente/cliente.js" data-cuenta="mi-negocio" async></script>
   Lleva la marca del cliente: el nombre y la foto de su asistente y su color. No carga nada más de terceros, no lee la
   página donde está y solo responde en las webs que el cliente autorizó en su cuenta. Todo lo que llega se pinta como texto. */
(function () {
  "use strict";
  var yo = document.currentScript || document.querySelector("script[data-cuenta][src*='asistente/cliente.js']");
  if (!yo || window.CWChatCliente) return;
  var CUENTA = String(yo.getAttribute("data-cuenta") || "").toLowerCase();
  if (!/^[a-z0-9-]{2,40}$/.test(CUENTA)) return;
  var BASE = yo.getAttribute("data-api") || "https://jlyrymgbykhpktabvlkl.supabase.co/functions/v1";
  var abierto = false, armado = false, enviando = false, W = null, raiz, cuerpo, campo, lista, sug;

  function sesion() {
    var k = "cw-chat-" + CUENTA, v = null;
    try { v = localStorage.getItem(k); } catch (e) { /* sin almacenamiento: la sesión dura esta visita */ }
    if (!v || !/^[a-z0-9]{16,40}$/.test(v)) { v = ""; var a = new Uint8Array(12); (window.crypto || window.msCrypto).getRandomValues(a); for (var i = 0; i < a.length; i++) v += ("0" + a[i].toString(16)).slice(-2); try { localStorage.setItem(k, v); } catch (e) { /* igual sirve */ } }
    return v;
  }
  var SESION = sesion();
  function pedir(fn, datos) {
    return fetch(BASE + "/" + fn, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(datos) }).then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { j._ok = r.ok; return j; }); });
  }
  function color(v, d) { return /^#[0-9a-f]{6}$/i.test(v || "") ? v : d; }
  function claro(hex) { var r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16); return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 > 0.6; }
  function inicial(nombre, c) { var l = (String(nombre || "A").trim()[0] || "A").toUpperCase().replace(/[<>&"']/g, "A"); return "data:image/svg+xml;utf8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect width="96" height="96" rx="48" fill="' + c + '"/><text x="48" y="62" font-family="Arial,Helvetica,sans-serif" font-size="44" font-weight="700" text-anchor="middle" fill="#fff">' + l + "</text></svg>"); }
  function el(tag, clase, texto) { var e = document.createElement(tag); if (clase) e.className = clase; if (texto != null) e.textContent = texto; return e; }

  function armar() {
    if (armado) return; armado = true;
    var principal = color(W.color, "#14120F"), acento = color(W.acento, principal), sobre = claro(principal) ? "#0A0908" : "#ffffff";
    var foto = /^data:image\/(jpeg|png|webp);base64,/.test(W.foto || "") ? W.foto : inicial(W.asistente || W.nombre, principal);
    var host = el("div"); host.style.cssText = "position:fixed;z-index:2147483000;right:0;bottom:0"; document.body.appendChild(host);
    raiz = host.attachShadow ? host.attachShadow({ mode: "open" }) : host;
    var css = el("style");
    css.textContent = ":host{all:initial}*{box-sizing:border-box;font-family:system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif}"
      + ".b{position:fixed;right:16px;bottom:16px;display:flex;align-items:center;gap:10px;border:0;cursor:pointer;border-radius:999px;padding:8px 18px 8px 8px;background:" + principal + ";color:" + sobre + ";font-size:15px;font-weight:600;box-shadow:0 12px 34px -12px rgba(0,0,0,.55)}"
      + ".b img,.h img{width:40px;height:40px;border-radius:50%;object-fit:cover;background:#fff;flex:none}"
      + ".p{position:fixed;right:16px;bottom:16px;width:min(380px,calc(100vw - 24px));height:min(560px,calc(100dvh - 24px));background:#fff;color:#1b1b1b;border-radius:18px;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 24px 70px -18px rgba(0,0,0,.55);font-size:15px;line-height:1.45}"
      + ".p[hidden],.b[hidden]{display:none}.h{display:flex;align-items:center;gap:10px;padding:12px 14px;background:" + principal + ";color:" + sobre + "}.h div{flex:1;min-width:0}.h b{display:block;font-size:16px}.h span{font-size:12px;opacity:.85}"
      + ".h button{background:none;border:0;color:inherit;font-size:24px;line-height:1;cursor:pointer;padding:4px 8px}"
      + ".m{flex:1;overflow:auto;padding:12px;display:flex;flex-direction:column;gap:8px;background:#f6f4f1}.m div{max-width:86%;padding:9px 12px;border-radius:14px;white-space:pre-wrap;overflow-wrap:anywhere}"
      + ".yo{align-self:flex-end;background:" + principal + ";color:" + sobre + "}.el{align-self:flex-start;background:#fff;border:1px solid #e7e2da}"
      + ".s{display:flex;flex-wrap:wrap;gap:6px;padding:8px 12px 0;background:#f6f4f1}.s button{border:1px solid " + acento + ";background:#fff;color:#1b1b1b;border-radius:999px;padding:6px 12px;font-size:13px;cursor:pointer}"
      + ".f{display:flex;gap:8px;padding:10px;border-top:1px solid #e7e2da;background:#fff}.f input{flex:1;min-width:0;border:1px solid #d9d2c8;border-radius:12px;padding:10px 12px;font-size:16px;outline:none;color:#1b1b1b;background:#fff}.f input:focus{border-color:" + acento + "}"
      + ".f button{border:0;border-radius:12px;background:" + principal + ";color:" + sobre + ";font-weight:700;padding:0 14px;cursor:pointer;font-size:15px}"
      + ".n{font-size:11px;color:#7a736a;text-align:center;padding:0 10px 8px;background:#fff}.n a{color:inherit}"
      + "@media (max-width:480px){.p{right:0;bottom:0;width:100vw;height:100dvh;border-radius:0}}";
    var b = el("button", "b"); b.type = "button"; b.setAttribute("aria-label", "Abrir el chat con " + (W.asistente || "el asistente"));
    var bi = el("img"); bi.src = foto; bi.alt = ""; b.appendChild(bi); b.appendChild(el("span", null, "Escríbenos"));
    var p = el("div", "p"); p.hidden = true; p.setAttribute("role", "dialog"); p.setAttribute("aria-label", "Chat con " + (W.asistente || "el asistente"));
    var h = el("div", "h"), hi = el("img"); hi.src = foto; hi.alt = ""; h.appendChild(hi);
    var ht = el("div"); ht.appendChild(el("b", null, W.asistente || "Asistente")); ht.appendChild(el("span", null, "Asistente virtual de " + (W.nombre || "") + " · responde al instante")); h.appendChild(ht);
    var x = el("button", null, "×"); x.type = "button"; x.setAttribute("aria-label", "Cerrar"); h.appendChild(x);
    lista = el("div", "m"); sug = el("div", "s");
    var f = el("form", "f"); campo = el("input"); campo.type = "text"; campo.maxLength = 1000; campo.placeholder = "Escribe tu mensaje"; campo.setAttribute("aria-label", "Tu mensaje"); campo.autocomplete = "off";
    var env = el("button", null, "Enviar"); env.type = "submit"; f.appendChild(campo); f.appendChild(env);
    var n = el("div", "n", "Asistente virtual. "); var a = el("a", null, "Creative Whisper"); a.href = "https://creativewhisper.net/susurro-digital/"; a.target = "_blank"; a.rel = "noopener"; n.appendChild(a);
    p.appendChild(h); p.appendChild(lista); p.appendChild(sug); p.appendChild(f); p.appendChild(n);
    raiz.appendChild(css); raiz.appendChild(b); raiz.appendChild(p);
    cuerpo = { b: b, p: p };
    b.onclick = function () { abrir(true); }; x.onclick = function () { abrir(false); };
    f.onsubmit = function (e) { e.preventDefault(); var v = campo.value; campo.value = ""; enviar(v); };
    burbuja("el", W.saludo || ("Hola. Soy " + (W.asistente || "el asistente") + ", de " + (W.nombre || "este negocio") + ". ¿En qué te ayudo?"));
    sugerir(W.sugerencias || []);
  }
  function burbuja(clase, texto) { var d = el("div", clase, texto); lista.appendChild(d); lista.scrollTop = 1e9; return d; }
  function sugerir(ops) { sug.textContent = ""; (ops || []).slice(0, 4).forEach(function (o) { var c = el("button", null, String(o).slice(0, 60)); c.type = "button"; c.onclick = function () { enviar(o); }; sug.appendChild(c); }); }
  function abrir(v) { if (!armado) return; abierto = v; cuerpo.p.hidden = !v; cuerpo.b.hidden = v; if (v) campo.focus(); }
  // Las respuestas pueden traer marcas de la página del asistente ([opciones:A|B], [ruta:…]): las opciones salen como botones; lo demás se quita.
  function limpiar(t) { var ops = []; t = String(t || "").replace(/\[opciones:([^\]]+)\]/g, function (_m, o) { ops = o.split("|").map(function (s) { return s.trim(); }).filter(Boolean); return ""; }).replace(/\[[a-z_]+:[^\]]*\]/g, "").replace(/\*\*([^*]+)\*\*/g, "$1").replace(/\n{3,}/g, "\n\n").trim(); return { texto: t, opciones: ops }; }
  function enviar(texto) {
    texto = String(texto || "").trim(); if (!texto || enviando) return;
    enviando = true; sug.textContent = ""; burbuja("yo", texto);
    var espera = burbuja("el", "…");
    pedir("agente-cliente", { cuenta: CUENTA, sesion: SESION, texto: texto }).then(function (j) {
      var r = limpiar(j.respuesta || (j._ok ? "" : "No pude responder ahora. Inténtalo en un momento."));
      espera.textContent = r.texto || "Gracias por escribir. En un momento te responden.";
      sugerir(r.opciones);
    }).catch(function () { espera.textContent = "No pude responder ahora. Revisa tu conexión e inténtalo otra vez."; })
      .then(function () { enviando = false; lista.scrollTop = 1e9; });
  }
  window.CWChatCliente = { abrir: function () { if (armado) abrir(true); else yo.setAttribute("data-abrir", "1"); }, cerrar: function () { abrir(false); } };
  function empezar() {
    pedir("cuenta-cliente", { accion: "widget", cuenta: CUENTA }).then(function (w) {
      if (!w._ok || !w.nombre || w.activa === false) return;   // cuenta desconocida o en pausa: no se muestra nada en la web del cliente
      W = w; armar(); if (yo.getAttribute("data-abrir") === "1") abrir(true);
    }).catch(function () { /* sin conexión: la web del cliente sigue igual, sin el chat */ });
  }
  if (document.body) empezar(); else document.addEventListener("DOMContentLoaded", empezar);
})();
