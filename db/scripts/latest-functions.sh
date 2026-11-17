#!/usr/bin/env bash
# Script: latest-functions.sh
# Muestra solo el nombre del archivo de la función buscada (última versión)
# Opción --open para abrir el archivo en el editor

set -e

FUNC_DIR="../functions"
FUNC_FILTER="$1"
OPEN_FILE=false
if [ "$2" == "--open" ]; then
  OPEN_FILE=true
fi
FUNC_FILTER_LC=$(echo "$FUNC_FILTER" | tr '[:upper:]' '[:lower:]')

declare -A func_files

spinner() {
  local pid=$1
  local delay=0.1
  local spinstr='|/-\'
  while kill -0 $pid 2>/dev/null; do
    for i in $(seq 0 3); do
      printf "\r%s" "${spinstr:$i:1}"
      sleep $delay
    done
  done
  printf "\r"
  echo
}

# Si hay filtro, primero filtra archivos que contengan el texto (case-insensitive)
if [ -n "$FUNC_FILTER_LC" ]; then
  mapfile -t files < <(grep -il "$FUNC_FILTER" "$FUNC_DIR"/*.sql | sort -r)
else
  mapfile -t files < <(ls -1 "$FUNC_DIR"/*.sql | sort -r)
fi

TMP_SELECTED_FILE=$(mktemp)
(
for file in "${files[@]}"; do
  FUNC_NAME=$(grep -i -m1 -Eo 'create( or replace)?[ ]+function[ ]+([a-zA-Z0-9_]+\.)?[a-zA-Z0-9_]+' "$file" | sed -E 's/create( or replace)?[ ]+function[ ]+//' | head -n1)
  [ -z "$FUNC_NAME" ] && continue

  FUNC_NAME_LC=$(echo "$FUNC_NAME" | tr '[:upper:]' '[:lower:]')
  FUNC_NAME_NO_SCHEMA=$(echo "$FUNC_NAME_LC" | awk -F. '{print $NF}')
  if [ -n "$FUNC_FILTER_LC" ]; then
    [[ "$FUNC_NAME_LC" != *"$FUNC_FILTER_LC"* && "$FUNC_NAME_NO_SCHEMA" != *"$FUNC_FILTER_LC"* ]] && continue
  fi

  if [ -z "${func_files[$FUNC_NAME]}" ]; then
    func_files[$FUNC_NAME]="$file"
  fi

done

for fname in "${!func_files[@]}"; do
  echo "${func_files[$fname]}"
  echo "${func_files[$fname]}" > "$TMP_SELECTED_FILE"
done
) &
pid=$!
spinner $pid
wait $pid

SELECTED_FILE="$(cat "$TMP_SELECTED_FILE")"
rm "$TMP_SELECTED_FILE"

if [ -z "$SELECTED_FILE" ]; then
  echo "No se encontró ninguna función que coincida con el filtro." >&2
  exit 1
fi

# Si se pasa --open y hay archivo, abrirlo en el editor
if $OPEN_FILE && [ -n "$SELECTED_FILE" ]; then
  if command -v code >/dev/null 2>&1; then
    code "$SELECTED_FILE"
  else
    xdg-open "$SELECTED_FILE" 2>/dev/null || open "$SELECTED_FILE" 2>/dev/null || notepad "$SELECTED_FILE"
  fi
fi
