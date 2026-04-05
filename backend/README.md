# ISEP Backend – Microservices

Production-grade Spring Boot 3 (Java 21) microservices for DG Shipping ISEP.

## Services

| Service | Port | Description |
|---------|------|-------------|
| **meeting-service** | 8081 | Bodies, meetings, correspondence groups, reference data, workflow |
| **document-service** | 8082 | Document storage and versioning (`documents` schema) |
| **agenda-service** | 8083 | Agenda items (`core.agenda_items`) |
| **user-service** | 8087 | User and role management |
| **notification-service** | 8084 | Notifications (runnable stub; add JPA + notifications schema for full API) |
| **approval-service** | 8085 | Paper approval workflow (runnable stub) |
| **collaboration-service** | 8086 | Feedback and collaboration (runnable stub) |
| **reporting-service** | 8088 | Reports and audit (runnable stub) |

## Prerequisites

- **Java 21** (`JAVA_HOME` set for Maven wrapper)
- **PostgreSQL** with database `isep`, user `isep_app`, password `isep_dev_password`; run migrations from project `database/`
- **Keycloak** (optional): realm `isep-realm` for JWT; set `KEYCLOAK_JWKS_URI` and `KEYCLOAK_ISSUER_URI` if not on defaults

## Build all

From repo root:

```bash
cd backend
mvn clean install -DskipTests
```

Or build one service:

```bash
cd backend/meeting-service
mvn clean package
```

## Run

**Single API for frontend (recommended for dev):** run **meeting-service** only. The frontend uses `NEXT_PUBLIC_API_URL=http://localhost:8081` and meeting-service exposes the main APIs.

```bash
cd backend/meeting-service
mvn spring-boot:run
# or: ./mvnw spring-boot:run
```

**Run individual microservices** (each in its own terminal):

```bash
# Meeting (main API) – port 8081
cd backend/meeting-service && mvn spring-boot:run

# Documents – port 8082
cd backend/document-service && mvn spring-boot:run

# Agenda – port 8083
cd backend/agenda-service && mvn spring-boot:run

# User – port 8087
cd backend/user-service && mvn spring-boot:run

# Notification – port 8084 (stub)
cd backend/notification-service && mvn spring-boot:run

# Approval – port 8085 (stub)
cd backend/approval-service && mvn spring-boot:run

# Collaboration – port 8086 (stub)
cd backend/collaboration-service && mvn spring-boot:run

# Reporting – port 8088 (stub)
cd backend/reporting-service && mvn spring-boot:run
```

Override port: `SERVER_PORT=8082 mvn spring-boot:run`

## Verify

```bash
curl -s http://localhost:8081/actuator/health   # meeting-service
curl -s http://localhost:8082/actuator/health   # document-service
curl -s http://localhost:8083/actuator/health   # agenda-service
```

## Architecture

- **JWT**: All services validate Keycloak JWTs (OAuth2 resource server). Use same realm (`isep-realm`) and JWKS/issuer for all.
- **Database**: Shared PostgreSQL; each service uses the schema it owns (e.g. `documents`, `core`, `notifications`, `collaboration`, `workflow`, `audit`).
- **Frontend**: Points to one base URL. For full microservices, put an API gateway (e.g. Kong or Spring Cloud Gateway) in front and route by path to the appropriate service.
