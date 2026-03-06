# 🔄 Sincronización de Productos Públicos

## 📋 Resumen

Se implementó un sistema de sincronización automática que:

1. **Mantiene `products` como colección privada** (solo empleados)
2. **Crea `products_public` como colección pública** (acceso sin autenticación)
3. **Sincroniza automáticamente** cualquier cambio de `products` → `products_public`
4. **Expone solo datos necesarios** (nombre, código) sin precios ni información sensible

---

## 🏗️ Arquitectura de Seguridad

```
┌─────────────────────────────────────────┐
│         COLECCIÓN PRIVADA               │
│         'products'                      │
│  ✓ Requiere autenticación               │
│  ✓ Contiene TODA la información         │
│  ✓ Precios, costos, proveedores...      │
└──────────────┬──────────────────────────┘
               │
               │ Cloud Function
               │ (sincronización automática)
               │
               ▼
┌─────────────────────────────────────────┐
│         COLECCIÓN PÚBLICA               │
│         'products_public'               │
│  ✓ Acceso público (sin autenticación)   │
│  ✓ Solo datos básicos:                  │
│    - nombre                             │
│    - codigo                             │
│    - categoria                          │
│    - descripcion                        │
└─────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│    FORMULARIO PÚBLICO DE PEDIDOS        │
│    pedidos/index.html                   │
└─────────────────────────────────────────┘
```

---

## 📦 Archivos Creados

### 1. **Cloud Functions**
- `functions/package.json` - Dependencias de Node.js
- `functions/index.js` - Lógica de sincronización
- `functions/.gitignore` - Archivos a ignorar

### 2. **Reglas de Firestore**
- `firestore.rules` - Reglas actualizadas con `products_public`

### 3. **Formulario actualizado**
- `pedidos/index.html` - Ahora lee de `products_public`

---

## ⚙️ Instalación y Despliegue

### **Paso 1: Instalar Firebase CLI** (si no está instalado)

```bash
npm install -g firebase-tools
```

Verificar instalación:
```bash
firebase --version
```

### **Paso 2: Inicializar Firebase en el proyecto**

```bash
# En la raíz del proyecto
firebase login
firebase init
```

Cuando pregunte qué servicios usar, selecciona:
- ☑ Firestore
- ☑ Functions
- ☑ Hosting (opcional)

Configuración sugerida:
- **Firestore rules file:** `firestore.rules` (ya existe)
- **Functions language:** JavaScript
- **ESLint:** Yes (recomendado)
- **Install dependencies:** Yes

### **Paso 3: Instalar dependencias de Functions**

```bash
cd functions
npm install
cd ..
```

### **Paso 4: Desplegar Reglas de Firestore**

```bash
firebase deploy --only firestore:rules
```

✅ Esto publicará las reglas que permiten lectura pública de `products_public`

### **Paso 5: Desplegar Cloud Functions**

```bash
firebase deploy --only functions
```

Esto desplegará:
- ✅ `syncProductToPublic` - Sincronización automática
- ✅ `syncAllProductsToPublic` - Sincronización inicial masiva

### **Paso 6: Sincronización Inicial (IMPORTANTE)**

Una vez desplegadas las funciones, ejecuta la sincronización inicial:

#### **Opción A: Desde Firebase Console (Recomendado)**

1. Ve a: https://console.firebase.google.com/
2. Selecciona tu proyecto
3. Ve a **Functions**
4. Busca `syncAllProductsToPublic`
5. Click en **⋮** (tres puntos) → **Test function** → **Run test**

#### **Opción B: Mediante HTTP Request**

Una vez desplegada, puedes invocar la función mediante:

```bash
# Reemplaza con tu región y proyecto
curl -X POST https://us-central1-sistema-de-gestion-elcafehnos.cloudfunctions.net/syncAllProductsToPublic \
  -H "Content-Type: application/json" \
  -d '{"data":{}}'
```

O desde la consola del navegador en Firebase Console:

```javascript
fetch('https://us-central1-sistema-de-gestion-elcafehnos.cloudfunctions.net/syncAllProductsToPublic', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ data: {} })
})
.then(r => r.json())
.then(console.log);
```

---

## 🔍 Verificación

### 1. **Verificar que la colección `products_public` existe**

En Firebase Console:
- Firestore Database → Datos
- Deberías ver la colección `products_public` con todos los productos

### 2. **Probar el formulario público**

Abre: `https://tu-dominio.com/pedidos/`

- ✅ Los productos deberían cargar sin errores
- ✅ No se requiere autenticación
- ✅ Aparecen todos los productos

### 3. **Verificar sincronización automática**

