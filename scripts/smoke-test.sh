#!/bin/bash
# ISEP Smoke Test Helper
# Usage: ./scripts/smoke-test.sh <test_number> <jwt_token>
# Get JWT: log in via app, open DevTools → Application → Cookies → next-auth session,
# or: Keycloak token endpoint (see infrastructure/keycloak/README.md)
#
# Optional env:
#   ISEP_JWT — default token if arg 2 omitted
#   ISEP_API_BASE — e.g. http://localhost:8081 (default; appends /api/v1)
#   MEETING_ID, ITEM_ID, DOC_ID — UUIDs for tests 6–7, 9–10
#   MEMBER_ID — test 7 assignee; if unset, first active MEMBER from Postgres (same host/DB as uuids)
#   SMOKE_TEST_PDF — file to upload in test 6 (default /tmp/test.pdf; created if missing)

set -euo pipefail

API_ROOT="${ISEP_API_BASE:-http://localhost:8081}"
BASE="${API_ROOT%/}/api/v1"
TOKEN="${2:-${ISEP_JWT:-}}"

# DB-only helper — no JWT required
if [ "${1:-}" = "uuids" ]; then
  echo "=== Useful UUIDs from DB ==="
  PGPASSWORD="${PGPASSWORD:-isep_dev_password}" psql -h localhost -p 5433 -U isep_app -d isep -c "
    SELECT 'meeting' as type, meeting_id::text as id, title FROM core.meetings LIMIT 5;
    SELECT 'agenda_item' as type, agenda_item_id::text as id, meeting_id::text as must_match_this_meeting, title FROM core.agenda_items ORDER BY meeting_id LIMIT 10;
    SELECT 'document' as type, document_id::text as id, title FROM documents.documents LIMIT 3;
    SELECT 'member_user' as type, user_id::text as id, full_name FROM core.users WHERE system_role = 'MEMBER' LIMIT 3;
  "
  exit 0
fi

if [ -z "$TOKEN" ]; then
  echo "Usage: $0 <test> <jwt_token>  OR  export ISEP_JWT='paste-jwt-here'  (must quote; do not use <angle brackets>)"
  exit 1
fi

AUTH="Authorization: Bearer $TOKEN"

_is_uuid() {
  [[ "${1:-}" =~ ^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$ ]]
}

_resolve_member_id_from_db() {
  PGPASSWORD="${PGPASSWORD:-isep_dev_password}" psql -h localhost -p 5433 -U isep_app -d isep -t -A -c \
    "SELECT user_id::text FROM core.users WHERE is_active AND system_role = 'MEMBER' ORDER BY created_at LIMIT 1;" 2>/dev/null || true
}

