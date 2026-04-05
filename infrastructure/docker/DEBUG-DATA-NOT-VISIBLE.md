# Debug: Data not visible after restore

Run these on the **server** (e.g. `root@srv1469721`) and keep the output. They confirm config, DB, and what the API returns.

---

## Quick: No data in any module (Dashboard, Papers, Meetings, etc.)

If **http://148.230.66.191/isep** loads but **no data** appears on Dashboard, Papers, Meetings, or other modules, the API is almost certainly returning **401** (JWT rejected). Do the following in order.

**1. Backend issuer must match the token**

On the server:

```bash
cd /root/DG-Shipping
COMPOSE="docker compose -f infrastructure/docker/docker-compose.prod.yml --env-file infrastructure/docker/.env.production"

docker exec $($COMPOSE ps -q meeting-service) env | grep KEYCLOAK_ISSUER_URI
```

- The token issued at login has an `iss` claim (e.g. `https://148.230.66.191/realms/isep-realm` or `http://148.230.66.191/realms/isep-realm`). **KEYCLOAK_ISSUER_URI** must match it **exactly** (including http vs https).
- If your site is **HTTP only**, set in `infrastructure/docker/.env.production`:  
  `KEYCLOAK_ISSUER_URI=http://148.230.66.191/realms/isep-realm`
- If your site is **HTTPS** (or a proxy sends HTTPS to Keycloak), use:  
  `KEYCLOAK_ISSUER_URI=https://148.230.66.191/realms/isep-realm`
- Then restart backends:  
  `$COMPOSE up -d meeting-service user-service`  
  **Log out and log in again** so the browser gets a new token, then reload Dashboard / Papers.

**2. Frontend must reach the API (SSR)**

```bash
docker exec $($COMPOSE ps -q frontend) env | grep API_URL
```

- Must be **API_URL=http://nginx/isep**. If it is empty or points to the public URL, the frontend container cannot reach Kong; set it in `docker-compose.prod.yml` (frontend `environment`) and restart frontend.

**3. Database has data**

```bash
PG_CONTAINER=$($COMPOSE ps -q postgresql)
docker exec -e PGPASSWORD=isep_prod_password $PG_CONTAINER psql -h localhost -U isep_app -d isep -t -c "
SELECT 'core.meetings' AS tbl, COUNT(*) FROM core.meetings
UNION ALL SELECT 'core.papers', COUNT(*) FROM core.papers
UNION ALL SELECT 'core.users', COUNT(*) FROM core.users;
"
```

- If all counts are 0, restore data (see `database/DATA-PUSH-TO-HOSTED.md`).

**4. Confirm from frontend logs**

- In the browser: log in, open **Dashboard** and **Papers** (`/isep/papers/`).
- On the server run:  
  `$COMPOSE logs --tail=80 frontend`
- Look for `[API] getMeetingsPage ok` / `getMeetingsPage failed 401`, or similar for papers. **401** = issuer mismatch (repeat step 1 and log in again).

**5. meeting-service logs (if still 401)**

```bash
$COMPOSE logs --tail=50 meeting-service
```

- If you see **"The iss claim is not valid"**, KEYCLOAK_ISSUER_URI does not match the token’s `iss`. Set KEYCLOAK_ISSUER_URI to the exact `iss` (http or https) and restart meeting-service and user-service, then log in again.

---

## 0. Token issuer mismatch (401)

If the backend has the correct KEYCLOAK_ISSUER_URI (public URL) but you still get 401, the **token** was issued with the wrong issuer. The frontend requests the token from Keycloak at login; if it uses the **internal** URL (`http://keycloak:8080/realms/isep-realm`), Keycloak issues a token with `iss: "http://keycloak:8080/realms/isep-realm"`, which the backend rejects. **Fix:** Set the frontend’s **KEYCLOAK_ISSUER** to the **public** URL so the token is requested via the public host and Keycloak issues `iss: "http://148.230.66.191/realms/isep-realm"`. In `docker-compose.prod.yml`, frontend environment: `KEYCLOAK_ISSUER: ${PUBLIC_ORIGIN:-http://148.230.66.191}/realms/isep-realm`. Restart frontend, then log out and log in again.

## 1. Backend issuer (must match token from browser)

The token you get when logging in has issuer = **public** URL. Backends must use that same value.

```bash
cd /root/DG-Shipping
COMPOSE="docker compose -f infrastructure/docker/docker-compose.prod.yml --env-file infrastructure/docker/.env.production"

# Should show KEYCLOAK_ISSUER_URI=http://148.230.66.191/realms/isep-realm (public), not keycloak:8080
docker exec $($COMPOSE ps -q meeting-service) env | grep KEYCLOAK
```

