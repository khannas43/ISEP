# SonarQube Community Edition (Docker)

Standalone SonarQube setup for **code review**, usable by **this project and any other project** on your machine. One server, many repos.

## Quick start

From the **project root** (DG Shipping):

```bash
docker compose -f infrastructure/docker/docker-compose.sonarqube.yml up -d
```

Or from `infrastructure/docker`:

```bash
docker compose -f docker-compose.sonarqube.yml up -d
```

- **Web UI:** http://localhost:9010  
- **First login:** `admin` / `admin` — you will be prompted to change the password.

## Optional: environment variables

Create `infrastructure/docker/.env.sonarqube` (or set in your shell) to override:

| Variable              | Default | Description                          |
|-----------------------|--------|--------------------------------------|
| `SONAR_DB_PASSWORD`   | `sonar`| PostgreSQL password for SonarQube DB  |
| `SONAR_HOST_PORT`     | `9010` | Host port for SonarQube web UI        |

Example:

```bash
# infrastructure/docker/.env.sonarqube
SONAR_DB_PASSWORD=your_secure_password
SONAR_HOST_PORT=9010
```

Then run:

```bash
docker compose -f infrastructure/docker/docker-compose.sonarqube.yml --env-file infrastructure/docker/.env.sonarqube up -d
```

## Linux: vm.max_map_count (required for SonarQube)

SonarQube uses Elasticsearch and needs a higher `vm.max_map_count`. If the container keeps restarting, run once:

```bash
sudo sysctl -w vm.max_map_count=262144
```

To make it persistent:

```bash
echo "vm.max_map_count=262144" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

## Using SonarQube from any project

The same SonarQube server can be used by **this repo and other projects**.

### 1. Install SonarScanner

- **Node/JavaScript/TypeScript:** `npm install -D sonar-scanner` (or use `npx sonar-scanner`).
- **Java/Maven:** use SonarScanner for Maven or Gradle plugin.
- **Standalone CLI:** [Download SonarScanner](https://docs.sonarsource.com/sonarqube/latest/analyzing-source-code/scanners/sonarscanner/).

### 2. Create a project in SonarQube

1. Open http://localhost:9010 and log in.
2. **Create project manually** and choose “Locally”.
3. Set a **Project key** (e.g. `isep-frontend`, `my-other-app`).
4. Run the analysis; SonarQube will show the exact `sonar-scanner` (or Maven/Gradle) command with a token.

### 3. Run analysis from your project

Point the scanner to this server:

- **Host URL:** `http://localhost:9010` (or `http://<host-ip>:9010` if running scanner from another machine).
- **Token:** Create in SonarQube: **My Account → Security → Generate Tokens**.

Example for a **Node/Next.js** project (e.g. ISEP frontend):

```bash
cd frontend
npx sonar-scanner \
  -Dsonar.host.url=http://localhost:9010 \
  -Dsonar.token=YOUR_TOKEN \
  -Dsonar.projectKey=isep-frontend \
  -Dsonar.sources=src \
  -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info
```

Example for **Java/Maven** (e.g. meeting-service):

```bash
cd backend/meeting-service
mvn sonar:sonar \
  -Dsonar.host.url=http://localhost:9010 \
  -Dsonar.token=YOUR_TOKEN \
  -Dsonar.projectKey=isep-meeting-service
```

Other projects: use the same `sonar.host.url` and `sonar.token`, and a different `sonar.projectKey` per project.

## Stopping and removing

```bash
docker compose -f infrastructure/docker/docker-compose.sonarqube.yml down
```

Data is kept in Docker volumes. To remove data as well:

```bash
docker compose -f infrastructure/docker/docker-compose.sonarqube.yml down -v
```

## Upgrading from an old SonarQube (e.g. lts-community)

If you see **"The version of SonarQube you are trying to upgrade from is too old. Please upgrade to the 24.12 version first"**, the database was created by an older image. Easiest fix: start with a clean database (you will lose existing projects/tokens):

```bash
docker compose -f infrastructure/docker/docker-compose.sonarqube.yml down -v
docker compose -f infrastructure/docker/docker-compose.sonarqube.yml up -d
```

Then open the Web UI, log in as admin/admin, and recreate any projects/tokens.

## Summary

| Item        | Value                                      |
|------------|---------------------------------------------|
| Compose file | `infrastructure/docker/docker-compose.sonarqube.yml` |
| Web UI     | http://localhost:9010                      |
| Default login | admin / admin (change on first use)      |
| Reusable   | Yes — one server for this and other projects; use same host URL, different project keys. |