1. En tu panel de administración interno, edita un producto
2. Ve a Firestore Console → `products_public`
3. El producto debería actualizarse automáticamente

---

## 🎯 Cómo Funciona la Sincronización

### **Trigger automático**

La Cloud Function se ejecuta automáticamente cuando:

- ✅ Se **crea** un producto → Lo copia a `products_public`
- ✅ Se **actualiza** un producto → Actualiza en `products_public`
- ✅ Se **elimina** un producto → Lo elimina de `products_public`

### **Datos copiados**

Solo se copian campos públicos:

```javascript
{
  nombre: "Café Gran Selecto 1kg",
  codigo: "CF-001",
  categoria: "Café en grano",
  descripcion: "Blend premium de arábica",
  updatedAt: "2026-03-06T15:30:00.000Z"
}
```

### **Datos NO copiados (protegidos)**

- ❌ Precio
- ❌ Costo
- ❌ Stock
- ❌ Proveedor
- ❌ Margen de ganancia
- ❌ Cualquier información sensible

---

## 📊 Monitoreo

### **Ver logs de las funciones**

```bash
firebase functions:log
```

O en Firebase Console → Functions → Logs

### **Estadísticas**

Firebase Console → Functions → Detalles de cada función:
- Invocaciones
- Tiempo de ejecución
- Errores

---

## 🛡️ Seguridad Mejorada

### **Antes (INSEGURO)**
```javascript
match /products/{docId} {
  allow read: if true;  // ❌ Expone TODA la información
}
```

### **Ahora (SEGURO)**
```javascript
match /products/{docId} {
  allow read: if isLoggedIn();  // ✅ Solo empleados autenticados
}

match /products_public/{docId} {
  allow read: if true;   // ✅ Público pero con datos limitados
  allow write: if false; // ✅ Solo Cloud Functions pueden escribir
}
```

---

## 💰 Costos

### **Firebase Functions - Nivel Gratuito (Spark Plan)**
- 125K invocaciones/mes
- 40K GB-segundos/mes

### **Con tu volumen de productos:**
- Sincronización inicial: 1 invocación
- Por cada cambio de producto: 1 invocación
- Estimado: **< 100 invocaciones/mes** (muy por debajo del límite)

**Costo estimado: $0** (dentro del nivel gratuito)

---

## 🚨 Solución de Problemas

### **Error: "Missing or insufficient permissions"**

**Causa:** Las reglas no están desplegadas

**Solución:**
```bash
firebase deploy --only firestore:rules
```

### **Error: "products_public no existe"**

**Causa:** No se ejecutó la sincronización inicial

**Solución:** Ejecutar `syncAllProductsToPublic` (ver Paso 6)

### **Los productos no se sincronizan automáticamente**

**Verificar:**
1. Las Cloud Functions están desplegadas: `firebase functions:list`
2. Ver logs de errores: `firebase functions:log --only syncProductToPublic`

### **Error al desplegar Functions**

**Si aparece error de Node.js:**
```bash
cd functions
rm -rf node_modules package-lock.json
npm install
cd ..
firebase deploy --only functions
```

---

## 📝 Comandos Útiles

```bash
# Ver estado de despliegue
firebase deploy --only firestore:rules,functions

# Ver funciones desplegadas
firebase functions:list

# Ver logs en tiempo real
firebase functions:log --only syncProductToPublic

# Eliminar una función
firebase functions:delete syncAllProductsToPublic

# Probar funciones localmente
firebase emulators:start --only functions,firestore
```

---

## ✅ Checklist de Implementación

- [ ] Instalar Firebase CLI
- [ ] Ejecutar `firebase init`
- [ ] Instalar dependencias: `cd functions && npm install`
- [ ] Desplegar reglas: `firebase deploy --only firestore:rules`
- [ ] Desplegar funciones: `firebase deploy --only functions`
- [ ] Ejecutar sincronización inicial: `syncAllProductsToPublic`
- [ ] Verificar `products_public` en Firestore
- [ ] Probar formulario público: cargan los productos
- [ ] Probar sincronización: editar producto y verificar cambio

---

## 🎓 Próximos Pasos (Opcional)

1. **Agregar validación de reCAPTCHA en Cloud Functions**
2. **Rate limiting para el formulario público**
3. **Notificaciones por email cuando llegan pedidos**
4. **Dashboard de métricas de solicitudes**

---

## 📞 Soporte

Si encuentras problemas:
1. Verifica los logs: `firebase functions:log`
2. Revisa la consola de Firebase
3. Verifica que las reglas estén publicadas
4. Asegúrate que `products_public` existe en Firestore

---

**¡Listo!** Ahora tienes un sistema seguro de productos públicos que se sincroniza automáticamente sin exponer información sensible. 🎉
