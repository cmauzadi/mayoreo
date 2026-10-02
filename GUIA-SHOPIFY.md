# Subir un tema a Shopify — pauta de trabajo

Guía operativa para construir y subir temas de Shopify desde Claude Code.
Escrita a partir de errores reales que costaron tres re-subidas en el proyecto
Calle 23. Cada regla de la sección 0 es un bug que ya pasó.

## Cómo usar este archivo

Cópialo a la raíz de cada proyecto nuevo de Shopify como **`CLAUDE.md`**.
Claude Code lo lee solo al abrir la sesión y sigue las reglas sin que haya que
repetirlas. Si el proyecto ya tiene un `CLAUDE.md`, pega este contenido al final.

```bash
curl -sL https://raw.githubusercontent.com/cmauzadi/mayoreo/claude/vigilant-fermi-9me6am/GUIA-SHOPIFY.md -o CLAUDE.md
```

---

## 0. Reglas que no se rompen

Estas cinco causan fallas **silenciosas**: el tema sube "bien", no hay error en
ningún lado, y la tienda sale rota. Ninguna la detecta `theme-check`.

### 0.1 `presets` y `default` nunca van juntos en el mismo schema

Son excluyentes. `default` es para secciones que se renderizan estáticas con
`{% section %}`. `presets` es para las que el comerciante agrega a mano desde el
personalizador. Declarar ambos **invalida el schema completo**: Shopify descarta
la sección y cualquier referencia revienta con
`'mi-seccion' is not a valid section type`.

```jsonc
// MAL — Shopify descarta esta sección entera
{ "name": "Portada", "settings": [...],
  "presets": [{ "name": "Portada" }],
  "default": { "blocks": [...] } }

// BIEN — sección estática
{ "name": "Portada", "settings": [...], "default": { "blocks": [...] } }

// BIEN — sección que se agrega a mano
{ "name": "Portada", "settings": [...], "presets": [{ "name": "Portada" }] }
```

### 0.2 La portada va en `templates/index.liquid`, no en `index.json`

Shopify valida las plantillas JSON al subir el tema. Si algo no le cuadra, la
**descarta sin avisar**: acepta el resto del tema y la tienda se queda sin
portada, sirviendo el 404 en la raíz. Una plantilla Liquid no pasa por ese
validador.

```liquid
{% section 'hero' %}
{% section 'catalog' %}
{% section 'footer-cta' %}
```

Se pierde el reordenamiento por arrastre en el personalizador; el orden se cambia
moviendo líneas. A cambio, la portada no puede desaparecer. Para un proyecto de
cliente con fecha, esa es la decisión correcta.

Si el proyecto exige plantillas JSON, escríbelas **completas**: cada sección con
su objeto `settings` y, si tiene bloques, `blocks` + `block_order`. Nunca
`{ "type": "x" }` a secas.

### 0.3 Los bloques `default` del schema no aplican en plantillas JSON

Sólo aplican a secciones estáticas. En una plantilla JSON hay que escribir los
bloques uno por uno. Es el otro motivo para preferir `index.liquid`: las
secciones estáticas sí heredan sus bloques `default` y la portada sale completa
desde el primer momento.

### 0.4 El ZIP lleva las carpetas en la raíz

```
tema.zip
├── assets/
├── config/
├── layout/
├── locales/
├── sections/
├── snippets/
└── templates/
```

No dentro de un directorio contenedor. Usa `-X` para no meter metadatos y excluye
archivos ocultos.

### 0.5 `theme-check` en verde no significa que funcione

Es un linter estático: revisa sintaxis de Liquid, schemas bien formados,
accesibilidad y rendimiento. **No simula la subida ni valida la coherencia entre
`presets` y `default`.** Pasarlo es necesario, no suficiente.

---

## 1. Probar de verdad antes de subir

La única prueba real es servir el tema contra una tienda. Shopify CLI lo hace y
recarga en vivo:

```bash
npm install -g @shopify/cli
shopify theme dev --store tu-tienda.myshopify.com
```

Levanta el tema en `http://127.0.0.1:9292` con los datos reales de la tienda.
Cualquiera de los errores de la sección 0 aparece ahí en segundos, en vez de
después de subir un ZIP.

