# meeting-service

ISEP Meeting and Committee Management (SRS-03 Module A, SRS-04 §4). Spring Boot 3, Java 21, JPA.

## API

- `GET /api/v1/meetings` — paginated list (optional `bodyId`, `status`)
- `GET /api/v1/meetings/{id}` — by id
- `POST /api/v1/meetings` — create (JWT required)
- `PATCH /api/v1/meetings/{id}/status?status=ACTIVE` — update status

## Run locally

1. **PostgreSQL** with ISEP schema (run migrations from project `database/`).
2. **Keycloak** (optional for JWT): realm `isep-realm`, JWKS at `/realms/isep-realm/protocol/openid-connect/certs`. If not used, you may need to adjust security config.
3. Start the service (port **8081** by default):

   **Option A – Maven wrapper (needs `JAVA_HOME` set):**
   ```bash
   cd backend/meeting-service
   ./mvnw spring-boot:run
   ```

   **Option B – System Maven:**
   ```bash
   cd backend/meeting-service
   mvn spring-boot:run
   ```

   **Option C – If Java not found with wrapper, set JAVA_HOME then run:**
   ```bash
   export JAVA_HOME=$(/usr/libexec/java_home 2>/dev/null || echo "/opt/homebrew/opt/openjdk")
   cd backend/meeting-service
   ./mvnw spring-boot:run
   ```

4. **Verify** the backend is up (in another terminal):
   ```bash
   curl -s http://localhost:8081/actuator/health
   ```
   You should get JSON like `{"status":"UP",...}`. If you see `Connection refused`, the service is not running on 8081.

Env: `POSTGRES_*`, `KEYCLOAK_JWKS_URI`, `KEYCLOAK_ISSUER_URI` (see `src/main/resources/application.yml`).
