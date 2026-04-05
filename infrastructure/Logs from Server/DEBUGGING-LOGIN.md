# Debugging "Sign-in failed" on production

Use this when login shows: *"Sign-in failed. Check frontend container logs or browser Console for details."*

The **Manifest** and **WebSocket** messages in the console are **not from ISEP** and can be ignored for login.

**If your Console shows `+layout.svelte` or any `.svelte` file in the stack trace** — you are on **Open WebUI** (Svelte app at the root), **not** on the ISEP app (Next.js). ISEP never uses Svelte. In that case you will never see a POST to `/isep/api/auth/callback/credentials` and the "Sign-in failed" message may be from the other app. You must open **`http://148.230.66.191/isep/`** and confirm the ISEP login page loads (see below).

---

## Step 0 – Confirm ISEP is reachable at /isep/

Before debugging the form, confirm the ISEP app is actually served:

1. In the browser address bar, type **exactly:** `http://148.230.66.191/isep/` and press Enter.
2. **If you see the ISEP login page** (title "ISEP", "IMO Strategic Engagement Platform", "Sign in" with Username and Password) — you are on the right app. Then do Step 1–3 below.
3. **If you see Open WebUI again, or a 404, or a blank page** — the host is **not** routing `/isep/` to the ISEP Docker stack. On the server, the reverse proxy (e.g. Nginx) for `148.230.66.191` must have a `location /isep/` (and optionally `location = /isep`) that proxies to the port where the ISEP stack is running (e.g. the one in `docker-compose.prod.yml`, often 8081). Fix that first; only then can you test ISEP login.

---

## Important: Use the correct URL and base path

- **The root** `http://148.230.66.191/` is Open WebUI; URLs like `/_app/immutable/` are from that app, not ISEP. You will not see `/isep/api/auth/callback/credentials` unless you are on the ISEP app.
- **ISEP is only at:** `http://148.230.66.191/isep/` — type this in the address bar. You should see the ISEP login page ("ISEP", "Sign in"). Only then does Sign in POST to `.../isep/api/auth/callback/credentials` (visible in Network tab). If you get another app or 404, the host Nginx is not proxying `/isep/` to the ISEP stack.
- If you end up on `http://148.230.66.191/auth` (no `/isep`), that is the **root** host’s auth, not ISEP. The `/_app/version.json` request and referer `http://148.230.66.191/auth?redirect=...` usually come from another app on the same host (e.g. rfpguardian), not from the ISEP frontend.
- On the server, **`.env.production`** (or the env file used by Docker Compose) must have:
  - **`PUBLIC_BASE_URL=http://148.230.66.191/isep`** (with `/isep`).  
  If it is set to `http://148.230.66.191` (without `/isep`), NextAuth will redirect to the root and auth will break.
- After changing env, rebuild/restart the frontend so it picks up the correct `NEXTAUTH_URL`.

---

## Step 1 – Check the sign-in request in the browser (Network tab)

The ISEP login form does **not** do a normal form POST; it uses JavaScript (`signIn()` from NextAuth), which sends a **fetch()** request. So the sign-in shows up as a **Fetch/XHR** request, not a document navigation.

**If you see only GET requests and no POST:**

1. **Confirm you are on the ISEP page:** URL must be exactly `http://148.230.66.191/isep/` and you must see the ISEP "Sign in" form (Username, Password). If you are on the root or another app, the POST will not go to the ISEP URL.
2. **In the Network tab:**
   - Enable **"Preserve log"** (so redirects don’t clear the list).
   - **Clear** the request list (trash icon or right‑click → Clear).
   - In the filter bar, try **"Fetch/XHR"** (or leave "All" and scroll for a request with Method **POST**).
   - Click **Sign in** once on the ISEP form.
   - Look for a new request with **Method: POST** and URL containing **`/isep/api/auth/callback/credentials`** or **`credentials`**.
