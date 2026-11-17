#!/bin/bash

# Verificar que se ejecuta con bash (no sh/dash/zsh)
if [ -z "${BASH_VERSION:-}" ]; then
  echo "ERROR: Este script debe ejecutarse con bash"
  echo "  Solucion: bash $0 $*"
  exit 1
fi

set -euo pipefail

# ---------------------------------------------------------------------------
# SALIDA / LOGS
#   - Colores y animacion solo si la salida es una terminal (no al redirigir).
#   - NO_COLOR=1 desactiva los colores.
# ---------------------------------------------------------------------------
IS_TTY=0
if [ -t 1 ] && [ "${TERM:-dumb}" != "dumb" ]; then IS_TTY=1; fi

if [ "$IS_TTY" = 1 ] && [ -z "${NO_COLOR:-}" ]; then
  C_RST=$'\033[0m'; C_DIM=$'\033[2m'; C_BOLD=$'\033[1m'
  C_RED=$'\033[31m'; C_GRN=$'\033[32m'; C_YEL=$'\033[33m'; C_CYN=$'\033[36m'
else
  C_RST=""; C_DIM=""; C_BOLD=""; C_RED=""; C_GRN=""; C_YEL=""; C_CYN=""
fi

CLR=$'\r\033[K'          # volver al inicio de la linea y borrarla
FRAMES='|/-\'            # cuadros del indicador animado
TOTAL_STEPS=5
STEP_N=0
BEGIN_T=$SECONDS

hr()   { printf '  %s%s%s\n' "$C_DIM" "------------------------------------------------------" "$C_RST"; }
step() { STEP_N=$((STEP_N + 1)); printf '\n%s[%d/%d] %s%s\n' "$C_BOLD" "$STEP_N" "$TOTAL_STEPS" "$1" "$C_RST"; }
info() { printf '  %s[INFO]%s %s\n' "$C_CYN" "$C_RST" "$*"; }
ok()   { printf '  %s[ OK ]%s %s\n' "$C_GRN" "$C_RST" "$*"; }
warn() { printf '  %s[WARN]%s %s\n' "$C_YEL" "$C_RST" "$*"; }
err()  { printf '  %s[FAIL]%s %s\n' "$C_RED" "$C_RST" "$*"; }
kv()   { printf '         %s%-14s%s %s\n' "$C_DIM" "$1" "$C_RST" "$2"; }

# Para llamadas rapidas: begin muestra "[ .. ] mensaje" y done_ok/done_fail lo reemplaza
begin() {
  BEGIN_T=$SECONDS
  if [ "$IS_TTY" = 1 ]; then printf '  %s[ .. ]%s %s' "$C_CYN" "$C_RST" "$1"; fi
}
done_ok() {
  if [ "$IS_TTY" = 1 ]; then printf '%s' "$CLR"; fi
  ok "$1  ${C_DIM}($((SECONDS - BEGIN_T))s)${C_RST}"
}
done_fail() {
  if [ "$IS_TTY" = 1 ]; then printf '%s' "$CLR"; fi
  err "$1"
}

# Para esperas largas: anima un indicador mientras el proceso PID siga vivo.
#   spin "mensaje" PID [segundo_inicio] [limite_segundos]
# Devuelve el codigo de salida del proceso.
spin() {
  local msg="$1" pid="$2" t0="${3:-$SECONDS}" limit="${4:-}" i=0 rc=0 elapsed shown
  if [ "$IS_TTY" = 1 ]; then
    while kill -0 "$pid" 2>/dev/null; do
      elapsed=$((SECONDS - t0))
      if [ -n "$limit" ]; then shown="${elapsed}s/${limit}s"; else shown="${elapsed}s"; fi
      printf '%s  %s[ %s ]%s %s %s(%s)%s' "$CLR" "$C_CYN" "${FRAMES:$((i % 4)):1}" "$C_RST" "$msg" "$C_DIM" "$shown" "$C_RST"
      i=$((i + 1))
      sleep 0.15
    done
    printf '%s' "$CLR"
  fi
  wait "$pid" || rc=$?
  return $rc
}

fmt_time() { printf '%02d:%02d:%02d' $(($1 / 3600)) $((($1 % 3600) / 60)) $(($1 % 60)); }

