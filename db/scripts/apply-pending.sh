#!/bin/bash
set -euo pipefail

# Colores para mejor visibilidad
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging helpers adaptativos
log_info() {
  echo -e "[INFO] $1" >&2
}

log_success() {
  echo -e "${GREEN}[OK] $1${NC}" >&2
}

log_warning() {
  echo -e "${YELLOW}[!] $1${NC}" >&2
}

log_error() {
  echo -e "${RED}[X] $1${NC}" >&2
}

# Función de ayuda
show_help() {
  cat << 'EOF'
Script de Migración de Base de Datos
====================================

USO:
  ./apply-pending.sh [OPCIONES]

MODOS:
  (sin parámetros)     Aplicar directamente a BD local (desarrollo)
  --ci-cd             Flujo CI/CD via S3+Lambda (producción)
  archivo.sql         Generar SQL para revisión/debug (no aplica cambios)

EJEMPLOS:
  # Desarrollo local
  ./apply-pending.sh

  # Producción automática  
  ./apply-pending.sh --ci-cd

  # Debug/revisión
  ./apply-pending.sh review.sql
  cat review.sql                    # revisar contenido
  ./apply-pending.sh --ci-cd              # aplicar después
  # o
  psql -f review.sql               # aplicar manualmente

VARIABLES DE ENTORNO:
  
  Para modo local:
    PGHOST, PGPORT, PGUSER, PGDATABASE, PGPASSWORD
  
  Para modo --ci-cd:
    LAMBDA_FUNCTION_NAME=migration-executor
    S3_BUCKET=mi-bucket-migraciones
    AWS_REGION=us-west-2

EOF
}

# Spinner para feedback visual
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

