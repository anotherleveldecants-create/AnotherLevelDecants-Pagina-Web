# 📁 ESTRUCTURA DEL PROYECTO - GUÍA RÁPIDA

## 🎯 Para Agregar/Editar Productos: `data/perfumes.json`

```json
{
  "id": 1,                              // ID único
  "brand": "Marca",                     // Marca del perfume
  "name": "Nombre del producto",        // Nombre completo
  "price5": 9.99,                       // Precio 5ml
  "price10": 17.48,                     // Precio 10ml (auto)
  "gender": "masculino|unisex",         // Categoría
  "icon": "🌴",                         // Emoji
  "desc": "Descripción corta",          // Descripción
  "highlight": "Lo que destaca",        // Punto clave
  "inStock": true,                      // true=visible | false=oculto
  "stockLevel": "high|medium|low|out"   // Nivel indicativo
}
```

## 🎨 Para Editar Packs: `data/packs.json`

```json
{
  "id": "pack-noche",                   // ID único (prefijo: pack-)
  "tag": "★ Bestseller · Noche",        // Etiqueta
  "name": "Pack Noche Perfecta",        // Nombre del pack
  "desc": "Descripción del pack",       // Descripción
  "icon": "🌙",                         // Emoji
  "discount": 0.08,                     // Descuento (0.08 = 8%)
  "inStock": true,                      // true=visible | false=oculto
  "items": [
    { "perfId": 2, "size": 10 },        // Referencia a perfume por ID
    { "perfId": 5, "size": 10 }
  ]
}
```

## ⚙️ Para Cambiar Configuración: `src/config.js`

```javascript
export const CONFIG = {
  ITEMS_PER_PAGE: 6,                    // Productos por página
  WHATSAPP_PHONE: '34600000000',        // ← TU NÚMERO AQUÍ
  DISCOUNT_PACK: 0.08,                  // Descuento de packs
}
```

## 🎨 Para Personalizar Estilos: `src/styles/main.css`

```css
:root {
  --bg: #faf9f7;              /* Fondo */
  --surface: #ffffff;         /* Superficie (cards) */
  --border: #e8e4df;          /* Bordes */
  --text: #1a1916;            /* Texto principal */
  --muted: #8a8680;           /* Texto secundario */
  --accent: #c9a96e;          /* Color destacado */
  --accent-dark: #a8864d;     /* Color oscuro */
}
```

## 📝 Ejemplo: Deshabilitar un producto por falta de stock

**Antes:**
```json
{ "id": 11, "name": "Honor & Glory", "inStock": true, ... }
```

**Después:**
```json
{ "id": 11, "name": "Honor & Glory", "inStock": false, ... }
```

→ El producto desaparecerá de la tienda automáticamente

## 🚀 Flujo de Desarrollo

```
1. EDITAR datos (perfumes.json / packs.json)
   ↓
2. npm run dev (se actualiza automáticamente)
   ↓
3. VER cambios en http://localhost:3000
   ↓
4. npm run build (cuando esté listo para producción)
   ↓
5. SUBIR carpeta dist/ al hosting
```

## 🎯 Archivos Que NO Necesitas Tocar (Generalmente)

- `src/modules/products.js` - Gestión de lógica
- `src/modules/cart.js` - Lógica del carrito
- `src/modules/ui.js` - Renderizado de UI
- `src/utils/helpers.js` - Funciones auxiliares
- `index.html` - Estructura HTML
- `vite.config.js` - Configuración del builder

## ✅ Checklist para Lanzar

- [ ] `src/config.js` - Cambié WhatsApp
- [ ] `data/perfumes.json` - Agregué mis productos
- [ ] `data/packs.json` - Configuré mis packs
- [ ] `npm run dev` - Todo funciona en local
- [ ] `npm run build` - Build sin errores
- [ ] Subí `dist/` al hosting
- [ ] Probé en navegador: ✓

---

**Cualquier duda sobre las estructuras JSON, revisa `data/perfumes.json` y `data/packs.json` en el proyecto.**