# Segundos -> "3h 12m" / "45m" / "20s"
fmt_age() {
  local s=$1
  if [ "$s" -ge 3600 ]; then printf '%dh %02dm' $((s / 3600)) $(((s % 3600) / 60))
  elif [ "$s" -ge 60 ]; then printf '%dm' $((s / 60))
  else printf '%ds' "$s"; fi
}

# Fecha de AWS (ISO 8601 o epoch) -> epoch. Funciona con date de GNU y de macOS.
to_epoch() {
  local ts="$1" e clean
  if [[ "$ts" =~ ^[0-9]+(\.[0-9]+)?$ ]]; then echo "${ts%.*}"; return 0; fi
  if e=$(date -d "$ts" +%s 2>/dev/null); then echo "$e"; return 0; fi
  clean=$(echo "$ts" | sed -E 's/\.[0-9]+//; s/([+-][0-9]{2}):([0-9]{2})$/\1\2/; s/Z$/+0000/')
  if e=$(date -j -f "%Y-%m-%dT%H:%M:%S%z" "$clean" +%s 2>/dev/null); then echo "$e"; return 0; fi
  echo ""
}

# Solo lectura: imprime "arn<TAB>estado<TAB>creada" por cada task viva del cluster.
# Falla (codigo != 0) si no se puede consultar, por ejemplo por falta de permisos.
list_active_tasks() {
  local c="$1" arns
  arns=$(aws ecs list-tasks --cluster "$c" --region "$REGION" \
    --query 'taskArns[]' --output text 2>/dev/null) || return 1
  [ -z "$arns" ] && return 0
  # shellcheck disable=SC2086
  aws ecs describe-tasks --cluster "$c" --tasks $arns --region "$REGION" \
    --query 'tasks[].[taskArn,lastStatus,createdAt,startedBy]' --output text 2>/dev/null
}

# Lee por stdin las lineas de list_active_tasks y las imprime con su antiguedad
print_task_rows() {
  local arn st created by ep age now
  now=$(date +%s)
  while IFS=$'\t' read -r arn st created by; do
    if [ -z "$arn" ]; then continue; fi
    ep=$(to_epoch "$created")
    if [ -n "$ep" ]; then age="lleva $(fmt_age $((now - ep)))"; else age="$created"; fi
    # startedBy viene vacio o "None" si la task se lanzo con una version anterior del script
    if [ -z "$by" ] || [ "$by" = "None" ]; then by="desconocido"; fi
    printf '         %s%-33s%s %-10s %-13s por %s\n' "$C_DIM" "${arn##*/}" "$C_RST" "$st" "$age" "$by"
  done
}

# Consulta las tasks activas de un cluster mostrando el indicador animado.
# Deja el resultado en ROWS. Devuelve != 0 si no se pudo consultar.
#   fetch_active "cluster" "mensaje"
SPIN_TMP=""
ROWS=""
fetch_active() {
  local tmp rc=0
  if [ "$IS_TTY" != 1 ]; then info "$2"; fi
  tmp=$(mktemp)
  SPIN_TMP="$tmp"
  list_active_tasks "$1" > "$tmp" 2>/dev/null &
  spin "$2" $! || rc=$?
  ROWS=$(cat "$tmp")
  rm -f "$tmp"
  SPIN_TMP=""
  return $rc
}

# Detiene las tasks listadas (lineas "arn<TAB>estado<TAB>creada") de un cluster.
# Acumula resultados en STOP_OK y STOP_FAILS.
#   stop_listed_tasks "cluster" "$ROWS"
STOP_OK=0
STOP_FAILS=0
stop_listed_tasks() {
  local c="$1" rows="$2" arn st created by
  while IFS=$'\t' read -r arn st created by; do
    if [ -z "$arn" ]; then continue; fi
    begin "Deteniendo ${arn##*/}"
    if aws ecs stop-task --cluster "$c" --task "$arn" --region "$REGION" >/dev/null 2>&1; then
      done_ok "Detenida: ${arn##*/}"
      STOP_OK=$((STOP_OK + 1))
    else
      done_fail "No se pudo detener: ${arn##*/}"
      STOP_FAILS=$((STOP_FAILS + 1))
    fi
  done <<< "$rows"
}

# ---------------------------------------------------------------------------
# CONFIGURACION
# ---------------------------------------------------------------------------
REGION="us-west-2"
SUBNET="subnet-0289e8971174aa940"
SG="sg-0c406654102e52a7e"

