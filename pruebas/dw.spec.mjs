// La página de Digital Whisper: mascotas, formulario (sin enviarlo) y reglas de texto (sin precios ni «cómo se hace»).
import { test, expect } from '@playwright/test';
import { loc } from './paginas.mjs';
import { sinCookies } from './util.mjs';

for (const [ruta, idioma] of [['/susurro-digital/', 'es'], ['/digital-whisper/', 'en']]) {
  test.describe(`Digital Whisper · ${ruta}`, () => {
    test.use({ locale: loc(idioma) });

    test('las cinco mascotas se dibujan y se mueven', async ({ page }) => {
      await page.goto(ruta, { waitUntil: 'load' }); await sinCookies(page);
      await page.locator('#familia').scrollIntoViewIfNeeded(); await page.waitForTimeout(2000);
      const m = await page.evaluate(() => [...document.querySelectorAll('.cw-mascota')].map((e) => { const s = e.querySelector('svg'), b = e.getBoundingClientRect(); return { n: e.dataset.mascota, w: b.width, h: b.height, anim: s ? s.getAnimations({ subtree: true }).length : 0 }; }));
      expect(m.map((x) => x.n).sort()).toEqual(['ari', 'pia', 'ruby', 'teo', 'tiko']);
      for (const x of m) { expect(x.w, x.n).toBeGreaterThan(40); expect(x.anim, x.n + ' animada').toBeGreaterThan(0); }
    });

    test('el formulario avisa lo que falta y no envía nada incompleto', async ({ page }) => {
      const envios = []; page.on('request', (q) => { if (q.method() === 'POST' && /cuenta-cliente/.test(q.url()) && /"registro"/.test(q.postData() || '')) envios.push(q.url()); });
      await page.goto(ruta, { waitUntil: 'load' }); await sinCookies(page);
      const err = page.locator('#rError'), enviar = page.locator('#rEnviar');
      await enviar.click(); await expect(err).toBeVisible();
      await page.fill('#rNombre', 'Prueba'); await page.fill('#rNegocio', 'Prueba'); await enviar.click(); await expect(err).toContainText('WhatsApp');
      await page.fill('#rWhatsapp', '+12025550142'); await page.fill('#rCorreo', 'no-es-correo'); await enviar.click(); await expect(err).toContainText(idioma === 'es' ? 'correo' : 'email');
      await page.fill('#rCorreo', 'prueba@example.com'); await enviar.click(); await expect(err).toContainText(idioma === 'es' ? 'privacidad' : 'privacy');
      expect(envios, 'no se envía una solicitud incompleta').toEqual([]);
      for (const id of ['rNombre', 'rNegocio', 'rWhatsapp', 'rCorreo', 'rVertical']) expect(await page.locator('#' + id).evaluate((e) => !!(e.labels && e.labels.length)), id + ' con rótulo').toBe(true);
    });

    test('reglas de texto: sin precios, sin nombre anterior, con privacidad a la vista', async ({ page }) => {
      await page.goto(ruta, { waitUntil: 'load' });
      const t = await page.evaluate(() => { for (const d of document.querySelectorAll('details')) d.open = true; return document.querySelector('main').innerText + ' ' + document.querySelector('footer').innerText; });
      expect(t).not.toMatch(/(US)?\$\s?\d|\d+\s?(USD|dólares|dollars)/i);
      expect(t).not.toMatch(/Susurro digital|Escucha digital/i);
      expect(t).not.toMatch(/Claude|Anthropic|Supabase|Telnyx|ElevenLabs|prompt/i);
      await expect(page.locator('#solicitud a[href*="privacidad"], #solicitud a[href*="privacy"]')).toBeVisible();
      expect(await page.title()).toContain('Digital Whisper');
    });
  });
}
