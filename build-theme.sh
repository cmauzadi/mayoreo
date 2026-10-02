#!/usr/bin/env bash
# Valida y empaqueta el tema. Shopify exige las carpetas en la raíz del zip.
# Las reglas que verifica validar-tema.py están explicadas en GUIA-SHOPIFY.md.
set -euo pipefail
cd "$(dirname "$0")"

python3 validar-tema.py

rm -f calle23-shopify-theme.zip
find shopify-theme -name '.DS_Store' -delete 2>/dev/null || true
(cd shopify-theme && zip -rq -X ../calle23-shopify-theme.zip . -x '.*' '__MACOSX/*')
echo "listo: calle23-shopify-theme.zip ($(du -h calle23-shopify-theme.zip | cut -f1))"
