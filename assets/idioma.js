/* Idioma de las páginas del cliente (/cuenta/ y /alta/): español o inglés en la MISMA dirección.
   Por qué así y no dos páginas: a estas direcciones se llega por enlaces personales (#t=…, #a=…) que ya están enviados y por el
   correo del código; duplicarlas obligaría a mantener cada pantalla dos veces y a saber el idioma antes de enviar el enlace.
   Cómo funciona: las páginas se escriben en español. Con el inglés elegido, este archivo traduce lo que se ve (textos, rótulos
   de campos y botones), también lo que la página pinta después, con el diccionario que cada página registra (cuenta/en.js,
   alta/en.js). Lo que escribe la persona o su negocio (nombres, mensajes, archivos) nunca está en el diccionario y no se toca.
   Qué idioma: 1) ?lang=en / ?lang=es  2) lo que la persona eligió antes (el mismo «cw-lang» del resto de la web)
               3) el idioma de su cuenta (CWIdioma.sugerir)  4) el del navegador: español si es español; si no, inglés.
   Uso:  CWIdioma.registrar({ exactos: { "Hola": "Hi" }, patrones: [[/^Hola, (.+)$/, "Hi, $1"]] })
         CWIdioma.idioma  ·  CWIdioma.t("Hola")  ·  CWIdioma.poner("en")  ·  CWIdioma.alCambiar(fn)  ·  CWIdioma.boton(elemento) */
(function () {
  "use strict";
  var K = "cw-lang", elegido = null;
  try { var q = new URLSearchParams(location.search).get("lang"); if (q === "en" || q === "es") { localStorage.setItem(K, q); elegido = q; } else { var s = localStorage.getItem(K); if (s === "en" || s === "es") elegido = s; } } catch (e) { /* sin almacenamiento: vale el navegador */ }
  var nav = (navigator.languages && navigator.languages[0]) || navigator.language || "";
  var idioma = elegido || (/^es\b/i.test(nav) ? "es" : "en");
  var EX = Object.create(null), RE = [], oyentes = [], faltan = new Set(), obs = null;
  var ATR = ["placeholder", "aria-label", "title", "alt"];
  var norm = function (x) { return String(x).replace(/\s+/g, " ").trim(); };

  function t(texto) {
    var k = norm(texto); if (!k) return null;
    if (k in EX) return EX[k];
    for (var i = 0; i < RE.length; i++) { if (RE[i][0].test(k)) return k.replace(RE[i][0], RE[i][1]); }
    return null;
  }
  // Para los textos que arma el código (no pasan por el documento): devuelve la traducción o el mismo texto.
  function tr(texto) { if (idioma !== "en") return texto; var v = t(texto); return v == null ? texto : v; }

  function fuera(el) { return !el || !!(el.closest && el.closest("script,style,code,textarea,[data-nt]")); }
  function nodo(n) {
    var o = n.nodeValue; if (!o || !/[A-Za-zÁÉÍÓÚáéíóúÑñ]/.test(o)) return;
    if (n.__en === o) return;                       // ya está traducido
    if (fuera(n.parentElement)) return;
    var v = t(o);
    if (v == null) { faltan.add(norm(o)); return; }
    n.__es = o; n.__en = o.match(/^\s*/)[0] + v + o.match(/\s*$/)[0]; n.nodeValue = n.__en;
  }
  function atributos(el) {
    if (fuera(el)) return;
    for (var i = 0; i < ATR.length; i++) {
      var a = ATR[i], o = el.getAttribute(a); if (!o) continue;
      el.__atr = el.__atr || {};
      if (el.__atr[a] && el.__atr[a].en === o) continue;
      var v = t(o); if (v == null) { faltan.add(norm(o)); continue; }
      el.__atr[a] = { es: o, en: v }; el.setAttribute(a, v);
    }
  }
  function recorrer(raiz) {
    if (idioma !== "en" || !raiz) return;
    if (raiz.nodeType === 3) return nodo(raiz);
    if (raiz.nodeType !== 1 && raiz.nodeType !== 9) return;
    if (raiz.nodeType === 1) atributos(raiz);
    var w = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, null), n;
    while ((n = w.nextNode())) { if (n.nodeType === 3) nodo(n); else atributos(n); }
  }
  function deshacer() {
    var w = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, null), n;
    while ((n = w.nextNode())) {
      if (n.nodeType === 3) { if (n.__es != null && n.nodeValue === n.__en) n.nodeValue = n.__es; n.__es = n.__en = undefined; }
      else if (n.__atr) { for (var a in n.__atr) if (n.getAttribute(a) === n.__atr[a].en) n.setAttribute(a, n.__atr[a].es); n.__atr = undefined; }
    }
  }
  function vigilar() {
    if (obs || typeof MutationObserver === "undefined") return;
    obs = new MutationObserver(function (ms) {
      if (idioma !== "en") return;
      for (var i = 0; i < ms.length; i++) {
        var m = ms[i];
        if (m.type === "characterData") nodo(m.target);
        else if (m.type === "attributes") atributos(m.target);
        else for (var j = 0; j < m.addedNodes.length; j++) recorrer(m.addedNodes[j]);
      }
    });
    obs.observe(document.documentElement, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATR });
  }
  function aplicar() {
    document.documentElement.lang = idioma;
    if (idioma === "en") { recorrer(document.documentElement); vigilar(); } else deshacer();
    var bs = document.querySelectorAll("[data-idioma]");
    for (var i = 0; i < bs.length; i++) pintarBoton(bs[i]);
  }
  function pintarBoton(b) {
    b.setAttribute("data-nt", ""); b.setAttribute("lang", idioma === "en" ? "es" : "en");
    b.setAttribute("aria-label", idioma === "en" ? "Ver en español" : "View in English");
    b.innerHTML = idioma === "en" ? "EN <b>/</b> ES" : "ES <b>/</b> EN";
  }
  function poner(nuevo, recordar) {
    if (nuevo !== "en" && nuevo !== "es") return;
    if (recordar !== false) { try { localStorage.setItem(K, nuevo); } catch (e) { /* vale para esta visita */ } elegido = nuevo; }
    if (nuevo === idioma) return;
    idioma = nuevo; api.idioma = nuevo; faltan.clear(); aplicar();
    for (var i = 0; i < oyentes.length; i++) { try { oyentes[i](nuevo); } catch (e) { /* un oyente que falla no detiene a los demás */ } }
  }
  var api = {
    idioma: idioma, t: tr, faltan: faltan,
    registrar: function (d) { var k; for (k in (d.exactos || {})) EX[norm(k)] = d.exactos[k]; for (k = 0; k < (d.patrones || []).length; k++) RE.push(d.patrones[k]); if (document.body) recorrer(document.documentElement); },
    poner: poner,
    // El idioma de la cuenta manda solo si la persona no eligió nada antes.
    sugerir: function (i) { if (!elegido && (i === "en" || i === "es")) poner(i, false); },
    alCambiar: function (f) { oyentes.push(f); },
    loc: function () { return idioma === "en" ? "en-US" : "es-EC"; },
    boton: function (b) { if (!b) return; b.setAttribute("data-idioma", ""); pintarBoton(b); b.addEventListener("click", function () { poner(idioma === "en" ? "es" : "en"); }); },
  };
  window.CWIdioma = api;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", aplicar); else aplicar();
})();
