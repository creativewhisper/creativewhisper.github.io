import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
export const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

// Abre una página y anota lo que falla mientras carga: errores de consola, errores de la página y pedidos rotos.
export async function visitar(page, ruta, { esperar = 1500 } = {}) {
  const fallos = [];
  page.on('console', (m) => { if (m.type() === 'error') fallos.push('consola: ' + m.text().slice(0, 200)); });
  page.on('pageerror', (e) => fallos.push('página: ' + String(e).slice(0, 200)));
  page.on('response', (r) => { if (r.status() >= 400) fallos.push(`${r.status()} ${r.url().slice(0, 160)}`); });
  page.on('requestfailed', (q) => { const u = q.url(); if (!/\.(mp4|webm)(\?|$)/.test(u) && !/facebook|fbevents/.test(u)) fallos.push('no cargó: ' + u.slice(0, 160) + ' ' + (q.failure()?.errorText || '')); });
  const resp = await page.goto(ruta, { waitUntil: 'load' });
  // En la copia local el asistente de la web principal no responde (el servidor solo acepta el dominio real): no es un fallo.
  const local = !/creativewhisper\.net/.test(process.env.BASE || '');
  const limpio = () => fallos.filter((f) => !(local && (/asistente-web/.test(f) || /status of 403/.test(f))));
  Object.defineProperty(fallos, 'reales', { get: limpio });
  await page.waitForTimeout(esperar);
  return { resp, fallos };
}
export const sinCookies = async (page) => { await page.locator('.cw-ck .no').click({ timeout: 2500 }).catch(() => {}); };
export async function bajarTodo(page) {
  const alto = await page.evaluate(() => document.documentElement.scrollHeight);
  const paso = page.viewportSize().height * 0.9;
  for (let y = 0; y < Math.min(alto, 30000); y += paso) { await page.mouse.wheel(0, paso); await page.waitForTimeout(80); }
  await page.waitForTimeout(600);
}
// Pedidos a Meta (píxel): no puede haber ninguno antes del permiso.
export function vigilarMeta(context) { const vistos = []; context.on('request', (q) => { if (/facebook\.(com|net)|fbevents|fbcdn/.test(q.url())) vistos.push(q.url().slice(0, 100)); }); return vistos; }
