# ⚡ Inicio Rápido - Sincronización de Productos

## 🎯 Lo que se hizo

✅ Se creó un sistema de sincronización automática de productos:
- `products` (privada) → `products_public` (pública)
- El formulario de pedidos ahora lee de `products_public`
- Sin exponer información sensible (precios, costos, stock)

---

## 🚀 Pasos para Activar (15 minutos)

### 1️⃣ Instalar Firebase CLI

```bash
npm install -g firebase-tools
```

### 2️⃣ Iniciar sesión y configurar proyecto

```bash
firebase login
firebase use --add
```

Selecciona tu proyecto: `sistema-de-gestion-elcafehnos`

### 3️⃣ Instalar dependencias

```bash
cd functions
npm install
cd ..
```

### 4️⃣ Desplegar TODO

```bash
firebase deploy
```

Esto desplegará:
- ✅ Reglas de Firestore (con `products_public`)
- ✅ Cloud Functions (sincronización automática)

### 5️⃣ Sincronización inicial

**Opción A - Desde Firebase Console (Recomendado):**
1. Ve a: https://console.firebase.google.com/
2. Selecciona tu proyecto
3. Ve a **Functions** en el menú lateral
4. Busca `syncAllProductsToPublic`
5. Click en **⋮** (tres puntos) → **Test function**
6. Click en **Run test**

**Opción B - Crear script temporal:**
En la consola del navegador de Firebase Console → Firestore:
```javascript
// Copiar y pegar en la consola del navegador
fetch('https://us-central1-sistema-de-gestion-elcafehnos.cloudfunctions.net/syncAllProductsToPublic', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ data: {} })
})
.then(r => r.json())
.then(console.log);
```

### 6️⃣ Verificar

1. **Firestore Console:** Verifica que existe la colección `products_public`
2. **Formulario público:** Abre `pedidos/index.html` y verifica que carguen los productos

---

## ✅ ¡Listo!

Ahora cada vez que edites un producto en `products`, se sincronizará automáticamente a `products_public`.

---

## 📚 Documentación Completa

Lee [PRODUCTS_SYNC_SETUP.md](PRODUCTS_SYNC_SETUP.md) para:
- Arquitectura detallada
- Solución de problemas
- Monitoreo y logs
- Configuración avanzada

---

## 🆘 Problemas Comunes

**Error: "Missing permissions"**
```bash
firebase deploy --only firestore:rules
```

**products_public vacía**

Ejecuta la sincronización inicial desde Firebase Console (ver paso 5️⃣)

**Ver logs de errores**
```bash
firebase functions:log
```
