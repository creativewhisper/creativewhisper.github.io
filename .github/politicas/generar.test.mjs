// Pruebas del generador de las páginas estáticas de /privacidad/{cuenta} (Fase 11.6c). Sin red: datos fijos.
//   node --test .github/politicas/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, readdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const GEN = fileURLToPath(new URL('./generar.mjs', import.meta.url));
const correr = promisify(execFile);

const bloques = [
  { t: 'h1', s: [['Política de privacidad de <script>alert(1)</script>', false]] },
  { t: 'h2', s: [['1. Quién es responsable', false]] },
  { t: 'p', s: [['Escribe a ', false], ['privacidad@demo.invalid', true], [' <img src=x onerror=alert(2)>', false]] },
  { t: 'li', s: [['uno', false]] }, { t: 'li2', s: [['uno.a', false]] }, { t: 'li2', s: [['uno.b', false]] }, { t: 'li', s: [['dos', false]] },
  { t: 'p', s: [['javascript:alert(3) en texto no es enlace', false]] },
  { t: 'ol', s: [['primero', false]] },
  { t: 'hr' }, { t: 'raro', s: [['no se pinta', false]] },
  { t: 'tabla', filas: [[[['Para qué', false]], [['Base', false]]], [[['Responderte', false]], [['Contrato" onmouseover="x', false]]]] },
];
const v = (version, desde, hasta) => ({ version, desde, hasta });
const pol = (cuenta, idioma, version, vigente, extra = {}) => ({
  existe: true, cuenta, nombre: '<b>Demo</b> & Cía', version, idioma, vigente, revision_legal: false, bloques,
  desde: version === 1 ? '2026-11-01T20:00:00Z' : '2026-11-21T20:00:00Z', hasta: version === 1 ? '2026-11-21T20:00:00Z' : null,
  otros_idiomas: version === 2 ? [idioma === 'es' ? 'en' : 'es'] : [],
  versiones: idioma === 'es' ? [v(2, '2026-11-21T20:00:00Z', null), v(1, '2026-11-01T20:00:00Z', '2026-11-21T20:00:00Z')] : [v(2, '2026-11-21T20:00:00Z', null)], ...extra,
});
const DATOS = {
  lista: [
    { cuenta: 'demo', idioma: 'es', version: 1, vigente: false }, { cuenta: 'demo', idioma: 'es', version: 2, vigente: true },
    { cuenta: 'demo', idioma: 'en', version: 2, vigente: true }, { cuenta: 'otra', idioma: 'es', version: 1, vigente: true },
  ],
  politicas: {
    'demo|es|1': pol('demo', 'es', 1, false), 'demo|es|2': pol('demo', 'es', 2, true), 'demo|en|2': pol('demo', 'en', 2, true),
    'otra|es|1': pol('otra', 'es', 1, true, { nombre: 'Otra', revision_legal: true, versiones: [v(1, '2026-11-01T20:00:00Z', null)] }),
  },
};

async function sitio(datos, ...extra) {
  const raiz = await mkdtemp(join(tmpdir(), 'politicas-'));
  const f = join(raiz, 'datos.json'); await writeFile(f, JSON.stringify(datos));
  const r = await correr(process.execPath, [GEN, '--raiz', raiz, '--datos', f, ...extra]).catch((e) => e);
  return { raiz, r, leer: (p) => readFile(join(raiz, 'privacidad', p), 'utf8') };
}
async function todos(dir, base = dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true }).catch(() => [])) {
    const p = join(dir, e.name); if (e.isDirectory()) out.push(...await todos(p, base)); else out.push(p.slice(base.length + 1));
  }
  return out.sort();
}

test('escribe las páginas esperadas, solo dentro de privacidad/', async () => {
  const { raiz, r } = await sitio(DATOS);
  assert.equal(r.code ?? 0, 0, String(r.stderr));
  assert.deepEqual(await todos(raiz), ['datos.json', 'privacidad/demo.html', 'privacidad/demo/en.html', 'privacidad/demo/index.html', 'privacidad/demo/v1.html', 'privacidad/demo/v2-en.html', 'privacidad/demo/v2.html', 'privacidad/otra.html', 'privacidad/otra/index.html', 'privacidad/otra/v1.html']);
  await rm(raiz, { recursive: true });
});