3. **If there is still no POST:** open the **Console** tab and click Sign in again. Any **red** error (e.g. "Failed to fetch", or a script error) can stop the sign-in request from being sent. Share that error.

When you find the sign-in request, note:
- **Request URL** – Should contain `/isep/api/auth/callback/credentials`. If it is something like `/api/auth/...` without `/isep`, the app may be using the wrong base URL.
- **Status** – 200, 302, 401, 500, or (failed) = different problems.
- **Response** – Click the request → **Response** (or **Preview**) tab. Note whether you see JSON with `error`, `url`, or HTML.

Share: **exact Request URL, Status code, and a short description of the Response.**

---

## Step 2 – Check browser Console for the sign-in result

Right after you see "Sign-in failed", in the **Console** tab:

1. Type or filter by: `LoginForm` or `signIn result`.
2. Look for a line like:  
   `[LoginForm] signIn result (fallback branch): {...}`  
   The `{...}` is the object NextAuth returned (e.g. `{"ok":false}` or `{"status":500}`).

If you see that line, copy the full line (including the JSON) and share it.  
If you do **not** see it, the frontend build on the server may not include the latest `LoginForm.tsx` (with the `console.warn`).

---

## Step 3 – Check frontend container logs on the server

On the server, **while or right after** a sign-in attempt, run:

```bash
cd /root/DG-Shipping
docker compose -f infrastructure/docker/docker-compose.prod.yml --env-file infrastructure/docker/.env.production logs --tail=200 frontend
```

Look for lines starting with `[auth]`, for example:

- `[auth] authorize called, username: admin-sa` → The login request reached the Next.js app.
- `[auth] Keycloak token request failed: ...` → Frontend cannot reach Keycloak (e.g. network or URL).
- `[auth] Keycloak token error: 401 {...}` → Keycloak rejected (wrong user/password or client secret).
- `[auth] authorize failed: ...` → Error message from the auth logic.

If there are **no** `[auth]` lines when you sign in, the POST from the browser is not reaching the frontend container (e.g. wrong URL, proxy, or 404). Use Step 1 to confirm the request URL and status.

Save logs to a file and share:

```bash
docker compose -f infrastructure/docker/docker-compose.prod.yml --env-file infrastructure/docker/.env.production logs --tail=300 frontend > /root/frontend-logs.txt
cat /root/frontend-logs.txt
```

Copy the output (or the file) into `infrastructure/Logs from Server/frontend-logs.txt` and share.

---

## Step 4 – Confirm env and Keycloak on the server

On the server, ensure:

1. **`.env.production`** (or the env file used by compose) has:
   - `KEYCLOAK_CLIENT_SECRET=CHANGE-ME-IMPORT-REPLACE-WITH-SECRET` (or the value from Keycloak for client `isep-web`).
   - `NEXTAUTH_SECRET` set.
   - `NEXTAUTH_URL` / `PUBLIC_BASE_URL` consistent with how you open the app (e.g. `http://148.230.66.191/isep`).

2. **Keycloak** is up and the token endpoint works from the host:
   ```bash
   curl -s -X POST "http://127.0.0.1:8081/realms/isep-realm/protocol/openid-connect/token" \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "grant_type=password&client_id=isep-web&client_secret=CHANGE-ME-IMPORT-REPLACE-WITH-SECRET&username=admin-sa&password=Admin@12345!&scope=openid"
   ```
   If this returns JSON with `access_token`, Keycloak and client secret are fine; the problem is then between browser and frontend or frontend and Keycloak (Steps 1–3).

---

## Summary – what to share

To fix the login issue, please share:

1. **Network:** Request URL, status code, and a short description of the response for the sign-in POST.
2. **Console:** The full `[LoginForm] signIn result (fallback branch): ...` line (if present).
3. **Server:** The output of `docker compose ... logs --tail=300 frontend` (or the contents of `frontend-logs.txt`) from right after a failed sign-in.

With those three, we can tell whether the failure is: wrong URL, proxy, 404, 500, Keycloak unreachable, or bad credentials/config.
