#!/usr/bin/env bash
# Create admin-sa user in isep-realm (use if realm was imported without users).
# Keycloak Admin: admin / admin at http://localhost:8180
# Requires: curl, jq. Usage: ./create-admin-sa-user.sh [keycloak_url]
set -e
KC_URL="${1:-http://localhost:8180}"
REALM="isep-realm"
USERNAME="admin-sa"
PASSWORD="Admin@12345!"
ADMIN_USER="admin"
ADMIN_PASS="admin"

echo "Getting admin token from $KC_URL..."
TOKEN=$(curl -s -X POST "$KC_URL/realms/master/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=$ADMIN_USER" \
  -d "password=$ADMIN_PASS" \
  -d "grant_type=password" \
  -d "client_id=admin-cli" \
  | jq -r '.access_token')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo "Failed to get admin token. Is Keycloak running at $KC_URL? (admin/admin)"
  exit 1
fi

echo "Creating user $USERNAME in realm $REALM..."
TMP_HEADERS=$(mktemp)
HTTP_CODE=$(curl -s -w "%{http_code}" -o /dev/null -D "$TMP_HEADERS" -X POST "$KC_URL/admin/realms/$REALM/users" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username":"'"$USERNAME"'","email":"admin-sa@isep.local","enabled":true,"emailVerified":true,"firstName":"Admin","lastName":"SA"}')

if [ "$HTTP_CODE" = "201" ]; then
  LOCATION=$(grep -i "^location:" "$TMP_HEADERS" | awk '{print $2}' | tr -d '\r\n')
  USER_ID=$(basename "$LOCATION")
  rm -f "$TMP_HEADERS"
  echo "User created. Setting password..."
  curl -s -X PUT "$KC_URL/admin/realms/$REALM/users/$USER_ID/reset-password" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"type":"password","value":"'"$PASSWORD"'","temporary":false}' > /dev/null
  echo "Assigning SYSTEM_ADMIN role..."
  ROLE_JSON=$(curl -s -X GET "$KC_URL/admin/realms/$REALM/roles/SYSTEM_ADMIN" -H "Authorization: Bearer $TOKEN")
  ROLE_ID=$(echo "$ROLE_JSON" | jq -r '.id')
  if [ -n "$ROLE_ID" ] && [ "$ROLE_ID" != "null" ]; then
    curl -s -X POST "$KC_URL/admin/realms/$REALM/users/$USER_ID/role-mappings/realm" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d '[{"id":"'"$ROLE_ID"'","name":"SYSTEM_ADMIN"}]' > /dev/null
  fi
  echo "Done. Log in with username: $USERNAME password: $PASSWORD"
elif [ "$HTTP_CODE" = "409" ]; then
  rm -f "$TMP_HEADERS"
  echo "User $USERNAME already exists. To reset password: Keycloak Admin $KC_URL (admin/admin) -> isep-realm -> Users -> admin-sa -> Credentials."
  exit 0
else
  rm -f "$TMP_HEADERS"
  echo "Failed to create user (HTTP $HTTP_CODE). Check Keycloak is running and realm $REALM exists."
  exit 1
fi