If you see `KEYCLOAK_ISSUER_URI: http://keycloak:8080/realms/isep-realm`, the fix is not applied. Update `docker-compose.prod.yml`: set `KEYCLOAK_ISSUER_URI: ${PUBLIC_ORIGIN:-http://148.230.66.191}/realms/isep-realm` for **meeting-service** and **user-service**, then:

```bash
$COMPOSE up -d meeting-service user-service
```

Ensure `.env.production` has (no trailing slash):

```bash
PUBLIC_ORIGIN=http://148.230.66.191
```

## 2. Data in DB

```bash
PG_CONTAINER=$($COMPOSE ps -q postgresql)
docker exec -e PGPASSWORD=isep_prod_password $PG_CONTAINER psql -h localhost -U isep_app -d isep -t -c "
SELECT 'core.meetings' AS tbl, COUNT(*) FROM core.meetings
UNION ALL SELECT 'core.international_bodies', COUNT(*) FROM core.international_bodies
UNION ALL SELECT 'core.users', COUNT(*) FROM core.users;
"
```

If all counts are 0, data was not restored; run the data-only restore again (see `database/DATA-PUSH-TO-HOSTED.md`).

## 3. Fresh login and frontend logs

1. Log out of the app (or use a new incognito window).
2. Log in again at `http://148.230.66.191/isep`.
3. Open the **Dashboard** (or Executive Dashboard).
4. On the server, immediately run:

```bash
$COMPOSE logs --tail=100 frontend
```

- **If you see `[API] getMeetingsPage ok, meetings: N`** — API is working; the UI should show data. If it still doesn’t, the problem is in the page/component.
- **If you see `[API] getMeetingsPage failed 401`** — backend is still rejecting the JWT. Check step 1 (KEYCLOAK_ISSUER_URI must be the public URL). Ensure you logged in again after changing the backend so the token has the correct issuer.
- **If you see `[Dashboard] Failed to load summary`** and a network error (e.g. ECONNREFUSED, ENOTFOUND) — frontend cannot reach nginx; check that `API_URL=http://nginx/isep` in the frontend container: `docker exec $($COMPOSE ps -q frontend) env | grep API_URL`.

## 4. Optional: meeting-service logs

When you load the dashboard, the meeting-service may log why it rejected the request:

```bash
$COMPOSE logs --tail=30 meeting-service
```

Share the outputs of steps 1, 2, and 3 (and 4 if relevant) so we can see the exact failure.

## 5. Audit log returns 403

If frontend logs show `[API] getAuditReport failed 403`, the meeting-service is rejecting the request because **GET /api/v1/reports/audit** required `SYSTEM_ADMIN` or `IC_DIVISION_HEAD` and the JWT does not have those roles in `realm_access.roles`.

**Applied fix:** The backend was updated so **GET /api/v1/reports/audit** only requires `authenticated()`. Rebuild and restart meeting-service so the change is applied; the Audit page should then show data for any logged-in user. The frontend still restricts the Audit link to SA/IH.

**Strict RBAC (optional):** To enforce SA/IH at the API for audit read, ensure Keycloak adds realm roles to the access token: Client **isep-web** → Client scopes → add **roles** and ensure the realm-roles mapper adds roles to the access token. Then you can revert the GET audit rule to `hasAnyRole("SYSTEM_ADMIN", "IC_DIVISION_HEAD")` if desired.

---

## 6. Kong restarting → 502 Bad Gateway

If **meeting-service** is Up but you get **502** when loading Dashboard/Papers, nginx is proxying to Kong and Kong is likely **Restarting**. Check:

```bash
$COMPOSE ps kong
$COMPOSE logs --tail=80 kong
```

### 6a. "Address already in use" on unix socket

If logs show:

```text
bind() to unix:/usr/local/kong/sockets/we failed (98: Address already in use)
```

the previous Kong process left its worker socket in place; on restart the new process can’t bind. **Immediate fix:** remove the Kong container so the next start gets a clean filesystem, then start again:

```bash
$COMPOSE stop kong
$COMPOSE rm -f kong
$COMPOSE up -d kong
```

**Permanent fix:** In `docker-compose.prod.yml`, Kong has a **tmpfs** mount for `/usr/local/kong/sockets` so that directory is empty on every start and the socket conflict doesn’t recur. Use **`mode=1777`** so Kong (running non-root in the image) can create the socket; otherwise you may see **Permission denied (13)**. Example:

```yaml
tmpfs:
  - /usr/local/kong/sockets:mode=1777
```

After adding or fixing that, run the three commands above once so the new config is used.

### 6b. Other Kong issues

- Use the production-only Kong config **kong-prod.yml** (only meeting-service, user-service, workflow-service, keycloak). In compose, set `KONG_DECLARATIVE_CONFIG: /kong/kong-prod.yml` and mount `kong-prod.yml`.
- If Kong still crashes, the logs may show **OOM** (out of memory) or a config error; fix or raise memory for the Kong container.
