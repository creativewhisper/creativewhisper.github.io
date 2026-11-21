// Las páginas públicas y las del cliente, con su idioma. «pareja» es la misma página en el otro idioma.
export const PUBLICAS = [
  { ruta: '/es/', idioma: 'es', pareja: '/', agente: 'cw', cookies: true },
  { ruta: '/', idioma: 'en', pareja: '/es/', agente: 'cw', cookies: true },
  { ruta: '/servicios.html', idioma: 'es', pareja: '/services.html', agente: 'cw', cookies: true },
  { ruta: '/services.html', idioma: 'en', pareja: '/servicios.html', agente: 'cw', cookies: true },
  { ruta: '/portafolio.html', idioma: 'es', pareja: '/portfolio.html', agente: 'cw', cookies: true },
  { ruta: '/portfolio.html', idioma: 'en', pareja: '/portafolio.html', agente: 'cw', cookies: true },
  { ruta: '/datos.html', idioma: 'es', pareja: '/data.html', agente: 'cw', cookies: true },
  { ruta: '/data.html', idioma: 'en', pareja: '/datos.html', agente: 'cw', cookies: true },
  { ruta: '/privacidad.html', idioma: 'es', pareja: '/privacy.html', agente: 'cw', cookies: true },
  { ruta: '/privacy.html', idioma: 'en', pareja: '/privacidad.html', agente: 'cw', cookies: true },
  { ruta: '/susurro-digital/', idioma: 'es', pareja: '/digital-whisper/', agente: 'dw', cookies: true },
  { ruta: '/digital-whisper/', idioma: 'en', pareja: '/susurro-digital/', agente: 'dw', cookies: true },
  { ruta: '/cotizacion-generica.html', idioma: 'es', agente: null, cookies: true },
  { ruta: '/api/', idioma: 'es', agente: 'dw', cookies: false },
  { ruta: '/api/?lang=en', idioma: 'en', agente: 'dw', cookies: false },
];
// Páginas del cliente, vistas sin haber entrado.
export const CLIENTE = [
  { ruta: '/cuenta/', idioma: 'es', agente: 'dw' }, { ruta: '/cuenta/?lang=en', idioma: 'en', agente: 'dw' },
  { ruta: '/panel/', idioma: 'es', agente: 'dw' }, { ruta: '/panel/?lang=en', idioma: 'en', agente: 'dw' },
  { ruta: '/alta/', idioma: 'es', agente: null }, { ruta: '/alta/?lang=en', idioma: 'en', agente: null },
];
export const REDIRECCIONES = [['/escucha-digital/', '/susurro-digital/'], ['/en/digital-whisper/', '/digital-whisper/']];
export const loc = (idioma) => (idioma === 'es' ? 'es-EC' : 'en-US');
export const EN_VIVO = /creativewhisper\.net/.test(process.env.BASE || '');
