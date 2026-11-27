// Fase 11.5b · Segundo factor (TOTP) en la oficina y las páginas de admin (assets/mfa.js).
// Supabase Auth se simula en la prueba: no se entra a ninguna cuenta real ni se crea ningún factor de verdad.
import { test, expect } from '@playwright/test';

const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
const jwt = (aal) => `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ sub: 'u-prueba', role: 'authenticated', aud: 'authenticated', email: 'admin@ejemplo.invalid', aal, session_id: 's1', exp: Math.floor(Date.now() / 1000) + 3600 })}.c2lnbmF0dXJh`;
const FACTOR = { id: 'f-1', factor_type: 'totp', status: 'verified', friendly_name: 'Oficina CW', created_at: '2026-11-27T12:00:00Z', updated_at: '2026-11-27T12:00:00Z' };
const usuario = (factores) => ({ id: 'u-prueba', aud: 'authenticated', role: 'authenticated', email: 'admin@ejemplo.invalid', factors: factores, app_metadata: {}, user_metadata: {}, created_at: '2026-01-01T00:00:00Z' });
const sesion = (aal, factores) => ({ access_token: jwt(aal), refresh_token: 'r-' + aal, token_type: 'bearer', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, user: usuario(factores) });

async function preparar(page, { factores, clave = 'cw-oficina-movil' }) {
  const visto = { esAdmin: [], logout: 0, verificados: [], inscritos: 0 };
  await page.addInitScript(([k, s]) => { try { localStorage.setItem(k, s); } catch (e) { /* nada */ } }, [clave, JSON.stringify(sesion('aal1', factores))]);
  await page.route('**/auth/v1/user', (r) => r.fulfill({ json: usuario(factores) }));
  await page.route('**/auth/v1/token?grant_type=refresh_token', (r) => r.fulfill({ json: sesion('aal1', factores) }));
  await page.route('**/auth/v1/logout**', (r) => { visto.logout++; r.fulfill({ status: 204, body: '' }); });
  await page.route(/\/auth\/v1\/factors$/, (r) => {
    visto.inscritos++;
    r.fulfill({ json: { id: 'f-nuevo', type: 'totp', friendly_name: 'Oficina CW', totp: { qr_code: 'data:image/svg+xml;utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"></svg>', secret: 'JBSWY3DPEHPK3PXP', uri: 'otpauth://totp/x' } } });
  });
  await page.route(/\/auth\/v1\/factors\/[^/]+$/, (r) => r.fulfill({ json: { id: 'x' } }));
  await page.route(/\/auth\/v1\/factors\/[^/]+\/challenge$/, (r) => r.fulfill({ json: { id: 'ch-1', type: 'totp', expires_at: Math.floor(Date.now() / 1000) + 300 } }));
  await page.route(/\/auth\/v1\/factors\/([^/]+)\/verify$/, (r) => {
    const cuerpo = JSON.parse(r.request().postData() || '{}');
    visto.verificados.push(cuerpo.code);
    if (cuerpo.code !== '123456') return r.fulfill({ status: 422, json: { code: 'mfa_verification_failed', msg: 'Invalid TOTP code entered' } });
    r.fulfill({ json: sesion('aal2', [FACTOR]) });
  });
  await page.route('**/rest/v1/rpc/es_admin', (r) => {
    const tok = (r.request().headers()['authorization'] || '').split('.')[1] || '';
    let aal = ''; try { aal = JSON.parse(Buffer.from(tok, 'base64url').toString()).aal; } catch (e) { /* nada */ }
    visto.esAdmin.push(aal);
    // Igual que la base desde la 037: con factor verificado, solo aal2 es admin.
    r.fulfill({ json: factores.some((f) => f.status === 'verified') ? aal === 'aal2' : true });
  });
  await page.route('**/functions/v1/**', (r) => r.fulfill({ json: {} }));
  await page.route(/\/rest\/v1\/(?!rpc\/)/, (r) => r.fulfill({ json: [] })); // vistas y tablas: vacías (nunca la base real)
  return visto;
}