# Tiempo maximo de vida de la task (segundos). Se cuenta despues de instalar socat.
# La task se mata sola pasado este tiempo aunque este script muera.
# Ejemplo: MAX_SECONDS=3600 ./rds-proxy.sh dev
MAX_SECONDS="${MAX_SECONDS:-7200}"

# Tamano de la task. Un proxy socat no necesita 1 vCPU / 2 GB (lo que tiene hoy
# la task definition). 0.25 vCPU / 0.5 GB es suficiente y cuesta ~4x menos.
# Para usar lo que dice la task definition: TASK_CPU= TASK_MEMORY= ./rds-proxy.sh dev
TASK_CPU="${TASK_CPU-256}"
TASK_MEMORY="${TASK_MEMORY-512}"

# Segundos maximos esperando a que el puerto 5432 responda
PORT_WAIT_MAX="${PORT_WAIT_MAX:-150}"

# ---------------------------------------------------------------------------
# MODO STATUS: solo consulta, no lanza ni detiene nada.
#   ./rds-proxy.sh status
# ---------------------------------------------------------------------------
if [ "${1:-}" = "status" ]; then
  echo ""
  printf '  %sRDS PROXY STATUS%s   region: %s\n' "$C_BOLD" "$C_RST" "$REGION"
  hr
  # Ctrl+C durante la consulta: limpiar y salir sin dejar nada colgado
  trap 'kill $(jobs -p) 2>/dev/null || true; rm -f "${SPIN_TMP:-}"; if [ "$IS_TTY" = 1 ]; then printf "%s" "$CLR"; fi; exit 130' INT TERM HUP
  TOTAL_ACTIVE=0
  for env_name in dev prod; do
    c="rds-access-cluster-$env_name"
    if ! fetch_active "$c" "Consultando $env_name ($c)"; then
      warn "$env_name: no se pudo consultar $c (permisos o red)"
      continue
    fi
    if [ -z "$ROWS" ]; then
      ok "$env_name: sin tasks activas"
    else
      N=$(printf '%s\n' "$ROWS" | awk 'NF' | wc -l | tr -d ' ')
      TOTAL_ACTIVE=$((TOTAL_ACTIVE + N))
      warn "$env_name: $N task(s) activa(s) en $c"
      printf '%s\n' "$ROWS" | print_task_rows
    fi
  done
  hr
  if [ "$TOTAL_ACTIVE" -gt 0 ]; then
    info "Para detenerlas: ./rds-proxy.sh stop"
  else
    ok "Nada encendido, no hay costo corriendo"
  fi
  echo ""
  exit 0
fi

