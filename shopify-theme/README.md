# Calle 23 — tema de Shopify

Tema completo para tienda de tenis con doble canal: **mayoreo y menudeo**.
Pasa `theme-check` de Shopify sin errores ni advertencias.

## Por qué la portada es `index.liquid` y no `index.json`

Shopify valida las plantillas JSON al subir el tema. Si algo no le cuadra, las
descarta **en silencio**: acepta el resto del tema y la tienda se queda sin
portada, sirviendo el 404 en la raíz. Eso pasó dos veces durante el desarrollo.

Por eso la portada es una plantilla Liquid con secciones estáticas. No pasa por
ese validador, así que no puede desaparecer.

Lo que se gana: la portada siempre existe.
Lo que se pierde: las secciones de la portada no se reordenan arrastrándolas en
el personalizador. Para cambiar el orden se mueven las líneas de
`templates/index.liquid`. Todo el texto, las imágenes y los bloques se siguen
editando normal desde el personalizador.

## Instalar

1. En tu panel de Shopify: **Tienda online → Temas → Agregar tema → Subir archivo ZIP**.
2. Selecciona `calle23-shopify-theme.zip`.
3. Cuando termine, **Personalizar** para configurarlo. Publícalo sólo cuando ya tenga contenido real.

## Lo primero que hay que configurar

### Ajustes del tema (ícono de engrane en el personalizador)

| Sección | Qué poner |
|---|---|
| Marca | Logo en SVG, bajada y favicon |
| Color y tipografía | Acento de menudeo y de mayoreo, ancho de los títulos |
| Mayoreo | Pedido mínimo, descuento de respaldo y número de WhatsApp |
| Redes sociales | Instagram, Facebook, TikTok |

### Menús

El tema usa `main-menu` en el encabezado y `footer` en el pie. Créalos en
**Tienda online → Navegación**. El pie admite hasta tres columnas, cada una
apuntando al menú que elijas.

### Catálogo

La sección **Catálogo** de la portada muestra tarjetas de ejemplo hasta que
elijas una colección. En cuanto la elijas, se renderizan tus productos reales.

Los filtros funcionan con **etiquetas de producto**. Las que vienen configuradas
son `retro`, `running`, `skate`, `basquet` y `casual`; cámbialas por las tuyas
en los bloques de la sección.

Etiquetas con significado especial:

- `nuevo` → insignia "Nuevo"
- `pocos` → insignia "Últimos pares"

### Precio de mayoreo

El tema lee el precio mayorista de un **metacampo** por producto:

- Espacio de nombres y clave: `custom.precio_mayoreo`
- Tipo: **Decimal**
- Valor: el precio por par en pesos, por ejemplo `1120.00`

Si un producto no tiene el metacampo, el precio se calcula con el **descuento de
respaldo** de los ajustes del tema.

Metacampos opcionales que también usa la tarjeta:

- `custom.pares_por_caja` (entero) → muestra "Caja 12"
- `custom.color` (texto) → el color bajo el nombre del modelo

## El switch Menudeo / Mayoreo

Cambia el acento de toda la tienda y los precios que se muestran. La elección se
guarda en el navegador para que el mayorista no la repita en cada página.

**Es presentación, no es cobro.** El precio que de verdad se cobra lo decide
Shopify. Para que el mayorista pague precio de mayorista al momento de pagar
necesitas una de estas tres rutas:

1. **Shopify Plus** — B2B nativo: cuentas de empresa, catálogos y listas de
   precio por cliente. Es lo correcto si el volumen lo justifica.
2. **Basic / Grow / Advanced + app** — SparkLayer, Wholesale Gorilla o
   B2B Handsontrade. Trabajan con etiquetas de cliente y mínimos de compra.
3. **Sin app** — catálogo mayorista en página con contraseña y cierre por
   pedido borrador. Barato, pero el cliente no compra solo.

El formulario de "abrir cuenta de mayorista" usa el formulario de contacto de
Shopify y llega al correo de la tienda. Apruebas a mano, creas el cliente y lo
etiquetas como `mayorista`.

## Lo que falta antes de publicar

Lo marcado con etiquetas naranjas en el personalizador es **marcador de
posición**. Reemplázalo:

- Logo real en lugar del nombre en tipografía
- Fotos de producto en 4:5
- Fotos de categoría, de portada y de lookbook
- Logos de las marcas que manejas
- Escalas y precios reales de mayoreo
- Políticas reales en Preguntas frecuentes y en la barra de avisos
- Número de WhatsApp

El sello "Demo de diseño" del pie se quita vaciando ese campo en la sección
**Pie de página**.

## Notas técnicas

- **Tipografías propias.** Archivo y Martian Mono se sirven desde `assets/`
  del tema, con `preload`. Ninguna petición sale a terceros.
- **Sin dependencias.** No hay jQuery, ni framework, ni librerías externas.
  `assets/calle23.js` son 9 KB sin minificar.
- **Carrito con AJAX.** Agregar al carrito desde la tarjeta usa `/cart/add.js`.
  En carril de mayoreo agrega el mínimo configurado de un jalón.
- **Accesibilidad.** Navegación por teclado en acordeón, filtros, tallas y menú;
  foco visible; respeta `prefers-reduced-motion`; enlace para saltar al contenido.
- **Sin scroll horizontal** de 390 px a 1920 px.

## Estructura

```
assets/     calle23.css, calle23.js y las 4 tipografías woff2
config/     ajustes del tema
layout/     theme.liquid y password.liquid
locales/    traducciones (vacías: el texto vive en los ajustes)
sections/   13 secciones editables
snippets/   slate, product-card, demo-cards, icono
templates/  las 19 plantillas que Shopify requiere (inicio en Liquid, no JSON)
```
