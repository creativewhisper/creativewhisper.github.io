/* La familia Whisper · mascotas animadas de Creative Whisper (SVG, sin dependencias).

   Uso en cualquier página:
     <span class="cw-mascota" data-mascota="tiko"></span>
     <script src="/assets/mascotas.js" defer></script>

   Opciones (atributos):
     data-mascota  tiko | ruby | pia | teo | ari
     data-tamano   alto en píxeles (por defecto 170; también vale CSS: .cw-mascota{height:…})
     data-entrada  "no" para que aparezca sin la entrada (por defecto entra al verse en pantalla)
     data-loop     "no" para dejarla quieta después de entrar
   Desde código: CWMascotas.pintar(elemento) · CWMascotas.entrar(elemento)
   Con «reducir movimiento» activado en el equipo, se muestran quietas.

   Personalidad (entrada → animación en bucle):
     Tiko  (quiere comprar)  cae dando un salto → brinca feliz, saluda y balancea la bolsa
     Ruby  (está molesta)    cae pisando fuerte → frunce el ceño, tiembla y le sale vapor
     Pía   (tiene una duda)  asoma de lado      → mira a un lado y al otro, ladea la cabeza, el «?» flota
     Teo   (le encanta)      rebota contento    → se mece, parpadea y le salen corazones
     Ari   (solo miraba)     entra despacio     → respira lento, mira de reojo y parpadea con sueño
*/
(function () {
  "use strict";
  if (window.CWMascotas) return;
  var N = "#0A0908";
  var C = { tiko: "#FBA919", ruby: "#E63C37", pia: "#F4BE9B", teo: "#46AB9F", ari: "#C3B092" };
  var L = 'stroke="' + N + '" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"';
  function mano(x, y, ang) { // manito de tres dedos que apunta en el ángulo dado (grados)
    return '<g transform="translate(' + x + ' ' + y + ') rotate(' + ang + ') scale(1.5)"><path ' + L.replace('5"', '2.8"') + ' d="M0 0 l-5 -7 M0 0 l0 -9 M0 0 l5 -7"/></g>';
  }
  function piernas(c) {
    return '<g class="p-i" style="transform-origin:110px 188px"><path ' + L + ' d="M110 188 L108 248 L88 254"/></g>' +
           '<g class="p-d" style="transform-origin:132px 188px"><path ' + L + ' d="M132 188 L134 248 L154 254"/></g>';
  }
  var cuerpo = function (k) { return '<circle cx="121" cy="108" r="82" fill="' + C[k] + '"/>'; };

  var DIBUJO = {
    tiko: function () {
      return '<g class="todo" style="transform-origin:121px 254px">' +
        '<g class="p-i" style="transform-origin:110px 186px"><path ' + L + ' d="M110 186 L104 214 L118 232 L110 252"/></g>' +
        '<g class="p-d" style="transform-origin:134px 186px"><path ' + L + ' d="M134 186 L140 210 L162 218 L166 240"/></g>' +
        '<g class="b-i" style="transform-origin:44px 124px"><path ' + L + ' d="M44 124 Q22 104 18 70"/>' + mano(18, 70, -8) + '</g>' +
        cuerpo("tiko") +
        '<g class="ojos" style="transform-origin:121px 100px"><ellipse cx="97" cy="100" rx="17" ry="30" fill="' + N + '"/><ellipse cx="146" cy="96" rx="17" ry="30" fill="' + N + '"/>' +
        '<path d="M78 101 L116 101 M127 97 L165 97" stroke="' + C.tiko + '" stroke-width="3.2"/></g>' +
        '<g class="b-d" style="transform-origin:198px 118px"><path ' + L + ' d="M200 112 Q228 94 228 60"/>' +
          '<g class="bolsa" style="transform-origin:226px 62px"><path ' + L.replace('5"', '4"') + ' d="M216 76 Q216 56 226 56 Q236 56 236 76"/>' +
          '<path d="M207 74 L245 74 L249 112 L203 112 Z" fill="#FFFDF7" stroke="' + N + '" stroke-width="4.2" stroke-linejoin="round"/></g>' +
          mano(226, 60, 6) + '</g>' +
        '</g>';
    },
    ruby: function () {
      return '<g class="todo" style="transform-origin:121px 254px">' + piernas() + cuerpo("ruby") +
        '<g class="vapor"><path class="v1" d="M70 30 q-8 -10 0 -18 q8 -8 0 -18" ' + L.replace('5"', '4"') + ' style="opacity:0"/><path class="v2" d="M172 30 q8 -10 0 -18 q-8 -8 0 -18" ' + L.replace('5"', '4"') + ' style="opacity:0"/></g>' +
        '<g class="cejas"><path ' + L.replace('5"', '6"') + ' d="M74 70 L112 90 M168 70 L130 90"/></g>' +
        '<g class="ojos" style="transform-origin:121px 104px"><ellipse cx="96" cy="104" rx="16" ry="7" fill="' + N + '"/><ellipse cx="146" cy="104" rx="16" ry="7" fill="' + N + '"/></g>' +
        '<g class="brazos"><path ' + L + ' d="M88 140 L94 156 M154 140 L148 156"/>' +
        '<path ' + L.replace('5"', '4.4"') + ' d="M78 162 C80 146 104 148 121 160 C138 172 162 174 164 160 C166 146 138 148 121 160 C104 172 76 176 78 162 Z"/></g>' +
        '</g>';
    },
    pia: function () {
      return '<g class="todo" style="transform-origin:121px 254px">' + piernas() +
        '<g class="b-i" style="transform-origin:42px 128px"><path ' + L + ' d="M42 128 Q34 152 38 178"/>' + mano(38, 180, 180) + '</g>' +
        cuerpo("pia") +
        '<g class="ojos" style="transform-origin:121px 98px"><g class="mira">' +
          '<circle cx="94" cy="104" r="27" fill="' + N + '"/><path d="M84 86 L100 86 L94 96 L106 96 L102 108 L88 98 L92 94 Z" fill="#fff"/>' +
          '<circle cx="150" cy="90" r="29" fill="' + N + '"/><path d="M140 70 L158 70 L150 82 L164 82 L160 96 L144 84 L148 80 Z" fill="#fff"/></g>' +
          '<path ' + L.replace('5"', '3.4"') + ' d="M172 70 l8 -8 M176 76 l10 -5 M178 84 l11 -2"/></g>' +
        '<path ' + L + ' d="M134 148 Q142 172 156 156 Q160 148 158 138"/>' + mano(134, 148, -30) +
        '<g class="duda" style="transform-origin:46px 40px"><path ' + L.replace('5"', '5.6"') + ' d="M34 26 Q36 10 50 12 Q62 16 56 28 Q50 36 50 44"/><circle cx="50" cy="56" r="3.6" fill="' + N + '"/></g>' +
        '</g>';
    },
    teo: function () {
      return '<g class="todo" style="transform-origin:121px 254px">' + piernas() +
        '<g class="b-i" style="transform-origin:44px 126px"><path ' + L + ' d="M44 126 Q34 156 40 186"/>' + mano(40, 188, 180) + '</g>' +
        '<g class="b-d" style="transform-origin:198px 126px"><path ' + L + ' d="M198 126 Q208 156 202 186"/>' + mano(202, 188, 180) + '</g>' +
        cuerpo("teo") +
        '<g class="ojos" style="transform-origin:121px 100px"><ellipse cx="99" cy="100" rx="16" ry="29" fill="' + N + '"/><ellipse cx="143" cy="100" rx="16" ry="29" fill="' + N + '"/>' +
        '<path d="M80 98 L118 98 M124 98 L162 98" stroke="' + C.teo + '" stroke-width="3.2"/></g>' +
        '<path ' + L + ' d="M76 142 Q121 182 166 142 M72 146 L80 140 M170 146 L162 140"/>' +
        '<g class="corazon" style="transform-origin:206px 30px"><path transform="translate(206 30) scale(1.6) translate(-206 -30)" d="M206 44 C188 30 192 14 204 18 Q206 19 206 24 Q206 19 208 18 C220 14 224 30 206 44 Z" fill="#FFFDF7" stroke="' + N + '" stroke-width="2.6" stroke-linejoin="round"/></g>' +
        '</g>';
    },
    ari: function () {
      return '<g class="todo" style="transform-origin:121px 254px">' + piernas() +
        '<g class="b-i" style="transform-origin:44px 124px"><path ' + L + ' d="M44 124 Q34 150 38 176"/>' + mano(38, 178, 180) + '</g>' +
        '<g class="b-d" style="transform-origin:198px 124px"><path ' + L + ' d="M198 124 Q208 150 204 176"/>' + mano(204, 178, 180) + '</g>' +
        cuerpo("ari") +
        '<g class="ojos" style="transform-origin:121px 92px"><g class="mira">' +
          '<circle cx="91" cy="94" r="27" fill="#E2C9A4" stroke="' + N + '" stroke-width="3.6"/><path class="parpado" d="M64 96 A27 27 0 0 1 118 96 Z" fill="' + N + '"/>' +
          '<circle cx="152" cy="94" r="27" fill="#E2C9A4" stroke="' + N + '" stroke-width="3.6"/><path class="parpado" d="M125 96 A27 27 0 0 1 179 96 Z" fill="' + N + '"/>' +
        '</g></g>' +
        '</g>';
    }
  };

  var CSS = '' +
    '.cw-mascota{display:inline-block;height:170px;aspect-ratio:240/270;vertical-align:bottom}' +
    '.cw-mascota svg{width:100%;height:100%;overflow:visible;display:block}' +
    '.cw-mascota svg *{transform-box:view-box}' +
    '.cw-mascota.espera svg{opacity:0}' +
    /* entradas */
    '.cw-mascota.entra[data-mascota=tiko] .todo{animation:cwm-cae .9s cubic-bezier(.3,.6,.4,1) both}' +
    '.cw-mascota.entra[data-mascota=ruby] .todo{animation:cwm-pisa .8s cubic-bezier(.5,0,.6,1.4) both}' +
    '.cw-mascota.entra[data-mascota=pia] .todo{animation:cwm-asoma 1s cubic-bezier(.2,.8,.3,1.2) both}' +
    '.cw-mascota.entra[data-mascota=teo] .todo{animation:cwm-rebota 1s cubic-bezier(.3,.7,.4,1) both}' +
    '.cw-mascota.entra[data-mascota=ari] .todo{animation:cwm-despacio 1.4s ease-out both}' +
    '@keyframes cwm-cae{0%{transform:translateY(-140px) scale(.9,1.1);opacity:0}45%{transform:translateY(0) scale(1.15,.82);opacity:1}62%{transform:translateY(-26px) scale(.95,1.06)}80%{transform:translateY(0) scale(1.05,.95)}100%{transform:none}}' +
    '@keyframes cwm-pisa{0%{transform:translateY(-90px);opacity:0}55%{transform:translateY(0) scale(1.18,.8);opacity:1}70%{transform:translateX(-5px) scale(1,1)}80%{transform:translateX(5px)}90%{transform:translateX(-3px)}100%{transform:none}}' +
    '@keyframes cwm-asoma{0%{transform:translateX(-60px) rotate(-30deg);opacity:0}60%{transform:translateX(6px) rotate(8deg);opacity:1}80%{transform:rotate(-4deg)}100%{transform:none}}' +
    '@keyframes cwm-rebota{0%{transform:scale(0);opacity:0}40%{transform:scale(1.15,.9);opacity:1}60%{transform:scale(.92,1.08)}80%{transform:scale(1.04,.97)}100%{transform:none}}' +
    '@keyframes cwm-despacio{0%{transform:translateY(16px);opacity:0}100%{transform:none;opacity:1}}' +
    /* bucles (solo después de entrar) */
    '.cw-mascota.vive .ojos{animation:cwm-parpadeo 4.2s infinite}' +
    '.cw-mascota.vive[data-mascota=ruby] .ojos{animation-delay:-1.3s}.cw-mascota.vive[data-mascota=pia] .ojos{animation-delay:-2.1s}.cw-mascota.vive[data-mascota=teo] .ojos{animation-delay:-3s}' +
    '@keyframes cwm-parpadeo{0%,90%,100%{transform:scaleY(1)}93%{transform:scaleY(.08)}96%{transform:scaleY(1)}}' +
    // Tiko
    '.cw-mascota.vive[data-mascota=tiko] .todo{animation:cwm-brinco 1.1s cubic-bezier(.3,.6,.4,1) infinite}' +
    '.cw-mascota.vive[data-mascota=tiko] .b-i{animation:cwm-saludo .55s ease-in-out infinite alternate}' +
    '.cw-mascota.vive[data-mascota=tiko] .b-d{animation:cwm-alza 1.1s ease-in-out infinite}' +
    '.cw-mascota.vive[data-mascota=tiko] .bolsa{animation:cwm-pendulo 1.1s ease-in-out infinite}' +
    '.cw-mascota.vive[data-mascota=tiko] .p-i{animation:cwm-patada 1.1s ease-in-out infinite}' +
    '.cw-mascota.vive[data-mascota=tiko] .p-d{animation:cwm-patada 1.1s ease-in-out infinite reverse}' +
    '@keyframes cwm-brinco{0%,100%{transform:translateY(0) scale(1.06,.94)}15%{transform:translateY(0) scale(1)}45%{transform:translateY(-24px) scale(.97,1.04)}75%{transform:translateY(0) scale(1)}}' +
    '@keyframes cwm-saludo{from{transform:rotate(-10deg)}to{transform:rotate(14deg)}}' +
    '@keyframes cwm-alza{0%,100%{transform:rotate(0)}45%{transform:rotate(-10deg)}}' +
    '@keyframes cwm-pendulo{0%,100%{transform:rotate(-8deg)}50%{transform:rotate(12deg)}}' +
    '@keyframes cwm-patada{0%,100%{transform:rotate(0)}45%{transform:rotate(14deg)}}' +
    // Ruby
    '.cw-mascota.vive[data-mascota=ruby] .todo{animation:cwm-tiembla 2.6s ease-in-out infinite}' +
    '.cw-mascota.vive[data-mascota=ruby] .cejas{animation:cwm-ceno 2.6s ease-in-out infinite}' +
    '.cw-mascota.vive[data-mascota=ruby] .v1{animation:cwm-vapor 2.6s ease-out infinite}' +
    '.cw-mascota.vive[data-mascota=ruby] .v2{animation:cwm-vapor 2.6s ease-out infinite .15s}' +
    '.cw-mascota.vive[data-mascota=ruby] .p-i{animation:cwm-zapateo 2.6s ease-in-out infinite;transform-origin:110px 250px}' +
    '@keyframes cwm-tiembla{0%,50%,100%{transform:none}54%{transform:translateX(-4px) rotate(-1.5deg)}58%{transform:translateX(4px) rotate(1.5deg)}62%{transform:translateX(-4px) rotate(-1.5deg)}66%{transform:translateX(4px) rotate(1.5deg)}70%{transform:none}}' +
    '@keyframes cwm-ceno{0%,40%,100%{transform:none}52%,72%{transform:translateY(5px)}}' +
    '@keyframes cwm-vapor{0%,50%{opacity:0;transform:translateY(8px)}62%{opacity:1}100%{opacity:0;transform:translateY(-22px)}}' +
    '@keyframes cwm-zapateo{0%,74%,100%{transform:none}80%{transform:rotate(-14deg)}86%{transform:none}}' +
    // Pía
    '.cw-mascota.vive[data-mascota=pia] .todo{animation:cwm-ladea 3.6s ease-in-out infinite}' +
    '.cw-mascota.vive[data-mascota=pia] .mira{animation:cwm-mira 3.6s ease-in-out infinite}' +
    '.cw-mascota.vive[data-mascota=pia] .duda{animation:cwm-duda 1.8s ease-in-out infinite}' +
    '.cw-mascota.vive[data-mascota=pia] .b-i{animation:cwm-mece 3.6s ease-in-out infinite}' +
    '@keyframes cwm-ladea{0%,100%{transform:rotate(0)}25%{transform:rotate(-6deg)}50%{transform:rotate(0)}75%{transform:rotate(5deg)}}' +
    '@keyframes cwm-mira{0%,100%{transform:translateX(0)}20%,35%{transform:translateX(-6px) translateY(-2px)}60%,80%{transform:translateX(6px)}}' +
    '@keyframes cwm-duda{0%,100%{transform:translateY(0) rotate(-6deg)}50%{transform:translateY(-8px) rotate(8deg)}}' +
    '@keyframes cwm-mece{0%,100%{transform:rotate(0)}50%{transform:rotate(8deg)}}' +
    // Teo
    '.cw-mascota.vive[data-mascota=teo] .todo{animation:cwm-baila 2.2s ease-in-out infinite}' +
    '.cw-mascota.vive[data-mascota=teo] .corazon{animation:cwm-corazon 2.2s ease-out infinite}' +
    '.cw-mascota.vive[data-mascota=teo] .b-i{animation:cwm-mece 1.1s ease-in-out infinite}' +
    '.cw-mascota.vive[data-mascota=teo] .b-d{animation:cwm-mece 1.1s ease-in-out infinite reverse}' +
    '@keyframes cwm-baila{0%,100%{transform:rotate(-3deg)}50%{transform:rotate(3deg) translateY(-4px)}}' +
    '@keyframes cwm-corazon{0%{transform:translateY(10px) scale(.5);opacity:0}20%{transform:translateY(0) scale(1.1);opacity:1}35%{transform:scale(.95)}50%{transform:scale(1.08)}100%{transform:translateY(-34px) scale(.9);opacity:0}}' +
    // Ari
    '.cw-mascota.vive[data-mascota=ari] .todo{animation:cwm-respira 4.8s ease-in-out infinite}' +
    '.cw-mascota.vive[data-mascota=ari] .mira{animation:cwm-reojo 7s ease-in-out infinite}' +
    '.cw-mascota.vive[data-mascota=ari] .ojos{animation:cwm-sueno 7s ease-in-out infinite}' +
    '@keyframes cwm-respira{0%,100%{transform:scale(1,1)}50%{transform:scale(1.03,.97)}}' +
    '@keyframes cwm-reojo{0%,30%,100%{transform:translateX(0)}38%,55%{transform:translateX(-5px)}63%,80%{transform:translateX(5px)}}' +
    '@keyframes cwm-sueno{0%,86%,100%{transform:scaleY(1)}90%,94%{transform:scaleY(.15)}}' +
    '@media (prefers-reduced-motion:reduce){.cw-mascota *{animation:none!important}.cw-mascota.espera svg{opacity:1}}';

  function estilo() { if (document.getElementById("cw-mascotas-css")) return; var s = document.createElement("style"); s.id = "cw-mascotas-css"; s.textContent = CSS; document.head.appendChild(s); }
  var reducir = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  function pintar(el) {
    var k = (el.getAttribute("data-mascota") || "").toLowerCase(); if (!DIBUJO[k] || el.firstChild) return;
    var t = el.getAttribute("data-tamano"); if (t) el.style.height = parseInt(t, 10) + "px";
    var nombre = { tiko: "Tiko", ruby: "Ruby", pia: "Pía", teo: "Teo", ari: "Ari" }[k];
    el.setAttribute("role", "img"); if (!el.getAttribute("aria-label")) el.setAttribute("aria-label", nombre);
    el.innerHTML = '<svg viewBox="0 0 240 270" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' + DIBUJO[k]() + '</svg>';
    if (reducir) return;
    if (el.getAttribute("data-entrada") === "no") { vivir(el); return; }
    el.classList.add("espera");
  }
  function vivir(el) { if (el.getAttribute("data-loop") !== "no") el.classList.add("vive"); }
  function entrar(el) {
    if (reducir) return;
    el.classList.remove("espera", "vive", "entra"); void el.offsetWidth; el.classList.add("entra");
    var todo = el.querySelector(".todo");
    var fin = function () { todo.removeEventListener("animationend", fin); el.classList.remove("entra"); vivir(el); };
    todo.addEventListener("animationend", fin);
  }
  var io = ("IntersectionObserver" in window) ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); var d = parseInt(e.target.getAttribute("data-retraso") || "0", 10); setTimeout(function () { entrar(e.target); }, d); } });
  }, { threshold: .35 }) : null;

  function iniciar(raiz) {
    estilo();
    (raiz || document).querySelectorAll(".cw-mascota[data-mascota]").forEach(function (el) {
      pintar(el);
      if (el.classList.contains("espera")) { if (io) io.observe(el); else entrar(el); }
    });
  }
  window.CWMascotas = { iniciar: iniciar, pintar: pintar, entrar: entrar };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { iniciar(); }); else iniciar();
})();
