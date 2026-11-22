// Fase 11.6c · /privacidad/{cuenta} como página ESTÁTICA (camino A): responde 200, sin pasar por 404.html y sin pedir nada
// a la base. Las páginas las escribe .github/politicas/generar.mjs; aquí se prueban las que estén en el repo (o publicadas).
// En local, python no sirve «x.html» en «/x»: se pide con .html. Contra lo publicado se pide la dirección real, sin .html.
import { test, expect } from '@playwright/test';
import { readdirSync } from 'node:fs';
import { EN_VIVO } from './paginas.mjs';

const CARPETA = new URL('../privacidad/', import.meta.url);
let cuentas = [];
try { cuentas = readdirSync(CARPETA).filter((f) => /^[a-z0-9][a-z0-9-]{1,39}\.html$/.test(f)).map((f) => f.slice(0, -5)).sort().slice(0, 3); } catch { /* sin carpeta: no hay políticas */ }
const dir = (c, resto = '') => `/privacidad/${c}${resto}` + (EN_VIVO ? '' : '.html');

for (const c of cuentas) {
  test(`/privacidad/${c} responde 200 con la política, sin pedir nada a la base`, async ({ page }) => {
    const fallos = [], pedidos = [];
    page.on('pageerror', (e) => fallos.push(String(e)));
    page.on('console', (m) => { if (m.type() === 'error') fallos.push(m.text()); });
    page.on('request', (r) => { if (/supabase\.co/.test(r.url())) pedidos.push(r.url()); });
    const r = await page.goto(dir(c));
    expect(r.status()).toBe(200);
    await expect(page.locator('h1').first()).toContainText(/Política de privacidad|Privacy policy/);
    await expect(page.locator('p.sub').first()).toContainText(/Versión \d+ · vigente desde el/);
    const html = await r.text();
    expect(html).toContain('Generada por .github/politicas/generar.mjs');
    expect(await page.evaluate(() => document.querySelectorAll('script:not([src])').length)).toBe(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1);
    expect(pedidos).toEqual([]);
    expect(fallos).toEqual([]);
  });
}

test('las versiones y el inglés enlazados existen', async ({ request }) => {
  for (const c of cuentas) {
    const html = await (await request.get(dir(c))).text();
    const enlaces = [...html.matchAll(/href="(\/privacidad\/[^"]+)"/g)].map((m) => m[1]);
    for (const e of enlaces) {
      const r = await request.get(EN_VIVO ? e : e + '.html', { maxRedirects: 0 });
      expect(r.status(), e).toBe(200);
    }
  }
});

test('/privacidad (la política de Creative Whisper) sigue respondiendo', async ({ request }) => {
  const r = await request.get(EN_VIVO ? '/privacidad' : '/privacidad.html', { maxRedirects: 0 });
  expect(r.status()).toBe(200);
  expect(await r.text()).not.toContain('Generada por .github/politicas/generar.mjs');
});
