// Fase 11.5b (M2) · cotizacion.html abre las propuestas de antes (v1) y las nuevas (v2: nombre con PBKDF2 de 600 000 iteraciones).
// La propuesta v2 se arma aquí mismo y se sirve simulada: no se publica ningún archivo nuevo.
import { test, expect } from '@playwright/test';
import { claveNueva, cifrar, idV1, idV2 } from '../.github/cotizaciones/comun.mjs';

test('una propuesta v2 abre con su clave y una clave equivocada no', async ({ page }) => {
  test.setTimeout(90_000);
  const clave = claveNueva(), id = await idV2(clave), v1 = await idV1(clave);
  const paq = await cifrar(clave, { t: 'Propuesta de prueba', c: 'Cliente ficticio', f: '2026-11-27', h: '<!doctype html><title>ok</title><h1 id="hecho">Propuesta v2 abierta</h1>' });
  const pedidos = [];
  await page.route('**/cotizaciones/*.json', (r) => {
    const n = r.request().url().split('/').pop().replace('.json', ''); pedidos.push(n);
    if (n === id) return r.fulfill({ json: paq });
    if (n === v1) return r.fulfill({ status: 404, body: '' });
    return r.fallback();
  });
  await page.goto('/cotizacion.html');
  await page.locator('#clave').fill('CW-NO-EXISTE-12345');
  await page.locator('#go').click();
  await expect(page.locator('#msg')).toContainText('no corresponde', { timeout: 30_000 });
  await page.locator('#clave').fill(clave.toLowerCase().replace(/-/g, ' '));
  await page.locator('#go').click();
  await expect(page.locator('#hecho')).toHaveText('Propuesta v2 abierta', { timeout: 60_000 });
  expect(pedidos).toContain(v1); expect(pedidos).toContain(id); // primero el nombre viejo, después el nuevo
});

test('el demo de antes (v1) sigue abriendo con su clave', async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto('/cotizacion.html');
  await page.locator('#clave').fill('CW-DEMO-2026');
  await page.locator('#go').click();
  await expect(page.locator('#clave')).toHaveCount(0, { timeout: 60_000 }); // la propuesta reemplaza la página
});
