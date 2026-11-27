// Re-cifra las cotizaciones de antes (v1: nombre con SHA-256 rápido) con una clave NUEVA y el formato v2.
// Uso, desde la raíz del repo, en tu computadora:
//   node .github/cotizaciones/migrar.mjs <archivo con las claves viejas, una por línea>
// Para cada clave vieja busca su archivo v1, lo abre, lo cifra con una clave nueva (v2) y escribe el archivo v2.
// Las claves nuevas se guardan SOLO en «claves-nuevas-cotizaciones.txt» junto al archivo de claves viejas (fuera del repo).
// Los archivos v1 NO se borran: siguen abriendo con la clave vieja hasta que mandes las nuevas a cada cliente y decidas
// borrarlos (git rm cotizaciones/<id>.json). Ojo: los v1 quedan en el historial público de git; por eso la clave cambia.
import { readFileSync, writeFileSync, existsSync, appendFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { claveNueva, cifrar, descifrar, idV1, idV2, normaliza } from './comun.mjs';
const lista = process.argv[2];
if (!lista || !existsSync(lista)) { console.error('Falta el archivo con las claves viejas.'); process.exit(1); }
if (resolve(lista).startsWith(resolve('.'))) { console.error('El archivo de claves está dentro del repo: muévelo fuera antes de seguir.'); process.exit(1); }
const salida = join(dirname(resolve(lista)), 'claves-nuevas-cotizaciones.txt');
let n = 0;
for (const linea of readFileSync(lista, 'utf8').split(/\r?\n/)) {
  const vieja = (linea.match(/CW[\sA-Z0-9-]{6,}/i) || [linea])[0].trim();
  if (normaliza(vieja).length < 6) continue;
  const v1 = `cotizaciones/${await idV1(vieja)}.json`;
  if (!existsSync(v1)) { console.log(`· sin archivo para una clave (${normaliza(vieja).slice(0, 4)}…)`); continue; }
  const datos = await descifrar(vieja, JSON.parse(readFileSync(v1, 'utf8')));
  const nueva = claveNueva(), paq = await cifrar(nueva, datos), v2 = `cotizaciones/${await idV2(nueva)}.json`;
  if ((await descifrar(nueva, paq)).h !== datos.h) throw new Error('comprobación fallida');
  writeFileSync(v2, JSON.stringify(paq));
  appendFileSync(salida, `${datos.c || '(sin cliente)'} · ${datos.t || ''}\tantes: ${v1}\tahora: ${v2}\tclave nueva: ${nueva}\n`);
  console.log(`✓ ${datos.c || '(sin cliente)'} · ${datos.t || ''} → ${v2}`); n++;
}
console.log(`\n${n} cotizaciones re-cifradas. Claves nuevas en: ${salida}`);