# ---------------------------------------------------------------------------
# MODO STOP: detiene tasks activas (reemplaza a rds-proxy-sweep.sh).
#   ./rds-proxy.sh stop              # dev y prod, pregunta por cada cluster
#   ./rds-proxy.sh stop dev          # solo dev
#   ./rds-proxy.sh stop all --yes    # sin preguntar (para cron / EventBridge)
# No necesita .env.
# ---------------------------------------------------------------------------
if [ "${1:-}" = "stop" ]; then
  STOP_SCOPE="all"
  AUTO_YES=0
  for a in "${@:2}"; do
    case "$a" in
      dev|prod|all) STOP_SCOPE="$a" ;;
      --yes|-y)     AUTO_YES=1 ;;
      *)
        err "Argumento desconocido: $a"
        echo "         Uso: $0 stop [dev|prod|all] [--yes]"
        exit 1
        ;;
    esac
  done
  if [ "$STOP_SCOPE" = "all" ]; then STOP_ENVS="dev prod"; else STOP_ENVS="$STOP_SCOPE"; fi

  echo ""
  printf '  %sRDS PROXY STOP%s   region: %s\n' "$C_BOLD" "$C_RST" "$REGION"
  hr
  trap 'kill $(jobs -p) 2>/dev/null || true; rm -f "${SPIN_TMP:-}"; if [ "$IS_TTY" = 1 ]; then printf "%s" "$CLR"; fi; exit 130' INT TERM HUP

  QUERY_FAILS=0
  SKIPPED=0
  DECLINED=0
  for env_name in $STOP_ENVS; do
    c="rds-access-cluster-$env_name"
    if ! fetch_active "$c" "Consultando $env_name ($c)"; then
      warn "$env_name: no se pudo consultar $c (permisos o red)"
      QUERY_FAILS=$((QUERY_FAILS + 1))
      continue
    fi
    if [ -z "$ROWS" ]; then
      ok "$env_name: sin tasks activas"
      continue
    fi
    N=$(printf '%s\n' "$ROWS" | awk 'NF' | wc -l | tr -d ' ')
    warn "$env_name: $N task(s) activa(s) en $c"
    printf '%s\n' "$ROWS" | print_task_rows

    if [ "$AUTO_YES" != 1 ]; then
      if [ ! -t 0 ]; then
        warn "Sin terminal: usa --yes para detener sin preguntar"
        SKIPPED=1
        continue
      fi
      read -r -p "  Detener estas $N task(s) de $env_name? [y/N] " ans || ans=""
      if ! [[ "$ans" =~ ^[yY]$ ]]; then
        info "Omitido: $env_name"
        DECLINED=1
        continue
      fi
    fi
    stop_listed_tasks "$c" "$ROWS"
  done

  hr
  if [ "$STOP_FAILS" -gt 0 ]; then
    err "$STOP_FAILS task(s) no se pudieron detener (revisa permisos: ecs:StopTask)"
  fi
  if [ "$STOP_OK" -gt 0 ]; then
    ok "$STOP_OK task(s) detenida(s)"
  elif [ "$DECLINED" -eq 1 ]; then
    info "No se detuvo ninguna task"
  elif [ "$STOP_FAILS" -eq 0 ] && [ "$QUERY_FAILS" -eq 0 ] && [ "$SKIPPED" -eq 0 ]; then
    ok "Nada que detener"
  fi
  echo ""
  if [ "$STOP_FAILS" -gt 0 ] || [ "$QUERY_FAILS" -gt 0 ] || [ "$SKIPPED" -gt 0 ]; then exit 1; fi
  exit 0
fi

RDS_TARGET=${1:-"dev"}

case $RDS_TARGET in
  "dev")
    CLUSTER="rds-access-cluster-dev"
    TASK_DEF="my-rds-access-task"
    ;;
  "prod")
    CLUSTER="rds-access-cluster-prod"
    TASK_DEF="my-rds-access-task-prod"
    ;;
  *)
    err "Entorno desconocido: $RDS_TARGET"
    echo "         Opciones disponibles: dev, prod, status, stop"
    echo "         Uso: $0 [dev|prod|status|stop]"
    exit 1
    ;;
esac

# ---------------------------------------------------------------------------
# LIMPIEZA: una sola funcion para cualquier salida (fin normal, error, Ctrl+C,
# cierre de terminal). Detiene la task si quedo viva.
# ---------------------------------------------------------------------------
TASK_ARN=""
TASK_STOPPED=0

on_exit() {
  local rc=$?
  trap - EXIT INT TERM HUP
  if [ "$IS_TTY" = 1 ]; then printf '%s' "$CLR"; fi

  local pids
  pids=$(jobs -p) || true
  if [ -n "$pids" ]; then kill $pids 2>/dev/null || true; fi
  if [ -n "${SPIN_TMP:-}" ]; then rm -f "$SPIN_TMP"; fi

  if [ -n "$TASK_ARN" ] && [ "$TASK_STOPPED" != 1 ]; then
    echo ""
    begin "Deteniendo task del proxy"
    if aws ecs stop-task --cluster "$CLUSTER" --task "$TASK_ARN" --region "$REGION" >/dev/null 2>&1; then
      done_ok "Task detenida. Acceso a RDS cerrado"
    else
      done_fail "No se pudo detener la task. Detenla manualmente:"
      echo "         aws ecs stop-task --cluster $CLUSTER --task $TASK_ARN --region $REGION"
    fi
  fi
  exit "$rc"
}

# INT/TERM/HUP se convierten en exit, y EXIT dispara on_exit una sola vez
trap 'exit 130' INT
trap 'exit 143' TERM
trap 'exit 129' HUP
trap on_exit EXIT

# ---------------------------------------------------------------------------
# ENCABEZADO
# ---------------------------------------------------------------------------
echo ""
printf '  %sRDS PROXY%s   entorno: %s%s%s   region: %s\n' "$C_BOLD" "$C_RST" "$C_BOLD" "$RDS_TARGET" "$C_RST" "$REGION"
hr

