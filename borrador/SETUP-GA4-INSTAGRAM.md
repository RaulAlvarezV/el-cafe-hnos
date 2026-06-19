# Setup GA4 + Instagram — El Café Hermanos

Guía de pasos. Las partes de cuentas (Google / Meta) las hace el cliente; RGS se encarga
del código y el deploy.

---

## 1) Google Analytics 4 (~10 min)

**Objetivo:** obtener el *Measurement ID* del sitio (formato `G-XXXXXXXXXX`).

**Lo hacés vos:**
1. Entrá a https://analytics.google.com con la cuenta de Google del negocio (idealmente
   `elcafehermanos@gmail.com`, así queda a nombre del negocio).
2. Si no tenés cuenta de Analytics, te va a pedir crear una **Cuenta** (nombre: "El Café Hermanos").
3. Crear **Propiedad**: Administrar (engranaje abajo a la izquierda) → **Crear → Propiedad**.
   - Nombre: `El Café Hermanos – Sitio web`
   - Zona horaria: (GMT-03:00) Argentina · Moneda: Peso argentino (ARS)
   - Siguiente → datos del negocio → **Crear**.
4. Crear **flujo de datos** (data stream) tipo **Web**:
   - URL del sitio: `https://el-cafe-hnos.vercel.app` (o el dominio final cuando lo tengas).
   - Nombre del flujo → **Crear flujo**.
5. Copiá el **ID de medición** (arriba a la derecha del flujo, `G-XXXXXXXXXX`).
6. **Pasámelo** → lo reemplazo en las 6 páginas (1 comando). Listo.

> No hace falta pegar ningún snippet: el sitio ya tiene el código de GA4 y el banner de
> consentimiento. Solo se cambia el ID. GA no trackea desde `localhost`.

---

## 2) Instagram (Graph API + Cloud Function)

**Objetivo:** que la grilla del sitio muestre tus últimas publicaciones reales, con el token
guardado solo en el servidor.

### Parte A — Tu cuenta (Meta)  [según doc vigente de Meta, jun 2026]
1. **Cuenta profesional**: @elcafehermanos en **Creator o Empresa**. ✅ (ya hecho)
2. **Crear app** en https://developers.facebook.com → *Mis apps → Crear app* → tipo
   **Empresa (Business)** (es requisito). Nombre: "El Café Hermanos Web".
3. **Agregar Instagram**: panel de la app → *Agregar producto → Instagram → Configurar* →
   menú izquierdo **Instagram → "Configuración de la API con el inicio de sesión de Instagram"**
   (*API setup with Instagram business login*).
4. **Conectar y generar token**: en esa pantalla conectás @elcafehermanos (login + autorizar)
   y hacés clic en **"Generar token"** al lado de la cuenta → copiás el **token de larga
   duración (~60 días)**.
   - Nota: para uso en el sitio público, Meta puede pedir **verificación del negocio / revisión
     de la app**. Si aparece, se resuelve en ese momento.
   - Docs: developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/get-started/

### Parte B — El sitio está en Hostinger (Premium): usamos PHP, no Firebase
El feed se sirve con un PHP en el propio Hostinger (mismo origen, sin CORS, sin Firebase, sin
plan Blaze). Archivos ya listos en `borrador/`: `instagram.php`, `ig-refresh.php`,
`secret-ig.example.php`.

5. **Guardar el token (seguro):** copiá `secret-ig.example.php` como `secret-ig.php`, pegá el
   token adentro y subilo **UNA carpeta ARRIBA de public_html** (así no es accesible por la web).
6. **Subir el proxy:** `instagram.php` va en la **raíz del sitio**, junto a `index.html` (dentro
   de public_html).
7. **Apuntar el sitio:** en `index.html`, dejar `IG_ENDPOINT = 'instagram.php'`.
8. **Renovación automática del token:** subí `ig-refresh.php` junto a `secret-ig.php` (arriba de
   public_html) y creá un **Cron Job** en el hPanel que corra `php /ruta/ig-refresh.php` una vez
   por mes (cada corrida extiende el token 60 días).

### Parte C — Lo hago yo (con tu OK)
- Los 3 PHP ya están listos. Cuando los subas, ajusto `IG_ENDPOINT` y verificamos que la grilla
  muestre las publicaciones reales. Si Meta cambió algún campo/endpoint, lo corrijo en `instagram.php`.

> Nota: `instagram-cloud-function.js` queda solo como alternativa por si algún día se mueve a
> Firebase; con Hostinger **no se usa**.

---

### Reglas de RGS
- No cargo credenciales ni tokens por vos: esas partes las hacés en tus cuentas.
- No deployo a producción sin tu aprobación explícita.
