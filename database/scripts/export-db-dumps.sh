#!/usr/bin/env bash
# Export ISEP PostgreSQL schema+data to repo-root dump files for GitHub / hosted restore.
# Usage: ./export-db-dumps.sh [host] [port]
# Default: localhost:5433 (ISEP docker-compose.dev Postgres)
#
# Produces (at repo root):
#   isep_dump.sql       — full plain SQL (schema + data; restore with psql)
#   isep_data_only.sql  — data only (hosted DB must already have schema/migrations)
#   isep_dump.dump      — custom format (pg_restore; client/server PG versions must match)

set -euo pipefail

HOST="${1:-localhost}"
PORT="${2:-5433}"
export PGPASSWORD="${PGPASSWORD:-isep_dev_password}"
DB="isep"
USER="isep_app"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "Exporting from ${USER}@${HOST}:${PORT}/${DB} ..."

PGCONNECT_TIMEOUT=5 psql -h "$HOST" -p "$PORT" -U "$USER" -d "$DB" -c "SELECT 1" >/dev/null

pg_dump -h "$HOST" -p "$PORT" -U "$USER" -d "$DB" \
  -F p --no-owner --no-acl \
  -f "$ROOT/isep_dump.sql"

pg_dump -h "$HOST" -p "$PORT" -U "$USER" -d "$DB" \
  --data-only -F p --no-owner --no-acl \
  -f "$ROOT/isep_data_only.sql"

pg_dump -h "$HOST" -p "$PORT" -U "$USER" -d "$DB" \
  -F c --no-owner --no-acl \
  -f "$ROOT/isep_dump.dump"

ls -lh "$ROOT"/isep_dump.sql "$ROOT"/isep_data_only.sql "$ROOT"/isep_dump.dump
echo "Done. Commit and push: isep_dump.sql, isep_data_only.sql, isep_dump.dump"