**Si no se puede usar el CLI** (sin credenciales de la tienda, entorno sin
navegador), entonces: validar con el script de la sección 7, subir como tema
**nuevo** sin publicar, y revisar con Vista previa. Nunca publicar a ciegas.

---

## 2. Estructura obligatoria

| Carpeta | Qué va | Obligatoria |
|---|---|---|
| `layout/` | `theme.liquid` y `password.liquid` | Sí |
| `templates/` | Las plantillas de cada tipo de página | Sí |
| `sections/` | Secciones editables desde el personalizador | Sí en la práctica |
| `snippets/` | Fragmentos reutilizables (`{% render %}`) | No |
| `assets/` | CSS, JS, imágenes, tipografías | No |
| `config/` | `settings_schema.json` y `settings_data.json` | Sí |
| `locales/` | Traducciones, al menos un `*.default.json` | Sí |
| `blocks/` | Bloques de tema reutilizables | No |

`layout/theme.liquid` tiene que incluir, sin falta:

```liquid
{{ content_for_header }}   <!-- dentro de <head>, lo último -->
{{ content_for_layout }}   <!-- dentro de <body> -->
```

Sin cualquiera de los dos, la tienda no funciona: `content_for_header` inyecta
analíticas, scripts de apps y metadatos; `content_for_layout` es donde se pinta
la plantilla.

`config/settings_schema.json` arranca siempre con el bloque de identidad:

```json
[
  { "name": "theme_info",
    "theme_name": "Nombre",
    "theme_version": "1.0.0",
    "theme_author": "Autor" }
]
```

---

## 3. Las plantillas que Shopify exige

Sin el juego completo no deja **publicar** el tema. Pueden ser `.liquid` o
`.json`, y pueden ser mínimas, pero tienen que existir.

```
templates/
├── 404
├── article
├── blog
├── cart
├── collection
├── gift_card
├── index                  ← .liquid, ver regla 0.2
├── list-collections
├── page
├── password
├── product
├── search
└── customers/
    ├── account
    ├── activate_account
    ├── addresses
    ├── login
    ├── order
    ├── register
    └── reset_password
```

Nunca dos plantillas con el mismo nombre base: `index.liquid` **o**
`index.json`, jamás las dos.

---

## 4. Anatomía de una sección

```liquid
{%- liquid
  assign coleccion = collections[section.settings.coleccion]
-%}

<section class="mi-seccion">
  <h2>{{ section.settings.titulo }}</h2>

  {%- for block in section.blocks -%}
    <div {{ block.shopify_attributes }}>{{ block.settings.texto }}</div>
  {%- endfor -%}
</section>

{% schema %}
{
  "name": "Mi sección",
  "max_blocks": 8,
  "settings": [
    { "type": "text", "id": "titulo", "label": "Título", "default": "Hola" },
    { "type": "collection", "id": "coleccion", "label": "Colección" }
  ],
  "blocks": [
    { "type": "item", "name": "Elemento",
      "settings": [
        { "type": "text", "id": "texto", "label": "Texto", "default": "Texto" }
      ] }
  ],
  "default": {
    "blocks": [
      { "type": "item", "settings": { "texto": "Uno" } },
      { "type": "item", "settings": { "texto": "Dos" } }
    ]
  }
}
{% endschema %}
```

Reglas:

- **Un solo** `{% schema %}`, `{% stylesheet %}` y `{% javascript %}` por archivo,
  los tres al nivel superior.
- El `{% schema %}` tiene que ser JSON válido. Sin comentarios, sin comas colgando.
- `{{ block.shopify_attributes }}` en cada bloque, o el personalizador no sabe
  seleccionarlos.
- `max_blocks` admite hasta 50.
- Los `id` de settings son únicos dentro de la sección.
- Esconde la sección cuando no tiene contenido, en vez de dejar un hueco:
  `{%- if section.blocks.size > 0 -%} … {%- endif -%}`

Tipos de setting más usados: `text`, `textarea`, `richtext`, `image_picker`,
`url`, `checkbox`, `select`, `range`, `color`, `collection`, `product`,
`blog`, `page`, `link_list`, `video`, `font_picker`, más `header` y `paragraph`
que son decorativos y **no llevan `id`**.

Ojo con los tipos de valor en `default`: `range` y los numéricos van como número
(`20`), `select` siempre como cadena (`"20"`). Confundirlos rompe el schema.

