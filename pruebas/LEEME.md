# Pruebas automáticas de creativewhisper.net

Recorren la web como una persona (Playwright, Chromium) en computadora y en celular, en español y en inglés.
No envían formularios, no aceptan nada real y no usan claves.

## Qué revisan

| Archivo | Qué comprueba |
|---|---|
| `web.spec.mjs` | Cada página abre, está en su idioma, no deja errores en la consola, no se desborda, sus imágenes cargan y tienen `alt`, sus enlaces internos y anclas existen, accesibilidad básica (axe), contraste en las páginas del producto, redirecciones, sitemap y robots. También que no se vea el nombre anterior del servicio. |
| `cookies.spec.mjs` | El aviso de cookies aparece, el píxel de Meta no se pide antes del permiso, «Rechazar» se respeta y «Aceptar» lo carga. Las páginas del cliente no cargan el píxel. |
| `idioma.spec.mjs` | El botón ES/EN lleva a la página equivalente y no rebota. En cuenta, panel, alta y API no quedan textos en español en la versión en inglés. |
| `dw.spec.mjs` | Digital Whisper: las 5 mascotas se dibujan y se mueven, el formulario avisa lo que falta sin enviar nada, y la página no tiene precios ni nombres de proveedores. |
| `cliente.spec.mjs` | Cuenta, panel y alta sin haber entrado: dicen qué hacer, tienen ayuda y no dejan errores. |
| `privacidad-cuenta.spec.mjs` | Fase 11.6b: `/privacidad/{cuenta}` (la política de cada empresa, que en GitHub Pages pasa por `404.html`) se pinta como texto sin HTML de afuera, con el aviso de borrador legal, las versiones y el inglés. La respuesta de la base se simula en la prueba. |
| `agentes.spec.mjs` | Cada página interactiva tiene su agente y se abre. Con `CON_AGENTES=1` le hace una pregunta a cada tipo de agente (gasta respuestas de IA). |

## Cómo correrlas

```
cd pruebas
npm install
npx playwright install chromium     # solo la primera vez

npm test                 # prueba ESTA copia del repo (levanta un servidor local)
npm run vivo             # prueba lo publicado en creativewhisper.net
npm run agentes          # además pregunta a los agentes (solo contra lo publicado)
npx playwright test dw   # un solo archivo
npx playwright show-report informe   # ver el informe con capturas de lo que falló
```

En GitHub corren solas (Action «Pruebas de la web»): en cada PR, después de cada cambio en `main` y cada mañana.

## Lo que saben y dejan pasar (anotado en `claude/encargo-fable/resultado-fase-11-1.md`)

- `cotizacion-generica.html` tiene `<li>` fuera de lista: no se toca sin avisar.
- En las páginas oscuras con animación no se mide el contraste: depende del momento de la animación.
- Contra la copia local los agentes de la web principal no responden (el servidor solo acepta el dominio real): por eso la pregunta a los agentes es solo contra lo publicado.
