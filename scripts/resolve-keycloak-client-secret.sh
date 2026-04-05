#!/usr/bin/env bash
# Print isep-web client secret for curl / token scripts.
# Resolution order:
#   1) KEYCLOAK_CLIENT_SECRET (environment)
#   2) frontend/.env.local (first KEYCLOAK_CLIENT_SECRET= line)
#   3) frontend/.env
#   4) Realm import default (realm-isep.json isep-web client)
#
# Usage: SECRET=$(./scripts/resolve-keycloak-client-secret.sh)
# From repo root; no trailing newline in output (safe for curl -d).

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [ -n "${KEYCLOAK_CLIENT_SECRET:-}" ]; then
  printf '%s' "$KEYCLOAK_CLIENT_SECRET"
  exit 0
fi

read_secret_from_file() {
  local f="$1"
  [ -f "$f" ] || return 1
  local raw
  raw=$(grep -E '^[[:space:]]*KEYCLOAK_CLIENT_SECRET=' "$f" | tail -1 | tr -d '\r') || return 1
  [ -n "$raw" ] || return 1
  raw="${raw#*KEYCLOAK_CLIENT_SECRET=}"
  raw="${raw#"${raw%%[![:space:]]*}"}"
  raw="${raw%"${raw##*[![:space:]]}"}"
  case "$raw" in
    \"*) raw="${raw#\"}"; raw="${raw%\"}" ;;
    \'*) raw="${raw#\'}"; raw="${raw%\'}" ;;
  esac
  [ -n "$raw" ] || return 1
  printf '%s' "$raw"
}

for f in "$ROOT/frontend/.env.local" "$ROOT/frontend/.env"; do
  if s=$(read_secret_from_file "$f" 2>/dev/null); then
    printf '%s' "$s"
    exit 0
  fi
done

printf '%s' 'CHANGE-ME-IMPORT-REPLACE-WITH-SECRET'