---

## 5. Lo que tiene que ser real, no simulado

Un tema que parece una maqueta no sirve. Usa los objetos de Shopify:

| Cosa | Hazlo así |
|---|---|
| Formulario de contacto | `{% form 'contact' %}` con `contact[name]`, `contact[email]`, campos libres |
| Alta al boletín | `{% form 'customer' %}` con `contact[email]` y `contact[tags]` |
| Agregar al carrito | `{% form 'product', product %}`, o `fetch('/cart/add.js')` |
| Login, registro, direcciones | `customer_login`, `create_customer`, `customer_address` |
| Errores del formulario | `{{ form.errors | default_errors }}` |
| Éxito | `{% if form.posted_successfully? %}` |
| Íconos de pago | `{% for t in shop.enabled_payment_types %}{{ t | payment_type_svg_tag }}{% endfor %}` |
| Menús | `linklists['main-menu'].links`, nunca enlaces a mano |
| Rutas | `routes.cart_url`, `routes.account_url`, `routes.search_url` |
| Paginación | `{% paginate collection.products by 24 %}` |

**Precios.** El filtro `money` recibe **centavos**, no pesos. Haz la aritmética
con enteros:

```liquid
{%- assign factor = 100 | minus: descuento -%}
{%- assign precio = product.price | times: factor | divided_by: 100 -%}
{{ precio | money }}
```

**Imágenes.** Siempre con `width` y `height` explícitos, o `theme-check` lo marca
como error y el navegador sufre saltos de layout:

```liquid
<img src="{{ img | image_url: width: 1000 }}"
     srcset="{{ img | image_url: width: 500 }} 500w, {{ img | image_url: width: 1000 }} 1000w"
     sizes="(max-width: 720px) 100vw, 50vw"
     alt="{{ img.alt | escape }}"
     width="{{ img.width }}" height="{{ img.height }}" loading="lazy">
```

**Datos que no existen.** Si el comerciante no ha subido fotos ni elegido
colección, no dejes huecos: renderiza un marcador de posición diseñado que diga
qué falta y en qué proporción. Nunca inventes productos, precios o reseñas que
parezcan reales sin marcarlos.

---

## 6. Assets y tipografías

- CSS y JS en `assets/`, enlazados con
  `{{ 'tema.css' | asset_url | stylesheet_tag }}` y
  `<script src="{{ 'tema.js' | asset_url }}" defer></script>`.
- **Las tipografías van dentro del tema**, no desde Google Fonts. Baja los
  `.woff2`, súbelos a `assets/` y declara el `@font-face` en `theme.liquid` con
  `asset_url`. Sin peticiones a terceros, más rápido, y sin el problema de
  privacidad de mandar la IP de cada visitante a Google.
- Quédate sólo con los subsets que usas (`latin`, `latin-ext` para español).
  Cirílico y vietnamita son peso muerto.
- Precarga las dos familias principales con
  `{{ 'x.woff2' | asset_url | preload_tag: as: 'font', type: 'font/woff2', crossorigin: 'anonymous' }}`.
- El ZIP del tema admite hasta 50 MB.

---

## 7. Validar antes de empaquetar

Guarda esto como `validar-tema.py` en la raíz del proyecto. Cubre lo que
`theme-check` no ve.

