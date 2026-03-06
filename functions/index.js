/**
 * Cloud Functions para El Café Hermanos
 * 
 * Funciones:
 * - syncProductToPublic: Sincroniza automáticamente la colección 'productos' (privada)
 *   a 'products_public' (pública) cada vez que hay cambios.
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Inicializar Firebase Admin
admin.initializeApp();
const db = admin.firestore();

/**
 * Sincronizar productos a colección pública
 * 
 * Se dispara cuando:
 * - Se crea un producto
 * - Se actualiza un producto
 * - Se elimina un producto
 * 
 * Copia solo los campos necesarios para el formulario público:
 * - nombre
 * - codigo
 * - categoria (opcional)
 * - descripcion (opcional)
 */
exports.syncProductToPublic = functions.firestore
  .document('productos/{productId}')
  .onWrite(async (change, context) => {
    const productId = context.params.productId;
    
    try {
      // Si el documento fue eliminado
      if (!change.after.exists) {
        console.log(`Producto ${productId} eliminado, eliminando de products_public`);
        await db.collection('products_public').doc(productId).delete();
        return null;
      }
      
      const productData = change.after.data();
      
      // Datos públicos a copiar (solo lo necesario para el formulario)
      const publicData = {
        nombre: productData.nombre || 'Sin nombre',
        codigo: productData.codigo || '',
        categoria: productData.categoria || '',
        descripcion: productData.descripcion || '',
        // NO copiar: precios, costos, stock, proveedores, etc.
        updatedAt: new Date().toISOString()
      };
      
      // Copiar a colección pública
      await db.collection('products_public').doc(productId).set(publicData, { merge: true });
      
      console.log(`Producto ${productId} sincronizado a products_public`);
      return null;
      
    } catch (error) {
      console.error(`Error al sincronizar producto ${productId}:`, error);
      throw error;
    }
  });

/**
 * OPCIONAL: Función para sincronización inicial masiva
 * 
 * Ejecutar manualmente una vez para copiar todos los productos existentes
 */
exports.syncAllProductsToPublic = functions.https.onCall(async (data, context) => {
  try {
    // Intentar primero 'products', luego 'productos' como fallback
    let productsSnapshot = await db.collection('products').get();
    let sourceCollection = 'products';
    
    if (productsSnapshot.empty) {
      console.log('Colección "products" vacía, intentando con "productos"');
      productsSnapshot = await db.collection('productos').get();
      sourceCollection = 'productos';
    }
    
    if (productsSnapshot.empty) {
      return { 
        success: false, 
        count: 0, 
        message: 'No se encontraron productos en ninguna colección (products o productos)' 
      };
    }
    const batch = db.batch();
    
    let count = 0;
    productsSnapshot.forEach((doc) => {
      const productData = doc.data();
      const publicRef = db.collection('products_public').doc(doc.id);
      
      const publicData = {
        nombre: productData.nombre || 'Sin nombre',
        codigo: productData.codigo || '',
        categoria: productData.categoria || '',
        descripcion: productData.descripcion || '',
        updatedAt: new Date().toISOString()
      };
      
      batch.set(publicRef, publicData);
      count++;
    });
    
    await batch.commit();
    
    console.log(`${count} productos sincronizados desde ${sourceCollection} a products_public`);
    return { 
      success: true, 
      count, 
      sourceCollection,
      message: `${count} productos sincronizados desde ${sourceCollection} a products_public` 
    };
    
  } catch (error) {
    console.error('Error en sincronización masiva:', error);
    throw error;
  }
});
