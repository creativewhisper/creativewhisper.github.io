// Fase 11.6b · creativewhisper.net/privacidad/{cuenta}: la política de cada empresa. En GitHub Pages esa dirección cae en
// 404.html, que la pide a la base. Aquí se simula lo mismo (la ruta responde con 404.html) y la respuesta de la base se
// fija en la prueba: no depende de datos reales ni gasta nada.
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

const PAGINA404 = readFileSync(new URL('../404.html', import.meta.url), 'utf8');
const POLITICA = {
  existe: true, cuenta: 'demo', nombre: '<img src=x onerror=alert(1)>Demo', version: 2, idioma: 'es', vigente: true, desde: '2026-11-21T20:00:00Z', hasta: null, revision_legal: false,
  otros_idiomas: ['en'], versiones: [{ version: 2, desde: '2026-11-21T20:00:00Z', hasta: null }, { version: 1, desde: '2026-11-01T20:00:00Z', hasta: '2026-11-21T20:00:00Z' }],
  bloques: [
    { t: 'h1', s: [['Política de privacidad de <script>alert(1)</script>', false]] },
    { t: 'h2', s: [['1. Quién es responsable', false]] },
    { t: 'p', s: [['Escribe a ', false], ['privacidad@demo.invalid', true]] },
    { t: 'li', s: [['uno', false]] }, { t: 'li2', s: [['dos', false]] },
    { t: 'tabla', filas: [[[['Para qué', false]], [['Base', false]]], [[['Responderte', false]], [['Contrato', false]]]] },
  ],
};
async function preparar(page, respuesta) {
  const fallos = [];
  page.on('pageerror', (e) => fallos.push(String(e)));
  page.on('dialog', (d) => { fallos.push('diálogo: ' + d.message()); d.dismiss(); });
  await page.route(/\/privacidad\/[a-z0-9-]+(\/v\d+)?\/?(\?.*)?$/, (r) => r.fulfill({ status: 404, contentType: 'text/html; charset=utf-8', body: PAGINA404 }));
  await page.route(/\/no-existe-de-verdad$/, (r) => r.fulfill({ status: 404, contentType: 'text/html; charset=utf-8', body: PAGINA404 }));
  await page.route('**/rest/v1/rpc/politica_publica', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(respuesta) }));
  return fallos;
}

test('una dirección que no existe dice «página no encontrada»', async ({ page }) => {
  const fallos = await preparar(page, { existe: false });
  await page.goto('/no-existe-de-verdad');
  await expect(page.locator('h1')).toHaveText('Página no encontrada');
  expect(fallos).toEqual([]);
});

test('la política publicada se pinta como texto, con el aviso de borrador legal y sus versiones', async ({ page }) => {
  const fallos = await preparar(page, POLITICA);
  await page.goto('/privacidad/demo');
  await expect(page.locator('h1')).toContainText('Política de privacidad de <script>alert(1)</script>');
  await expect(page.locator('.aviso').first()).toContainText('Borrador para revisión de abogado');
  await expect(page.locator('table td').first()).toHaveText('Responderte');
  await expect(page.locator('strong', { hasText: 'privacidad@demo.invalid' })).toBeVisible();
  await expect(page.locator('ul ul li')).toHaveText('dos');
  await expect(page.locator('.versiones a')).toHaveCount(2);
  await expect(page.locator('a', { hasText: 'English version' })).toHaveAttribute('href', '/privacidad/demo?lang=en');
  expect(await page.evaluate(() => document.querySelectorAll('script:not([src]), img[onerror]').length)).toBe(0);
  expect(await page.title()).toContain('Demo');
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1);
  expect(fallos).toEqual([]);
});

test('sin política publicada lo dice, en inglés si se pide', async ({ page }) => {
  const fallos = await preparar(page, { existe: false });
  await page.goto('/privacidad/sin-politica?lang=en');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('#pagina p')).toHaveText('This company has no published privacy policy yet.');
  expect(fallos).toEqual([]);
});

test('una versión anterior avisa y enlaza a la vigente', async ({ page }) => {
  const fallos = await preparar(page, { ...POLITICA, version: 1, vigente: false, revision_legal: true });
  await page.goto('/privacidad/demo/v1');
  await expect(page.locator('.aviso')).toHaveCount(1);
  await expect(page.locator('.aviso a')).toHaveAttribute('href', '/privacidad/demo');
  expect(fallos).toEqual([]);
});
