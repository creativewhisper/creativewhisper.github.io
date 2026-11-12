/* Imágenes en el navegador para el alta y la cuenta: achicar un logo o una foto y recortar la foto del asistente,
   antes de enviarlas. Nada se sube a ningún lado desde aquí: devuelve «data:» listos para enviar a la función. */
(function () {
  "use strict";
  function leer(archivo) { return new Promise(function (ok, mal) { var r = new FileReader(); r.onload = function () { ok(String(r.result)); }; r.onerror = function () { mal(new Error("No se pudo leer el archivo.")); }; r.readAsDataURL(archivo); }); }
  function imagen(src) { return new Promise(function (ok, mal) { var i = new Image(); i.onload = function () { ok(i); }; i.onerror = function () { mal(new Error("Ese archivo no es una imagen que podamos usar.")); }; i.src = src; }); }
  function lienzo(w, h) { var c = document.createElement("canvas"); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h)); return c; }
  var pesa = function (datos) { return Math.floor((datos.length - datos.indexOf(",") - 1) * 0.75); };
  // Dibuja la imagen dentro de un máximo de lado y la devuelve en el formato pedido, bajando la calidad hasta que pese menos que el tope.
  function exportar(img, lado, tipos, tope, fondo) {
    var k = Math.min(1, lado / Math.max(img.naturalWidth || img.width, img.naturalHeight || img.height));
    for (var vuelta = 0; vuelta < 6; vuelta++) {
      var c = lienzo((img.naturalWidth || img.width) * k, (img.naturalHeight || img.height) * k), x = c.getContext("2d");
      if (fondo) { x.fillStyle = fondo; x.fillRect(0, 0, c.width, c.height); }
      x.imageSmoothingQuality = "high"; x.drawImage(img, 0, 0, c.width, c.height);
      for (var t = 0; t < tipos.length; t++) for (var q = 0.9; q >= 0.5; q -= 0.1) {
        var d = c.toDataURL(tipos[t], q);
        if (d.indexOf("data:" + tipos[t]) === 0 && pesa(d) <= tope) return { datos: d, ancho: c.width, alto: c.height, bytes: pesa(d) };
        if (tipos[t] === "image/png") break;   // el PNG no tiene calidad: si no cabe, se prueba el siguiente formato o un tamaño menor
      }
      k *= 0.8;
    }
    throw new Error("No pudimos achicar esa imagen. Prueba con otra.");
  }
  window.CWImagenes = {
    pesa: pesa,
    // Logo: si ya es liviano se usa tal cual (un SVG nunca se toca); si pesa más de 300 KB se achica solo (PNG con transparencia; si no cabe, WebP).
    logo: async function (archivo, tope) {
      tope = tope || 300000;
      var datos = await leer(archivo);
      if (!/^data:image\/(png|webp|svg\+xml|jpeg)/.test(datos)) throw new Error("Sube tu logo en PNG, SVG, WebP o JPG.");
      if (/^data:image\/svg/.test(datos)) { if (archivo.size > tope) throw new Error("Ese SVG pesa demasiado. Expórtalo más simple o súbelo en PNG."); return { datos: datos, achicado: false }; }
      if (archivo.size <= tope && !/^data:image\/jpeg/.test(datos)) return { datos: datos, achicado: false };
      var r = exportar(await imagen(datos), 1000, ["image/png", "image/webp"], tope);
      return { datos: r.datos, achicado: true, bytes: r.bytes, antes: archivo.size };
    },
    // Foto para el contenido: JPG de 2000 px como mucho y menos de 1,5 MB.
    foto: async function (archivo) { var r = exportar(await imagen(await leer(archivo)), 2000, ["image/jpeg"], 1500000, "#ffffff"); return r.datos; },
    abrir: async function (archivo) { return imagen(await leer(archivo)); },
    // Foto del asistente: recorte cuadrado con acercamiento (zoom ≥ 1) y posición (dx, dy entre -1 y 1). Devuelve la de 640 px
    // (perfil de WhatsApp) y la de 192 px (chat, panel y app).
    recorte: function (img, zoom, dx, dy) {
      var w = img.naturalWidth || img.width, h = img.naturalHeight || img.height, lado = Math.min(w, h) / Math.max(1, zoom || 1);
      var x0 = (w - lado) / 2 + (dx || 0) * (w - lado) / 2, y0 = (h - lado) / 2 + (dy || 0) * (h - lado) / 2;
      function sale(px, tope) {
        for (var q = 0.88; q >= 0.4; q -= 0.08) {
          var c = lienzo(px, px), x = c.getContext("2d"); x.fillStyle = "#fff"; x.fillRect(0, 0, px, px); x.imageSmoothingQuality = "high"; x.drawImage(img, x0, y0, lado, lado, 0, 0, px, px);
          var d = c.toDataURL("image/jpeg", q); if (pesa(d) <= tope) return d;
        }
        throw new Error("No pudimos preparar esa foto. Prueba con otra.");
      }
      return { grande: sale(640, 380000), chica: sale(192, 55000) };
    },
    // Avatar neutro (la inicial sobre un color) para cuando el asistente todavía no tiene foto.
    inicial: function (nombre, color) {
      var l = (String(nombre || "A").trim()[0] || "A").toUpperCase().replace(/[<>&"']/g, "A");
      var c = /^#[0-9a-f]{6}$/i.test(color || "") ? color : "#3EA398";
      return "data:image/svg+xml;utf8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect width="96" height="96" rx="48" fill="' + c + '"/><text x="48" y="62" font-family="Arial,Helvetica,sans-serif" font-size="44" font-weight="700" text-anchor="middle" fill="#fff">' + l + "</text></svg>");
    }
  };
})();