test('todo lo de la base sale como texto; aviso de borrador, versiones e inglés', async () => {
  const { raiz, leer } = await sitio(DATOS);
  const h = await leer('demo.html');
  assert.ok(h.includes('Política de privacidad de &lt;script&gt;alert(1)&lt;/script&gt;'));
  assert.ok(h.includes('&lt;img src=x onerror=alert(2)&gt;'));
  assert.ok(h.includes('Contrato&quot; onmouseover=&quot;x'));
  assert.ok(!/<script(?! src="\/assets\/politica-idioma\.js"><\/script>)/.test(h), 'solo el script del idioma');
  assert.equal((h.match(/<script/g) ?? []).length, 1);
  assert.ok(!h.includes('noindex'), 'la vigente se deja indexar');
  assert.ok(h.includes('Borrador para revisión de abogado'));
  assert.ok(h.includes('<title>Política de privacidad · &lt;b&gt;Demo&lt;/b&gt; &amp; Cía</title>'));
  assert.ok(h.includes('<a href="/privacidad/demo/v1">Versión 1</a>') && h.includes('<a href="/privacidad/demo/v2">Versión 2</a>'));
  assert.ok(h.includes('<a href="/privacidad/demo/en" hreflang="en">English version</a>'));
  assert.ok(h.includes('<link rel="alternate" hreflang="en" href="https://creativewhisper.net/privacidad/demo/en">'));
  assert.ok(h.includes('<link rel="canonical" href="https://creativewhisper.net/privacidad/demo">'));
  assert.ok(h.includes('<ul><li>uno\n<ul><li>uno.a</li>\n<li>uno.b</li>\n</ul>\n</li><li>dos'), 'sublista dentro del li');
  assert.ok(h.includes('<ol><li>primero\n</li></ol>'));
  assert.ok(!h.includes('no se pinta'));
  assert.ok(h.includes('Versión 2 · vigente desde el 21 de noviembre de 2026'));
  assert.equal(await leer('demo/index.html'), h);
  const en = await leer('demo/en.html');
  assert.ok(en.startsWith('<!doctype html>') && en.includes('<html lang="en">') && en.includes('Draft for legal review'));
  assert.ok(!en.includes('<script'), 'la página en inglés no lleva script');
  assert.ok(en.includes('<a href="/privacidad/demo" hreflang="es">Versión en español</a>'));
  const vieja = await leer('demo/v1.html');
  assert.ok(vieja.includes('Esta es una versión anterior. <a href="/privacidad/demo">Ver la vigente</a>'));
  assert.ok(vieja.includes('<meta name="robots" content="noindex">'));
  assert.ok(vieja.includes('hasta el 21 de noviembre de 2026'));
  const otra = await leer('otra.html');
  assert.ok(!otra.includes('class="aviso"'), 'revisada por el abogado: sin aviso');
  assert.ok(!otra.includes('Versiones de esta política'), 'una sola versión: sin lista');
  await rm(raiz, { recursive: true });
});

test('borra lo que dejó de estar publicado y no toca nada fuera de privacidad/', async () => {
  const { raiz } = await sitio(DATOS);
  await writeFile(join(raiz, 'fuera.html'), 'x');
  await writeFile(join(raiz, 'privacidad', 'suelto.html'), 'x');
  const f = join(raiz, 'datos.json');
  await writeFile(f, JSON.stringify({ lista: DATOS.lista.filter((x) => x.cuenta === 'demo'), politicas: DATOS.politicas }));
  const r = await correr(process.execPath, [GEN, '--raiz', raiz, '--datos', f]);
  assert.match(r.stdout, /borradas 4/);
  const quedan = await todos(raiz);
  assert.ok(quedan.includes('fuera.html'));
  assert.ok(!quedan.some((p) => p.startsWith('privacidad/otra')) && !quedan.includes('privacidad/suelto.html'));
  const r2 = await correr(process.execPath, [GEN, '--raiz', raiz, '--datos', f]);
  assert.match(r2.stdout, /escritas 0 · iguales 6 · borradas 0/, 'dos corridas iguales no cambian nada');
  await rm(raiz, { recursive: true });
});

