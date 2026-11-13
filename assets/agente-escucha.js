/* Agente conversacional de las páginas del servicio «Digital Whisper» (antes «Susurro digital») (la página pública, el alta y la cuenta).
   Uso:  AgenteEscucha({ api, accion, idioma: "es" | "en", datos: () => ({...}), cabeceras: () => ({...}), titulo, saludo, sugerencias: [], boton })
   Habla con la función cuenta-cliente (acciones agente_publico y agente) o con alta-cliente (asistente). Todo lo que llega se pinta como texto, nunca como HTML.
   Fase 7 (opcionales; sin ellos se comporta como siempre):
     fijo: true        en computadora (1180 px o más) queda ABIERTO como panel lateral fijo y la página le hace sitio; se puede plegar
                       y lo recuerda. En celular sigue siendo una burbuja que se expande como hoja inferior y no tapa los botones.
     filtro(texto)     si devuelve un texto, el mensaje NO se envía ni se guarda y se muestra ese aviso (para claves pegadas por error).
     voz: { pedir }    agrega «Hablar con el agente»: pide el micrófono con un aviso claro, conversa por voz (ElevenLabs) y, si se
                       niega el permiso o la voz no está disponible, sigue por escrito. pedir() devuelve { token | signed_url, instrucciones, saludo, idioma } o { error }.
   Devuelve { abrir, preguntar, decir(texto), cerrar }. */