# ---------------------------------------------------------------------------
# REVISION PREVIA: avisa si ya hay tasks vivas en este cluster (solo lectura).
# No detiene nada: puede ser la sesion de otra persona.
# ---------------------------------------------------------------------------
fetch_active "$CLUSTER" "Revisando tasks activas en $CLUSTER" || true
ACTIVE_ROWS="$ROWS"
if [ -n "$ACTIVE_ROWS" ]; then
  N_ACTIVE=$(printf '%s\n' "$ACTIVE_ROWS" | awk 'NF' | wc -l | tr -d ' ')
  echo ""
  warn "Ya hay $N_ACTIVE task(s) activa(s) en $CLUSTER"
  printf '%s\n' "$ACTIVE_ROWS" | print_task_rows
  kv "nota" "puede ser una sesion tuya olvidada o de otra persona"
  if [ -t 0 ]; then
    read -r -p "  [s] Detener y continuar   [y] Continuar sin detener   [N] Cancelar: " ans || ans=""
    case "$ans" in
      s|S)
        stop_listed_tasks "$CLUSTER" "$ACTIVE_ROWS"
        if [ "$STOP_FAILS" -gt 0 ]; then
          warn "Algunas tasks no se pudieron detener; se continua de todos modos"
        fi
        ;;
      y|Y)
        ;;
      *)
        info "Cancelado, no se lanzo ninguna task"
        echo ""
        exit 0
        ;;
    esac
  else
    info "Modo no interactivo: se continua"
  fi
fi

# ---------------------------------------------------------------------------
# [1/5] PREPARAR
# ---------------------------------------------------------------------------
step "Preparar"
begin "Cargando .env y leyendo la task definition"

if [ ! -f ".env" ]; then
  done_fail "No se encontro el archivo .env en $(pwd)"
  exit 1
fi

set -a
# shellcheck disable=SC1091
source .env
set +a

if ! CONTAINER_NAME=$(aws ecs describe-task-definition \
      --task-definition "$TASK_DEF" \
      --region "$REGION" \
      --query 'taskDefinition.containerDefinitions[0].name' \
      --output text); then
  done_fail "No se pudo leer la task definition $TASK_DEF"
  exit 1
fi

# Quien lanza la task: se guarda en el campo startedBy de ECS (max 128 caracteres)
# para poder identificarla despues en status / stop.
#   usuario IAM:  arn:...:user/dportillo                 -> dportillo
#   SSO / rol:    arn:...:assumed-role/Rol/correo@x.com  -> correo@x.com
LAUNCHER=$(aws sts get-caller-identity --query Arn --output text 2>/dev/null || true)
LAUNCHER="${LAUNCHER##*/}"
if [ -z "$LAUNCHER" ] || [ "$LAUNCHER" = "None" ]; then LAUNCHER="$(whoami)"; fi
STARTED_BY="${LAUNCHER}@$(hostname -s 2>/dev/null || echo host)"
STARTED_BY="${STARTED_BY:0:128}"

# Mismo comando que ya tiene la task definition, pero con limite de vida.
# ${PGHOST} NO se expande aqui: se expande dentro del contenedor, con el valor
# de la variable de entorno PGHOST que ya trae la task definition (dev o prod).
# Al terminar el sleep, el sh sale, el contenedor se detiene y la task muere
# (es run-task, no service, asi que ECS no la reinicia).
CMD="apk add --no-cache socat >/dev/null && echo 'Proxy RDS iniciado automaticamente' && { socat TCP-LISTEN:5432,fork,reuseaddr TCP:\${PGHOST}:5432 & P=\$!; sleep ${MAX_SECONDS}; kill \$P; }"

SIZE_JSON=""
if [ -n "$TASK_CPU" ] && [ -n "$TASK_MEMORY" ]; then
  SIZE_JSON="\"cpu\":\"$TASK_CPU\",\"memory\":\"$TASK_MEMORY\","
  SIZE_LABEL="$(awk "BEGIN{print $TASK_CPU/1024}") vCPU / $(awk "BEGIN{print $TASK_MEMORY/1024}") GB"
else
  SIZE_LABEL="segun task definition"
fi

OVERRIDES_JSON=$(printf '{%s"containerOverrides":[{"name":"%s","command":["/bin/sh","-c","%s"]}]}' \
  "$SIZE_JSON" "$CONTAINER_NAME" "$CMD")

