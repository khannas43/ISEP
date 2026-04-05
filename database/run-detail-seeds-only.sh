#!/usr/bin/env bash
# Run only seeds 04 (users) and 05 (participants + agenda for 60 meetings). Use when V6/01-03 already applied.
# Usage: ./run-detail-seeds-only.sh [host] [port]

set -e
HOST="${1:-localhost}"
PORT="${2:-5433}"
export PGPASSWORD="${PGPASSWORD:-isep_dev_password}"
DB="isep"
USER="isep_app"
PSQL="psql -h $HOST -p $PORT -U $USER -d $DB -v ON_ERROR_STOP=1"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "Running seeds 04 (users), 05 (meeting detail), 06 (status history), 07 (rich sample)..."
$PSQL -f seeds/04_seed_users.sql
$PSQL -f seeds/05_seed_meeting_detail_sample.sql
$PSQL -f seeds/06_seed_meeting_status_history.sql
$PSQL -f seeds/07_seed_meeting_rich_sample.sql

echo "Done. To restart meeting-service (from project root): cd .. && docker compose -f infrastructure/docker/docker-compose.dev.yml restart meeting-service"