test('si la base dice «ninguna», no borra sin --permitir-vacio', async () => {
  const { raiz } = await sitio(DATOS);
  const f = join(raiz, 'datos.json'); await writeFile(f, JSON.stringify({ lista: [], politicas: {} }));
  const r = await correr(process.execPath, [GEN, '--raiz', raiz, '--datos', f]).catch((e) => e);
  assert.equal(r.code, 1); assert.match(r.stderr, /No borro nada/);
  assert.equal((await todos(join(raiz, 'privacidad'))).length, 9);
  await correr(process.execPath, [GEN, '--raiz', raiz, '--datos', f, '--permitir-vacio']);
  assert.equal((await todos(join(raiz, 'privacidad'))).length, 0);
  await rm(raiz, { recursive: true });
});

test('rechaza cuentas raras, respuestas que no coinciden y no escribe nada', async () => {
  for (const lista of [[{ cuenta: '../x', idioma: 'es', version: 1, vigente: true }], [{ cuenta: 'demo', idioma: 'fr', version: 1, vigente: true }], [{ cuenta: 'demo', idioma: 'es', version: '1', vigente: true }]]) {
    const { raiz, r } = await sitio({ lista, politicas: {} });
    assert.equal(r.code, 1); assert.match(r.stderr, /entrada inválida/);
    assert.deepEqual(await todos(raiz), ['datos.json']);
    await rm(raiz, { recursive: true });
  }
  const { raiz, r } = await sitio({ lista: [{ cuenta: 'demo', idioma: 'es', version: 2, vigente: true }], politicas: { 'demo|es|2': { ...pol('demo', 'es', 2, true), cuenta: 'otra' } } });
  assert.equal(r.code, 1); assert.match(r.stderr, /no devolvió/);
  assert.deepEqual(await todos(raiz), ['datos.json']);
  await rm(raiz, { recursive: true });
  // La lista dice vigente y la página ya no (se aprobó otra versión entre las dos consultas): corta sin escribir.
  const b = await sitio({ lista: [{ cuenta: 'demo', idioma: 'es', version: 2, vigente: true }], politicas: { 'demo|es|2': pol('demo', 'es', 2, false) } });
  assert.equal(b.r.code, 1); assert.match(b.r.stderr, /cambió durante la corrida/);
  assert.deepEqual(await todos(b.raiz), ['datos.json']);
  await rm(b.raiz, { recursive: true });
});

test('una versión vieja en inglés sin inglés vigente lleva a la vigente en español; las cuentas «prueba-» no se indexan', async () => {
  const datos = {
    lista: [{ cuenta: 'prueba-x', idioma: 'es', version: 2, vigente: true }, { cuenta: 'prueba-x', idioma: 'en', version: 1, vigente: false }],
    politicas: { 'prueba-x|es|2': pol('prueba-x', 'es', 2, true, { otros_idiomas: [] }), 'prueba-x|en|1': pol('prueba-x', 'en', 1, false, { otros_idiomas: [], versiones: [v(1, '2026-11-01T20:00:00Z', '2026-11-21T20:00:00Z')] }) },
  };
  const { raiz, r, leer } = await sitio(datos);
  assert.equal(r.code ?? 0, 0, String(r.stderr));
  const vieja = await leer('prueba-x/v1-en.html');
  assert.ok(vieja.includes('This is a previous version. <a href="/privacidad/prueba-x">See the current one</a>'));
  assert.ok((await leer('prueba-x.html')).includes('<meta name="robots" content="noindex">'));
  assert.deepEqual((await todos(join(raiz, 'privacidad'))), ['prueba-x.html', 'prueba-x/index.html', 'prueba-x/v1-en.html', 'prueba-x/v2.html']);
  await rm(raiz, { recursive: true });
});

