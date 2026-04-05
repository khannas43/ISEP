#!/usr/bin/env bash
# Use when the full run-migrations-and-seeds.sh failed because tables already exist (e.g. V2).
# Runs V6 (reference_data) and all seeds so dropdowns and sample meetings work.
# Usage: ./run-remaining-and-seeds.sh [host] [port]

set -e
HOST="${1:-localhost}"
PORT="${2:-5433}"
export PGPASSWORD="${PGPASSWORD:-isep_dev_password}"
DB="isep"
USER="isep_app"
PSQL="psql -h $HOST -p $PORT -U $USER -d $DB -v ON_ERROR_STOP=1"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "Creating reference_data table (V6) if not exists..."
$PSQL -f migrations/V6__reference_data.sql

echo "Creating meeting_status_history table (V7) if not exists..."
$PSQL -f migrations/V7__meeting_status_history.sql

echo "Adding agenda assigned_coordinator (V8) if not exists..."
$PSQL -f migrations/V8__agenda_assigned_coordinator.sql

echo "Creating meeting_correspondence_groups table (V12) if not exists..."
$PSQL -f migrations/V12__meeting_correspondence_groups.sql

echo "Creating user_body_assignments table (V13) if not exists..."
$PSQL -f migrations/V13__user_body_assignments.sql

echo "Creating system_config and announcements tables (V14) if not exists..."
$PSQL -f migrations/V14__system_config_and_announcements.sql

echo "Running seeds (01–09: bodies, 70 meetings, reference, users, detail, status history, rich sample, CGs, tasks/papers/notifications/audit)..."
$PSQL -f seeds/01_reference_bodies.sql
$PSQL -f seeds/02_meetings_sample.sql
$PSQL -f seeds/03_reference_data.sql
$PSQL -f seeds/04_seed_users.sql
$PSQL -f seeds/05_seed_meeting_detail_sample.sql
$PSQL -f seeds/06_seed_meeting_status_history.sql
$PSQL -f seeds/07_seed_meeting_rich_sample.sql
$PSQL -f seeds/08_seed_correspondence_groups.sql
$PSQL -f seeds/09_seed_tasks_papers_notifications_audit.sql

echo "Done."
echo "  - To verify data: PGPASSWORD=isep_dev_password psql -h ${HOST} -p ${PORT} -U ${USER} -d ${DB} -f scripts/verify-meeting-data.sql"
echo "  - To use in app: rebuild meeting-service so new endpoints (participants, tasks, status-history, correspondence-groups) are loaded:"
echo "    cd to project root then: docker compose -f infrastructure/docker/docker-compose.dev.yml up -d --build meeting-service"
