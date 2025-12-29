# 🔒 Seguridad de Credenciales de Firebase

## ⚠️ IMPORTANTE - Configuración de Firebase

Este proyecto utiliza Firebase y requiere credenciales de API que **NO deben ser commiteadas a Git**.

### Configuración Inicial

1. **Copia el archivo de ejemplo:**
   ```bash
   cp js/firebase-config.example.js js/firebase-config.js
   ```

2. **Edita el archivo `js/firebase-config.js`** con tus credenciales reales de Firebase Console.

3. **NUNCA commitees** el archivo `js/firebase-config.js` (ya está en `.gitignore`).

### Estructura de Archivos

- ✅ `js/firebase-config.example.js` - Archivo de plantilla (SÍ se commitea)
- ❌ `js/firebase-config.js` - Credenciales reales (NO se commitea)

### Acciones Requeridas Tras Exposición de Credenciales

Si tus credenciales fueron expuestas públicamente:

1. **Regenera la clave de API inmediatamente:**
   - Ve a [Google Cloud Console](https://console.cloud.google.com/)
   - Navega a "APIs y servicios" → "Credenciales"
   - Encuentra la clave expuesta y haz clic en "Volver a generar clave"

2. **Agrega restricciones a tu clave de API:**
   - Ve a Firebase Console → Configuración del proyecto
   - En "Restricciones de aplicaciones", selecciona "Referencias HTTP (sitios web)"
   - Agrega solo tus dominios autorizados (ej: `tu-dominio.com`, `localhost`)
   - En "Restricciones de API", limita a las APIs que necesitas (Firestore, etc.)

3. **Elimina la clave del historial de Git:**
   ```bash
   # IMPORTANTE: Esto reescribe el historial de Git
   git filter-branch --force --index-filter \
   "git rm --cached --ignore-unmatch pedidos.html" \
   --prune-empty --tag-name-filter cat -- --all
   
   # Fuerza el push
   git push origin --force --all
   ```

4. **Actualiza el archivo local** con las nuevas credenciales en `js/firebase-config.js`.

### Seguridad Adicional

Para mayor seguridad en producción, considera:
- Usar Firebase App Check
- Implementar Cloud Functions para operaciones sensibles
- Configurar reglas de seguridad estrictas en Firestore
- Limitar el uso de API por día/hora en Firebase Console

### Soporte

Si necesitas ayuda con la configuración de seguridad, consulta:
- [Documentación de Firebase Security](https://firebase.google.com/docs/projects/api-keys)
- [Google Cloud Security Best Practices](https://cloud.google.com/security/best-practices)
