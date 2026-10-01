#!/usr/bin/env bash
# Reconstruye el ZIP del tema a partir de shopify-theme/.
# Shopify exige las carpetas en la raíz del zip, no dentro de un directorio.
set -euo pipefail
cd "$(dirname "$0")"
rm -f calle23-shopify-theme.zip
find shopify-theme -name '.DS_Store' -delete 2>/dev/null || true
(cd shopify-theme && zip -rq -X ../calle23-shopify-theme.zip . -x '.*' '__MACOSX/*')
echo "listo: calle23-shopify-theme.zip ($(du -h calle23-shopify-theme.zip | cut -f1))"
