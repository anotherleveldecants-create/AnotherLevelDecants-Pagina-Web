# AnotherLevelDecants - E-commerce de Perfumes Decant

Tienda online profesional y modular para venta de decants de perfumes de lujo. Construida con Vite, JavaScript modular y datos JSON para fácil mantenimiento.

## 📋 Características

- ✅ **Catálogo modular**: Productos en JSON, fácil de editar
- ✅ **Gestión de stock**: Marcar productos como "out of stock"
- ✅ **Paginación**: 6 productos por página
- ✅ **Buscador**: Busca por marca y nombre
- ✅ **Filtros**: Por género (Masculino/Unisex)
- ✅ **Carrito moderno**: Sidebar con actualizaciones en tiempo real
- ✅ **Integración WhatsApp**: Checkout directo vía WhatsApp
- ✅ **Responsive**: Optimizado para móvil
- ✅ **Seguridad**: Escapado de HTML contra XSS
- ✅ **SEO**: Meta tags, Open Graph, estructura semántica

## 📁 Estructura del Proyecto

```
anotherlevel-decants/
├── index.html                 # Página principal
├── vite.config.js             # Configuración de Vite
├── package.json               # Dependencias
├── .gitignore                 # Archivos ignorados por Git
├── README.md                  # Este archivo
│
├── src/
│   ├── main.js               # Punto de entrada
│   ├── config.js             # Configuración central
│   ├── styles/
│   │   └── main.css          # Estilos completos
│   ├── modules/
│   │   ├── products.js       # Gestión de productos
│   │   ├── cart.js           # Gestión del carrito
│   │   └── ui.js             # Render de UI
│   └── utils/
│       └── helpers.js        # Funciones auxiliares
│
├── data/
│   ├── perfumes.json         # Catálogo de perfumes
│   └── packs.json            # Packs curados
```

## 🚀 Instalación y Setup

### 1. Clonar o descargar el proyecto
```bash
cd "Página Web AnotherLevelDecants"
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar el número de WhatsApp
Abre `src/config.js` y actualiza:
```javascript
export const CONFIG = {
  WHATSAPP_PHONE: 'TU_NÚMERO_AQUÍ', // Ej: '34612345678'
}
```

### 4. Ejecutar en desarrollo
```bash
npm run dev
```

Abrirá automáticamente `http://localhost:3000`

## 📦 Agregar/Editar Productos

### Editar productos disponibles
Archivo: `data/perfumes.json`

```json
{
  "id": 1,
  "brand": "Jean Paul Gaultier",
  "name": "Le Beau Paradise Garden",
  "price5": 9.99,
  "price10": 17.48,
  "gender": "masculino",
  "icon": "🌴",
  "desc": "Descripción breve",
  "highlight": "Punto destacable",
  "inStock": true,           // ← Cambiar a false para deshabilitarlo
  "stockLevel": "high"       // high, medium, low, out
}
```

### Agregar nuevo producto
1. Abre `data/perfumes.json`
2. Copia un objeto existente
3. Modifica los valores (importante: `id` único)
4. Guarda el archivo

El sitio se actualizará automáticamente en desarrollo.

### Editar packs
Archivo: `data/packs.json`

```json
{
  "id": "pack-noche",
  "name": "Pack Noche Perfecta",
  "icon": "🌙",
  "desc": "Descripción del pack",
  "discount": 0.08,           // 8% de descuento
  "inStock": true,            // false para deshabilitarlo
  "items": [
    { "perfId": 2, "size": 10 },
    { "perfId": 5, "size": 10 }
  ]
}
```

## 🛠️ Build para Producción

```bash
npm run build
```

Genera una carpeta `dist/` optimizada lista para hosting.

## 🚀 Deploy

### Opción 1: Netlify (Recomendado - Gratis)
1. Haz build: `npm run build`
2. Conecta tu repo a [Netlify](https://netlify.com)
3. Configura build command: `npm run build`
4. Publish directory: `dist`

### Opción 2: Vercel
1. Importa tu proyecto en [Vercel](https://vercel.com)
2. Detecta automáticamente Vite
3. Deploy con un click

### Opción 3: Hosting tradicional
1. Haz build: `npm run build`
2. Descarga la carpeta `dist/`
3. Sube los archivos vía FTP a tu hosting
4. Asegúrate que el servidor sirva `index.html` para todas las rutas

## 🎨 Personalización

### Cambiar colores
Edita las variables en `src/styles/main.css`:
```css
:root {
  --accent: #c9a96e;        /* Color principal */
  --text: #1a1916;          /* Texto */
  --bg: #faf9f7;            /* Fondo */
}
```

### Cambiar fuentes
En `index.html`, modifica el link de Google Fonts:
```html
<link href="https://fonts.googleapis.com/css2?family=TU_FUENTE" rel="stylesheet" />
```

## 📱 Responsive Breakpoints

- **Desktop**: 1200px+
- **Tablet**: 901px - 1199px
- **Mobile**: < 600px

## 🔒 Seguridad

- ✅ HTML escapado contra XSS
- ✅ Sin dependencias peligrosas
- ✅ Datos en JSON (no DB públicas)
- ✅ WhatsApp como pago (tercero de confianza)

## 🐛 Troubleshooting

### "npm command not found"
Instala Node.js desde [nodejs.org](https://nodejs.org)

### Puerto 3000 en uso
Vite usará automáticamente otro puerto. Revisa la terminal.

### Cambios no se reflejan
En desarrollo: Limpia caché del navegador (Ctrl+Shift+R)

## 📚 Tecnología

- **Vite**: Bundler ultrarrápido
- **JavaScript ES6+**: Modular y moderno
- **JSON**: Datos fáciles de mantener
- **CSS3**: Responsive y performante
- **No frameworks**: Código vanilla puro

## 📄 Licencia

Proyecto personal. Úsalo como quieras.

## ✉️ Soporte

Si necesitas cambios o tienes dudas sobre el proyecto, contacta directamente.

---

**Última actualización**: Mayo 2026
