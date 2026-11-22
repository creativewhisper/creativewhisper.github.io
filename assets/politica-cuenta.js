// Fase 11.6b · creativewhisper.net/privacidad/{cuenta}[/v{n}][?lang=en]: la política de privacidad de cada empresa que usa
// Digital Whisper. Desde la 11.6c la dirección normal es una página ESTÁTICA (privacidad/{cuenta}.html, estado 200) que
// escribe la Action «Políticas de privacidad» (.github/politicas/generar.mjs). Esto queda de respaldo: lo que todavía no
// tiene página (los minutos entre aprobar y la siguiente corrida, o una dirección con «/» final o «?lang=en» en una ruta
// sin página) cae en 404.html, que la pide a la base (politica_publica: solo lo publicado) y la pinta con textContent.
(function () {
  // También las direcciones de las páginas estáticas en inglés (/en, /v{n}-en), por si todavía no existen.
  var m = location.pathname.match(/^\/privacidad\/([a-z0-9][a-z0-9-]{1,39})\/?(?:v(\d{1,4})(-en)?\/?|(en)\/?)?$/);
  if (!m) return;
  var cuenta = m[1], version = m[2] ? Number(m[2]) : null;
  var en = /[?&]lang=en\b/.test(location.search) || !!m[3] || !!m[4];
  var T = en ? { cargando: "Loading the privacy policy…", nohay: "This company has no published privacy policy yet.", error: "The policy could not be loaded. Try again in a moment.",
      borrador: "Draft for legal review: this policy has not yet been reviewed by the company's lawyer.", vieja: "This is a previous version. ", verVigente: "See the current one",
      version: "Version", desde: "effective from", hasta: "until", versiones: "Versions of this policy", otro: "Versión en español", titulo: "Privacy policy" }
    : { cargando: "Cargando la política de privacidad…", nohay: "Esta empresa todavía no tiene una política de privacidad publicada.", error: "No se pudo cargar la política. Intenta de nuevo en un momento.",
      borrador: "Borrador para revisión de abogado: esta política todavía no la revisó el abogado de la empresa.", vieja: "Esta es una versión anterior. ", verVigente: "Ver la vigente",
      version: "Versión", desde: "vigente desde el", hasta: "hasta el", versiones: "Versiones de esta política", otro: "English version", titulo: "Política de privacidad" };
  document.documentElement.lang = en ? "en" : "es";
  document.title = T.titulo + " · " + cuenta;
  var raiz = document.getElementById("pagina");
  var el = function (tag, txt, cls) { var x = document.createElement(tag); if (txt != null) x.textContent = txt; if (cls) x.className = cls; return x; };
  var segs = function (padre, s) { (s || []).forEach(function (p) { var t = String(p[0] || ""); if (p[1]) { var b = el("strong", t); padre.appendChild(b); } else padre.appendChild(document.createTextNode(t)); }); return padre; };
  var fecha = function (f) { try { return new Date(f).toLocaleDateString(en ? "en-US" : "es-EC", { day: "numeric", month: "long", year: "numeric", timeZone: "America/Guayaquil" }); } catch (e) { return ""; } };
  raiz.textContent = ""; raiz.appendChild(el("p", T.cargando, "sub"));
  var cuerpo = { p_cuenta: cuenta, p_version: version, p_idioma: en ? "en" : "es" };
  fetch("https://jlyrymgbykhpktabvlkl.supabase.co/rest/v1/rpc/politica_publica", {
    method: "POST", headers: { "content-type": "application/json", apikey: "sb_publishable_ap5wyI1Q4-_IO8fXJ3xBJA_RzGp89dV" }, body: JSON.stringify(cuerpo)
  }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }).then(function (d) {
    raiz.textContent = "";
    if (!d || !d.existe) { raiz.appendChild(el("h1", T.titulo)); raiz.appendChild(el("p", T.nohay)); return; }
    document.title = T.titulo + " · " + (d.nombre || cuenta);
    if (!d.revision_legal) raiz.appendChild(el("div", T.borrador, "aviso"));
    if (!d.vigente) { var a = el("div", T.vieja, "aviso"); var l = el("a", T.verVigente); l.href = "/privacidad/" + cuenta + (en ? "?lang=en" : ""); a.appendChild(l); raiz.appendChild(a); }
    raiz.appendChild(el("p", T.version + " " + d.version + " · " + T.desde + " " + fecha(d.desde) + (d.hasta ? " " + T.hasta + " " + fecha(d.hasta) : ""), "sub"));
    var lista = null, sub = null;
    (d.bloques || []).forEach(function (b) {
      if (b.t !== "li" && b.t !== "li2" && b.t !== "ol") { lista = null; sub = null; }
      if (b.t === "h1" || b.t === "h2" || b.t === "p") raiz.appendChild(segs(el(b.t === "h1" ? "h1" : b.t === "h2" ? "h2" : "p"), b.s));
      else if (b.t === "hr") raiz.appendChild(el("hr"));
      else if (b.t === "li" || b.t === "ol") { if (!lista || lista.tagName !== (b.t === "ol" ? "OL" : "UL")) { lista = el(b.t === "ol" ? "ol" : "ul"); raiz.appendChild(lista); } var li = segs(el("li"), b.s); lista.appendChild(li); sub = null; }
      else if (b.t === "li2") { var ult = lista && lista.lastElementChild; if (!ult) return; if (!sub) { sub = el("ul"); ult.appendChild(sub); } sub.appendChild(segs(el("li"), b.s)); }
      else if (b.t === "tabla") {
        var cont = el("div", null, "tabla"), tb = el("table");
        (b.filas || []).forEach(function (fila, i) { var tr = el("tr"); fila.forEach(function (c) { tr.appendChild(segs(el(i === 0 ? "th" : "td"), c)); }); tb.appendChild(tr); });
        cont.appendChild(tb); raiz.appendChild(cont);
      }
    });
    if ((d.versiones || []).length > 1) {
      raiz.appendChild(el("h2", T.versiones));
      var ul = el("ul", null, "versiones");
      d.versiones.forEach(function (v) { var li = el("li"), a = el("a", T.version + " " + v.version); a.href = "/privacidad/" + cuenta + "/v" + v.version + (en ? "?lang=en" : ""); li.appendChild(a); li.appendChild(document.createTextNode(" · " + fecha(v.desde) + (v.hasta ? " – " + fecha(v.hasta) : ""))); ul.appendChild(li); });
      raiz.appendChild(ul);
    }
    if ((d.otros_idiomas || []).length) { var p = el("p", null, "idiomas"), a2 = el("a", T.otro); a2.href = "/privacidad/" + cuenta + (version ? "/v" + version : "") + (en ? "" : "?lang=en"); p.appendChild(a2); raiz.appendChild(p); }
  }).catch(function () { raiz.textContent = ""; raiz.appendChild(el("h1", T.titulo)); raiz.appendChild(el("p", T.error)); });
})();
