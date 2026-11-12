/* Agente conversacional de las páginas del servicio «Escucha digital» (la página pública y la cuenta del cliente).
   Uso:  AgenteEscucha({ api, accion, datos: () => ({...}), cabeceras: () => ({...}), titulo, saludo, sugerencias: [], boton })
   Habla con la función cuenta-cliente (acciones agente_publico y agente). Todo lo que llega se pinta como texto, nunca como HTML. */
(function () {
  "use strict";
  window.AgenteEscucha = function (o) {
    var chat = [], abierto = false;
    var css = document.createElement("style");
    css.textContent = ".ae-b{position:fixed;right:max(16px,env(safe-area-inset-right,0px));bottom:max(16px,env(safe-area-inset-bottom,0px));z-index:70;height:54px;padding:0 20px 0 16px;border-radius:999px;border:0;cursor:pointer;font:600 15px/1 'Hanken Grotesk',system-ui,sans-serif;background:#ECE6DB;color:#0A0908;display:flex;align-items:center;gap:10px;box-shadow:0 14px 40px -14px rgba(0,0,0,.7)}"
      + ".ae-b::before{content:'';width:10px;height:10px;border-radius:50%;background:#3EA398;box-shadow:0 0 0 4px rgba(62,163,152,.25)}.ae-b:hover{background:#F5A300}"
      + ".ae-p{position:fixed;right:max(16px,env(safe-area-inset-right,0px));bottom:max(16px,env(safe-area-inset-bottom,0px));z-index:71;width:min(400px,calc(100vw - 32px));height:min(580px,calc(100dvh - 32px));background:#14120F;color:#ECE6DB;border:1px solid rgba(236,230,219,.16);border-radius:20px;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 30px 80px -20px rgba(0,0,0,.8);font:400 15px/1.45 'Hanken Grotesk',system-ui,sans-serif}"
      + ".ae-p[hidden]{display:none}.ae-h{display:flex;align-items:center;gap:10px;padding:14px 16px;border-bottom:1px solid rgba(236,230,219,.12)}.ae-h b{flex:1;font:800 20px/1 'Big Shoulders Display','Arial Narrow',Impact,sans-serif;text-transform:uppercase;letter-spacing:.02em}"
      + ".ae-h i{width:22px;height:8px;background:#3EA398;transform:skewX(-11deg)}.ae-h button{background:none;border:0;color:inherit;font-size:24px;line-height:1;cursor:pointer;padding:4px 8px}"
      + ".ae-m{flex:1;overflow:auto;padding:14px;display:flex;flex-direction:column;gap:8px}.ae-m div{max-width:86%;padding:9px 13px;border-radius:14px;white-space:pre-wrap;overflow-wrap:anywhere}"
      + ".ae-m .yo{align-self:flex-end;background:#ECE6DB;color:#0A0908}.ae-m .el{align-self:flex-start;background:#1E1B17;border:1px solid rgba(236,230,219,.12)}"
      + ".ae-s{display:flex;flex-wrap:wrap;gap:6px;padding:0 14px 10px}.ae-s button{border:1px solid rgba(236,230,219,.26);background:none;color:inherit;border-radius:999px;padding:6px 12px;font:inherit;font-size:13px;cursor:pointer}.ae-s button:hover{border-color:#F5A300;color:#F5A300}"
      + ".ae-f{display:flex;gap:8px;padding:12px;border-top:1px solid rgba(236,230,219,.12)}.ae-f input{flex:1;min-width:0;background:#0A0908;border:1px solid rgba(236,230,219,.26);border-radius:12px;color:inherit;padding:11px 12px;font:inherit;font-size:16px;outline:none}.ae-f input:focus{border-color:#F5A300}"
      + ".ae-f button{border:0;border-radius:12px;background:#F5A300;color:#0A0908;font:inherit;font-weight:700;padding:0 16px;cursor:pointer}.ae-n{font-size:11.5px;color:#A39A8D;padding:0 14px 10px}";
    // En la cuenta del cliente el botón va a la izquierda: a la derecha queda libre para probar el chat de su propia web.
    if (o.izquierda) css.textContent += ".ae-b,.ae-p{right:auto;left:max(16px,env(safe-area-inset-left,0px))}";
    document.head.appendChild(css);
    var b = document.createElement("button"); b.type = "button"; b.className = "ae-b"; b.id = "aeAbrir"; b.textContent = o.boton || "¿Dudas? Pregúntame";
    var p = document.createElement("div"); p.className = "ae-p"; p.hidden = true; p.setAttribute("role", "dialog"); p.setAttribute("aria-label", o.titulo || "Asistente");
    var h = document.createElement("div"); h.className = "ae-h"; h.appendChild(document.createElement("i"));
    var t = document.createElement("b"); t.textContent = o.titulo || "Asistente"; h.appendChild(t);
    var x = document.createElement("button"); x.type = "button"; x.setAttribute("aria-label", "Cerrar"); x.textContent = "×"; h.appendChild(x);
    var m = document.createElement("div"); m.className = "ae-m"; m.id = "aeMensajes";
    var s = document.createElement("div"); s.className = "ae-s";
    var f = document.createElement("form"); f.className = "ae-f"; f.autocomplete = "off";
    var i = document.createElement("input"); i.type = "text"; i.maxLength = 1200; i.placeholder = "Escribe tu pregunta"; i.setAttribute("aria-label", "Tu pregunta"); i.id = "aeTexto"; i.autocomplete = "off";
    var e = document.createElement("button"); e.type = "submit"; e.textContent = "Enviar";
    var n = document.createElement("div"); n.className = "ae-n"; n.textContent = o.nota || "Asistente automático. No escribas aquí contraseñas, códigos ni datos de tarjetas.";
    f.appendChild(i); f.appendChild(e); p.appendChild(h); p.appendChild(m); p.appendChild(s); p.appendChild(f); p.appendChild(n);
    document.body.appendChild(b); document.body.appendChild(p);
    function burbuja(clase, texto) { var d = document.createElement("div"); d.className = clase; d.textContent = texto; m.appendChild(d); m.scrollTop = 1e9; return d; }
    function sugerir() { s.textContent = ""; (o.sugerencias || []).forEach(function (q) { var c = document.createElement("button"); c.type = "button"; c.textContent = q; c.onclick = function () { enviar(q); }; s.appendChild(c); }); }
    function abrir(v) { abierto = v; p.hidden = !v; b.hidden = v; if (v) { if (!m.childNodes.length) { burbuja("el", o.saludo || "Hola. ¿En qué te ayudo?"); sugerir(); } i.focus(); } }
    async function enviar(texto) {
      texto = String(texto || "").trim(); if (!texto) return;
      s.textContent = ""; chat.push({ rol: "usuario", texto: texto }); burbuja("yo", texto);
      var espera = burbuja("el", "…");
      try {
        var r = await fetch(o.api, { method: "POST", headers: Object.assign({ "content-type": "application/json" }, o.cabeceras ? o.cabeceras() : {}), body: JSON.stringify(Object.assign({ accion: o.accion, mensajes: chat.slice(-10) }, o.datos ? o.datos() : {})) });
        var j = await r.json().catch(function () { return {}; });
        var resp = j.texto || j.error || "No pude responder ahora. Inténtalo en un momento.";
        espera.textContent = resp; if (j.texto && r.ok) chat.push({ rol: "asistente", texto: resp });
      } catch (err) { espera.textContent = "No pude responder ahora. Revisa tu conexión e inténtalo otra vez."; }
      m.scrollTop = 1e9;
    }
    b.onclick = function () { abrir(true); }; x.onclick = function () { abrir(false); };
    f.onsubmit = function (ev) { ev.preventDefault(); var v = i.value; i.value = ""; enviar(v); };
    document.addEventListener("keydown", function (ev) { if (ev.key === "Escape" && abierto) abrir(false); });
    return { abrir: function () { abrir(true); }, preguntar: function (q) { abrir(true); enviar(q); } };
  };
})();
