// Cada página pública: abre, está en su idioma, no tiene errores, no se desborda en el celular, sus imágenes cargan,
// sus enlaces internos existen y sus anclas llevan a algo. También lo básico de accesibilidad.
import { test, expect } from '@playwright/test';
import { PUBLICAS, CLIENTE, REDIRECCIONES, loc } from './paginas.mjs';
import { visitar, sinCookies, bajarTodo, AXE } from './util.mjs';

for (const pg of [...PUBLICAS, ...CLIENTE]) {
  test.describe(`${pg.ruta} (${pg.idioma})`, () => {
    test.use({ locale: loc(pg.idioma) });

    test('abre bien, en su idioma y sin errores', async ({ page }) => {
      const { resp, fallos } = await visitar(page, pg.ruta);
      expect(resp.status()).toBe(200);
      await expect(page.locator('html')).toHaveAttribute('lang', new RegExp('^' + pg.idioma));
      expect((await page.title()).length).toBeGreaterThan(5);
      await expect(page.locator('h1:visible').first()).toBeVisible();
      await sinCookies(page); await bajarTodo(page);
      expect(fallos.reales, fallos.reales.join('\n')).toEqual([]);
      // nada se sale por los lados
      expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1);
      // imágenes: todas cargan y todas dicen qué son (o se marcan como adorno con alt vacío)
      const imgs = await page.evaluate(() => [...document.querySelectorAll('img')].filter((i) => i.getAttribute('src')).map((i) => ({ src: i.currentSrc || i.src, alt: i.getAttribute('alt'), ok: i.complete && i.naturalWidth > 0, lazy: i.loading === 'lazy', visto: i.getBoundingClientRect().width > 0 })));
      expect(imgs.filter((i) => i.alt === null).map((i) => i.src), 'imágenes sin alt').toEqual([]);
      expect(imgs.filter((i) => !i.ok && i.visto && !i.lazy).map((i) => i.src), 'imágenes rotas').toEqual([]);
      // el nombre anterior del servicio no se ve en ninguna parte
      expect(await page.evaluate(() => (document.body.innerText.match(/Susurro digital|Escucha digital(?! y tableros)/gi) || []).length), 'nombre anterior del servicio a la vista').toBe(0);
    });

    test('enlaces internos y anclas', async ({ page, request, baseURL }) => {
      await visitar(page, pg.ruta, { esperar: 800 });
      const origen = new URL(baseURL).origin;
      const enlaces = await page.evaluate(() => [...document.querySelectorAll('a[href]')].map((a) => ({ abs: a.href, crudo: a.getAttribute('href'), nueva: a.target === '_blank', rel: a.rel })));
      const internos = [...new Set(enlaces.map((e) => e.abs).filter((u) => u.startsWith(origen)).map((u) => u.split('#')[0]))];
      for (const u of internos) { const r = await request.head(u); expect(r.status(), u).toBe(200); }   // HEAD: no baja los videos
      // anclas de esta misma página
      const aqui = page.url().split('#')[0];
      const anclas = [...new Set(enlaces.map((e) => e.abs).filter((u) => u.startsWith(aqui + '#') && u.length > aqui.length + 1).map((u) => decodeURIComponent(u.split('#')[1])))].filter((a) => !a.startsWith('/'));
      const faltan = await page.evaluate((ids) => ids.filter((id) => !document.getElementById(id)), anclas);
      expect(faltan, 'anclas que no llevan a nada').toEqual([]);
      // lo que abre otra pestaña no le da control de esta a la otra página
      expect(enlaces.filter((e) => e.nueva && !/noopener|noreferrer/.test(e.rel)).map((e) => e.crudo), 'target=_blank sin rel=noopener').toEqual([]);
    });

    test('accesibilidad básica', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await visitar(page, pg.ruta, { esperar: 2500 });
      await sinCookies(page);
      // campos con rótulo
      const sinRotulo = await page.evaluate(() => [...document.querySelectorAll('input,select,textarea')].filter((c) => c.type !== 'hidden' && !(c.labels && c.labels.length) && !c.getAttribute('aria-label') && !c.getAttribute('aria-labelledby') && !c.closest('[aria-hidden=true]')).map((c) => c.id || c.name || c.type));
      expect(sinRotulo, 'campos sin rótulo').toEqual([]);
      await page.addScriptTag({ content: AXE });
      // El contraste se mide aparte (abajo): en las páginas con animación de entrada depende del momento.
      const v = await page.evaluate(async () => (await window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa'], rules: { 'color-contrast': { enabled: false } } })).violations.filter((x) => ['critical', 'serious'].includes(x.impact)).map((x) => `${x.id} (${x.nodes.length}): ${x.nodes[0].html.slice(0, 120)}`));
      // Conocido y anotado en el informe 11.1: la cotización genérica tiene <li> fuera de lista (no se toca sin avisar).
      const conocidos = pg.ruta === '/cotizacion-generica.html' ? /^listitem/ : null;
      expect(v.filter((x) => !(conocidos && conocidos.test(x))), v.join('\n')).toEqual([]);
    });
  });
}

// Contraste: en las páginas de fondo claro (producto y cliente) el texto tiene que leerse bien.
for (const pg of [...PUBLICAS.filter((p) => /digital|api/.test(p.ruta)), ...CLIENTE]) {
  test(`contraste · ${pg.ruta}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await visitar(page, pg.ruta, { esperar: 2500 }); await sinCookies(page);
    await page.addScriptTag({ content: AXE });
    const v = await page.evaluate(async () => (await window.axe.run(document, { runOnly: ['color-contrast'] })).violations.flatMap((x) => x.nodes.map((n) => n.html.slice(0, 120))));
    expect(v, v.join('\n')).toEqual([]);
  });
}

for (const [de, a] of REDIRECCIONES) {
  test(`${de} lleva a ${a}`, async ({ page }) => {
    await page.goto(de, { waitUntil: 'load' }); await page.waitForURL((u) => u.pathname === a, { timeout: 8000 });
    expect(new URL(page.url()).pathname).toBe(a);
  });
}

test('sitemap y robots', async ({ request }) => {
  const mapa = await (await request.get('/sitemap.xml')).text();
  const urls = [...mapa.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
  expect(urls.length).toBeGreaterThan(8);
  for (const u of urls) expect((await request.get(u)).status(), u).toBe(200);
  expect(await (await request.get('/robots.txt')).text()).toContain('Sitemap:');
});
