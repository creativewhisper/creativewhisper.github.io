// Fase 11.6c · Páginas estáticas de /privacidad/{cuenta}: los enlaces de antes con «?lang=en» llevan a la versión en
// inglés, si la política la tiene (la página la declara con <link rel="alternate" hreflang="en">). Sin inglés, se queda.
(function () {
  if (!/[?&]lang=en\b/.test(location.search)) return;
  var l = document.querySelector('link[rel="alternate"][hreflang="en"]');
  if (l && l.href && l.href.split("?")[0] !== location.href.split("?")[0]) location.replace(l.href);
})();
