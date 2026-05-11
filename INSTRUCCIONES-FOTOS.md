# 📸 Cómo Agregar Fotos de Productos

## Ubicación de Carpeta de Imágenes

Las fotos de los productos deben colocarse en:
```
/public/images/products/
```

## Nombres de Archivo

Cada foto debe nombrarse según el **ID del producto** en el JSON:

```
1.jpg     → Jean Paul Gaultier Le Beau Paradise Garden
2.jpg     → Jean Paul Gaultier Le Male Elixir
3.jpg     → Valentino Born in Roma Intense
4.jpg     → Yves Saint Laurent Y EDP
5.jpg     → Armani Stronger With You Intensely
6.jpg     → Fragrance World Liquid Brun
7.jpg     → Al Haramain Amber Oud Aqua Dubai
8.jpg     → Lattafa Khamrah Qahwa
9.jpg     → Armaf Club de Nuit Intense Man
10.jpg    → Fragrance World Mandarin Sky
11.jpg    → Lattafa Honor & Glory
12.jpg    → Lattafa Asad
13.jpg    → Bentley For Men Absolute
```

## Recomendaciones de Foto

- **Formato**: JPG, PNG, WebP
- **Tamaño**: 400-500px de ancho (se adapta automáticamente)
- **Contenido**: Foto clara del decant/frasco de perfume
- **Fondo**: Preferiblemente fondo blanco o neutro
- **Resolución**: Mínimo 72 DPI, máximo 2MB por imagen

## Pasos para Agregar Fotos

1. **Toma una foto del decant** con buen iluminación
2. **Redimensiona** a unos 500px de ancho
3. **Guarda como JPG** en la carpeta `public/images/products/`
4. **Nombra el archivo** según el ID (ej: `5.jpg` para Armani)
5. **Recarga el navegador** (o espera si estás en dev mode)

## Verificación en Desarrollo

Si ejecutas `npm run dev`, los cambios se verán automáticamente:
- Las fotos aparecerán en las tarjetas del catálogo
- Si falta una foto, se mostrará solo el icono emoji
- El nombre del archivo debe coincidir exactamente (sensible a mayúsculas/minúsculas)

## En Producción

Antes de hacer `npm run build`, asegúrate de:
1. ✓ Todas las fotos están en `public/images/products/`
2. ✓ Los nombres son correctos (1.jpg, 2.jpg, etc.)
3. ✓ Las imágenes se ven bien en el navegador en dev mode

Luego ejecuta:
```bash
npm run build
```

Las fotos se copiarán automáticamente a la carpeta `dist/`.

## Ejemplos de Tamaños Recomendados

| Ancho | Alto | Uso |
|-------|------|-----|
| 400px | 600px | Vertical (botellas) |
| 500px | 500px | Cuadrada |
| 600px | 450px | Horizontal |

## Solución de Problemas

### Las fotos no aparecen
- Verifica que el archivo esté en `public/images/products/`
- Comprueba que el nombre sea exacto: `1.jpg`, `2.jpg`, etc.
- Verifica que sea formato JPG o PNG

### Las fotos se ven pixeladas
- La imagen es muy pequeña
- Redimensiona a mínimo 400px de ancho

### Una foto se ve cortada
- El contenido es muy grande
- Recorta la foto para que el producto sea el protagonista

## Nota Importante

El campo `image` en `perfumes.json` apunta a `/images/products/{id}.jpg`. Si quieres usar nombres personalizados o diferentes formatos, edita directamente el JSON:

```json
{
  "id": 1,
  "image": "/images/products/mi-foto-personalizada.jpg",
  ...
}
```

¡Listo! 📸 Tu tienda de decants lucirá profesional con fotos reales.
