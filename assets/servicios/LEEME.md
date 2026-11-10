# Servicios en video (cotizaciones)

Seis videos verticales de unos 25 s, en español e inglés (`cw-<nn>-<grupo>-<es|en>.mp4`, 720×1280) con su póster `.jpg`:

| nn | grupo | servicios que muestra |
|---|---|---|
| 01 | whatsapp | Automatización de WhatsApp |
| 02 | escucha | Análisis de conversaciones, análisis de datos y tableros |
| 03 | contenido | Contenido vertical, diseño para Instagram, Meta Ads, community manager con IA |
| 04 | web | Páginas web interactivas, sitios con pedido por WhatsApp, asistente en vivo |
| 05 | produccion | Video de marca, testimonios, corporativo B2B, cortometrajes, eventos, actores, doblaje |
| 06 | automotriz | Car edit y fotografía de producto |

## Para ponerlas en una cotización
```html
<div data-cw-servicios data-solo="whatsapp,escucha,contenido,automotriz"></div>
<script src="https://creativewhisper.github.io/assets/servicios/tarjetas.js" defer></script>
```
- `data-solo`: ids de servicio o grupos (sin el atributo salen los 19).
- `data-lang="en"` para la versión en inglés (por defecto, el idioma de la página).
- `data-titulo="no"` si la sección ya tiene su propio título, o un título propio; `data-tema="claro"` para fondos claros.
- Los videos no van dentro del archivo cifrado: se cargan desde esta carpeta solo cuando el cliente toca una tarjeta.

## Cómo se ven (v2, 9-nov-2026)
- Cada servicio es una tarjeta vertical tipo reel con un cuadro real de su parte del video (`th/<id>-<es|en>.webp`, 360×640). Los servicios mensuales llevan la etiqueta "Mensual" / "Monthly" sobre la imagen.
- Las tarjetas van en una fila que se desliza (flechas en computadora, dedo en celular).
- Al pasar el mouse, la tarjeta se mueve sin sonido desde ese mismo cuadro.
- Al tocarla, el video se abre grande sobre la página, con sonido, en el segundo del servicio, con una barra por capítulos arriba y la lista de capítulos al lado (en celular, botones abajo). Se cierra con la X, Esc o tocando afuera.
- El título de la sección toma la letra del último h1/h2 de la página antes de las tarjetas, para que se vea parte de cada cotización.
- El segundo de cada miniatura está en `TH` dentro de `tarjetas.js`. Si se cambia un video, hay que volver a sacar sus miniaturas y revisar esos segundos.
