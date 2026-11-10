/* Asistente de chat y voz de Creative Whisper: configuración de la web de CW.
   Lo cargan la portada y las páginas internas; el asistente común está en asistente/asistente.js.
   La información sale de la base de Creative Whisper (función asistente-web de Supabase). */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  // En la portada, Servicios es un solo tramo animado que muestra un área en cada punto.
  // En servicios.html cada área tiene su propia sección; en datos y portafolio hay equivalentes.
  var INTERNAS = {
    "servicios": ["areas"],
    "servicios-datos": ["area-datos", "ciclo"],
    "servicios-produccion": ["area-produccion"],
    "servicios-marketing": ["area-digital"],
    "servicios-automatizacion": ["area-automatizacion", "conversaciones"],
    "trabajo": ["galeria"]
  };
  window.CW_ASISTENTE = {
    sitio: "cw",
    tema: { fondo: "#0A0908", panel: "#14120F", panel2: "#1E1B17", texto: "#ECE6DB", suave: "#A39A8D",
            acento: "#3EA398", acentoTexto: "#5CC2B6", sobreAcento: "#0A0908", linea: "rgba(236,230,219,.14)",
            fuente: '"Hanken Grotesk",system-ui,-apple-system,"Segoe UI",sans-serif',
            titulo: '"Big Shoulders Display","Arial Narrow",Impact,sans-serif' },
    textos: /^en/i.test(document.documentElement.lang || "") ? {
      boton: (("ontouchstart" in window) || matchMedia("(pointer: coarse)").matches) ? "Tap here and be surprised" : "Click here and be surprised",
      titulo: "Creative Whisper assistant", subtitulo: "Replies instantly",
      saludo: "Hi. I am the Creative Whisper assistant: I can tell you what we do and how we can help your brand.",
      sugerencias: ["What services do you offer?", "How do you work?", "Can you build an assistant like this for my website?", "How do I book a meeting?"],
      nota: "Creative Whisper automated assistant. To book a meeting, use the WhatsApp button.",
      permiso: "To talk with you by voice, we are asking for permission to use your microphone. It is only used while this conversation is open.",
      sinMic: "Without microphone access, we will continue by text. If you change your mind, tap the microphone next to the text field.",
      sinVoz: "We could not connect voice right now. We will continue by text.",
      finAgente: "The call ended. If you have another question, type it here or tap the microphone.",
      finPersona: "The voice conversation ended. You can keep writing or talk again with the microphone.",
      error: "I could not answer right now. Message us with the WhatsApp button on the page.",
      placeholder: "Type your question"
    } : {

      titulo: "Asistente de Creative Whisper",
      saludo: "Hola. Soy el asistente de Creative Whisper: te cuento qué hacemos y cómo podemos ayudar a tu marca.",
      sugerencias: ["¿Qué servicios ofrecen?", "¿Cómo trabajan?", "¿Pueden hacer un asistente así para mi web?", "¿Cómo agendo una reunión?"],
      nota: "Asistente automático de Creative Whisper. Para agendar, usa el botón de WhatsApp."
    },
    cabecera: "header.top",
    evitar: [".fab", ".sx-chip", ".hud"],
    // punto de cada tramo animado de la portada donde ya se ve el contenido
    avance: { inicio: 0, enfoque: 0.85, servicios: 0.12, "servicios-datos": 0.35, "servicios-produccion": 0.5,
              "servicios-marketing": 0.62, "servicios-automatizacion": 0.75, marcas: 0.97, trabajo: 0.1, caso: 0.8 },
    resolver: function (id) {
      if ($("servicios") && (/^servicios-/.test(id) || id === "marcas")) return $("servicios");
      var ids = INTERNAS[id] || [];
      for (var i = 0; i < ids.length; i++) if ($(ids[i])) return $(ids[i]);
      return null;
    },
    contexto: function () { var en = /^en/i.test(document.documentElement.lang || ""); return "página " + (document.title || location.pathname).slice(0, 80) + (en ? " · el visitante está en la versión en inglés: responde en inglés" : ""); }
  };
  var s = document.createElement("script");
  s.src = "https://creativewhisper.github.io/asistente/asistente.js";
  s.defer = true;
  document.head.appendChild(s);
})();