test('oficina sin segundo factor: entra como antes, sin pedir código', async ({ page }) => {
  const visto = await preparar(page, { factores: [] });
  await page.goto('/oficina/');
  await expect(page.locator('#vApp')).toBeVisible();
  await expect(page.locator('.cw-mfa')).toHaveCount(0);
  expect(visto.esAdmin).toEqual(['aal1']);
});

test('oficina con segundo factor: pide el código, rechaza uno malo y entra con el bueno (aal2)', async ({ page }) => {
  const visto = await preparar(page, { factores: [FACTOR] });
  await page.goto('/oficina/');
  const d = page.locator('.cw-mfa');
  await expect(d).toBeVisible();
  await expect(page.locator('#vApp')).toBeHidden();
  expect(visto.esAdmin).toEqual([]); // no se pide nada de admin antes del código
  await d.locator('input').fill('000000');
  await d.locator('[type=submit]').click();
  await expect(d.locator('[data-aviso]')).toContainText('no sirvió');
  await d.locator('input').fill('123456');
  await d.locator('[type=submit]').click();
  await expect(d).toHaveCount(0);
  await expect(page.locator('#vApp')).toBeVisible();
  expect(visto.verificados).toEqual(['000000', '123456']);
  expect(visto.esAdmin).toEqual(['aal2']);
});

test('oficina con segundo factor: «Salir» cierra la sesión y vuelve al inicio', async ({ page }) => {
  const visto = await preparar(page, { factores: [FACTOR] });
  await page.goto('/oficina/');
  await page.locator('.cw-mfa [data-salir]').click();
  await expect(page.locator('#vLogin')).toBeVisible();
  await expect(page.locator('#vApp')).toBeHidden();
  expect(visto.logout).toBe(1);
  expect(visto.esAdmin).toEqual([]);
});

test('activar el segundo factor: muestra el QR y la clave, y confirma con el código', async ({ page }) => {
  const visto = await preparar(page, { factores: [] });
  await page.goto('/oficina/');
  await expect(page.locator('#vApp')).toBeVisible();
  await page.evaluate(() => { const el = document.createElement('div'); el.id = 'mfaPrueba'; document.body.appendChild(el); return cwMfa.panel(sb, el); });
  const p = page.locator('#mfaPrueba');
  await expect(p).toContainText('Sin segundo factor');
  await p.locator('[data-mfa-activar]').click();
  await expect(p.locator('img[data-mfa-qr]')).toHaveAttribute('src', /^data:image\/svg\+xml/);
  await expect(p.locator('[data-mfa-secreto]')).toHaveText('JBSWY3DPEHPK3PXP');
  await p.locator('[data-mfa-codigo]').fill('123456');
  await p.locator('[data-mfa-confirmar]').click();
  await expect(p).toContainText('Listo');
  expect(visto.inscritos).toBe(1);
});

for (const [ruta, clave, visible] of [['/oficina/modelo/', 'cw-oficina-movil', '#vApp'], ['/finanzas/', 'cw-finanzas-movil', '#vApp']]) {
  test(`${ruta} con segundo factor pide el código antes de abrir`, async ({ page }) => {
    await preparar(page, { factores: [FACTOR], clave });
    await page.goto(ruta);
    await expect(page.locator('.cw-mfa')).toBeVisible();
    await expect(page.locator(visible)).toBeHidden();
    await page.locator('.cw-mfa input').fill('123456');
    await page.locator('.cw-mfa [type=submit]').click();
    await expect(page.locator('.cw-mfa')).toHaveCount(0);
    await expect(page.locator(visible)).toBeVisible();
  });
}

test('admin.html con segundo factor pide el código antes de mostrar el panel', async ({ page }) => {
  // admin.html usa la clave de sesión por defecto de supabase-js: sb-<proyecto>-auth-token.
  await preparar(page, { factores: [FACTOR], clave: 'sb-jlyrymgbykhpktabvlkl-auth-token' });
  await page.goto('/admin.html');
  await expect(page.locator('.cw-mfa')).toBeVisible();
  await expect(page.locator('#vistaPanel')).toBeHidden();
  await page.locator('.cw-mfa input').fill('123456');
  await page.locator('.cw-mfa [type=submit]').click();
  await expect(page.locator('.cw-mfa')).toHaveCount(0);
  await expect(page.locator('#vistaPanel')).toBeVisible();
});
