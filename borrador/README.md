# Borrador — Rediseño El Café Hermanos

Prototipo navegable del rediseño del sitio. **No es producción**: vive en `borrador/` y no
modifica ninguna página del sitio en vivo. Es para revisar la dirección de diseño antes de
bajar los cambios a las páginas reales.

## Cómo verlo
Servir el repo (para que resuelvan las rutas `../assets`) y entrar a `/borrador/`:

```
python -m http.server 5500
# luego abrir: http://localhost:5500/borrador/index.html
```

> Tip: si ves una versión vieja, hacé **Ctrl+F5** (el server local cachea).

## Páginas (todas navegables entre sí)
- `index.html` — Home.
- `servicios.html` — Hub de servicios: cómo trabajamos (alquiler/comodato/venta + servicio
  técnico/mantenimiento/capacitación/acompañamiento + redes), Capacitación, Asesoramiento y
  "Comercios que confían" (antes en venta). Reemplaza a venta/capacitación/asesoramiento.
- `productos.html` — Catálogo con filtro por categoría (40 productos, 9 categorías).
- `cafeteras.html` — Cafeteras y molinos.
- `contacto.html` — Formulario (EmailJS) + canales de contacto.
- `terminos.html` — Términos y Condiciones (borrador, con campos `[COMPLETAR]`).

## Qué incluye
- Hero con animación, **navbar con chips difuminados** (header separado del hero por borde dorado).
- **Carrusel de productos** (Swiper) en la home.
- Catálogo de productos con **filtro por categoría** y tarjetas uniformes (encuadre parejo = boceto de "igualar imágenes").
- **Instagram** que hace `fetch` de 4–5 publicaciones desde `instagram-feed.json` (mismo shape que la Graph API).
- Banda de **slogan** + acentos **verde/terracota** del brand kit.
- Banda de **comunidad de WhatsApp** + **botón flotante** (Chat directo / Comunidad) en todas las páginas.
- **Banner de cookies (Aceptar/Rechazar) + Google Analytics 4** gateado por consentimiento (no trackea desde `localhost`).
- Footer con crédito **RGS · Rebel Grid Systems** y link a Términos.
- **Pedidos oculto**: no aparece en el menú (la página sigue existiendo, solo deslinkeada).

## Identidad (del brand kit de Canva "El café Hermanos Kit")
- Tipografía: **STIX Two Text** (títulos) + **Montserrat** (cuerpo) + **Great Vibes** (acento).
- Paleta (5 colores): marrón `#683015` · verde `#177e3e` · dorado `#ffc54c` · crema `#f6f7d4` · terracota `#e0562b`.

## Pendientes / decisiones
- **Términos**: datos legales cargados (El Café Hnos S.R.L., CUIT 30-71479391-4, Suárez 97, Maipú). Conviene una revisión legal final antes de publicar.
- ✅ **GA4**: propiedad web `G-FHV9YVGX0M` configurada en las 6 páginas (gateada por el banner de cookies, no trackea en localhost). Empieza a medir cuando el sitio esté en producción.
- ✅ **Instagram real**: andando vía **PHP en Hostinger** (`instagram.php` lee el token de `secret-ig.php`, ubicado fuera de `public_html`). Probado: `elcafehermanos.com/instagram.php` devuelve los posts. Pendiente: **cron** de renovación del token (`ig-refresh.php`, mensual) y, al subir el rediseño, dejar `IG_ENDPOINT='instagram.php'`. El feed de ejemplo (`instagram-feed.json`) queda solo para el preview local sin PHP.
- ✅ **Imágenes en WebP**: convertidas (≈86% menos de peso, 12,9 MB → 1,7 MB). Se conservan los originales PNG/JPG para producción. El `og:image` se mantiene en PNG (mejores vistas previas en WhatsApp/Facebook).
- **reCAPTCHA real** para cuando se reactive Pedidos.
- **A producción** (con aprobación): bajar este diseño a las páginas reales, quitar/redirigir
  venta/capacitación/asesoramiento, y **componentizar** navbar/footer/CSS (la home aún tiene su CSS
  inline; las páginas internas ya usan el compartido `borrador.css`).

## Dependencias (por CDN)
Bootstrap Icons 1.11, Swiper 11 (solo home), EmailJS 4 (solo contacto), Google Fonts (STIX Two Text, Montserrat, Great Vibes).
