# Kong CE API Gateway

Declarative config for ISEP (SRS-07 §3). Routes and rate limits per SRS-07 §3.1.

## JWT validation

Kong JWT plugin must be configured with Keycloak's JWKS URI. In DEV this is typically:

`http://keycloak:8080/realms/isep-realm/protocol/openid-connect/certs`

Configure via Kong Admin API or use a plugin that supports JWKS URL (e.g. `jwt` with `uri` parameter). See Kong CE docs for the exact plugin config for Keycloak.

## Running

- DB-less: `KONG_DATABASE=off` and mount `kong.yml` as `KONG_DECLARATIVE_CONFIG`.
- Used by `infrastructure/docker/docker-compose.dev.yml`.
