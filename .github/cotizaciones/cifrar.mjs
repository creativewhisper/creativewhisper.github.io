// Cifra una propuesta nueva (formato v2). Uso, desde la raíz del repo:
//   node .github/cotizaciones/cifrar.mjs --html propuesta.html --cliente "Nombre" --titulo "Título" --fecha 2026-11-27
// Escribe cotizaciones/v2-<id>.json y muestra la clave UNA vez en la pantalla: guárdala en tu gestor de contraseñas y
// mándasela al cliente. No queda escrita en ningún archivo.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { claveNueva, cifrar, descifrar, idV2 } from './comun.mjs';
const a = Object.fromEntries(process.argv.slice(2).join(' ').split(/\s*--/).filter(Boolean).map((x) => { const [k, ...v] = x.split(' '); return [k, v.join(' ').replace(/^"|"$/g, '')]; }));
if (!a.html || !existsSync(a.html)) { console.error('Falta --html con la propuesta.'); process.exit(1); }
const clave = a.clave || claveNueva();
const datos = { t: a.titulo || 'Cotización', c: a.cliente || '', f: a.fecha || new Date().toISOString().slice(0, 10), h: readFileSync(a.html, 'utf8') };
const paq = await cifrar(clave, datos), id = await idV2(clave), ruta = `cotizaciones/${id}.json`;
if ((await descifrar(clave, paq)).h !== datos.h) { console.error('La comprobación falló: no se escribió nada.'); process.exit(1); }
writeFileSync(ruta, JSON.stringify(paq));
console.log(`Listo: ${ruta}\nClave (guárdala ahora, no queda en ningún archivo): ${clave}`);
