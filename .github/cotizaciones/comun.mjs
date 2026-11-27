// Cotizaciones cifradas · Fase 11.5b (M2). Mismo formato que lee cotizacion.html.
// Se corre en la computadora de Matías: las claves nunca se suben al repo ni pasan por ningún servidor.
import { webcrypto as wc, randomInt } from 'node:crypto';
import { gzipSync, gunzipSync } from 'node:zlib';
const s = wc.subtle, enc = new TextEncoder(), dec = new TextDecoder();
export const ITER_ID_V2 = 600000, ITER_CONTENIDO = 600000;
export const normaliza = (v) => String(v ?? '').normalize('NFKC').toUpperCase().replace(/[^A-Z0-9]/g, '');
const hex = (b) => Buffer.from(b).toString('hex');
export async function idV1(clave) { return hex(await s.digest('SHA-256', enc.encode('cw-cotizacion-id-v1:' + normaliza(clave)))).slice(0, 24); }
export async function idV2(clave) {
  const base = await s.importKey('raw', enc.encode(normaliza(clave)), 'PBKDF2', false, ['deriveBits']);
  return 'v2-' + hex(await s.deriveBits({ name: 'PBKDF2', salt: enc.encode('cw-cotizacion-id-v2'), iterations: ITER_ID_V2, hash: 'SHA-256' }, base, 128));
}
async function llave(clave, sal, iter, uso) {
  const base = await s.importKey('raw', enc.encode(normaliza(clave)), 'PBKDF2', false, ['deriveKey']);
  return s.deriveKey({ name: 'PBKDF2', salt: sal, iterations: iter, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, [uso]);
}
// Clave nueva: 25 caracteres de un alfabeto sin letras que se confunden (unos 120 bits), en grupos de 5.
const ALFABETO = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
export function claveNueva() {
  let t = ''; for (let i = 0; i < 25; i++) t += ALFABETO[randomInt(ALFABETO.length)];
  return 'CW-' + t.match(/.{5}/g).join('-');
}
export async function cifrar(clave, datos) {
  const sal = wc.getRandomValues(new Uint8Array(16)), iv = wc.getRandomValues(new Uint8Array(12));
  const ct = await s.encrypt({ name: 'AES-GCM', iv }, await llave(clave, sal, ITER_CONTENIDO, 'encrypt'), gzipSync(Buffer.from(JSON.stringify(datos), 'utf8')));
  return { v: 2, i: ITER_CONTENIDO, s: Buffer.from(sal).toString('base64'), n: Buffer.from(iv).toString('base64'), d: Buffer.from(ct).toString('base64') };
}
export async function descifrar(clave, paq) {
  const pl = await s.decrypt({ name: 'AES-GCM', iv: Buffer.from(paq.n, 'base64') }, await llave(clave, Buffer.from(paq.s, 'base64'), paq.i || 310000, 'decrypt'), Buffer.from(paq.d, 'base64'));
  return JSON.parse(dec.decode(gunzipSync(Buffer.from(pl))));
}
