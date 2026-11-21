// Pruebas de creativewhisper.net. Sin BASE se sirve esta copia del repo en local (lo que va a publicarse);
// con BASE=https://creativewhisper.net se prueba lo que está publicado.
import { defineConfig } from '@playwright/test';
const BASE = process.env.BASE || 'http://127.0.0.1:4173';
export default defineConfig({
  testDir: '.',
  outputDir: 'resultados',
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  workers: 4,
  reporter: [['list'], ['html', { outputFolder: 'informe', open: 'never' }]],
  use: { baseURL: BASE, screenshot: 'only-on-failure', trace: 'retain-on-failure' },
  webServer: process.env.BASE ? undefined : { command: 'python3 -m http.server 4173 --bind 127.0.0.1 --directory ..', url: 'http://127.0.0.1:4173/robots.txt', reuseExistingServer: true },
  projects: [
    { name: 'pc', use: { browserName: 'chromium', viewport: { width: 1366, height: 800 } } },
    { name: 'cel', use: { browserName: 'chromium', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } },
  ],
});