done_ok "Configuracion lista"
kv "cluster" "$CLUSTER"
kv "task def" "$TASK_DEF"
kv "tamano" "$SIZE_LABEL"
kv "duracion max" "$((MAX_SECONDS / 60)) min (se apaga sola)"
kv "lanzado por" "$STARTED_BY"

# ---------------------------------------------------------------------------
# [2/5] LANZAR TASK
# ---------------------------------------------------------------------------
step "Lanzar task en Fargate"
begin "Creando task"

if ! RAW_ARN=$(aws ecs run-task \
      --cluster "$CLUSTER" \
      --task-definition "$TASK_DEF" \
      --launch-type FARGATE \
      --region "$REGION" \
      --network-configuration "awsvpcConfiguration={subnets=[$SUBNET],securityGroups=[$SG],assignPublicIp=ENABLED}" \
      --overrides "$OVERRIDES_JSON" \
      --started-by "$STARTED_BY" \
      --query 'tasks[0].taskArn' --output text); then
  done_fail "aws ecs run-task fallo"
  exit 1
fi

if [ "$RAW_ARN" == "None" ] || [ -z "$RAW_ARN" ]; then
  done_fail "No se pudo lanzar la task (respuesta vacia)"
  exit 1
fi

# A partir de aqui on_exit se encarga de detenerla pase lo que pase
TASK_ARN="$RAW_ARN"
done_ok "Task creada: ${TASK_ARN##*/}"

# ---------------------------------------------------------------------------
# [3/5] ESPERAR A QUE ESTE RUNNING
# ---------------------------------------------------------------------------
step "Esperar a que la task inicie"
aws ecs wait tasks-running --cluster "$CLUSTER" --tasks "$TASK_ARN" --region "$REGION" >/dev/null 2>&1 &
WAIT_PID=$!
W0=$SECONDS
if spin "Aprovisionando contenedor" "$WAIT_PID"; then
  ok "Task en estado RUNNING  ${C_DIM}($((SECONDS - W0))s)${C_RST}"
else
  err "La task no llego a RUNNING"
  aws ecs describe-tasks --cluster "$CLUSTER" --tasks "$TASK_ARN" --region "$REGION" \
    --query 'tasks[0].[stoppedReason,containers[0].reason]' --output text 2>/dev/null \
    | sed 's/^/         /' || true
  exit 1
fi
RUN_START=$SECONDS

# ---------------------------------------------------------------------------
# [4/5] IP PUBLICA
# ---------------------------------------------------------------------------
step "Obtener IP publica"
begin "Consultando interfaz de red"

NETWORK_INTERFACE=$(aws ecs describe-tasks \
  --cluster "$CLUSTER" \
  --tasks "$TASK_ARN" \
  --region "$REGION" \
  --query 'tasks[0].attachments[0].details[?name==`networkInterfaceId`].value' \
  --output text)

PUBLIC_IP=$(aws ec2 describe-network-interfaces \
  --network-interface-ids "$NETWORK_INTERFACE" \
  --region "$REGION" \
  --query 'NetworkInterfaces[0].Association.PublicIp' \
  --output text)

if [ -z "$PUBLIC_IP" ] || [ "$PUBLIC_IP" == "None" ]; then
  done_fail "La task no tiene IP publica asignada"
  exit 1
fi
done_ok "IP publica: $PUBLIC_IP"

# ---------------------------------------------------------------------------
# [5/5] ESPERAR AL PROXY (apk add + socat, en vez de un sleep fijo)
# ---------------------------------------------------------------------------
step "Esperar a que el proxy responda"

port_open() {
  if command -v nc >/dev/null 2>&1; then
    nc -z -w 2 "$PUBLIC_IP" 5432 >/dev/null 2>&1
  elif command -v timeout >/dev/null 2>&1; then
    timeout 2 bash -c "exec 3<>/dev/tcp/$PUBLIC_IP/5432" >/dev/null 2>&1
  else
    (exec 3<>"/dev/tcp/$PUBLIC_IP/5432") >/dev/null 2>&1
  fi
}