# VERIFICAR AYUDA PRIMERO - ANTES DE CUALQUIER OTRA LÓGICA
if [ $# -ge 1 ] && [[ "$1" =~ ^(-h|--help|help)$ ]]; then
  show_help
  exit 0
fi

# Cargar variables desde .env si existe
if [ -f ".env" ]; then
  log_info "Cargando variables desde .env..."
  export $(grep -v '^#' .env | xargs)
fi

# Validar variables obligatorias solo en modo local
validate_env_vars() {
  local missing_vars=()
  for var in PGHOST PGPORT PGUSER PGDATABASE; do
    if [ -z "${!var:-}" ]; then
      missing_vars+=("$var")
    fi
  done

  if [ ${#missing_vars[@]} -gt 0 ]; then
    log_error "Variables de entorno faltantes: ${missing_vars[*]}"
    log_info "Asegúrate de definir estas variables en tu .env o como variables de entorno"
    exit 1
  fi
}

# Validar variables para S3+Lambda
validate_s3_lambda_vars() {
  local missing_vars=()
  for var in LAMBDA_FUNCTION_NAME S3_BUCKET AWS_REGION; do
    if [ -z "${!var:-}" ]; then
      missing_vars+=("$var")
    fi
  done

  if [ ${#missing_vars[@]} -gt 0 ]; then
    log_error "Variables S3+Lambda faltantes: ${missing_vars[*]}"
    log_info "Define LAMBDA_FUNCTION_NAME, S3_BUCKET y AWS_REGION en tu .env"
    exit 1
  fi
  
  # Verificar AWS CLI
  if ! command -v aws &> /dev/null; then
    log_error "AWS CLI no encontrado. Instálalo desde: https://aws.amazon.com/cli/"
    exit 1
  fi
  
  if ! aws sts get-caller-identity &> /dev/null 2>&1; then
    log_error "AWS CLI no configurado correctamente"
    exit 1
  fi
}

# Consultar migraciones aplicadas via Lambda
get_applied_migrations_remote() {
    log_info "Consultando migraciones aplicadas via Lambda..."
    
    export AWS_CLI_BINARY_FORMAT=raw-in-base64-out
    
    local payload_raw='{"action":"get_applied"}'
    local payload_b64
    
    if command -v base64 >/dev/null 2>&1; then
        payload_b64=$(printf '%s' "$payload_raw" | base64 | tr -d '\n')
    elif command -v openssl >/dev/null 2>&1; then
        payload_b64=$(printf '%s' "$payload_raw" | openssl base64 | tr -d '\n')
    else
        log_error "No se encontró comando base64 o openssl"
        return 1
    fi
    
    aws lambda invoke \
        --function-name "$LAMBDA_FUNCTION_NAME" \
        --region "$AWS_REGION" \
        --payload "$payload_b64" \
        /tmp/lambda_response.json >/dev/null 2>&1

    local lambda_exit_code=$?
    unset AWS_CLI_BINARY_FORMAT
    
    if [ $lambda_exit_code -eq 0 ]; then
        # SOLO devolver el resultado parseado del archivo
        jq -r '.body | fromjson | .applied_migrations[]?' /tmp/lambda_response.json 2>/dev/null || true
    else
        log_error "Error consultando Lambda"
        return 1
    fi
}

# Ejecutar migraciones via S3+Lambda
execute_via_s3_lambda() {
    local sql_content="$1"
    local temp_file="/tmp/migrations_$(date +%Y%m%d_%H%M%S).sql"
    local s3_key="migrations/$(basename "$temp_file")"
    
    # 1. Crear archivo temporal
    echo "$sql_content" > "$temp_file"
    local file_size=$(stat -f%z "$temp_file" 2>/dev/null || stat -c%s "$temp_file" 2>/dev/null || echo "0")
    log_info "Archivo SQL generado: $(( file_size / 1024 ))KB"
    
    # 2. Subir a S3
    log_info "Subiendo SQL a S3: s3://$S3_BUCKET/$s3_key"
    if ! aws s3 cp "$temp_file" "s3://$S3_BUCKET/$s3_key" --region "$AWS_REGION"; then
        log_error "Error subiendo a S3"
        rm -f "$temp_file"
        return 1
    fi
    
    # 3. Invocar Lambda usando base64 payload
    log_info "Ejecutando migraciones via Lambda..."
    
    # Configurar formato binario
    export AWS_CLI_BINARY_FORMAT=raw-in-base64-out
    
    # Crear payload y codificar en base64
    local payload_raw="{\"action\":\"execute_s3\",\"bucket\":\"$S3_BUCKET\",\"key\":\"$s3_key\"}"
    local payload_b64
    
    # Diferentes métodos de base64 según el sistema
    if command -v base64 >/dev/null 2>&1; then
        payload_b64=$(printf '%s' "$payload_raw" | base64 | tr -d '\n')
    elif command -v openssl >/dev/null 2>&1; then
        payload_b64=$(printf '%s' "$payload_raw" | openssl base64 | tr -d '\n')
    else
        log_error "No se encontró comando base64 o openssl"
        rm -f "$temp_file"
        return 1
    fi
    
    aws lambda invoke \
        --function-name "$LAMBDA_FUNCTION_NAME" \
        --region "$AWS_REGION" \
        --payload "$payload_b64" \
        /tmp/lambda_execute.json >/dev/null 2>&1
    
    local invoke_exit_code=$?
    
    # Limpiar variable de entorno
    unset AWS_CLI_BINARY_FORMAT
    
    # 4. Verificar resultado CON JQ
    if [ $invoke_exit_code -ne 0 ]; then
        log_error "Error invocando Lambda"
        rm -f "$temp_file"
        return 1
    fi
    
    # Verificar si la respuesta es exitosa usando jq
    local status=$(jq -r '.body | fromjson | .status // empty' /tmp/lambda_execute.json 2>/dev/null)
    local error_msg=$(jq -r '.body | fromjson | .error // empty' /tmp/lambda_execute.json 2>/dev/null)
    local message=$(jq -r '.body | fromjson | .message // empty' /tmp/lambda_execute.json 2>/dev/null)
    
    if [ "$status" = "success" ]; then
        log_success "Migraciones aplicadas exitosamente"
        
        # Mostrar mensaje de Lambda
        if [ -n "$message" ] && [ "$message" != "empty" ]; then
            echo "  📝 $message"
        fi
        
        # Mostrar migraciones aplicadas si están disponibles
        local applied_count=$(jq -r '.body | fromjson | .applied_migrations | length' /tmp/lambda_execute.json 2>/dev/null)
        if [ "$applied_count" != "null" ] && [ "$applied_count" -gt 0 ]; then
            echo "  📝 Migraciones aplicadas ($applied_count):"
            jq -r '.body | fromjson | .applied_migrations[]' /tmp/lambda_execute.json 2>/dev/null | while read -r migration; do
                echo "    • $migration"
            done
        else
            echo "  ℹ️  No se aplicaron nuevas migraciones (todas ya estaban aplicadas)"
        fi
        
        rm -f "$temp_file"
        return 0
        
    elif [ -n "$error_msg" ] && [ "$error_msg" != "empty" ]; then
        log_error "Error ejecutando migraciones: $error_msg"
        rm -f "$temp_file"
        return 1
        
    else
        log_error "Respuesta inesperada de Lambda:"
        cat /tmp/lambda_execute.json
        rm -f "$temp_file"
        return 1
    fi
}

# TU FUNCIÓN ORIGINAL - SIN CAMBIOS
process_and_apply_file() {
  local file="$1"
  local filename=$(basename "$file")
  local label="FUNC"

  if [[ "$file" == functions/* ]]; then
    label="FUNC"
  elif [[ "$file" == migrations/* ]]; then
    label="MIGR"
  fi

  local already_applied=$(psql -h "$PGHOST" -U "$PGUSER" -d "$PGDATABASE" -p "$PGPORT" -tAc "SELECT 1 FROM schema_migrations WHERE filename = '$filename' LIMIT 1;")
  if [[ "$already_applied" == "1" ]]; then
    log_info "[$label][OMIT] $filename ya fue aplicado. Se omite."
    return
  fi

  echo
  log_info "[$label][PROC] Verificando y aplicando: $file"
  if ! psql -h "$PGHOST" -U "$PGUSER" -d "$PGDATABASE" -p "$PGPORT" -v ON_ERROR_STOP=1 -f "$file" > /tmp/psql_error.log 2>&1; then
    log_error "[$label] Error al procesar el archivo: $file"
    echo -e "\n${RED}[DETALLE] Error desde psql:${NC}"
    cat /tmp/psql_error.log | sed 's/^/    /'

    if grep -qi "syntax error" /tmp/psql_error.log; then
      echo -e "\n${YELLOW}[TIP] Revisa la sintaxis SQL. Puede faltar ';', paréntesis, o estar mal escrito un keyword.${NC}"
    elif grep -qi "permission denied" /tmp/psql_error.log; then
      echo -e "\n${YELLOW}[TIP] Verifica los permisos del usuario '${PGUSER}' sobre los objetos.${NC}"
    elif grep -qi "could not connect" /tmp/psql_error.log; then
      echo -e "\n${YELLOW}[TIP] Asegúrate que la BD esté activa y accesible en ${PGHOST}:${PGPORT}.${NC}"
    else
      echo -e "\n${YELLOW}[TIP] Revisa el contenido del archivo SQL o intenta aplicarlo manualmente para más detalle.${NC}"
    fi

    exit 1
  fi

  psql -h "$PGHOST" -U "$PGUSER" -d "$PGDATABASE" -p "$PGPORT" -v ON_ERROR_STOP=1 -c "INSERT INTO schema_migrations (filename) VALUES ('$filename') ON CONFLICT DO NOTHING;" > /dev/null
  log_success "[$label] $file aplicado correctamente"
}

# TU FUNCIÓN ORIGINAL - SIN CAMBIOS
append_file_to_output() {
  local file="$1"
  echo -e "\n-- Archivo: $(basename "$file")\n" >> "$OUTPUT_FILE"
  cat "$file" >> "$OUTPUT_FILE"
}

# NUEVA LÓGICA: Determinar modo de operación
if [ $# -ge 1 ] && [ "$1" = "--ci-cd" ]; then
  # NUEVO MODO: CI/CD via S3+Lambda
  log_info "=== MODO CI/CD VIA S3+LAMBDA ==="
  
  validate_s3_lambda_vars
  
  # 1. Consultar estado remoto
  log_info "[STEP 1/4] Consultando estado de BD remota..."
  if get_applied_migrations_remote > /tmp/applied_result.txt; then
    # Función exitosa, leer resultado
    applied_migrations=$(cat /tmp/applied_result.txt)
    rm -f /tmp/applied_result.txt    
  else
      # Función falló
      log_error "Error en get_applied_migrations_remote"
      rm -f /tmp/applied_result.txt
      exit 1
  fi
  
  # Conteo correcto: verificar si está vacía primero
  if [ -z "$applied_migrations" ]; then
    applied_count=0
  else
    applied_count=$(printf '%s\n' "$applied_migrations" | grep -c '^..*$')
  fi

  log_success "$applied_count migraciones encontradas en BD remota"
  
  # 2. Encontrar archivos pendientes
  log_info "[STEP 2/4] Evaluando archivos pendientes..."
  pending_files=()
  
  for file in $(find migrations -name '*.sql' 2>/dev/null | sort); do
    filename=$(basename "$file")
    if ! echo "$applied_migrations" | grep -q "^${filename}$"; then
      pending_files+=("$file")
    fi
  done
  
  for file in $(find functions -name '*.sql' 2>/dev/null | sort); do
    filename=$(basename "$file")
    if ! echo "$applied_migrations" | grep -q "^${filename}$"; then
      pending_files+=("$file")
    fi
  done
  
  if [ ${#pending_files[@]} -eq 0 ]; then
    log_success "No hay migraciones pendientes para aplicar"
    exit 0
  fi
  
  log_info "Archivos pendientes encontrados: ${#pending_files[@]}"
  for file in "${pending_files[@]}"; do
    echo "  • $(basename "$file")"
  done
  
  # 3. Generar SQL combinado
  log_info "[STEP 3/4] Generando SQL optimizado..."
  combined_sql="-- Migraciones generadas automáticamente
-- Timestamp: $(date -u -Iseconds)
-- Archivos incluidos: ${#pending_files[@]}

"
  
  for file in "${pending_files[@]}"; do
    combined_sql+="-- Archivo: $(basename "$file")"$'\n'
    combined_sql+="$(cat "$file")"$'\n'$'\n'
  done
  
  # 4. Ejecutar via S3+Lambda
  log_info "[STEP 4/4] Ejecutando via S3+Lambda..."
  if execute_via_s3_lambda "$combined_sql"; then
    log_success "=== FLUJO CI/CD COMPLETADO EXITOSAMENTE ==="
  else
    log_error "=== FLUJO CI/CD FALLÓ ==="
    exit 1
  fi

elif [ $# -ge 1 ]; then
  # MODO DEBUG: Generar archivo SQL para revisión manual
  readonly OUTPUT_FILE="$1"
  readonly DELETE_AFTER=false
  readonly APPLY_DB=false
  log_info "[MODE] DEBUG: generando archivo para revisión → $OUTPUT_FILE"
  log_info "Este archivo incluye TODOS los archivos SQL (sin filtrar por estado)"
  log_warning "Para aplicar cambios, usa: ./script.sh --ci-cd (aplicación automática) o psql -f $OUTPUT_FILE (aplicación manual)"
  
  log_info "[SCAN] Buscando archivos SQL en 'migrations' y 'functions'..."
  has_files=false

  for file in $(find migrations -name '*.sql' 2>/dev/null | sort); do
    has_files=true
    append_file_to_output "$file"
  done

  for file in $(find functions -name '*.sql' 2>/dev/null | sort); do
    has_files=true
    append_file_to_output "$file"
  done

  if [ "$has_files" = false ]; then
    log_warning "No se encontraron archivos SQL para procesar."
    exit 0
  fi

  log_success "[DEBUG] Archivo generado para revisión: $OUTPUT_FILE"
  log_info "[NEXT] Revisa el archivo y después ejecuta:"
  echo "  • ./script.sh --ci-cd    (aplicar automáticamente)"
  echo "  • psql -f $OUTPUT_FILE   (aplicar manualmente)"
  
else
  # MODO LOCAL: Aplicar solo archivos pendientes
  readonly OUTPUT_FILE=$(mktemp --suffix=.sql)
  readonly DELETE_AFTER=true
  readonly APPLY_DB=true
  log_info "[MODE] Local: aplicando directamente a BD"
  validate_env_vars

  log_info "[INIT] Verificando existencia de tabla 'schema_migrations'..."
  if ! psql -h "$PGHOST" -U "$PGUSER" -d "$PGDATABASE" -p "$PGPORT" -v ON_ERROR_STOP=1 -c "
CREATE TABLE IF NOT EXISTS schema_migrations (
  id SERIAL PRIMARY KEY,
  filename TEXT UNIQUE NOT NULL,
  applied_at TIMESTAMPTZ DEFAULT now()
);" > /tmp/schema_table.log 2>&1; then
    log_error "Error al verificar o crear la tabla 'schema_migrations'"
    cat /tmp/schema_table.log | sed 's/^/    /'
    exit 1
  fi
  log_success "Tabla 'schema_migrations' verificada o creada correctamente"

  log_info "[STEP 1/3] Consultando migraciones ya aplicadas..."
  applied_migrations=$(psql -h "$PGHOST" -U "$PGUSER" -d "$PGDATABASE" -p "$PGPORT" -tAc "SELECT filename FROM schema_migrations;")
  log_success "$(printf '%s\n' "$applied_migrations" | grep -c '^..*$') migraciones ya aplicadas"

  log_info "[STEP 2/3] Buscando archivos pendientes en 'migrations' y 'functions'..."
  pending_files=()
  all_files=( $(find migrations -name '*.sql' 2>/dev/null | sort; find functions -name '*.sql' 2>/dev/null | sort) )
  total_files=${#all_files[@]}

  # Guardar migraciones aplicadas en archivo temporal
  applied_tmp=$(mktemp)
  printf '%s\n' "$applied_migrations" > "$applied_tmp"

  # Filtrar pendientes en bloque y poblar array con barra de progreso
  count=0
  while IFS= read -r file; do
    count=$((count+1))
    percent=$((count*100/total_files))
    bar_length=30
    filled=$((percent*bar_length/100))
    empty=$((bar_length-filled))
    printf "\r["; printf '%0.s#' $(seq 1 $filled); printf '%0.s ' $(seq 1 $empty); printf "] %3d%% (%d/%d)" "$percent" "$count" "$total_files"
    filename=$(basename "$file")
    if ! grep -Fxq "$filename" "$applied_tmp"; then
      pending_files+=("$file")
    fi
  done < <(printf '%s\n' "${all_files[@]}")
  printf "\n"
  rm -f "$applied_tmp"

  if [ ${#pending_files[@]} -eq 0 ]; then
    log_success "No hay migraciones pendientes para aplicar"
    exit 0
  fi

  log_info "Archivos pendientes encontrados: ${#pending_files[@]}"
  for file in "${pending_files[@]}"; do
    echo "  • $(basename "$file")"
  done

  log_info "[STEP 3/3] Aplicando archivos pendientes..."
  for file in "${pending_files[@]}"; do
    process_and_apply_file "$file"
  done

  if [ "$DELETE_AFTER" = true ] && [ -f "$OUTPUT_FILE" ]; then
    rm "$OUTPUT_FILE"
    log_info "[CLEAN] Archivo temporal eliminado"
  fi
fi

log_success "[DONE] Proceso completado exitosamente"