```python
#!/usr/bin/env python3
"""Verifica un tema de Shopify antes de empaquetarlo."""
import json, re, glob, os, sys

RAIZ = 'shopify-theme'   # carpeta del tema
errores = []

def schema_de(path):
    txt = open(path, encoding='utf-8').read()
    m = re.search(r'\{%\s*schema\s*%\}(.*?)\{%\s*endschema\s*%\}', txt, re.S)
    if not m:
        return None, txt
    try:
        return json.loads(m.group(1)), txt
    except Exception as e:
        errores.append(f'{path}: schema no es JSON válido -> {e}')
        return None, txt

# 1. presets y default nunca juntos  (regla 0.1)
for f in sorted(glob.glob(f'{RAIZ}/sections/*.liquid')):
    sch, _ = schema_de(f)
    if sch and 'presets' in sch and 'default' in sch:
        errores.append(f'{f}: tiene presets Y default. Shopify descarta la sección.')

# 2. una sola plantilla de inicio, y que sea .liquid  (regla 0.2)
indices = glob.glob(f'{RAIZ}/templates/index.*')
if len(indices) == 0:
    errores.append('falta templates/index')
elif len(indices) > 1:
    errores.append(f'hay {len(indices)} plantillas de inicio: {indices}')
elif indices[0].endswith('.json'):
    errores.append('templates/index.json: usa index.liquid (regla 0.2)')

# 3. toda sección llamada existe
for f in glob.glob(f'{RAIZ}/templates/*.liquid') + glob.glob(f'{RAIZ}/layout/*.liquid'):
    for s in re.findall(r"\{%-?\s*section\s+'([^']+)'", open(f, encoding='utf-8').read()):
        if not os.path.exists(f'{RAIZ}/sections/{s}.liquid'):
            errores.append(f'{f}: llama a la sección inexistente "{s}"')

# 4. todo snippet renderizado existe
for f in glob.glob(f'{RAIZ}/**/*.liquid', recursive=True):
    for s in re.findall(r"\{%-?\s*render\s+'([^']+)'", open(f, encoding='utf-8').read()):
        if not os.path.exists(f'{RAIZ}/snippets/{s}.liquid'):
            errores.append(f'{f}: renderiza el snippet inexistente "{s}"')

# 5. plantillas obligatorias para poder publicar
OBLIGATORIAS = ['404','article','blog','cart','collection','gift_card','index',
                'list-collections','page','password','product','search',
                'customers/account','customers/activate_account','customers/addresses',
                'customers/login','customers/order','customers/register',
                'customers/reset_password']
for t in OBLIGATORIAS:
    if not glob.glob(f'{RAIZ}/templates/{t}.*'):
        errores.append(f'falta la plantilla obligatoria templates/{t}')

# 6. el layout trae los dos objetos sin los que nada funciona
tl = f'{RAIZ}/layout/theme.liquid'
if not os.path.exists(tl):
    errores.append('falta layout/theme.liquid')
else:
    txt = open(tl, encoding='utf-8').read()
    for obj in ['content_for_header', 'content_for_layout']:
        if obj not in txt:
            errores.append(f'layout/theme.liquid: falta {{{{ {obj} }}}}')

# 7. config y locales
if not os.path.exists(f'{RAIZ}/config/settings_schema.json'):
    errores.append('falta config/settings_schema.json')
else:
    try:
        sch = json.load(open(f'{RAIZ}/config/settings_schema.json', encoding='utf-8'))
        if not (isinstance(sch, list) and sch and sch[0].get('name') == 'theme_info'):
            errores.append('settings_schema.json: el primer bloque debe ser theme_info')
    except Exception as e:
        errores.append(f'settings_schema.json inválido -> {e}')
if not glob.glob(f'{RAIZ}/locales/*.default.json'):
    errores.append('falta un archivo locales/*.default.json')

# 8. todo JSON del tema tiene que parsear
for f in glob.glob(f'{RAIZ}/**/*.json', recursive=True):
    try:
        json.load(open(f, encoding='utf-8'))
    except Exception as e:
        errores.append(f'{f}: JSON inválido -> {e}')

if errores:
    print('TEMA INVÁLIDO:')
    for e in errores:
        print('  -', e)
    sys.exit(1)
print('tema válido')
```

Y además, el linter oficial:

```bash
npm install -D @shopify/theme-check-node
npx theme-check shopify-theme   # o el runner de Node
```

Las dos cosas. Ninguna sustituye a la otra.

---

## 8. Empaquetar

`build-theme.sh` en la raíz:

```bash
#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

python3 validar-tema.py            # aborta si algo está mal

rm -f tema.zip
find shopify-theme -name '.DS_Store' -delete 2>/dev/null || true
(cd shopify-theme && zip -rq -X ../tema.zip . -x '.*' '__MACOSX/*')
echo "listo: tema.zip ($(du -h tema.zip | cut -f1))"
```

Verifica siempre el resultado sobre el ZIP extraído, no sobre la carpeta fuente:

```bash
rm -rf /tmp/zcheck && mkdir -p /tmp/zcheck && unzip -q tema.zip -d /tmp/zcheck
unzip -Z1 tema.zip | awk -F/ '{print $1}' | sort -u   # carpetas en la raíz
```

---

## 9. Subir y publicar

