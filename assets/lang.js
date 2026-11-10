/* Selector de idioma ES / EN: recuerda la elección del visitante y lo lleva a la página equivalente.
   La detección automática (navegador en español -> versión en español) va en línea en el <head> de las páginas en inglés. */
(function () {
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-set-lang]');
    if (!a) return;
    try { localStorage.setItem('cw-lang', a.getAttribute('data-set-lang')); } catch (x) {}
    e.preventDefault();
    location.href = a.getAttribute('href') + location.hash;
  });
})();
