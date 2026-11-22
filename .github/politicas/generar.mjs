#!/usr/bin/env node
// Fase 11.6c · «Camino A» de creativewhisper.net/privacidad/{cuenta}: páginas ESTÁTICAS con estado HTTP 200, para que el
// campo de política de Meta y los buscadores las acepten (antes la dirección caía en 404.html y respondía 404).
//
// Lee de la base SOLO lo público: la lista de políticas publicadas (politicas_publicadas, migración 035) y el contenido de
// cada versión con politica_publica (034), con la misma clave publicable que ya usa la web. Escribe SOLO dentro de
// privacidad/ y borra ahí lo que ya no está publicado. No lleva secretos.
//
//   privacidad/{cuenta}.html          vigente en español     → /privacidad/{cuenta}
//   privacidad/{cuenta}/index.html    la misma               → /privacidad/{cuenta}/
//   privacidad/{cuenta}/en.html       vigente en inglés      → /privacidad/{cuenta}/en
//   privacidad/{cuenta}/v{n}.html     versión n, español     → /privacidad/{cuenta}/v{n}
//   privacidad/{cuenta}/v{n}-en.html  versión n, inglés      → /privacidad/{cuenta}/v{n}-en
//
// Uso:
//   node .github/politicas/generar.mjs                       genera desde la base
//   node .github/politicas/generar.mjs --datos fijo.json     genera desde un archivo (pruebas): {lista:[...], politicas:{"cuenta|idioma|version": {...}}}
//   node .github/politicas/generar.mjs --permitir-vacio      deja borrar todas las páginas si la base dice que no hay ninguna
//   node .github/politicas/generar.mjs --comprobar [BASE]    pide cada página publicada (y /privacidad) y exige estado 200 y su versión
//   node .github/politicas/generar.mjs --validar             revisa que todo lo que hay en privacidad/ sea de la plantilla
//   --raiz DIR                                               carpeta del sitio (por defecto, la raíz del repo)
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const API = 'https://jlyrymgbykhpktabvlkl.supabase.co/rest/v1/rpc/';
const CLAVE = 'sb_publishable_ap5wyI1Q4-_IO8fXJ3xBJA_RzGp89dV'; // la misma clave publicable de assets/politica-cuenta.js
const SITIO = 'https://creativewhisper.net';
const CUENTA = /^[a-z0-9][a-z0-9-]{1,39}$/;
const SCRIPT_PERMITIDO = '<script src="/assets/politica-idioma.js"></script>';

const args = process.argv.slice(2);
const opcion = (n) => { const i = args.indexOf(n); return i >= 0 ? (args[i + 1] ?? '') : null; };
const RAIZ = resolve(opcion('--raiz') ?? join(dirname(fileURLToPath(import.meta.url)), '..', '..'));
const CARPETA = join(RAIZ, 'privacidad');

// ---------------------------------------------------------------- datos
async function rpc(nombre, cuerpo) {
  for (let intento = 1; ; intento++) {
    try {
      const r = await fetch(API + nombre, { method: 'POST', headers: { 'content-type': 'application/json', apikey: CLAVE }, body: JSON.stringify(cuerpo), signal: AbortSignal.timeout(20_000) });
      if (!r.ok) throw new Error(`${nombre}: estado ${r.status}`);
      return await r.json();
    } catch (e) {
      if (intento >= 3) throw e;
      await new Promise((ok) => setTimeout(ok, 2000 * intento));
    }
  }
}
const clave = (c, i, v) => `${c}|${i}|${v}`;

export function validarLista(lista) {
  if (!Array.isArray(lista)) throw new Error('la lista de políticas no es una lista');
  return lista.map((x) => {
    if (!x || !CUENTA.test(String(x.cuenta)) || !['es', 'en'].includes(x.idioma) || !Number.isInteger(x.version) || x.version < 1 || x.version > 9999) {
      throw new Error('entrada inválida en la lista: ' + JSON.stringify(x).slice(0, 200));
    }
    return { cuenta: x.cuenta, idioma: x.idioma, version: x.version, vigente: x.vigente === true };
  });
}

