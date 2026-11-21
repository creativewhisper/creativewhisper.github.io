// Las páginas del cliente sin haber entrado: dicen qué hacer, no piden nada al servidor que falle y tienen ayuda.
import { test, expect } from '@playwright/test';
import { visitar } from './util.mjs';

for (const lang of ['es', 'en']) {
  test(`cuenta sin entrar (${lang}): pide el correo y ofrece ayuda`, async ({ page }) => {
    const { fallos } = await visitar(page, `/cuenta/?lang=${lang}`, { esperar: 2500 });
    await expect(page.locator('#vEntrar')).toBeVisible();
    await expect(page.locator('#fCorreo input[type=email]')).toBeVisible();
    await expect(page.locator('.ae-b'), 'agente en la pantalla de entrada').toBeVisible();
    expect(await page.title()).toContain(lang === 'es' ? 'Mi cuenta' : 'My account');
    expect(fallos, fallos.join('\n')).toEqual([]);
  });
  test(`panel sin entrar (${lang}): invita a entrar, sin errores`, async ({ page }) => {
    const { fallos } = await visitar(page, `/panel/?lang=${lang}`, { esperar: 2500 });
    const entrar = page.locator('#app a.btn.pri');
    await expect(entrar).toBeVisible(); await expect(entrar).toHaveAttribute('href', '../cuenta/?volver=panel');
    await expect(page.locator('.ae-b')).toBeVisible();
    expect(fallos, fallos.join('\n')).toEqual([]);
  });
  test(`alta sin enlace (${lang}): explica y lleva a la cuenta`, async ({ page }) => {
    const { fallos } = await visitar(page, `/alta/?lang=${lang}`, { esperar: 2000 });
    await expect(page.locator('#vError')).toBeVisible();
    await expect(page.locator('#vError a[href="../cuenta/"]')).toBeVisible();
    expect(await page.title()).toContain('Digital Whisper');
    expect(fallos, fallos.join('\n')).toEqual([]);
  });
}

test('un correo sin cuenta no revela nada y no rompe la página', async ({ page }) => {
  await visitar(page, '/cuenta/?lang=es', { esperar: 1500 });
  await page.fill('#fCorreo input[type=email]', 'no-es-un-correo'); await page.locator('#fCorreo button[type=submit]').click();
  await expect(page.locator('#vEntrar')).toBeVisible();
});
