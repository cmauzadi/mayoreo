# Calle 23 — notas para el cliente

Demo de landing page para tienda de tenis urbanos con doble canal: **mayoreo y menudeo**.
Archivo único, sin dependencias: `calle23-landing.html`. Se abre con doble clic.

---

## La idea central

La página tiene un **switch de carril** (Menudeo / Mayoreo) en el encabezado, en la portada
y en el panel de ajustes. Al cambiarlo:

- el acento pasa de **naranja tráfico** (menudeo) a **lima alta visibilidad** (mayoreo);
- los precios cambian de "por par al público" a "precio mayorista por par + mínimo + % de ahorro";
- el botón de compra pasa de *Agregar al carrito* a *Agregar 6 pares*.

Es un solo catálogo con dos listas de precio, que es exactamente como opera el negocio.

---

## Qué falta antes de publicar

Lo marcado con etiquetas naranjas en la página es un **marcador de posición**, no contenido final.
El panel **Tweaks → Etiquetas de marcador → Ocultar** las quita para presentar en limpio.

| Pendiente | Dónde | Formato |
|---|---|---|
| Logo real de la tienda | Encabezado, pie, menú móvil | SVG en claro y oscuro |
| Fotos de producto | 8 tarjetas del catálogo | 4:5, fondo consistente |
| Foto de portada | Portada | 4:5 vertical |
| Fotos de categoría | 5 mosaicos | 1:1 y 4:3 |
| Logos de marcas | Franja de marcas | SVG monocromo |
| Fotos editoriales | Lookbook e Instagram | 16:9 y 1:1 |
| Íconos de pago | Pie | SVG oficiales de Visa, Mastercard, OXXO, SPEI |
| Precios y escalas reales | Catálogo y tabla de mayoreo | — |
| Políticas reales | Preguntas frecuentes, barra de avisos | — |
| Número de WhatsApp | Formulario de mayoreo | enlace `wa.me` |

Los nombres de modelo, SKU, precios y políticas son **inventados para el demo**. No los publiques tal cual.

---

## Migración a Shopify

### Secciones

| Sección del demo | Sección de tema Shopify |
|---|---|
| Marquesina superior | Announcement bar |
| Encabezado | Header |
| Portada | Image banner (el contador requiere Custom Liquid) |
| Franja de marcas | Logo list / Multicolumn |
| Categorías | Collection list |
| Catálogo | Featured collection |
| Banda de mayoreo | Custom Liquid + formulario `customer` o app B2B |
| Lookbook | Image with text |
| Servicios | Multicolumn |
| Instagram | App de contenido social |
| Preguntas frecuentes | Collapsible content |
| Boletín | Email signup |
| Pie | Footer |

### El mayoreo, en serio

El switch del demo es front-end. En producción los precios se sirven por **lista de precios
según el cliente**, no con JavaScript. Tres caminos, de mayor a menor costo:

1. **Shopify Plus** — B2B nativo: cuentas de empresa, catálogos y listas de precio por cliente.
   Es la opción correcta si el volumen lo justifica.
2. **Shopify Basic / Grow / Advanced + app** — SparkLayer, Wholesale Gorilla o B2B Handsontrade.
   Funcionan con etiquetas de cliente (`mayorista`) y mínimos de compra.
3. **Sin app** — catálogo mayorista en una página protegida con contraseña y cierre por
   pedido borrador (draft order). Barato, pero el cliente no compra solo.

El formulario de "abrir cuenta de mayorista" se conecta a un registro de cliente que se
aprueba a mano y se etiqueta. Hasta que no tenga la etiqueta, ve precios de menudeo.

### Tipografías

`Archivo` y `Martian Mono` no están en el selector de fuentes de Shopify. Dos opciones:

- dejar el `<link>` de Google Fonts en `theme.liquid` (lo que hace este demo), o
- subir los `.woff2` a `assets/` y declararlos con `@font-face` (mejor para velocidad y privacidad).

### Lo que es CSS puro y se migra sin tocar

Grano de impresión, rayas de peligro de la banda de mayoreo, marquesinas, offsets duros
de serigrafía en los botones, mosaicos de marcador. Nada depende de librerías externas.

---

## Panel Tweaks

Botón redondo abajo a la derecha. Sirve para discutir variantes en vivo durante la junta:
carril, tema (asfalto / papel), acento de menudeo, ancho de la tipografía de display,
columnas del catálogo, etiquetas de marcador, grano y movimiento.

No forma parte de la tienda. Se borra antes de publicar.

---

## Accesibilidad y rendimiento

- Navegación por teclado en acordeón, filtros, tallas y panel de ajustes; foco visible.
- Respeta `prefers-reduced-motion`.
- Sin scroll horizontal de 390 px a 1920 px.
- Sin JavaScript de terceros, sin imágenes pesadas: la página pesa menos de 100 KB sin fotos.
