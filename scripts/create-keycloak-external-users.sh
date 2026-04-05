#!/bin/bash
# Create Phase 4 external ministry demo users in Keycloak (run once per realm).
# Password for all: Agency@12345!
set -euo pipefail

KC_URL="${KC_URL:-http://localhost:8180}"
REALM="${REALM:-isep-realm}"

ADMIN_TOKEN=$(curl -s -X POST \
  "$KC_URL/realms/master/protocol/openid-connect/token" \
  -d "grant_type=password&client_id=admin-cli&username=admin&password=admin" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")

echo "Admin token acquired"

assign_realm_role() {
  local username=$1
  local role_name=$2
  local user_uuid
  user_uuid=$(curl -s -G "$KC_URL/admin/realms/$REALM/users" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    --data-urlencode "username=$username" \
    --data-urlencode "exact=true" \
    | python3 -c "import sys,json; d=json.load(sys.stdin); print(d[0]['id'] if d else '')")
  if [[ -z "$user_uuid" ]]; then
    echo "  (skip role $role_name: user $username not found)"
    return
  fi
  local role_json payload code
  role_json=$(curl -s "$KC_URL/admin/realms/$REALM/roles/$role_name" \
    -H "Authorization: Bearer $ADMIN_TOKEN")
  payload=$(echo "$role_json" | python3 -c "import sys,json; print(json.dumps([json.load(sys.stdin)]))")
  code=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST "$KC_URL/admin/realms/$REALM/users/$user_uuid/role-mappings/realm" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d "$payload")
  echo "  Realm role $role_name for $username: HTTP $code"
}

create_user() {
  local username=$1
  local firstname=$2
  local lastname=$3
  HTTP=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST "$KC_URL/admin/realms/$REALM/users" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"username\": \"$username\",
      \"email\": \"$username@demo.isep.gov.in\",
      \"firstName\": \"$firstname\",
      \"lastName\": \"$lastname\",
      \"enabled\": true,
      \"emailVerified\": true,
      \"credentials\": [{
        \"type\": \"password\",
        \"value\": \"Agency@12345!\",
        \"temporary\": false
      }]
    }")
  echo "Created $username: HTTP $HTTP"
}

create_user "moefcc-rep" "MoEFCC" "Representative"
create_user "mea-rep" "MEA" "Representative"
create_user "mod-rep" "MoD" "Representative"
create_user "mos-rep" "MoS" "Representative"
create_user "mopng-rep" "MoPNG" "Representative"

echo "Assigning realm role MEMBER (required for API / UI RBAC)..."
assign_realm_role "moefcc-rep" "MEMBER"
assign_realm_role "mea-rep" "MEMBER"
assign_realm_role "mod-rep" "MEMBER"
assign_realm_role "mos-rep" "MEMBER"
assign_realm_role "mopng-rep" "MEMBER"

echo ""
echo "All done. Login: Agency@12345! for all agency users."
