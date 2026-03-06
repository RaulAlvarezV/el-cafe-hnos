# 🔐 Configuración de reCAPTCHA v3

## ¿Qué se implementó?

Se agregó **Google reCAPTCHA v3** al formulario de pedidos públicos para proteger contra spam y solicitudes automatizadas maliciosas.

## ⚙️ Pasos para configurar reCAPTCHA

### 1. Obtener las credenciales de reCAPTCHA

1. **Ir a Google reCAPTCHA Admin Console:**
   https://www.google.com/recaptcha/admin/create

2. **Crear un nuevo sitio:**
   - **Label:** El Café Hermanos - Formulario Pedidos
   - **reCAPTCHA type:** reCAPTCHA v3
   - **Domains:** Agregar tus dominios:
     ```
     localhost
     elcafehermanos.com
     www.elcafehermanos.com
     sistema-de-gestion-elcafehnos.web.app
     sistema-de-gestion-elcafehnos.firebaseapp.com
     ```
   - Aceptar términos de servicio
   - Click en **Submit**

3. **Copiar las credenciales:**
   Se generarán dos keys:
   - **Site Key** (pública) - Para usar en el frontend
   - **Secret Key** (secreta) - Para usar en Cloud Functions

### 2. Reemplazar la Site Key en el código

Abrir el archivo: `pedidos/index.html`

**Buscar estas 2 líneas y reemplazar con tu Site Key real:**

#### Línea ~12 (en el HEAD):
```html
<script src="https://www.google.com/recaptcha/api.js?render=TU_SITE_KEY_AQUI"></script>
```

Actualmente dice:
```html
<script src="https://www.google.com/recaptcha/api.js?render=6LfVxKEqAAAAAKZp_example_REPLACE_WITH_YOUR_SITE_KEY"></script>
```

#### Línea ~335 (en la función submitOrder):
```javascript
recaptchaToken = await grecaptcha.execute('TU_SITE_KEY_AQUI', {action: 'submit_order'});
```

Actualmente dice:
```javascript
recaptchaToken = await grecaptcha.execute('6LfVxKEqAAAAAKZp_example_REPLACE_WITH_YOUR_SITE_KEY', {action: 'submit_order'});
```

### 3. (OPCIONAL) Crear Cloud Function para validar el token

Para verificación del lado del servidor, crear una Cloud Function:

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');

exports.validateOrderRequest = functions.firestore
  .document('order_requests/{requestId}')
  .onCreate(async (snap, context) => {
    const data = snap.data();
    const recaptchaToken = data.recaptchaToken;
    
    if (!recaptchaToken) {
      console.warn('Solicitud sin token reCAPTCHA');
      return null;
    }
    
    try {
      // Verificar el token con Google
      const response = await axios.post(
        `https://www.google.com/recaptcha/api/siteverify`,
        null,
        {
          params: {
            secret: 'TU_SECRET_KEY_AQUI', // Usar variables de entorno en producción
            response: recaptchaToken
          }
        }
      );
      
      const { success, score, action } = response.data;
      
      // Actualizar el documento con la verificación
      await snap.ref.update({
        recaptchaVerified: success,
        recaptchaScore: score,
        recaptchaAction: action
      });
      
      // Si el score es bajo, marcar como posible spam
      if (score < 0.5) {
        await snap.ref.update({
          status: 'pending_review',
          flaggedAsSpam: true
        });
      }
      
      console.log(`reCAPTCHA verificado: ${success}, Score: ${score}`);
      
    } catch (error) {
      console.error('Error al verificar reCAPTCHA:', error);
    }
  });
```

## 📊 Verificación del score

reCAPTCHA v3 devuelve un score de 0.0 a 1.0:
- **1.0** = Muy probablemente humano legítimo
- **0.5** = Neutral (umbral recomendado)
- **0.0** = Muy probablemente bot

Puedes ver los scores en:
https://www.google.com/recaptcha/admin (selecciona tu sitio → Analytics)

## 🔍 Monitoreo

Revisa el **reCAPTCHA Admin Console** regularmente para:
- Ver intentos de solicitudes
- Analizar scores promedio
- Detectar patrones de ataque
- Ajustar umbral de score si es necesario

## ✅ Cambios realizados en el código

### 1. Corregida la consulta de productos
**ANTES:**
```javascript
const productsRef = collection(db, 'productos'); // Requiere autenticación ❌
```

**AHORA:**
```javascript
const productsRef = collection(db, 'products'); // Acceso público ✅
```

**Razón:** Las reglas de Firestore permiten lectura pública a `products` pero `productos` requiere autenticación.

### 2. Agregado reCAPTCHA v3
- Script de reCAPTCHA en el `<head>`
- Generación de token antes de enviar el formulario
- Token guardado en Firestore para validación posterior

### 3. Protección contra spam
El sistema ahora genera un token único por cada envío que puede ser validado en el backend.

## 🚨 Importante

**NO COMMITEAR** la Secret Key a Git. Usar variables de entorno:

```bash
# En Cloud Functions
firebase functions:config:set recaptcha.secret="TU_SECRET_KEY"
```

```javascript
// En tu función
const RECAPTCHA_SECRET = functions.config().recaptcha.secret;
```

## 📝 Notas adicionales

- reCAPTCHA v3 funciona en segundo plano (sin checkbox visible)
- No interrumpe la experiencia del usuario
- Si falla la carga de reCAPTCHA, el formulario sigue funcionando (pero sin protección)
- Puedes hacer **obligatorio** el token modificando la línea ~342

---

**¿Necesitas ayuda?** Consulta la documentación oficial:
https://developers.google.com/recaptcha/docs/v3
