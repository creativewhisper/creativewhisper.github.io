// Aviso de cookies y píxel de Meta: el píxel solo se carga si la persona acepta.
import { test, expect } from '@playwright/test';
import { PUBLICAS, loc } from './paginas.mjs';
import { vigilarMeta } from './util.mjs';

for (const pg of PUBLICAS.filter((p) => p.cookies && p.pareja)) {
  test.describe(`cookies · ${pg.ruta}`, () => {
    test.use({ locale: loc(pg.idioma) });
    test('pregunta primero, respeta el «no» y solo mide con el «sí»', async ({ page, context }) => {
      const meta = vigilarMeta(context);
      await context.route(/facebook\.(com|net)/, (r) => r.fulfill({ status: 200, contentType: 'application/javascript', body: '/* píxel simulado en las pruebas */' }));
      await page.goto(pg.ruta, { waitUntil: 'load' });
      const aviso = page.locator('.cw-ck');
      await expect(aviso).toBeVisible();
      await expect(aviso).toContainText(pg.idioma === 'es' ? 'Aceptar' : 'Accept');
      await expect(aviso.locator('a')).toHaveAttribute('href', (pg.idioma === 'es' ? '/privacidad.html' : '/privacy.html') + '#cookies');
      await page.waitForTimeout(3000);
      expect(meta, 'pedidos a Meta antes del permiso').toEqual([]);
      // el aviso no tapa el botón del agente
      const cajas = await page.evaluate(() => { const caja = (e) => { if (!e) return null; const b = e.getBoundingClientRect(); return b.width ? [b.left, b.top, b.right, b.bottom] : null; }; const h = document.getElementById('cw-asistente'); return { ck: caja(document.querySelector('.cw-ck')), ag: caja(h && (h.shadowRoot || h).querySelector('.fab')) || caja(document.querySelector('.ae-b')) }; });
      if (cajas.ck && cajas.ag) { const [a, b] = [cajas.ck, cajas.ag]; expect(a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3], 'el aviso de cookies tapa el botón del agente').toBe(false); }
      await aviso.locator('.no').click();
      await expect(aviso).toHaveCount(0);
      await page.reload({ waitUntil: 'load' }); await page.waitForTimeout(800);
      await expect(page.locator('.cw-ck')).toHaveCount(0);
      expect(meta, 'pedidos a Meta después de rechazar').toEqual([]);
      // «Configurar cookies» lo vuelve a abrir; al aceptar se carga el píxel
      const conf = page.locator('[data-cookies]').first();
      await conf.evaluate((e) => e.click());   // clic directo: en la portada el pie se mueve con la animación
      await expect(page.locator('.cw-ck')).toBeVisible();
      await page.locator('.cw-ck .si').click(); await page.waitForTimeout(1500);
      expect(meta.some((u) => /fbevents\.js/.test(u)), 'el píxel se carga al aceptar').toBe(true);
      expect(await page.evaluate(() => JSON.parse(localStorage.getItem('cw-cookies')).si)).toBe(true);
    });
  });
}

test('las páginas del cliente no cargan el píxel', async ({ page, context }) => {
  const meta = vigilarMeta(context);
  for (const r of ['/cuenta/', '/panel/', '/alta/', '/api/']) { await page.goto(r, { waitUntil: 'load' }); await page.waitForTimeout(500); await expect(page.locator('.cw-ck')).toHaveCount(0); }
  expect(meta).toEqual([]);
});

test('la política de privacidad explica las cookies en los dos idiomas', async ({ page }) => {
  for (const r of ['/privacidad.html', '/privacy.html']) { await page.goto(r); await expect(page.locator('#cookies')).toBeAttached(); await expect(page.locator('[data-cookies]').first()).toBeAttached(); }
});
