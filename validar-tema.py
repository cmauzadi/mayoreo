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