1. **Tienda online → Temas → Agregar tema → Subir archivo ZIP**.
2. Súbelo siempre como **tema nuevo**. No uses "actualizar" sobre uno existente:
   conserva los ajustes guardados y puede enmascarar que el arreglo funcionó.
3. **Vista previa** antes de publicar. Revisa: portada, una colección, un
   producto, el carrito, búsqueda, 404, y el formulario de contacto.
4. Publica sólo cuando la vista previa esté bien.
5. Borra los temas viejos rotos para no confundirte después.

Para encontrar un problema sin volver a subir: **⋯ → Editar código**. Ahí se ve
qué archivos quedaron realmente y se pueden corregir en vivo.

---

## 10. Diagnóstico: error → causa

| Lo que ves | Qué pasa |
|---|---|
| `'x' is not a valid section type` | `sections/x.liquid` no existe, o su schema es inválido. Causa número uno: `presets` y `default` juntos |
| La raíz devuelve 404 y el resto del tema funciona | No hay plantilla de inicio. Shopify descartó `index.json` al subir |
| La portada carga a medias, sin bloques | Plantilla JSON sin `blocks` explícitos: los `default` del schema no aplican ahí |
| La sección no aparece en el personalizador | Le falta `presets`, o se está renderizando estática con `{% section %}` |
| `Liquid error: Unknown tag` | Etiqueta mal cerrada, o `{% endform %}` / `{% endpaginate %}` faltante |
| La tienda se ve sin estilos | Falta `{{ content_for_header }}`, o el `asset_url` apunta a un archivo que no está en `assets/` |
| Los enlaces del menú dan 404 | El menú de Shopify apunta a colecciones o páginas que todavía no existen en esa tienda |
| El precio sale con un cero de más o de menos | `money` recibe centavos. Revisa la aritmética |
| Tipografías que no cargan | El `.woff2` no está en `assets/`, o el `@font-face` usa una ruta en vez de `asset_url` |

---

## 11. Checklist de entrega

**Técnico**

- [ ] `shopify theme dev` levanta el tema sin errores, o se verificó en Vista previa
- [ ] `validar-tema.py` pasa
- [ ] `theme-check` en 0 errores y 0 advertencias
- [ ] Verificado sobre el ZIP **extraído**, no sobre la carpeta fuente
- [ ] Carpetas en la raíz del ZIP
- [ ] Ninguna sección con `presets` y `default`
- [ ] Una sola plantilla de inicio, en `.liquid`
- [ ] Las 19 plantillas obligatorias existen
- [ ] Todas las `<img>` con `width` y `height`
- [ ] Tipografías dentro del tema, sin peticiones a terceros
- [ ] Sin scroll horizontal de 390 px a 1920 px
- [ ] Foco visible, navegación por teclado, `prefers-reduced-motion`

**De contenido**

- [ ] Los formularios usan `{% form %}` de Shopify, no simulacros
- [ ] Los productos salen de una colección real, con respaldo marcado si no hay
- [ ] Cero datos inventados sin marcar: precios, reseñas, cifras, logos
- [ ] Marcadores de posición que digan qué foto falta y en qué proporción
- [ ] Textos editables desde el personalizador, no escritos en el código
- [ ] Sellos de "demo" quitables desde un ajuste

**Para el cliente**

- [ ] `README.md` dentro del tema: cómo instalarlo y qué configurar primero
- [ ] Documentados los metacampos que el tema espera
- [ ] Documentados los menús que el tema usa (`main-menu`, `footer`)
- [ ] Lista de lo que falta antes de publicar

---

## 12. Lo que no se puede probar desde Claude Code

Sé honesto sobre esto con el cliente:

- Sin credenciales de la tienda, **no hay forma de ejecutar el tema**. Los
  linters revisan archivos, no comportamiento.
- El `money` filter, los metacampos, los formularios y el carrito sólo se pueden
  verificar contra una tienda real.
- Un tema que pasa todas las validaciones todavía puede fallar al subir. Por eso
  se sube como tema nuevo, sin publicar, y se revisa con Vista previa.

Si algo falla después de subir, **pide una captura de pantalla con la URL
visible**. Los mensajes de error de Liquid en pantalla dicen el archivo y la
línea exactos, y resuelven en un minuto lo que de otro modo son horas de
adivinar.
