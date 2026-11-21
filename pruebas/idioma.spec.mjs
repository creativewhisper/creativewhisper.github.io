// El botón de idioma lleva a la misma página en el otro idioma y la elección se respeta.
import { test, expect } from '@playwright/test';
import { PUBLICAS, loc } from './paginas.mjs';
import { sinCookies } from './util.mjs';

for (const pg of PUBLICAS.filter((p) => p.pareja)) {
  test.describe(`idioma · ${pg.ruta}`, () => {
    test.use({ locale: loc(pg.idioma) });
    test(`cambia a ${pg.pareja}`, async ({ page }) => {
      await page.goto(pg.ruta, { waitUntil: 'load' }); await sinCookies(page);
      let b = page.locator('[data-set-lang]:visible').first();
      if (!(await b.count())) { await page.locator('button[aria-controls]:visible, button[aria-expanded]:visible').first().click().catch(() => {}); await page.waitForTimeout(500); b = page.locator('[data-set-lang]:visible').first(); }
      await expect(b, 'botón de idioma a la vista').toBeVisible();
      await b.click();
      await page.waitForURL((u) => u.pathname === pg.pareja, { timeout: 8000 });
      await page.waitForTimeout(700);
      expect(new URL(page.url()).pathname, 'no rebota a la otra versión').toBe(pg.pareja);
      await expect(page.locator('html')).toHaveAttribute('lang', new RegExp('^' + (pg.idioma === 'es' ? 'en' : 'es')));
    });
  });
}

// Las páginas del cliente son una sola dirección para los dos idiomas.
for (const ruta of ['/cuenta/', '/panel/', '/alta/', '/api/']) {
  test(`idioma · ${ruta} en inglés no deja textos en español`, async ({ page }) => {
    await page.goto(ruta + '?lang=es', { waitUntil: 'load' }); await page.waitForTimeout(1200);
    const es = await page.title();
    await page.goto(ruta + '?lang=en', { waitUntil: 'load' }); await page.waitForTimeout(1800);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    expect(await page.title(), 'el título de la pestaña también cambia de idioma').not.toBe(es);
    // Lo que el traductor de la página no encontró en su diccionario y sigue a la vista con pinta de español.
    const queda = await page.evaluate(() => { const visto = document.body.innerText; return [...(window.CWIdioma?.faltan || [])].filter((x) => visto.includes(x) && /[áéíóúñ¿¡]|\b(tu|para|con|una|los|las|del|que|cuenta|correo|aquí)\b/i.test(x)); });
    expect(queda, 'textos a la vista sin traducir al inglés').toEqual([]);
  });
  test(`idioma · ${ruta} el botón cambia de idioma sin salir de la página`, async ({ page }) => {
    await page.goto(ruta + '?lang=es', { waitUntil: 'load' }); await page.waitForTimeout(1200);
    await page.locator('[data-idioma]:visible, #idioma:visible').first().click(); await page.waitForTimeout(800);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    expect(new URL(page.url()).pathname).toBe(ruta);
  });
}
