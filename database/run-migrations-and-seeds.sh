#!/usr/bin/env bash
# Run all migrations and seeds against local Postgres (e.g. Docker on 5433).
# Usage: ./run-migrations-and-seeds.sh [host] [port]
# Default: host=localhost, port=5433 (docker-compose.dev exposes 5433:5432)

set -e
HOST="${1:-localhost}"
PORT="${2:-5433}"
export PGPASSWORD="${PGPASSWORD:-isep_dev_password}"
DB="isep"
USER="isep_app"
PSQL="psql -h $HOST -p $PORT -U $USER -d $DB -v ON_ERROR_STOP=1"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "Running migrations (V1..V6)..."
for f in migrations/V*.sql; do
  echo "  $f"
  $PSQL -f "$f"
done

echo "Running seeds (01, 02, 03)..."
$PSQL -f seeds/01_reference_bodies.sql
$PSQL -f seeds/02_meetings_sample.sql
$PSQL -f seeds/03_reference_data.sql

echo "Done. DB is ready."
