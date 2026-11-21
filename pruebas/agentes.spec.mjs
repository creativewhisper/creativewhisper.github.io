// Cada página interactiva tiene su agente. Con CON_AGENTES=1 (solo contra la web publicada) además se le hace UNA pregunta
// a cada tipo de agente y se espera una respuesta de verdad. Cada pregunta gasta una respuesta de IA: por eso es opcional.
import { test, expect } from '@playwright/test';
import { PUBLICAS, CLIENTE, loc, EN_VIVO } from './paginas.mjs';
import { sinCookies } from './util.mjs';
const BOTON = '#cw-asistente .fab, .ae-b';

for (const pg of [...PUBLICAS, ...CLIENTE].filter((p) => p.agente)) {
  test.describe(`agente · ${pg.ruta}`, () => {
    test.use({ locale: loc(pg.idioma) });
    test('tiene agente y se abre', async ({ page }) => {
      const errores = []; page.on('pageerror', (e) => errores.push(String(e)));
      await page.goto(pg.ruta, { waitUntil: 'load' }); await sinCookies(page);
      const b = page.locator(BOTON).first();
      await expect(b).toBeVisible({ timeout: 12000 });
      await b.click();
      await expect(page.locator('#cw-asistente textarea, .ae-p input, .ae-p textarea').first()).toBeVisible();
      expect(errores).toEqual([]);
    });
  });
}

const preguntar = EN_VIVO && process.env.CON_AGENTES === '1';
for (const [ruta, idioma] of [['/es/', 'es'], ['/', 'en'], ['/susurro-digital/', 'es'], ['/digital-whisper/', 'en'], ['/api/', 'es']]) {
  test.describe(`agente responde · ${ruta}`, () => {
    test.use({ locale: loc(idioma) });
    test('responde corto y sin precios', async ({ page }) => {
      test.skip(!preguntar, 'Solo con BASE=https://creativewhisper.net y CON_AGENTES=1');
      test.setTimeout(90_000);
      await page.addInitScript(() => { try { sessionStorage.setItem('cwa-cw', JSON.stringify({ hist: [], sesion: 'prueba-auto-' + Math.random().toString(36).slice(2, 8), voz: true })); } catch (e) {} });
      await page.goto(ruta, { waitUntil: 'load' }); await sinCookies(page);
      await page.locator(BOTON).first().click();
      const campo = page.locator('#cw-asistente textarea, .ae-p input, .ae-p textarea').first();
      const q = idioma === 'es' ? '¿Qué hacen, en una frase?' : 'What do you do, in one sentence?';
      await campo.fill(q); await campo.press('Enter');
      const burbujas = page.locator('#cw-asistente .msgs .b.bot, .ae-m div');
      let resp = '';
      await expect.poll(async () => { const t = await burbujas.allInnerTexts(); resp = t[t.length - 1] || ''; return t.length >= 2 && resp !== q && resp.length > 20 && !/^[.…\s]*$/.test(resp); }, { timeout: 60_000 }).toBe(true);
      await page.waitForTimeout(2500); resp = (await burbujas.allInnerTexts()).pop();
      expect(resp, 'el agente no pudo responder').not.toMatch(/No pude responder|could not answer/i);
      expect(resp, 'el agente no da precios').not.toMatch(/(US)?\$\s?\d/);
      expect(resp.length, 'respuesta corta').toBeLessThan(520);
    });
  });
}
