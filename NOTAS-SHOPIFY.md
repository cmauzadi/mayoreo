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

## Migración a Shopify — ya está hecha

El tema completo vive en `shopify-theme/` y el paquete listo para subir es
`calle23-shopify-theme.zip`. Pasa `theme-check` de Shopify sin errores ni
advertencias en sus 44 archivos.

Para subirlo: **Tienda online → Temas → Agregar tema → Subir archivo ZIP**.
Las instrucciones completas de configuración están en `shopify-theme/README.md`.

Lo que cambia respecto al demo estático:

| Demo HTML | Tema de Shopify |
|---|---|
| Textos en el código | Secciones editables desde el personalizador |
| Tarjetas de producto inventadas | Productos reales de la colección que elijas |
| Precio de mayoreo inventado | Metacampo `custom.precio_mayoreo` o descuento de respaldo |
| Formulario que no manda nada | Formulario de contacto real de Shopify |
| Boletín falso | Alta de cliente real con etiqueta `newsletter` |
| Carrito simulado | `/cart/add.js` contra el carrito real |
| Íconos de pago pendientes | Íconos reales según los métodos activos de la tienda |
| Tipografías desde Google Fonts | Tipografías servidas desde `assets/` del tema |
| Panel Tweaks | Quitado: era herramienta de presentación |

Para reconstruir el zip después de editar el tema: `./build-theme.sh`

### El mayoreo, en serio

El switch del tema cambia lo que se *muestra*. El precio que se *cobra* lo decide
Shopify. Tres caminos, de mayor a menor costo:

1. **Shopify Plus** — B2B nativo: cuentas de empresa, catálogos y listas de precio
   por cliente. Es la opción correcta si el volumen lo justifica.
2. **Basic / Grow / Advanced + app** — SparkLayer, Wholesale Gorilla o
   B2B Handsontrade. Funcionan con etiquetas de cliente y mínimos de compra.
3. **Sin app** — catálogo mayorista en una página protegida con contraseña y
   cierre por pedido borrador. Barato, pero el cliente no compra solo.

El formulario de "abrir cuenta de mayorista" llega al correo de la tienda. Se
aprueba a mano y se etiqueta al cliente como `mayorista`.

## Panel Tweaks

Botón redondo abajo a la derecha. Sirve para discutir variantes en vivo durante la junta:
carril, tema (asfalto / papel), acento de menudeo, ancho de la tipografía de display,
columnas del catálogo, etiquetas de marcador, grano y movimiento.

Sólo existe en el demo HTML. El tema de Shopify no lo incluye.

---

## Accesibilidad y rendimiento

- Navegación por teclado en acordeón, filtros, tallas y panel de ajustes; foco visible.
- Respeta `prefers-reduced-motion`.
- Sin scroll horizontal de 390 px a 1920 px.
- Sin JavaScript de terceros, sin imágenes pesadas: la página pesa menos de 100 KB sin fotos.

---

## Dos versiones del archivo

| Archivo | Para qué | Peso |
|---|---|---|
| `calle23-landing.html` | Migrar a Shopify. Carga las tipografías desde Google Fonts. | 78 KB |
| `calle23-landing-offline.html` | Presentar y mandar al cliente. Tipografías incrustadas: abre sin internet y no hace ninguna petición de red. | 392 KB |

Las dos son idénticas en diseño y comportamiento. Para el tema de Shopify usa la primera:
no conviene meter 300 KB de tipografías en base64 dentro de un tema.