(function () {
  "use strict";
  window.AgenteEscucha = function (o) {
    var chat = [], abierto = false, EN = String(o.idioma || "").toLowerCase().indexOf("en") === 0;
    var L = EN ? { boton: "Questions? Ask me", titulo: "Assistant", cerrar: "Close", ph: "Type your question", tu: "Your question", enviar: "Send", nota: "Automated assistant. Do not type passwords, codes or card details here.", saludo: "Hi. How can I help?", falla: "I could not answer just now. Please try again in a moment.", red: "I could not answer just now. Check your connection and try again.",
        hablar: "Talk to the agent", colgar: "End the call", permiso: "To talk by voice, your browser will ask for permission to use your microphone. It is only used while this conversation is open.", sinMic: "Without the microphone we will keep going in writing. Type your question below.", sinVoz: "Voice is not available right now. Let's keep going in writing.", conectando: "Connecting…", escucho: "I'm listening. Speak whenever you like.", fin: "The call ended. You can keep typing here.", plegar: "Hide" }
      : { boton: "¿Dudas? Pregúntame", titulo: "Asistente", cerrar: "Cerrar", ph: "Escribe tu pregunta", tu: "Tu pregunta", enviar: "Enviar", nota: "Asistente automático. No escribas aquí contraseñas, códigos ni datos de tarjetas.", saludo: "Hola. ¿En qué te ayudo?", falla: "No pude responder ahora. Inténtalo en un momento.", red: "No pude responder ahora. Revisa tu conexión e inténtalo otra vez.",
        hablar: "Hablar con el agente", colgar: "Terminar la llamada", permiso: "Para hablar por voz, tu navegador te va a pedir permiso para usar el micrófono. Solo se usa mientras esta conversación esté abierta.", sinMic: "Sin el micrófono seguimos por escrito. Escribe tu pregunta abajo.", sinVoz: "La voz no está disponible ahora. Sigamos por escrito.", conectando: "Conectando…", escucho: "Te escucho. Habla cuando quieras.", fin: "La llamada terminó. Puedes seguir escribiendo aquí.", plegar: "Ocultar" };
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
    css.textContent += ".ae-b{bottom:calc(max(16px,env(safe-area-inset-bottom,0px)) + var(--ae-sube,0px))}"
      + ".ae-v{display:flex;gap:8px;align-items:center;padding:10px 14px 0}.ae-v button{flex:1;display:flex;align-items:center;justify-content:center;gap:8px;border:1px solid rgba(236,230,219,.3);background:#1E1B17;color:#ECE6DB;border-radius:12px;padding:10px 12px;font:inherit;font-weight:600;cursor:pointer}.ae-v button:hover{border-color:#F5A300}.ae-v button.on{background:#E3120B;border-color:#E3120B;color:#fff}.ae-v svg{width:18px;height:18px;flex:none}"
      + ".ae-m .el.av{background:#22302E;border-color:rgba(62,163,152,.5)}"
      + "@media (max-width:719px){.ae-p{left:0;right:0;bottom:0;width:100%;height:min(76dvh,620px);border-radius:20px 20px 0 0;border-width:1px 0 0}}"
      // En celular, con «fijo», la burbuja es un círculo pequeño (no tapa los botones de la página); su texto sigue para lectores de pantalla.
      + "@media (max-width:719px){.ae-b.ae-mini{width:56px;height:56px;padding:0;justify-content:center;font-size:0;gap:0;background:#0A0908;border:2px solid #F5A300}.ae-b.ae-mini::before{width:14px;height:14px;background:#F5A300;box-shadow:0 0 0 5px rgba(245,163,0,.25)}}"
      + "@media (min-width:1180px){.ae-p.ae-fijo{top:0;bottom:0;right:0;left:auto;width:380px;height:100dvh;border-radius:0;border-width:0 0 0 1px;box-shadow:none}.ae-p.ae-fijo.ae-izq{left:0;right:auto;border-width:0 1px 0 0}"
      + "html.ae-lado body{padding-right:380px}html.ae-lado.ae-lado-izq body{padding-right:0;padding-left:380px}}";
    if (o.izquierda) css.textContent += ".ae-b,.ae-p{right:auto;left:max(16px,env(safe-area-inset-left,0px))}";
    document.head.appendChild(css);
    var b = document.createElement("button"); b.type = "button"; b.className = "ae-b"; b.id = "aeAbrir"; b.textContent = o.boton || L.boton;
    var p = document.createElement("div"); p.className = "ae-p"; p.hidden = true; p.setAttribute("role", "dialog"); p.setAttribute("aria-label", o.titulo || L.titulo);
    var h = document.createElement("div"); h.className = "ae-h"; h.appendChild(document.createElement("i"));
    var t = document.createElement("b"); t.textContent = o.titulo || L.titulo; h.appendChild(t);
    var x = document.createElement("button"); x.type = "button"; x.setAttribute("aria-label", L.cerrar); x.textContent = "×"; h.appendChild(x);
    var m = document.createElement("div"); m.className = "ae-m"; m.id = "aeMensajes";
    var s = document.createElement("div"); s.className = "ae-s";
    var FIJO = !!o.fijo, ancho = function () { return window.matchMedia && matchMedia("(min-width:1180px)").matches; };
    var guarda = { get: function () { try { return localStorage.getItem("cw-agente-plegado"); } catch (e) { return null; } }, set: function (v) { try { localStorage.setItem("cw-agente-plegado", v); } catch (e) { /* sin almacenamiento */ } } };
    if (FIJO) { b.classList.add("ae-mini"); b.setAttribute("aria-label", o.boton || L.boton); p.classList.add("ae-fijo"); if (o.izquierda) p.classList.add("ae-izq"); x.setAttribute("aria-label", L.plegar); }
    var vz = null, bv = null, conv = null, conectando = false;
    var MIC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v3"/></svg>';
    if (o.voz && o.voz.pedir) { vz = document.createElement("div"); vz.className = "ae-v"; bv = document.createElement("button"); bv.type = "button"; bv.id = "aeVoz"; bv.innerHTML = MIC + "<span></span>"; bv.lastChild.textContent = L.hablar; vz.appendChild(bv); }
    var f = document.createElement("form"); f.className = "ae-f"; f.autocomplete = "off";
    var i = document.createElement("input"); i.type = "text"; i.maxLength = 1200; i.placeholder = L.ph; i.setAttribute("aria-label", L.tu); i.id = "aeTexto"; i.autocomplete = "off";
    var e = document.createElement("button"); e.type = "submit"; e.textContent = L.enviar;
    var n = document.createElement("div"); n.className = "ae-n"; n.textContent = o.nota || L.nota;
    f.appendChild(i); f.appendChild(e); p.appendChild(h); if (vz) p.appendChild(vz); p.appendChild(m); p.appendChild(s); p.appendChild(f); p.appendChild(n);
    document.body.appendChild(b); document.body.appendChild(p);
    function burbuja(clase, texto) { var d = document.createElement("div"); d.className = clase; d.textContent = texto; m.appendChild(d); m.scrollTop = 1e9; return d; }
    function sugerir() { s.textContent = ""; (o.sugerencias || []).forEach(function (q) { var c = document.createElement("button"); c.type = "button"; c.textContent = q; c.onclick = function () { enviar(q); }; s.appendChild(c); }); }
    function lado() { var on = FIJO && abierto && ancho(); document.documentElement.classList.toggle("ae-lado", on); document.documentElement.classList.toggle("ae-lado-izq", on && !!o.izquierda); document.documentElement.style.setProperty("--ae-ancho", on ? "380px" : "0px"); }
    function abrir(v, sinFoco) { abierto = v; p.hidden = !v; b.hidden = v; lado(); if (v) { if (!m.childNodes.length) { burbuja("el", o.saludo || L.saludo); sugerir(); } if (!sinFoco) i.focus(); } else if (conv || conectando) colgar(); }
    // ----- Voz: «Hablar con el agente» -----
    function estadoVoz(on) { if (!bv) return; bv.classList.toggle("on", on); bv.lastChild.textContent = on ? L.colgar : L.hablar; }
    function colgar() { conectando = false; var c = conv; conv = null; estadoVoz(false); try { if (c) c.endSession(); } catch (e) { /* ya terminó */ } }
    async function hablar() {
      if (conv || conectando) { colgar(); burbuja("el av", L.fin); return; }
      conectando = true; estadoVoz(true); s.textContent = "";
      burbuja("el av", L.permiso);
      try { var st = await navigator.mediaDevices.getUserMedia({ audio: true }); st.getTracks().forEach(function (t) { t.stop(); }); }
      catch (err) { conectando = false; estadoVoz(false); burbuja("el av", L.sinMic); i.focus(); return; }
      var aviso = burbuja("el av", L.conectando);
      try {
        var cred = await o.voz.pedir();
        if (!cred || (!cred.token && !cred.signed_url)) throw new Error((cred && cred.error) || L.sinVoz);
        var mod = await import(o.voz.sdk || "https://cdn.jsdelivr.net/npm/@elevenlabs/client@1.30.0/+esm");
        var op = { overrides: { agent: { prompt: { prompt: cred.instrucciones || "" }, firstMessage: cred.saludo || "", language: cred.idioma || (EN ? "en" : "es") } },
          onConnect: function () { aviso.textContent = L.escucho; }, onDisconnect: function () { if (conv) { conv = null; estadoVoz(false); burbuja("el av", L.fin); } },
          onError: function () { /* se avisa al desconectar */ },
          onMessage: function (x) { var t = String((x && x.message) || "").trim(); if (!t) return; var mio = x.role === "user" || x.source === "user"; if (mio && o.filtro && o.filtro(t)) return; burbuja(mio ? "yo" : "el", t); } };
        var c = cred.token ? await mod.Conversation.startSession(Object.assign({ conversationToken: cred.token, connectionType: "webrtc" }, op)).catch(function (e2) { if (!cred.signed_url) throw e2; return mod.Conversation.startSession(Object.assign({ signedUrl: cred.signed_url, connectionType: "websocket" }, op)); })
          : await mod.Conversation.startSession(Object.assign({ signedUrl: cred.signed_url, connectionType: "websocket" }, op));
        if (!conectando) { try { c.endSession(); } catch (e3) { /* nada */ } return; }
        conv = c; conectando = false;
      } catch (err) { conectando = false; conv = null; estadoVoz(false); aviso.textContent = (err && err.message && err.message.length < 160 && !/fetch|import|module|undefined|null/i.test(err.message)) ? err.message : L.sinVoz; i.focus(); }
    }
    if (bv) bv.onclick = hablar;
    window.addEventListener("pagehide", function () { try { if (conv) conv.endSession(); } catch (e) { /* nada */ } });
    async function enviar(texto) {
      texto = String(texto || "").trim(); if (!texto) return;
      // Una clave pegada por error no se envía, no se guarda en la conversación y ni siquiera se muestra.
      var bloqueo = o.filtro ? o.filtro(texto) : null;
      if (bloqueo) { s.textContent = ""; burbuja("yo", "••••••••"); burbuja("el", bloqueo); return; }
      if (conv) { burbuja("yo", texto); try { conv.sendUserMessage(texto); } catch (e) { /* la llamada terminó */ } return; }
      s.textContent = ""; chat.push({ rol: "usuario", texto: texto }); burbuja("yo", texto);
      var espera = burbuja("el", "…");
      try {
        var r = await fetch(o.api, { method: "POST", headers: Object.assign({ "content-type": "application/json" }, o.cabeceras ? o.cabeceras() : {}), body: JSON.stringify(Object.assign({ accion: o.accion, idioma: EN ? "en" : "es", mensajes: chat.slice(-10) }, o.datos ? o.datos() : {})) });
        var j = await r.json().catch(function () { return {}; });
        var resp = j.texto || (EN ? null : j.error) || L.falla;
        espera.textContent = resp; if (j.texto && r.ok) chat.push({ rol: "asistente", texto: resp });
      } catch (err) { espera.textContent = L.red; }
      m.scrollTop = 1e9;
    }
    b.onclick = function () { abrir(true); if (FIJO) guarda.set("no"); }; x.onclick = function () { abrir(false); if (FIJO) guarda.set("si"); };
    if (FIJO) { window.addEventListener("resize", lado); if (ancho() && guarda.get() !== "si") abrir(true, true); }
    f.onsubmit = function (ev) { ev.preventDefault(); var v = i.value; i.value = ""; enviar(v); };
    document.addEventListener("keydown", function (ev) { if (ev.key === "Escape" && abierto && !(FIJO && ancho())) abrir(false); });
    return { abrir: function () { abrir(true); }, cerrar: function () { abrir(false); }, preguntar: function (q) { abrir(true); enviar(q); }, decir: function (t) { if (!m.childNodes.length) { burbuja("el", o.saludo || L.saludo); } burbuja("el", String(t)); }, hablar: hablar };
  };
})();
