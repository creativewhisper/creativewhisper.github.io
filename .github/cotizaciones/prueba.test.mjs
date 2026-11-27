// node --test .github/cotizaciones/  (Fase 11.5b, M2)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { claveNueva, cifrar, descifrar, idV1, idV2, normaliza } from './comun.mjs';
test('v1: el demo de siempre sigue abriendo (CW-DEMO-2026)', async () => {
  const id = await idV1('cw demo 2026'); assert.equal(id, '2f4f6a6c52f3cef49b986052');
  const d = await descifrar('CW-DEMO-2026', JSON.parse(readFileSync(new URL(`../../cotizaciones/${id}.json`, import.meta.url))));
  assert.ok(typeof d.h === 'string' && d.h.length > 0);
});
test('v2: ida y vuelta, nombre con prefijo y clave larga', async () => {
  const k = claveNueva(); assert.match(k, /^CW(-[2-9A-HJKMNP-Z]{5}){5}$/); assert.ok(normaliza(k).length >= 27);
  const paq = await cifrar(k, { t: 'T', c: 'C', f: '2026-11-27', h: '<p>hola</p>' });
  assert.equal(paq.i, 600000); assert.equal((await descifrar(k, paq)).h, '<p>hola</p>');
  const id = await idV2(k); assert.match(id, /^v2-[0-9a-f]{32}$/); assert.equal(id, await idV2(k.toLowerCase().replace(/-/g, ' ')));
  await assert.rejects(descifrar(claveNueva(), paq));
});