test('--comprobar exige estado 200 y la versión', async () => {
  const http = await import('node:http');
  const { raiz, leer } = await sitio(DATOS);
  const paginas = { '/privacidad/demo': await leer('demo.html'), '/privacidad/demo/en': await leer('demo/en.html'), '/privacidad/otra': await leer('otra.html'),
    '/privacidad/demo/v1': await leer('demo/v1.html'), '/privacidad/demo/v2': await leer('demo/v2.html'), '/privacidad/demo/v2-en': await leer('demo/v2-en.html'), '/privacidad/otra/v1': await leer('otra/v1.html'),
    '/privacidad': '<!doctype html><title>Política de privacidad de Creative Whisper</title>' };
  const srv = http.createServer((q, s) => { const b = paginas[q.url]; s.writeHead(b ? 200 : 404, { 'content-type': 'text/html' }); s.end(b ?? 'no'); });
  await new Promise((ok) => srv.listen(0, '127.0.0.1', ok));
  const base = `http://127.0.0.1:${srv.address().port}`;
  const f = join(raiz, 'datos.json');
  const bien = await correr(process.execPath, [GEN, '--datos', f, '--comprobar', base]).catch((e) => e);
  assert.equal(bien.code ?? 0, 0, String(bien.stdout));
  delete paginas['/privacidad/otra'];
  const mal = await correr(process.execPath, [GEN, '--datos', f, '--comprobar', base]).catch((e) => e);
  assert.equal(mal.code, 1); assert.match(mal.stdout, /FALLA 404 .*\/privacidad\/otra/);
  paginas['/privacidad/otra'] = await leer('otra.html'); delete paginas['/privacidad'];
  const sinCw = await correr(process.execPath, [GEN, '--datos', f, '--comprobar', base]).catch((e) => e);
  assert.equal(sinCw.code, 1); assert.match(sinCw.stdout, /FALLA 404 .*\/privacidad$/m);
  srv.close(); await rm(raiz, { recursive: true });
});

test('--validar acepta lo generado y rechaza un script metido después o un archivo suelto', async () => {
  const { raiz } = await sitio(DATOS);
  const ok = await correr(process.execPath, [GEN, '--raiz', raiz, '--validar']).catch((e) => e);
  assert.equal(ok.code ?? 0, 0, String(ok.stderr));
  const f = join(raiz, 'privacidad', 'demo', 'v1.html');
  await writeFile(f, (await readFile(f, 'utf8')).replace('</body>', '<script>alert(1)</script></body>'));
  await writeFile(join(raiz, 'privacidad', 'x.js'), 'alert(1)');
  const mal = await correr(process.execPath, [GEN, '--raiz', raiz, '--validar']).catch((e) => e);
  assert.equal(mal.code, 1);
  assert.match(mal.stderr, /demo\/v1\.html: la página trae un <script>/);
  assert.match(mal.stderr, /x\.js: nombre que no es de la plantilla/);
  await rm(raiz, { recursive: true });
});

test('el enlace al otro idioma solo aparece si esa página existe', async () => {
  const datos = { lista: [{ cuenta: 'demo', idioma: 'es', version: 2, vigente: true }, { cuenta: 'demo', idioma: 'es', version: 1, vigente: false }, { cuenta: 'demo', idioma: 'en', version: 1, vigente: false }],
    politicas: { 'demo|es|2': pol('demo', 'es', 2, true, { otros_idiomas: ['en'] }), 'demo|es|1': pol('demo', 'es', 1, false, { otros_idiomas: ['en'] }),
      'demo|en|1': pol('demo', 'en', 1, false, { otros_idiomas: ['es'], versiones: [v(1, '2026-11-01T20:00:00Z', '2026-11-21T20:00:00Z')] }) } };
  const { raiz, r, leer } = await sitio(datos);
  assert.equal(r.code ?? 0, 0, String(r.stderr));
  assert.ok(!(await leer('demo.html')).includes('English version'), 'sin inglés vigente, la vigente no enlaza a /en');
  assert.ok((await leer('demo/v1.html')).includes('<a href="/privacidad/demo/v1-en" hreflang="en">English version</a>'));
  assert.ok((await leer('demo/v1-en.html')).includes('<a href="/privacidad/demo/v1" hreflang="es">Versión en español</a>'));
  await rm(raiz, { recursive: true });
});
