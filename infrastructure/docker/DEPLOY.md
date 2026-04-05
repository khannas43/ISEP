# ISEP single-bundle deployment (Docker)

Deploy the full stack (frontend, backends, PostgreSQL, Redis, Keycloak, Kong, nginx) with one Docker Compose command. Suitable for **Hostinger** (Docker available) or any host with Docker and Docker Compose.

**App URL:** **http://148.230.66.191/isep** (no SSL). Next.js `basePath: '/isep'`. Nginx serves the app at `/isep`, API at `/isep/api`, Keycloak at `/realms` and `/auth`.

---

## What’s in the bundle

| Service           | Role                          |
|-------------------|-------------------------------|
| **nginx**         | Entry on port 80 → frontend, /api → Kong, /realms → Keycloak |
| **frontend**      | Next.js app (standalone)      |
| **meeting-service** | Spring Boot API            |
| **user-service**  | Spring Boot API               |
| **workflow-service** + **celery-worker** | Python workflow + queue |
| **kong**          | API gateway                   |
| **keycloak**      | Auth (isep-realm)             |
| **postgresql**    | Database                      |
| **redis**         | Cache / Celery broker         |
| **minio**         | Object storage                |

---

## 1. Prerequisites

- Docker and Docker Compose on the server (e.g. Hostinger VPS with Docker).
- Repo (or build context) on the server so paths in the compose file resolve (e.g. `../../frontend`, `../../backend/meeting-service`).

---

## 2. Configure environment

From the **repo root**:

```bash
cp infrastructure/docker/.env.production.example infrastructure/docker/.env.production
```

Edit `infrastructure/docker/.env.production` and set the two required values:

**1) NEXTAUTH_SECRET** — generate once and paste into the file:

```bash
openssl rand -base64 32
```

Copy the output and set `NEXTAUTH_SECRET=<that value>` in `.env.production`.

**2) KEYCLOAK_CLIENT_SECRET** — use the same value as in the Keycloak **isep-web** client. If you use the bundled realm import, the default in `realm-isep.json` is often:

```text
CHANGE-ME-IMPORT-REPLACE-WITH-SECRET
```

So set `KEYCLOAK_CLIENT_SECRET=CHANGE-ME-IMPORT-REPLACE-WITH-SECRET` (or the value you set in Keycloak Admin → Clients → isep-web → Credentials).

All other vars (PUBLIC_BASE_URL, PUBLIC_ORIGIN, PUBLIC_HOST) already default to `http://148.230.66.191` in the example; override them only if you use a different host or HTTPS.

Do **not** commit `.env.production`.

---

## 3. Build and run

From the **repo root**:

```bash
# Build all images (frontend, meeting-service, user-service, workflow-service)
docker compose -f infrastructure/docker/docker-compose.prod.yml --env-file infrastructure/docker/.env.production build

# Start the stack (detached)
docker compose -f infrastructure/docker/docker-compose.prod.yml --env-file infrastructure/docker/.env.production up -d
```

Open **http://148.230.66.191/isep** (or your configured PUBLIC_BASE_URL). You should see the ISEP login page. Keycloak realm is at **http://148.230.66.191/realms/isep-realm** (for admin, use Keycloak’s admin port if you expose it, or run admin from another machine).

---

## 4. Optional: HTTPS on Hostinger

If Hostinger provides a reverse proxy (e.g. Let’s Encrypt + proxy to port 80):

- Point the domain to the server and enable HTTPS at Hostinger.
- Set **PUBLIC_BASE_URL** to `https://yourdomain.com/isep` and **PUBLIC_ORIGIN** / **PUBLIC_HOST** accordingly.
- Rebuild the frontend so the client bundle uses HTTPS:

  ```bash
  docker compose -f infrastructure/docker/docker-compose.prod.yml --env-file infrastructure/docker/.env.production build frontend
  docker compose -f infrastructure/docker/docker-compose.prod.yml --env-file infrastructure/docker/.env.production up -d
  ```