P0=$SECONDS
READY=0
LAST_NOTE=0
while [ $((SECONDS - P0)) -lt "$PORT_WAIT_MAX" ]; do
  port_open &
  if spin "Probando ${PUBLIC_IP}:5432 (instalando socat)" $! "$P0" "$PORT_WAIT_MAX"; then
    READY=1
    break
  fi
  # En terminales sin animacion, avisar cada ~20s para que no parezca congelado
  if [ "$IS_TTY" != 1 ] && [ $((SECONDS - P0 - LAST_NOTE)) -ge 20 ]; then
    info "Sin respuesta aun ($((SECONDS - P0))s/${PORT_WAIT_MAX}s)"
    LAST_NOTE=$((SECONDS - P0))
  fi
  sleep 2 &
  spin "Probando ${PUBLIC_IP}:5432 (instalando socat)" $! "$P0" "$PORT_WAIT_MAX" || true
done

if [ "$READY" -ne 1 ]; then
  MY_IP=$(curl -s --max-time 5 https://checkip.amazonaws.com || echo "desconocida")
  err "El puerto 5432 no respondio en ${PORT_WAIT_MAX}s (se detendra la task)"
  kv "tu IP actual" "$MY_IP"
  kv "si fue timeout" "tu IP probablemente no esta permitida en el SG $SG"
  kv "si fue refused" "socat no arranco dentro de la task"
  printf '         %sIPs permitidas hoy en el 5432:%s\n' "$C_DIM" "$C_RST"
  aws ec2 describe-security-groups --group-ids "$SG" --region "$REGION" \
    --query 'SecurityGroups[0].IpPermissions[?ToPort==`5432`].IpRanges[].CidrIp' \
    --output text 2>/dev/null | tr '\t' '\n' | sed 's/^/           /' || true
  exit 1
fi
ok "Proxy respondiendo  ${C_DIM}($((SECONDS - P0))s)${C_RST}"

# ---------------------------------------------------------------------------
# RESUMEN
# ---------------------------------------------------------------------------
echo ""
hr
printf '  %sPROXY LISTO%s\n' "$C_BOLD" "$C_RST"
kv "host" "$PUBLIC_IP"
kv "puerto" "5432"
kv "entorno" "$RDS_TARGET"
kv "limite" "$((MAX_SECONDS / 60)) min (aprox)"
hr
echo "  Como usarlo:"
echo "    1. En tu .env cambia temporalmente:  PGHOST=$PUBLIC_IP"
echo "    2. Ejecuta tus scripts normales:     ./apply-pending.sh"
echo "    3. O conecta directo:                psql -h $PUBLIC_IP -p 5432 -U <usuario> -d <base>"
echo ""
echo "  Para detener: Ctrl+C (la task se cierra automaticamente)"
echo ""

# ---------------------------------------------------------------------------
# MONITOREO: linea viva con tiempo activo y restante. Revisa la task cada 30s.
# El restante se calcula desde que la task paso a RUNNING, asi que es una
# estimacion conservadora (el limite real es unos segundos mayor).
# ---------------------------------------------------------------------------
i=0
while true; do
  if [ $((i % 30)) -eq 0 ]; then
    STATUS=$(aws ecs describe-tasks --cluster "$CLUSTER" --tasks "$TASK_ARN" --region "$REGION" \
      --query 'tasks[0].lastStatus' --output text 2>/dev/null || echo "UNKNOWN")
    if [ "$STATUS" = "STOPPED" ]; then
      TASK_STOPPED=1
      if [ "$IS_TTY" = 1 ]; then printf '%s' "$CLR"; fi
      echo ""
      warn "La task ya se detuvo (limite de tiempo alcanzado o detenida externamente)"
      exit 0
    fi
  fi

  UP=$((SECONDS - RUN_START))
  REM=$((MAX_SECONDS - UP))
  if [ "$REM" -lt 0 ]; then REM=0; fi

  if [ "$IS_TTY" = 1 ]; then
    printf '%s  %s[ %s ]%s Proxy activo   %s activo   ~%s restante   %s(Ctrl+C: detener)%s' \
      "$CLR" "$C_GRN" "${FRAMES:$((i % 4)):1}" "$C_RST" "$(fmt_time "$UP")" "$(fmt_time "$REM")" "$C_DIM" "$C_RST"
  elif [ $((i % 300)) -eq 0 ]; then
    info "Proxy activo: $(fmt_time "$UP") activo, ~$(fmt_time "$REM") restante"
  fi

  i=$((i + 1))
  sleep 1
done