// ---------------------------------------------------------------- HTML (todo lo que viene de la base se escapa)
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const segs = (s) => (Array.isArray(s) ? s : []).map((p) => (Array.isArray(p) && p[1] ? `<strong>${esc(p[0])}</strong>` : esc(Array.isArray(p) ? p[0] : ''))).join('');
const fecha = (f, en) => { if (!f) return ''; const d = new Date(f); if (Number.isNaN(d.getTime())) return ''; return d.toLocaleDateString(en ? 'en-US' : 'es-EC', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Guayaquil' }); };

const TEXTOS = {
  es: { borrador: 'Borrador para revisión de abogado: esta política todavía no la revisó el abogado de la empresa.', vieja: 'Esta es una versión anterior. ', verVigente: 'Ver la vigente',
    version: 'Versión', desde: 'vigente desde el', hasta: 'hasta el', versiones: 'Versiones de esta política', otro: 'English version', titulo: 'Política de privacidad', inicio: 'Creative Whisper, inicio' },
  en: { borrador: "Draft for legal review: this policy has not yet been reviewed by the company's lawyer.", vieja: 'This is a previous version. ', verVigente: 'See the current one',
    version: 'Version', desde: 'effective from', hasta: 'until', versiones: 'Versions of this policy', otro: 'Versión en español', titulo: 'Privacy policy', inicio: 'Creative Whisper, home' },
};
// Direcciones públicas (sin .html: GitHub Pages sirve x.html en /x con estado 200).
export const ruta = (cuenta, idioma, version) => `/privacidad/${cuenta}` + (version ? `/v${version}${idioma === 'en' ? '-en' : ''}` : idioma === 'en' ? '/en' : '');

function cuerpo(d, bloques) {
  const out = []; let lista = null; // lista abierta: 'ul' | 'ol'
  const cerrar = () => { if (lista) { out.push(`</li></${lista}>`); lista = null; } };
  let sub = false; // sublista abierta dentro del último li
  for (const b of Array.isArray(bloques) ? bloques : []) {
    const t = b && b.t;
    if (t !== 'li2' && sub) { out.push('</ul>'); sub = false; }
    if (t !== 'li' && t !== 'li2' && t !== 'ol') cerrar();
    if (t === 'h1' || t === 'h2' || t === 'p') out.push(`<${t}>${segs(b.s)}</${t}>`);
    else if (t === 'hr') out.push('<hr>');
    else if (t === 'li' || t === 'ol') {
      const tipo = t === 'ol' ? 'ol' : 'ul';
      if (lista && lista !== tipo) cerrar();
      out.push(lista ? `</li><li>${segs(b.s)}` : `<${tipo}><li>${segs(b.s)}`); lista = tipo;
    } else if (t === 'li2') {
      if (!lista) continue; // igual que la página dinámica: un li2 sin li antes se omite
      out.push(sub ? `<li>${segs(b.s)}</li>` : `<ul><li>${segs(b.s)}</li>`); sub = true;
    } else if (t === 'tabla') {
      const filas = (Array.isArray(b.filas) ? b.filas : []).map((fila, i) => '<tr>' + (Array.isArray(fila) ? fila : []).map((c) => `<${i ? 'td' : 'th'}>${segs(c)}</${i ? 'td' : 'th'}>`).join('') + '</tr>');
      out.push(`<div class="tabla"><table>${filas.join('')}</table></div>`);
    }
  }
  if (sub) out.push('</ul>');
  cerrar();
  return out.join('\n');
}

// vigenteRuta: a dónde lleva «Ver la vigente» (la vigente del mismo idioma o, si ese idioma ya no tiene, la de español).
export function pagina(d, { cuenta, idioma, version, versiones, otros, vigenteRuta = null }) {
  const en = idioma === 'en'; const T = TEXTOS[idioma];
  const propia = ruta(cuenta, idioma, version);
  const vigente = d.vigente === true;
  const otro = otros.includes(en ? 'es' : 'en') ? ruta(cuenta, en ? 'es' : 'en', version) : null;
  const nombre = String(d.nombre || cuenta);
  const partes = [];
  if (d.revision_legal !== true) partes.push(`<div class="aviso">${esc(T.borrador)}</div>`);
  if (!vigente) partes.push(`<div class="aviso">${esc(T.vieja)}<a href="${esc(vigenteRuta ?? ruta(cuenta, idioma, null))}">${esc(T.verVigente)}</a></div>`);
  partes.push(`<p class="sub">${esc(`${T.version} ${d.version} · ${T.desde} ${fecha(d.desde, en)}` + (d.hasta ? ` ${T.hasta} ${fecha(d.hasta, en)}` : ''))}</p>`);
  partes.push(cuerpo(d, d.bloques));
  if (versiones.length > 1) {
    partes.push(`<h2>${esc(T.versiones)}</h2>`);
    partes.push('<ul class="versiones">' + versiones.map((v) => `<li><a href="${esc(ruta(cuenta, idioma, v.version))}">${esc(`${T.version} ${v.version}`)}</a>${esc(' · ' + fecha(v.desde, en) + (v.hasta ? ' – ' + fecha(v.hasta, en) : ''))}</li>`).join('') + '</ul>');
  }
  if (otro) partes.push(`<p class="idiomas"><a href="${esc(otro)}" hreflang="${en ? 'es' : 'en'}">${esc(T.otro)}</a></p>`);
  const alternos = otro ? `\n<link rel="alternate" hreflang="${idioma}" href="${SITIO}${esc(propia)}">\n<link rel="alternate" hreflang="${en ? 'es' : 'en'}" href="${SITIO}${esc(otro)}">` : '';
  return `<!doctype html>
<!-- Generada por .github/politicas/generar.mjs (Fase 11.6c) desde politica_publica. No editar a mano: se reescribe sola. -->
<html lang="${idioma}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; connect-src 'none'; base-uri 'none'; form-action 'none'">
<meta name="theme-color" content="#0A0908">${vigente && !cuenta.startsWith('prueba-') ? '' : '\n<meta name="robots" content="noindex">'}
<title>${esc(`${T.titulo} · ${nombre}`)}</title>
<meta name="description" content="${esc(`${T.titulo} · ${nombre} · ${T.version} ${d.version}`)}">
<link rel="canonical" href="${SITIO}${esc(propia)}">${alternos}
<link rel="icon" href="/assets/favicon-cw.png" type="image/png">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@800&family=Hanken+Grotesk:wght@400;500;600&display=swap">
<style>
:root{--fondo:#0A0908;--texto:#ECE6DB;--suave:#B9B0A2;--linea:rgba(236,230,219,.16);--acento:#F5A300;--aviso:#3A2A0A}
@media (prefers-color-scheme:light){:root:not([data-theme="dark"]){--fondo:#F6F1E8;--texto:#1B1712;--suave:#5B5246;--linea:rgba(27,23,18,.14);--acento:#B36B00;--aviso:#FCEBC4}}
*{box-sizing:border-box}html,body{margin:0}
body{background:var(--fondo);color:var(--texto);font:16px/1.6 "Hanken Grotesk",system-ui,sans-serif;-webkit-font-smoothing:antialiased}
main{max-width:760px;margin:0 auto;padding:28px 16px 80px;overflow-wrap:anywhere}
.marca{display:flex;align-items:center;gap:10px;color:inherit;text-decoration:none;font:800 18px/1 "Big Shoulders Display",system-ui,sans-serif;letter-spacing:.06em}
.marca img{width:34px;height:auto}
h1{font:800 clamp(30px,6vw,48px)/1.05 "Big Shoulders Display",system-ui,sans-serif;letter-spacing:.01em;margin:28px 0 8px;text-transform:uppercase}
h2{font-size:20px;font-weight:600;margin:30px 0 8px}
p,li{color:var(--texto)}.sub{color:var(--suave);font-size:14px}
li{margin:4px 0}ul,ol{padding-left:20px}ul ul{margin:2px 0}
.tabla{overflow-x:auto;margin:10px 0}
table{border-collapse:collapse;width:100%;font-size:14px}td,th{border:1px solid var(--linea);padding:8px;vertical-align:top;text-align:left}th{font-weight:600}
hr{border:0;border-top:1px solid var(--linea);margin:24px 0}
.aviso{background:var(--aviso);border-left:4px solid var(--acento);padding:10px 14px;border-radius:6px;font-size:14px;margin:18px 0}
a{color:var(--texto)}
</style>
</head>
<body>
<main id="contenido">
<a class="marca" href="/" aria-label="${esc(T.inicio)}"><img src="/assets/monograma-cw.png" alt="" width="34" height="23"><span>CREATIVE WHISPER</span></a>
<div id="pagina">
${partes.join('\n')}
</div>
</main>${en ? '' : '\n' + SCRIPT_PERMITIDO}
</body>
</html>
`;
}

// Lo que se escribe tiene que ser la plantilla: un solo script (el del idioma, en español), sin manejadores ni javascript:.
export function validarHtml(html, idioma) {
  const scripts = html.match(/<script\b[^>]*>[\s\S]*?<\/script>/gi) ?? [];
  const esperados = idioma === 'en' ? [] : [SCRIPT_PERMITIDO];
  if (scripts.length !== esperados.length || scripts.some((s, i) => s !== esperados[i])) throw new Error('la página trae un <script> que no es el de la plantilla');
  if ((html.match(/<script/gi) ?? []).length !== esperados.length) throw new Error('la página trae un <script> suelto');
  // El texto de la base llega escapado (sin «<»), así que cualquier etiqueta es de la plantilla: se revisan sus atributos.
  if (/<[^>]*\son[a-z]+\s*=/i.test(html)) throw new Error('la página trae un manejador de eventos');
  if (/<[^>]*\s(?:href|src)\s*=\s*["']?\s*(?:javascript|data):/i.test(html)) throw new Error('la página trae un enlace javascript: o data:');
  if (!html.includes('class="sub"')) throw new Error('la página no tiene la línea de versión');
  return html;
}

// ---------------------------------------------------------------- generar
async function archivosActuales(dir) {
  const out = [];
  async function andar(d) {
    let ents; try { ents = await readdir(d, { withFileTypes: true }); } catch (e) { if (e.code === 'ENOENT') return; throw e; }
    for (const e of ents) { const p = join(d, e.name); if (e.isDirectory()) await andar(p); else out.push(p); }
  }
  await andar(dir);
  return out;
}
function dentro(p) {
  const r = relative(CARPETA, p);
  if (!r || r.startsWith('..') || r.includes('..' + sep) || resolve(CARPETA, r) !== resolve(p)) throw new Error('ruta fuera de privacidad/: ' + p);
  return p;
}

export async function generar({ datos = null, permitirVacio = false } = {}) {
  const lista = validarLista(datos ? datos.lista : await rpc('politicas_publicadas', {}));
  const obtener = async (c, i, v) => {
    if (datos) { const d = datos.politicas?.[clave(c, i, v)]; if (!d) throw new Error('falta en los datos de prueba: ' + clave(c, i, v)); return d; }
    return rpc('politica_publica', { p_cuenta: c, p_version: v, p_idioma: i });
  };
  const escribir = new Map(); // ruta absoluta → html
  const cuentas = [...new Set(lista.map((x) => x.cuenta))].sort();
  for (const cuenta of cuentas) {
    for (const idioma of ['es', 'en']) {
      const delIdioma = lista.filter((x) => x.cuenta === cuenta && x.idioma === idioma).sort((a, b) => b.version - a.version);
      if (!delIdioma.length) continue;
      for (const x of delIdioma) {
        const d = await obtener(cuenta, idioma, x.version);
        if (!d || d.existe !== true || d.cuenta !== cuenta || d.idioma !== idioma || d.version !== x.version) throw new Error(`politica_publica no devolvió ${clave(cuenta, idioma, x.version)}`);
        // Si se aprobó una versión entre las dos consultas, la lista y la página no coinciden: se corta sin escribir nada.
        if ((d.vigente === true) !== x.vigente) throw new Error(`la política ${clave(cuenta, idioma, x.version)} cambió durante la corrida; se reintenta en la próxima`);
        const versiones = Array.isArray(d.versiones) ? d.versiones.filter((v) => Number.isInteger(v.version)) : [];
        // El enlace al otro idioma solo si esa página existe: la misma versión (en una versión) o una vigente (en la vigente).
        const otroIdioma = idioma === 'es' ? 'en' : 'es';
        const otrosVersion = lista.some((y) => y.cuenta === cuenta && y.idioma === otroIdioma && y.version === x.version) ? [otroIdioma] : [];
        const otrosVigente = lista.some((y) => y.cuenta === cuenta && y.idioma === otroIdioma && y.vigente) ? [otroIdioma] : [];
        const hayVigente = lista.some((y) => y.cuenta === cuenta && y.idioma === idioma && y.vigente);
        const ctx = { cuenta, idioma, versiones, vigenteRuta: ruta(cuenta, hayVigente ? idioma : 'es', null) };
        escribir.set(join(CARPETA, cuenta, `v${x.version}${idioma === 'en' ? '-en' : ''}.html`), validarHtml(pagina(d, { ...ctx, otros: otrosVersion, version: x.version }), idioma));
        if (x.vigente) {
          const vig = validarHtml(pagina(d, { ...ctx, otros: otrosVigente, version: null }), idioma);
          if (idioma === 'es') { escribir.set(join(CARPETA, `${cuenta}.html`), vig); escribir.set(join(CARPETA, cuenta, 'index.html'), vig); }
          else escribir.set(join(CARPETA, cuenta, 'en.html'), vig);
        }
      }
    }
  }
  const actuales = await archivosActuales(CARPETA);
  if (!escribir.size && actuales.length && !permitirVacio) {
    throw new Error(`La base dice que no hay políticas publicadas, pero hay ${actuales.length} páginas. No borro nada sin --permitir-vacio.`);
  }
  const cambios = { escritas: [], iguales: 0, borradas: [] };
  for (const [p, html] of escribir) {
    dentro(p);
    let antes = null; try { antes = await readFile(p, 'utf8'); } catch { /* nueva */ }
    if (antes === html) { cambios.iguales++; continue; }
    await mkdir(dirname(p), { recursive: true }); await writeFile(p, html); cambios.escritas.push(relative(RAIZ, p));
  }
  for (const p of actuales) if (!escribir.has(p)) { await rm(dentro(p)); cambios.borradas.push(relative(RAIZ, p)); }
  // carpetas que quedaron vacías
  for (const c of await readdir(CARPETA, { withFileTypes: true }).catch(() => [])) {
    if (c.isDirectory() && !(await readdir(join(CARPETA, c.name))).length) await rm(join(CARPETA, c.name), { recursive: true });
  }
  return { cuentas, ...cambios };
}

// Revisa lo que hay en privacidad/ (lo usa el trabajo «publicar» de la Action antes del commit): solo nombres de la
// plantilla y cada página pasa validarHtml. Devuelve la lista de problemas.
export async function validarCarpeta() {
  const problemas = [];
  for (const p of await archivosActuales(CARPETA)) {
    const r = relative(CARPETA, p).split(sep).join('/');
    const m = r.match(/^([a-z0-9][a-z0-9-]{1,39})(?:\.html|\/(index|en|v\d{1,4}(-en)?)\.html)$/);
    if (!m) { problemas.push(`${r}: nombre que no es de la plantilla`); continue; }
    const idioma = m[2] === 'en' || m[3] ? 'en' : 'es';
    try { const h = await readFile(p, 'utf8'); validarHtml(h, idioma); if (!h.includes('Generada por .github/politicas/generar.mjs')) throw new Error('sin la marca del generador'); }
    catch (e) { problemas.push(`${r}: ${e.message}`); }
  }
  return problemas;
}

// Pide cada página publicada (vigentes y cada versión) sin seguir redirecciones y exige estado 200 y la versión que dice
// la base. También /privacidad, la política de Creative Whisper, que no tiene que cambiar por existir la carpeta.
export async function comprobar(base = SITIO, datos = null) {
  const lista = validarLista(datos ? datos.lista : await rpc('politicas_publicadas', {}));
  const b = base.replace(/\/$/, '');
  const pedir = async (url) => { try { const r = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(20_000) }); return { status: r.status, t: await r.text() }; } catch (e) { return { status: 0, t: String(e) }; } };
  const fallos = [];
  const anotar = (ok, status, url) => { console.log(`${ok ? 'OK   ' : 'FALLA'} ${status} ${url}`); if (!ok) fallos.push(url); };
  const paginas = [];
  for (const x of lista) {
    paginas.push([ruta(x.cuenta, x.idioma, x.version), x]);
    if (x.vigente) paginas.push([ruta(x.cuenta, x.idioma, null), x]);
  }
  for (const [r, x] of paginas) {
    const { status, t } = await pedir(b + r);
    anotar(status === 200 && t.includes(`${TEXTOS[x.idioma].version} ${x.version} ·`) && t.includes('Generada por .github/politicas/generar.mjs'), status, b + r);
  }
  const cw = await pedir(b + '/privacidad');
  anotar(cw.status === 200 && !cw.t.includes('Generada por .github/politicas/generar.mjs'), cw.status, b + '/privacidad');
  return fallos;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const datosArchivo = opcion('--datos');
  const datos = datosArchivo ? JSON.parse(await readFile(datosArchivo, 'utf8')) : null;
  try {
    if (args.includes('--validar')) {
      const problemas = await validarCarpeta();
      for (const x of problemas) console.error('  ' + x);
      if (problemas.length) { console.error(`${problemas.length} archivos de privacidad/ no son páginas de la plantilla.`); process.exit(1); }
      console.log('privacidad/: todas las páginas son de la plantilla.');
    } else if (args.includes('--comprobar')) {
      const base = args[args.indexOf('--comprobar') + 1];
      const fallos = await comprobar(base && !base.startsWith('--') ? base : SITIO, datos);
      if (fallos.length) { console.error(`${fallos.length} páginas no responden 200 con su versión.`); process.exit(1); }
    } else {
      const r = await generar({ datos, permitirVacio: args.includes('--permitir-vacio') });
      console.log(`Cuentas: ${r.cuentas.join(', ') || '(ninguna)'} · escritas ${r.escritas.length} · iguales ${r.iguales} · borradas ${r.borradas.length}`);
      for (const p of r.escritas) console.log('  + ' + p);
      for (const p of r.borradas) console.log('  - ' + p);
    }
  } catch (e) { console.error('ERROR: ' + e.message); process.exit(1); }
}