---

## 5. Deploy on the server (first time)

The ISEP stack must run **on the same machine** as the IP (148.230.66.191). If the project is only on your Mac, get it onto the server first.

**5a. Get the project on the server**

- **Option A — Git (if repo is on GitHub):**
  ```bash
  cd ~
  git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git "DG Shipping"
  cd "DG Shipping"
  ```
- **Option B — Upload:** Zip the project on your Mac, upload via Hostinger File Manager or SCP, then unzip on the server and `cd` into the folder.

**5b. Pick a free port for ISEP**

Port **8080 is often in use** (e.g. another Python app). Check and use another port:

```bash
# On the server: see what’s using 8080 and 8081
sudo ss -tlnp | grep -E '8080|8081'
```

If 8080 is in use, use **8081** (or another free port) for ISEP. Set that in `.env.production` as `NGINX_PORT=8081`. The host Nginx will proxy `/isep/` to this port.

**5c. Configure and run on the server**

```bash
cd ~/DG\ Shipping   # or the path where you cloned/unzipped

cp infrastructure/docker/.env.production.example infrastructure/docker/.env.production
nano infrastructure/docker/.env.production   # set NEXTAUTH_SECRET, KEYCLOAK_CLIENT_SECRET, and NGINX_PORT=8081

docker compose -f infrastructure/docker/docker-compose.prod.yml --env-file infrastructure/docker/.env.production build
docker compose -f infrastructure/docker/docker-compose.prod.yml --env-file infrastructure/docker/.env.production up -d
```

Then add the host Nginx proxy (Section 6 below) and use **8081** in `proxy_pass` (e.g. `http://127.0.0.1:8081`).

---

## 6. Shared host (another app on same IP)

If **another app** is already using port 80 on this server (e.g. host Nginx serving a different site), do the following. If **8080 is already in use** (e.g. `ss -tlnp | grep 8080` shows another process), use **8081** (or another free port) for `NGINX_PORT` and in the host Nginx `proxy_pass`.

**Step 1 — Run ISEP on another port**

In `infrastructure/docker/.env.production` add (or set):

```bash
NGINX_PORT=8080
```

If **8080 is already in use** on the server (e.g. by another app), use **8081** instead: `NGINX_PORT=8081`. Then (re)start the stack. Docker will publish the ISEP nginx on that port.

**Step 2 — Proxy `/isep` (and Keycloak) from host Nginx**

On the **host** (Ubuntu/server), edit the existing Nginx config that listens on 80 (e.g. `/etc/nginx/sites-available/default` or your site config). Add these `location` blocks **inside** the `server { ... }` that handles `148.230.66.191` (or your server name). Use the **same port** you set for ISEP (e.g. **8081** if 8080 is taken):

```nginx
# ISEP app at /isep (proxy to Docker nginx — use 8081 if 8080 is in use)
location /isep/ {
    proxy_pass http://127.0.0.1:8081;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
location = /isep {
    return 301 /isep/;
}

# Keycloak (ISEP auth) — same host
location /realms/ {
    proxy_pass http://127.0.0.1:8081;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
location /auth/ {
    proxy_pass http://127.0.0.1:8081;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

Reload host Nginx:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

Then **http://148.230.66.191/isep/** will be served by the host Nginx and proxied to the ISEP stack (port 8081 if you used `NGINX_PORT=8081`).

---

## 7. Useful commands

```bash
# Logs
docker compose -f infrastructure/docker/docker-compose.prod.yml logs -f

# Stop
docker compose -f infrastructure/docker/docker-compose.prod.yml down

# Stop and remove volumes (deletes DB data)
docker compose -f infrastructure/docker/docker-compose.prod.yml down -v
```

---

## 8. Pushing only code to GitHub

Use the existing repo `.gitignore`. Do **not** commit:

- `infrastructure/docker/.env.production`
- Any file containing real secrets

On the server, create `.env.production` from the example and set the values there.
