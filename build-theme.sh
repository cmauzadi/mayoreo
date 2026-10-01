#!/usr/bin/env bash
# Reconstruye el ZIP del tema a partir de shopify-theme/.
# Shopify exige las carpetas en la raíz del zip, no dentro de un directorio.
set -euo pipefail
cd "$(dirname "$0")"
# Un schema con "presets" y "default" a la vez es inválido para Shopify:
# descarta la sección entera y la portada se cae. Nunca más en silencio.
python3 - <<'VALIDA'
import json, re, glob, os, sys
malas = []
for f in sorted(glob.glob('shopify-theme/sections/*.liquid')):
    sch = json.loads(re.search(r'\{%\s*schema\s*%\}(.*?)\{%\s*endschema\s*%\}',
                               open(f, encoding='utf-8').read(), re.S).group(1))
    if 'presets' in sch and 'default' in sch:
        malas.append(os.path.basename(f))
if malas:
    print('ERROR: presets y default juntos en:', ', '.join(malas)); sys.exit(1)
llamadas = re.findall(r"\{%\s*section\s*'([^']+)'\s*%\}",
                      open('shopify-theme/templates/index.liquid', encoding='utf-8').read())
faltan = [s for s in llamadas if not os.path.exists(f'shopify-theme/sections/{s}.liquid')]
if faltan:
    print('ERROR: index.liquid llama secciones inexistentes:', ', '.join(faltan)); sys.exit(1)
print(f'validación ok: {len(llamadas)} secciones en la portada, ningún schema inválido')
VALIDA

rm -f calle23-shopify-theme.zip
find shopify-theme -name '.DS_Store' -delete 2>/dev/null || true
(cd shopify-theme && zip -rq -X ../calle23-shopify-theme.zip . -x '.*' '__MACOSX/*')
echo "listo: calle23-shopify-theme.zip ($(du -h calle23-shopify-theme.zip | cut -f1))"
