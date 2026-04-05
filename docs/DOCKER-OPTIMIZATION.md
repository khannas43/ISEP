# Docker image and storage optimization

This guide helps reduce Docker image size and disk usage (e.g. when total usage is 35+ GB) and avoid unnecessary CPU during builds.

---

## 1. What was done in-repo

### 1.1 `.dockerignore` per service

Build context is sent to the Docker daemon for every build. Excluding unneeded files shrinks context and speeds builds.

| Service | File | Excludes |
|---------|------|----------|
| **Frontend** | `frontend/.dockerignore` | `node_modules`, `.next`, tests, coverage, playwright reports, `.cursor`, etc. |
| **Meeting-service** | `backend/meeting-service/.dockerignore` | `target/`, IDE files, `.git`, `*.md`, logs |
| **User-service** | `backend/user-service/.dockerignore` | Same as meeting-service |
| **Workflow-service** | `workflow-service/.dockerignore` | `.venv`, `__pycache__`, `.pytest_cache`, `.git`, `*.md` |

Ensure these files are present and committed so CI and production builds don’t send unnecessary data.

### 1.2 Image tags

- **Keycloak:** Already pinned to `quay.io/keycloak/keycloak:24.0` (no `latest`).
- **MinIO:** Pinned to `minio/minio:RELEASE.2024-01-16T16-07-38Z` in `docker-compose.prod.yml` to avoid `latest` bloat. Update the tag when you need a newer release.
- **Postgres, Redis, Nginx, Kong:** Already use `-alpine` or versioned tags where applicable.

---

## 2. Free disk space on the server (prune)

Old images, stopped containers, and unused volumes can use many GB.

**Preview what would be removed:**

```bash
docker system df
docker system df -v
```

**Remove unused build cache, stopped containers, dangling images:**

```bash
# Remove all unused images (not just dangling). Use with care if you share the host with other projects.
docker image prune -a

# Remove build cache (forces full rebuild next time but frees a lot)
docker builder prune -a

# Remove dangling images and stopped containers
docker image prune
docker container prune
```

**One-shot aggressive prune (frees maximum space; running containers are kept):**

```bash
docker system prune -a --volumes
```

**Warning:** `--volumes` deletes unused named volumes (e.g. `pgdata`, `redisdata`, `miniodata`). Only run this if you don’t need that data or have backups. To prune everything except volumes:

```bash
docker system prune -a
```

Run these on the deployment host (e.g. Hostinger VPS) when disk is full. After pruning, rebuild only the images you need.

---

## 3. Build-time optimizations

### 3.1 Multi-stage builds (already in use)

- **Frontend:** Builder stage runs `npm ci` and `npm run build`; runner stage copies only `.next/standalone`, `.next/static`, and `public`. No `node_modules` in the final image.
- **Meeting-service / User-service:** Maven stage compiles and packages; runner stage uses `eclipse-temurin:21-jre-alpine` and only the JAR. No Maven or JDK in the final image.
- **Workflow-service:** Single stage; consider a multi-stage build later (e.g. build deps in one stage, copy only `app/` and installed packages into a slimmer runtime image).

### 3.2 Frontend: production deps only

`npm ci --omit=optional` is already used. Do not add optional or dev dependencies needed only for tests/tooling unless required at build time.

### 3.3 Java: skip tests in image build

The Dockerfiles use `mvn package -DskipTests`. Do not run integration tests inside the image build (they need DB, etc.); run them in CI separately.

### 3.4 Python (workflow-service): slimmer base (optional)

Current base is `python:3.11-slim`. For a smaller image you can try `python:3.11-alpine` and rebuild; some pip packages may need extra build deps on Alpine. If the image builds and runs, Alpine can save ~100–200 MB per image.

---

## 4. Runtime CPU and memory

High CPU is often from:

- **Builds:** Large context and no `.dockerignore` → slow and CPU-heavy. The new `.dockerignore` files reduce context.
- **Too many concurrent builds:** Limit parallel builds (e.g. build one service at a time) if the host is small.
- **Runtime:** Keycloak and JVM services can use a lot of memory. You can add resource limits in `docker-compose.prod.yml` to avoid one service starving others:

```yaml
# Example: limit a service
meeting-service:
  deploy:
    resources:
      limits:
        memory: 512M
      reservations:
        memory: 256M
```

Adjust values per service and host. Use `docker stats` on the server to see actual usage before tightening limits.

---

## 5. Checklist after applying changes

1. **Commit** all new/updated `.dockerignore` files.
2. **On the build machine:** Run `docker builder prune -a` (optional, to clear old cache), then rebuild images:
   ```bash
   docker compose -f infrastructure/docker/docker-compose.prod.yml build --no-cache
   ```
3. **On the server:** Run `docker system df` and then `docker image prune -a` (or `docker system prune -a`) to remove old images and free space.
4. **Re-deploy** with the new images and confirm the app works.

---

## 6. Expected impact

- **Build context:** Smaller context (thanks to `.dockerignore`) means less data sent to the daemon and often faster builds; `target/` and `node_modules` were the main culprits for backends and frontend.
- **Final image size:** Frontend and Java services already use multi-stage builds and slim runtimes; the main gain is from not including build artifacts and caches. Keycloak/MinIO are third-party images; pinning MinIO avoids `latest` growth.
- **Disk:** Pruning unused images and build cache typically frees several GB on a host that has been building and updating for a while.

---

*Last updated: 2026-02. For ISEP deployment (Hostinger / Docker).*