case "$1" in

  6)
    echo "=== Test 6: Document upload to agenda item ==="
    MEETING_ID="${MEETING_ID:-}"
    ITEM_ID="${ITEM_ID:-}"
    if [ -z "$MEETING_ID" ] || [ -z "$ITEM_ID" ]; then
      echo "Error: set MEETING_ID and ITEM_ID (real UUIDs). Example:"
      echo "  export MEETING_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
      echo "  export ITEM_ID=yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy"
      echo "List samples: $0 uuids"
      exit 1
    fi
    if [[ ! "$MEETING_ID" =~ ^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$ ]] \
      || [[ ! "$ITEM_ID" =~ ^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$ ]]; then
      echo "Error: MEETING_ID and ITEM_ID must be UUIDs (not placeholders)."
      exit 1
    fi
    TEST_PDF="${SMOKE_TEST_PDF:-/tmp/test.pdf}"
    if [ ! -f "$TEST_PDF" ]; then
      echo "Creating minimal PDF at $TEST_PDF (override with SMOKE_TEST_PDF=...)"
      printf '%%PDF-1.1\n1 0 obj<<>>endobj\ntrailer<<>>\n%%%%EOF\n' > "$TEST_PDF"
    fi
    echo "Using meeting=$MEETING_ID item=$ITEM_ID file=$TEST_PDF"
    curl -sS -w "\nHTTP %{http_code}\n" \
      -H "$AUTH" \
      -F "file=@${TEST_PDF}" \
      "$BASE/meetings/$MEETING_ID/agenda/$ITEM_ID/documents/upload"
    echo ""
    echo "Check DB: SELECT document_id, minio_object_key, status FROM documents.documents ORDER BY created_at DESC LIMIT 1;"
    ;;

  7)
    echo "=== Test 7: Create task + member dashboard ==="
    MEETING_ID="${MEETING_ID:-}"
    ITEM_ID="${ITEM_ID:-}"
    if [ -z "$MEETING_ID" ] || [ -z "$ITEM_ID" ]; then
      echo "Error: set MEETING_ID and ITEM_ID. Example: $0 uuids"
      exit 1
    fi
    if ! _is_uuid "$MEETING_ID" || ! _is_uuid "$ITEM_ID"; then
      echo "Error: MEETING_ID and ITEM_ID must be UUIDs."
      exit 1
    fi
    MEMBER_ID="${MEMBER_ID:-}"
    if [ -z "$MEMBER_ID" ]; then
      MEMBER_ID="$(_resolve_member_id_from_db)"
      echo "Resolved MEMBER_ID from DB: $MEMBER_ID"
    fi
    if [ -z "$MEMBER_ID" ] || ! _is_uuid "$MEMBER_ID"; then
      echo "Error: set MEMBER_ID or ensure Postgres has an active user with system_role = 'MEMBER'."
      echo "List samples: $0 uuids"
      exit 1
    fi
    echo "Using meeting=$MEETING_ID item=$ITEM_ID member=$MEMBER_ID"
    TOMORROW=$(date -d '+1 day' +%Y-%m-%d 2>/dev/null || date -v+1d +%Y-%m-%d)
    curl -sS -w "\nHTTP %{http_code}\n" \
      -H "$AUTH" \
      -H "Content-Type: application/json" \
      -d "{
        \"meetingId\": \"$MEETING_ID\",
        \"agendaItemId\": \"$ITEM_ID\",
        \"title\": \"Smoke test task $(date +%s)\",
        \"assignedTo\": [\"$MEMBER_ID\"],
        \"dueDate\": \"$TOMORROW\",
        \"priority\": \"HIGH\"
      }" \
      "$BASE/tasks"
    echo ""
    echo "Now log in as MEMBER and hit: GET $BASE/tasks/my"
    ;;

  9)
    echo "=== Test 9: Version diff ==="
    DOC_ID="${DOC_ID:-}"
    if [ -z "$DOC_ID" ] || ! _is_uuid "$DOC_ID"; then
      echo "Error: set DOC_ID to a document UUID. Example: $0 uuids"
      exit 1
    fi
    echo "Using document=$DOC_ID"
    _diff_tmp="$(mktemp)"
    HTTP_DIFF=$(curl -sS -o "$_diff_tmp" -w "%{http_code}" \
      -H "$AUTH" \
      "$BASE/documents/$DOC_ID/diff?fromVersion=1&toVersion=2")
    head -100 "$_diff_tmp"
    echo ""
    echo "HTTP $HTTP_DIFF"
    echo ""
    echo "Changes count (should be > 0 after demo-seed patch):"
    python3 - "$_diff_tmp" <<'PY'
import json, sys
with open(sys.argv[1]) as f:
    d = json.load(f)
c = d.get("changes", [])
changed = [x for x in c if x.get("type") != "UNCHANGED"]
print(f"Total chunks: {len(c)}, Changed: {len(changed)}")
PY
    rm -f "$_diff_tmp"
    ;;

  10)
    echo "=== Test 10: Clean copy generation ==="
    DOC_ID="${DOC_ID:-}"
    if [ -z "$DOC_ID" ] || ! _is_uuid "$DOC_ID"; then
      echo "Error: set DOC_ID to a document UUID. Example: $0 uuids"
      exit 1
    fi
    echo "Using document=$DOC_ID"
    curl -sS -w "\nHTTP %{http_code}\n" \
      -H "$AUTH" \
      -H "Content-Type: application/json" \
      -d '{"fromVersion":1,"toVersion":2,"strategy":"ACCEPT_ALL"}' \
      "$BASE/documents/$DOC_ID/clean-copy"
    ;;

  *)
    echo "Tests: 6 (upload) | 7 (task) | 9 (diff) | 10 (clean-copy) | uuids"
    echo "API base: $API_ROOT (override with ISEP_API_BASE)"
    ;;
esac
