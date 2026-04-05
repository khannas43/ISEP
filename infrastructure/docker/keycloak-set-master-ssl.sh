#!/bin/sh
# Set master realm sslRequired to NONE so Admin Console works over HTTP (dev only).
# Run once after Keycloak is up; used by keycloak-init service.

set -e
KEYCLOAK_URL="${KEYCLOAK_URL:-http://keycloak:8080}"
ADMIN_USER="${KEYCLOAK_ADMIN:-admin}"
ADMIN_PASS="${KEYCLOAK_ADMIN_PASSWORD:-admin}"

# Keycloak 24 exposes /health/ready on management port 9000, not 8080. Use token endpoint on 8080 instead.
echo "Waiting for Keycloak at $KEYCLOAK_URL (may take 1–2 min)..."
TOKEN=""
for i in $(seq 1 60); do
  RESP=$(curl -sS --connect-timeout 5 -w "\n%{http_code}" -X POST "$KEYCLOAK_URL/realms/master/protocol/openid-connect/token" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "grant_type=password" \
    -d "client_id=admin-cli" \
    -d "username=$ADMIN_USER" \
    -d "password=$ADMIN_PASS" 2>/dev/null || true)
  HTTP_CODE=$(echo "$RESP" | tail -1)
  if [ "$HTTP_CODE" = "200" ]; then
    TOKEN=$(echo "$RESP" | sed '$d' | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
    [ -n "$TOKEN" ] && { echo "Keycloak is ready."; break; }
  fi
  [ "$i" -eq 60 ] && { echo "Timeout waiting for Keycloak (tried 5 min)."; exit 1; }
  sleep 5
done

if [ -z "$TOKEN" ]; then
  echo "Failed to get admin token."
  exit 1
fi

echo "Setting master realm sslRequired to NONE..."
HTTP_CODE=$(curl -sSf -o /dev/null -w "%{http_code}" -X PUT "$KEYCLOAK_URL/admin/realms/master" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"sslRequired":"none"}')

if [ "$HTTP_CODE" = "204" ] || [ "$HTTP_CODE" = "200" ]; then
  echo "Master realm updated (HTTP $HTTP_CODE). Admin Console can be used over HTTP."
else
  echo "Unexpected response updating realm: HTTP $HTTP_CODE"
  exit 1
fi
