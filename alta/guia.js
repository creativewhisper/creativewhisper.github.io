/* Conexión guiada del alta (fase 7): WhatsApp e Instagram, un paso a la vez. Textos en español e inglés en este mismo archivo
   (el bloque va marcado data-nt: no pasa por el diccionario de idioma.js y se vuelve a pintar al cambiar de idioma).
   Lenguaje simple: «clave de acceso» en lugar de «token». Las claves solo se escriben en los campos protegidos del paso 6. */
(function () {
  "use strict";
  var CW_WA = "593969235680";
  var TX = {
    es: {
      titulo: "Conecta tus canales", intro: "WhatsApp e Instagram se conectan dentro de TU cuenta de Meta, así siguen siendo tuyos. Te llevo de la mano, un paso a la vez. Puedes parar cuando quieras: lo que avanzas queda guardado.",
      guiada: "Conexión guiada", guiadaTx: "Paso a paso, con imágenes de dónde hacer clic. Unos 45 minutos.", equipo: "Prefiero que me guíen", equipoTx: "Una videollamada con el equipo: lo hacen contigo en pantalla.",
      paso: "Paso", de: "de", faltan: "Faltan unos", min: "min", listo: "¡Listo!", atras: "Atrás", sig: "Ya lo hice, siguiente", despues: "Seguir después", abrir: "Abrir esta pantalla en Meta", nueva: "Se abre en otra pestaña. Vuelve aquí cuando termines.",
      guardado: "Tu avance quedó guardado. Vuelve con el mismo enlace y sigues donde quedaste.", ayuda: "¿Te trabaste? Pregúntame en el chat o toca «Hablar con el agente».", copiar: "Copiar", copiado: "Copiado",
      faltaLista: "Marca lo que ya tienes. Lo que falte, te digo cómo conseguirlo.", todoListo: "Tienes todo. ¡Vamos!", pideTitulo: "Listo: abrimos tu WhatsApp con el mensaje escrito", pideTx: "Envíalo y el equipo te responde hoy para agendar la videollamada (unos 45 minutos). Mientras tanto puedes seguir con el alta: este paso se puede dejar para después.",
      pideMsg: "Hola. Soy de {e}. Estoy en el alta de Susurro digital y prefiero que me guíen por videollamada para conectar WhatsApp e Instagram. Me queda bien este día y hora: ",
      pideBtn: "Pedir la videollamada por WhatsApp", volverGuia: "Mejor lo intento con la guía", seguridad: "🔒 Estos tres campos están protegidos: se guardan cifrados y nadie los vuelve a ver. Nunca los pegues en el chat ni se los des a nadie por teléfono.",
      otras: "¿Tu página muestra un botón «Conectar»? También sirve", hecho: "Hecho", ver: "Ver",
    },
    en: {
      titulo: "Connect your channels", intro: "WhatsApp and Instagram are connected inside YOUR Meta account, so they stay yours. I will walk you through it, one step at a time. You can stop whenever you like: your progress is saved.",
      guiada: "Guided connection", guiadaTx: "Step by step, with pictures of where to click. About 45 minutes.", equipo: "I'd rather be guided", equipoTx: "A video call with the team: they do it with you on screen.",
      paso: "Step", de: "of", faltan: "About", min: "min left", listo: "Done!", atras: "Back", sig: "Done, next", despues: "Continue later", abrir: "Open this screen in Meta", nueva: "It opens in another tab. Come back here when you finish.",
      guardado: "Your progress is saved. Come back with the same link and pick up where you left off.", ayuda: "Stuck? Ask me in the chat or tap “Talk to the agent”.", copiar: "Copy", copiado: "Copied",
      faltaLista: "Tick what you already have. For anything missing, I'll tell you how to get it.", todoListo: "You have everything. Let's go!", pideTitulo: "Done: we open your WhatsApp with the message written", pideTx: "Send it and the team will reply today to schedule the video call (about 45 minutes). Meanwhile you can continue the setup: this step can wait.",
      pideMsg: "Hi. I'm from {e}. I'm setting up Digital Whisper and I'd rather be guided on a video call to connect WhatsApp and Instagram. This day and time works for me: ",
      pideBtn: "Ask for the video call on WhatsApp", volverGuia: "I'll try the guide instead", seguridad: "🔒 These three fields are protected: they are stored encrypted and nobody sees them again. Never paste them in the chat or give them to anyone over the phone.",
      otras: "Does your page show a “Connect” button? That works too", hecho: "Done", ver: "View",
    },
  };
  // Cada paso: título, minutos, a dónde lleva el botón, qué hacer (frases cortas) y el dibujo de la pantalla de Meta (menú, lo resaltado).
  var PASOS = {
    es: [
      { t: "Antes de empezar: ¿qué tienes listo?", m: 5, lista: [
        ["portafolio", "Mi negocio tiene su cuenta de empresa en Meta y yo la administro", "Se llama «portafolio comercial». Si no lo tienes, se crea gratis en dos minutos.", "https://business.facebook.com/overview"],
        ["numero", "Tengo a la mano el celular del WhatsApp de mi negocio", "Te va a llegar un código. Ojo: ese número deja de funcionar en la app de WhatsApp Business; lo atiende tu asistente.", null],
        ["tarjeta", "Tengo una tarjeta para ponerla en WhatsApp", "Meta te cobra a ti los mensajes que pasan de los gratuitos. Se pone en «Configuración de pago».", "https://business.facebook.com/billing_hub/payment_settings"],
        ["instagram_pro", "Mi Instagram es profesional y está vinculado a mi página de Facebook", "En Instagram: Configuración → Cuenta → Cambiar a cuenta profesional, y «Página vinculada».", "https://www.facebook.com/settings/?tab=linked_instagram"],
        ["privacidad", "Mi web tiene una página de política de privacidad", "Meta la pide para tu app. Si no la tienes, el equipo te pasa un texto listo para pegar.", null]] },
      { t: "Crea tu app en Meta", m: 5, url: "https://developers.facebook.com/apps/creation/", que: ["Toca «Crear app».", "Elige el tipo «Negocio».", "Ponle de nombre «Asistente {e}» y elige TU portafolio comercial."], d: { barra: "developers.facebook.com", menu: ["Mis apps", "Herramientas", "Ayuda"], titulo: "Mis apps", boton: "Crear app", campos: ["Nombre de la app", "Portafolio comercial"] } },
      { t: "Agrégale WhatsApp e Instagram", m: 8, url: "https://developers.facebook.com/apps/", que: ["Dentro de tu app, toca «Agregar casos de uso».", "Marca «Conectar con clientes por WhatsApp» y elige tu número.", "Marca «Administrar mensajes y contenido en Instagram»."], d: { barra: "developers.facebook.com", menu: ["Panel", "Casos de uso", "Configuración"], activo: 1, titulo: "Casos de uso", opciones: ["Conectar con clientes por WhatsApp", "Administrar mensajes y contenido en Instagram"], boton: "Guardar" } },
      { t: "Completa los datos básicos y copia dos datos", m: 5, url: "https://developers.facebook.com/apps/", que: ["Ve a «Configuración de la app» → «Básica».", "Pega la dirección de tu política de privacidad, sube tu logo y elige la categoría «Negocios y páginas».", "Arriba están el «Identificador de la app» y la «Clave secreta» (toca «Mostrar»). Los vas a pegar en el paso 6: déjalos a la vista."], d: { barra: "developers.facebook.com", menu: ["Panel", "Casos de uso", "Configuración › Básica"], activo: 2, titulo: "Configuración básica", campos: ["Identificador de la app", "Clave secreta de la app"], boton: "Mostrar" } },
      { t: "Crea el usuario de tu asistente", m: 5, url: "https://business.facebook.com/settings/system-users", que: ["En «Usuarios del sistema», toca «Agregar».", "Nombre: asistente-cw. Rol: Administrador.", "Toca «Asignar activos» y dale control total de: tu app, tu cuenta de WhatsApp, tu página y tu Instagram."], copia: "asistente-cw", d: { barra: "business.facebook.com", menu: ["Personas", "Socios", "Usuarios del sistema"], activo: 2, titulo: "Usuarios del sistema", boton: "Agregar", campos: ["Nombre: asistente-cw", "Rol: Administrador"] } },
      { t: "Genera tu clave de acceso", m: 5, url: "https://business.facebook.com/settings/system-users", que: ["Con ese usuario elegido, toca «Generar token» (así llama Meta a la clave de acceso).", "Elige tu app y, en vencimiento, «Nunca».", "Marca los permisos de la lista de abajo y toca «Generar». Copia la clave: la pegas en el siguiente paso."], permisos: true, d: { barra: "business.facebook.com", menu: ["Personas", "Socios", "Usuarios del sistema"], activo: 2, titulo: "asistente-cw", boton: "Generar token", campos: ["Vencimiento: Nunca", "Permisos: los de la lista"] } },
      { t: "Pega tus tres datos aquí", m: 5, pegar: true, que: ["Pega el identificador de la app, la clave secreta y la clave de acceso.", "Toca «Conectar». Yo reviso todo y te digo si falta algo."] },
      { t: "Publica tu app", m: 5, url: "https://developers.facebook.com/apps/", que: ["Arriba, en el panel de tu app, cambia el modo a «Activo» (Live) o toca «Publicar».", "Si Meta pide algo más, casi siempre es la política de privacidad o el ícono: complétalo ahí mismo."], d: { barra: "developers.facebook.com", menu: ["Panel", "Casos de uso", "Configuración"], activo: 0, titulo: "Asistente {e}", interruptor: "Modo de la app: Activo", boton: "Publicar" } },
      { t: "Pruébalo", m: 5, que: ["Desde otro celular, escribe «Hola, ¿qué horario tienen?» al WhatsApp de tu negocio.", "Tu asistente debe responder en segundos.", "¿No respondió? Revisa que la app esté en modo «Activo» (paso 7) o pregúntame en el chat."], fin: true },
    ],
    en: [
      { t: "Before you start: what do you have ready?", m: 5, lista: [
        ["portafolio", "My business has its Meta business account and I manage it", "It is called a “business portfolio”. If you don't have one, it is free and takes two minutes.", "https://business.facebook.com/overview"],
        ["numero", "I have the phone with my business WhatsApp number at hand", "A code will be sent to it. Note: that number stops working in the WhatsApp Business app; your assistant answers it.", null],
        ["tarjeta", "I have a card to add to WhatsApp", "Meta bills you for messages beyond the free ones. You add it under “Payment settings”.", "https://business.facebook.com/billing_hub/payment_settings"],
        ["instagram_pro", "My Instagram is a professional account linked to my Facebook Page", "In Instagram: Settings → Account → Switch to professional account, and “Linked Page”.", "https://www.facebook.com/settings/?tab=linked_instagram"],
        ["privacidad", "My website has a privacy policy page", "Meta requires it for your app. If you don't have one, the team will send you a text ready to paste.", null]] },
      { t: "Create your app in Meta", m: 5, url: "https://developers.facebook.com/apps/creation/", que: ["Tap “Create app”.", "Choose the “Business” type.", "Name it “Assistant {e}” and choose YOUR business portfolio."], d: { barra: "developers.facebook.com", menu: ["My apps", "Tools", "Help"], titulo: "My apps", boton: "Create app", campos: ["App name", "Business portfolio"] } },
      { t: "Add WhatsApp and Instagram to it", m: 8, url: "https://developers.facebook.com/apps/", que: ["Inside your app, tap “Add use cases”.", "Tick “Connect with customers through WhatsApp” and choose your number.", "Tick “Manage messaging & content on Instagram”."], d: { barra: "developers.facebook.com", menu: ["Dashboard", "Use cases", "Settings"], activo: 1, titulo: "Use cases", opciones: ["Connect with customers through WhatsApp", "Manage messaging & content on Instagram"], boton: "Save" } },
      { t: "Fill in the basics and copy two values", m: 5, url: "https://developers.facebook.com/apps/", que: ["Go to “App settings” → “Basic”.", "Paste your privacy policy address, upload your logo and choose the “Business and pages” category.", "At the top you will see the “App ID” and the “App secret” (tap “Show”). You will paste them in step 6: keep them in view."], d: { barra: "developers.facebook.com", menu: ["Dashboard", "Use cases", "Settings › Basic"], activo: 2, titulo: "Basic settings", campos: ["App ID", "App secret"], boton: "Show" } },
      { t: "Create your assistant's user", m: 5, url: "https://business.facebook.com/settings/system-users", que: ["Under “System users”, tap “Add”.", "Name: asistente-cw. Role: Admin.", "Tap “Assign assets” and give it full control of: your app, your WhatsApp account, your Page and your Instagram."], copia: "asistente-cw", d: { barra: "business.facebook.com", menu: ["People", "Partners", "System users"], activo: 2, titulo: "System users", boton: "Add", campos: ["Name: asistente-cw", "Role: Admin"] } },
      { t: "Generate your access key", m: 5, url: "https://business.facebook.com/settings/system-users", que: ["With that user selected, tap “Generate token” (that is what Meta calls the access key).", "Choose your app and, under expiration, “Never”.", "Tick the permissions listed below and tap “Generate”. Copy the key: you paste it in the next step."], permisos: true, d: { barra: "business.facebook.com", menu: ["People", "Partners", "System users"], activo: 2, titulo: "asistente-cw", boton: "Generate token", campos: ["Expiration: Never", "Permissions: the ones listed"] } },
      { t: "Paste your three values here", m: 5, pegar: true, que: ["Paste the app ID, the app secret and the access key.", "Tap “Connect”. I check everything and tell you if something is missing."] },
      { t: "Publish your app", m: 5, url: "https://developers.facebook.com/apps/", que: ["At the top of your app dashboard, switch the mode to “Live” or tap “Publish”.", "If Meta asks for something else, it is almost always the privacy policy or the icon: complete it right there."], d: { barra: "developers.facebook.com", menu: ["Dashboard", "Use cases", "Settings"], activo: 0, titulo: "Assistant {e}", interruptor: "App mode: Live", boton: "Publish" } },
      { t: "Try it", m: 5, que: ["From another phone, send “Hi, what are your opening hours?” to your business WhatsApp.", "Your assistant should answer within seconds.", "No answer? Check that the app is in “Live” mode (step 7) or ask me in the chat."], fin: true },
    ],
  };
  var PERMISOS = ["whatsapp_business_management", "whatsapp_business_messaging", "instagram_basic", "instagram_manage_comments", "instagram_content_publish", "instagram_manage_insights", "pages_show_list", "pages_read_engagement", "pages_manage_posts", "read_insights", "business_management"];
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]; }); };

  // Dibujo de «dónde hacer clic»: una ventana con el menú de Meta, lo que hay que tocar resaltado en naranja y un cursor.
  function dibujo(d, emp) {
    if (!d) return "";
    var y = 78, cuerpo = "", tx = function (s) { return esc(String(s).replace("{e}", emp)); };
    var menu = (d.menu || []).map(function (m, i) { var on = i === (d.activo == null ? -1 : d.activo); return '<rect x="14" y="' + (66 + i * 34) + '" width="132" height="26" rx="7" fill="' + (on ? "#FFD7BD" : "transparent") + '"/><text x="24" y="' + (83 + i * 34) + '" font-size="11.5" font-weight="' + (on ? 700 : 500) + '" fill="#0A0908">' + tx(m) + "</text>"; }).join("");
    cuerpo += '<text x="176" y="' + y + '" font-size="15" font-weight="800" fill="#0A0908">' + tx(d.titulo || "") + "</text>"; y += 16;
    (d.opciones || []).forEach(function (o) { cuerpo += '<rect x="176" y="' + y + '" width="330" height="30" rx="8" fill="#fff" stroke="#E6DCCD"/><rect x="186" y="' + (y + 8) + '" width="14" height="14" rx="3" fill="#3EA398"/><path d="M189 ' + (y + 15) + 'l3 3 6-6" stroke="#fff" stroke-width="2" fill="none"/><text x="208" y="' + (y + 20) + '" font-size="11.5" fill="#0A0908">' + tx(o) + "</text>"; y += 38; });
    (d.campos || []).forEach(function (c) { cuerpo += '<rect x="176" y="' + y + '" width="230" height="28" rx="8" fill="#fff" stroke="#E6DCCD"/><text x="186" y="' + (y + 18) + '" font-size="11.5" fill="#6B6259">' + tx(c) + "</text>"; y += 36; });
    if (d.interruptor) { cuerpo += '<rect x="176" y="' + y + '" width="250" height="30" rx="15" fill="#E3F4F1"/><circle cx="406" cy="' + (y + 15) + '" r="10" fill="#3EA398"/><text x="190" y="' + (y + 20) + '" font-size="11.5" font-weight="600" fill="#1E5E57">' + tx(d.interruptor) + "</text>"; y += 40; }
    var bw = Math.max(96, String(d.boton || "").length * 8 + 30), bx = 176, by = Math.min(y + 4, 196);
    if (d.boton) cuerpo += '<rect class="anillo" x="' + (bx - 6) + '" y="' + (by - 6) + '" width="' + (bw + 12) + '" height="44" rx="14" fill="none" stroke="#F5A300" stroke-width="3"/><rect x="' + bx + '" y="' + by + '" width="' + bw + '" height="32" rx="9" fill="#0A0908"/><text x="' + (bx + bw / 2) + '" y="' + (by + 21) + '" font-size="12.5" font-weight="700" fill="#fff" text-anchor="middle">' + tx(d.boton) + '</text><path class="cursor" d="M' + (bx + bw - 14) + " " + (by + 20) + 'l0 22 6-5 4 9 4-2-4-9 8 0z" fill="#fff" stroke="#0A0908" stroke-width="1.6" stroke-linejoin="round"/>';
    return '<svg class="dibujo" viewBox="0 0 540 250" role="img" aria-label="' + tx((d.titulo || "") + ": " + (d.boton || "")) + '"><rect x="1" y="1" width="538" height="248" rx="14" fill="#FBF7F2" stroke="#E6DCCD" stroke-width="2"/><rect x="1" y="1" width="538" height="38" rx="14" fill="#0A0908"/><rect x="1" y="24" width="538" height="15" fill="#0A0908"/><circle cx="20" cy="20" r="5" fill="#E3120B"/><circle cx="37" cy="20" r="5" fill="#F5A300"/><circle cx="54" cy="20" r="5" fill="#3EA398"/><rect x="76" y="10" width="300" height="20" rx="10" fill="#211d1a"/><text x="90" y="24" font-size="11" fill="#CDBFA6" font-family="ui-monospace,monospace">' + esc(d.barra || "") + '</text><rect x="1" y="39" width="158" height="210" fill="#F1EADF"/><rect x="1" y="235" width="158" height="14" rx="0" fill="#F1EADF"/>' + menu + cuerpo + "</svg>";
  }

  window.CWGuia = function (o) {
    // o: { raiz, empresa(), idioma(), estado (lo guardado), guardar(datos), camposPegar (el bloque con los campos protegidos), alCambiar(paso), decir(texto) }
    var E = Object.assign({ modo: null, paso: 0, hechos: [], lista: {}, pide_guia: false }, o.estado || {});
    if (E.pide_guia) E.modo = "equipo"; else if (E.paso > 0 || (E.hechos || []).length || Object.keys(E.lista || {}).some(function (k) { return E.lista[k]; })) E.modo = "guiada";
    var temporizador = null;
    function guardar() { clearTimeout(temporizador); temporizador = setTimeout(function () { o.guardar({ lista: E.lista, paso: E.paso, hechos: E.hechos, pide_guia: E.pide_guia }); }, 500); }
    function L() { return TX[o.idioma() === "en" ? "en" : "es"]; }
    function P() { return PASOS[o.idioma() === "en" ? "en" : "es"]; }
    function restan() { return P().reduce(function (n, p, i) { return n + (E.hechos.indexOf(i) >= 0 ? 0 : p.m); }, 0); }
    function pintar() {
      var l = L(), ps = P(), emp = o.empresa() || "", r = o.raiz, n = ps.length, hechos = E.hechos.length;
      var html = '<div class="g-modos"><button type="button" class="g-modo' + (E.modo === "guiada" ? " on" : "") + '" data-modo="guiada"><span class="ic">🧭</span><b>' + esc(l.guiada) + "</b><small>" + esc(l.guiadaTx) + '</small></button><button type="button" class="g-modo' + (E.modo === "equipo" ? " on" : "") + '" data-modo="equipo"><span class="ic">🤝</span><b>' + esc(l.equipo) + "</b><small>" + esc(l.equipoTx) + "</small></button></div>";
      if (E.modo === "equipo") {
        var msg = l.pideMsg.replace("{e}", emp);
        html += '<div class="g-caja"><h3>' + esc(l.pideTitulo) + '</h3><p class="ayuda">' + esc(l.pideTx) + '</p><div class="acciones" style="justify-content:flex-start"><a class="btn pri" id="gPedir" target="_blank" rel="noopener" href="https://wa.me/' + CW_WA + "?text=" + encodeURIComponent(msg) + '">' + esc(l.pideBtn) + '</a><button type="button" class="btn" data-modo="guiada">' + esc(l.volverGuia) + "</button></div></div>";
      } else if (E.modo === "guiada") {
        var i = Math.max(0, Math.min(n - 1, E.paso)), p = ps[i];
        html += '<div class="g-avance"><div class="g-barra"><i style="width:' + Math.round(hechos / n * 100) + '%"></i></div><div class="g-cuenta"><b>' + esc(l.paso) + " " + (i + 1) + " " + esc(l.de) + " " + n + "</b><span>" + (hechos >= n ? esc(l.listo) : esc(l.faltan) + " " + restan() + " " + esc(l.min)) + '</span></div><div class="g-puntos">' + ps.map(function (_x, k) { return '<button type="button" data-ira="' + k + '" class="' + (k === i ? "on " : "") + (E.hechos.indexOf(k) >= 0 ? "ok" : "") + '" aria-label="' + esc(l.paso) + " " + (k + 1) + '">' + (E.hechos.indexOf(k) >= 0 ? "✓" : k + 1) + "</button>"; }).join("") + "</div></div>";
        html += '<div class="g-caja" id="gPaso" data-paso-guia="' + i + '"><div class="g-cab"><h3>' + (i + 1) + ". " + esc(p.t.replace("{e}", emp)) + '</h3><span class="g-min">≈ ' + p.m + " min</span></div>";
        if (p.lista) {
          html += '<p class="ayuda">' + esc(l.faltaLista) + '</p><ul class="g-lista">' + p.lista.map(function (x) { return '<li><label><input type="checkbox" data-lista="' + x[0] + '"' + (E.lista[x[0]] ? " checked" : "") + "><span><b>" + esc(x[1]) + "</b><small>" + esc(x[2]) + "</small></span></label>" + (x[3] ? '<a class="btn chico" target="_blank" rel="noopener" href="' + esc(x[3]) + '">' + esc(l.ver) + " ↗</a>" : "") + "</li>"; }).join("") + "</ul>";
        } else {
          html += '<div class="g-dos">' + (p.d ? '<div class="g-dib">' + dibujo(p.d, emp) + "</div>" : "") + '<ol class="g-que">' + p.que.map(function (q) { return "<li>" + esc(q.replace("{e}", emp)) + "</li>"; }).join("") + "</ol></div>";
          if (p.copia) html += '<div class="g-copia"><code>' + esc(p.copia) + '</code><button type="button" class="btn chico" data-copiar="' + esc(p.copia) + '">' + esc(l.copiar) + "</button></div>";
          if (p.permisos) html += '<div class="g-perm">' + PERMISOS.map(function (x) { return "<code>" + x + "</code>"; }).join("") + "</div>";
          if (p.url) html += '<div class="g-abrir"><a class="btn oscuro" target="_blank" rel="noopener" href="' + esc(p.url) + '">' + esc(l.abrir) + ' ↗</a><small>' + esc(l.nueva) + "</small></div>";
          if (p.pegar) html += '<div class="aviso info">' + esc(l.seguridad) + '</div><div id="gPegar"></div>';
        }
        html += '<p class="g-ayuda">' + esc(l.ayuda) + '</p><div class="acciones"><button type="button" class="btn" data-gatras' + (i === 0 ? " disabled" : "") + ">" + esc(l.atras) + '</button><span class="g-fin"><button type="button" class="btn" data-gdespues>' + esc(l.despues) + "</button>" + (p.fin ? "" : '<button type="button" class="btn pri" data-gsig>' + esc(l.sig) + "</button>") + "</span></div></div>";
      }
      r.innerHTML = html;
      // Los campos protegidos son SIEMPRE los mismos elementos de la página (no se copian sus valores): se mueven a su sitio.
      var hueco = r.querySelector("#gPegar"), campos = o.camposPegar;
      if (hueco && campos) { hueco.appendChild(campos); campos.hidden = false; } else if (campos) { campos.hidden = true; document.body.appendChild(campos); }
    }
    function ir(k) { E.paso = Math.max(0, Math.min(P().length - 1, k)); guardar(); pintar(); if (o.alCambiar) o.alCambiar(E.paso); var c = o.raiz.querySelector("#gPaso"); if (c && c.scrollIntoView) c.scrollIntoView({ block: "nearest", behavior: "smooth" }); }
    o.raiz.addEventListener("click", function (ev) {
      var t = ev.target, b;
      if ((b = t.closest("[data-modo]"))) { E.modo = b.dataset.modo; E.pide_guia = E.modo === "equipo"; guardar(); pintar(); if (o.alCambiar) o.alCambiar(E.paso); return; }
      if (t.closest("#gPedir")) { E.pide_guia = true; guardar(); return; }
      if ((b = t.closest("[data-ira]"))) return ir(Number(b.dataset.ira));
      if (t.closest("[data-gatras]")) return ir(E.paso - 1);
      if (t.closest("[data-gsig]")) { if (E.hechos.indexOf(E.paso) < 0) E.hechos.push(E.paso); return ir(E.paso + 1); }
      if (t.closest("[data-gdespues]")) { guardar(); if (o.decir) o.decir(L().guardado); if (o.despues) o.despues(); return; }
      if ((b = t.closest("[data-copiar]"))) { try { navigator.clipboard.writeText(b.dataset.copiar); } catch (e) { /* sin portapapeles */ } b.textContent = L().copiado; }
    });
    o.raiz.addEventListener("change", function (ev) { var c = ev.target.closest("[data-lista]"); if (!c) return; E.lista[c.dataset.lista] = c.checked; guardar(); });
    pintar();
    return { pintar: pintar, estado: function () { return E; }, hecho: function (k) { if (E.hechos.indexOf(k) < 0) E.hechos.push(k); guardar(); pintar(); }, ir: ir, pasos: function () { return P().length; } };
  };
  window.CWGuia.PASOS = PASOS;
})();
