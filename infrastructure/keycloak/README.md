# Keycloak — ISEP (isep-realm)

## Start Keycloak

**Important:** Run from the **project root** (the folder that contains `infrastructure/`), not from `database/` or `frontend/`.

```bash
cd "/Users/sameerkhanna/Documents/Projects/DG Shipping"
docker compose -f infrastructure/docker/docker-compose.dev.yml up -d keycloak keycloak-init
```

`keycloak-init` runs once after Keycloak is healthy and sets the **master** realm’s “Require SSL” to **none** so the Admin Console works over HTTP. If you only start `keycloak`, run the init once manually:

```bash
docker compose -f infrastructure/docker/docker-compose.dev.yml run --rm keycloak-init
```

Then open **http://localhost:8180** and log in as **admin** / **admin**.

Or start the full dev stack:

```bash
docker compose -f infrastructure/docker/docker-compose.dev.yml up -d
```

- **Admin Console:** http://localhost:8180  
- **Admin login:** `admin` / `admin`  
- **Realm:** `isep-realm` (imported from `realm-isep.json` on first run)

---

## Realm roles (IC_DIVISION_HEAD and others)

The realm defines these **Realm roles** (Realm → Realm roles):

| Role                | Description           |
|---------------------|-----------------------|
| SYSTEM_ADMIN        | Platform administrator |
| IC_DIVISION_HEAD    | IC Division Head       |
| DELEGATION_LEADER   | Delegation Leader      |
| COORDINATOR         | Coordinator            |
| MEMBER              | Member / Expert        |
| VIEWER              | Read-only viewer       |

**Check that IC_DIVISION_HEAD exists:**  
Keycloak Admin Console → **isep-realm** → **Realm roles** → you should see **IC_DIVISION_HEAD** in the list.

---

## Test users (from realm import)

If the realm was imported from `realm-isep.json` (e.g. fresh Keycloak or re-import), **all six role users** exist:

| Username  | Password     | Realm role        | SRS role | Use in app |
|-----------|--------------|-------------------|----------|------------|
| admin-sa  | Admin@12345! | SYSTEM_ADMIN      | SA       | SA Dashboard, user/config/audit, MFA |
| ih-user   | Ih@12345!    | IC_DIVISION_HEAD  | IH       | IH Dashboard, audit read, paper approval, MFA |
| dl-user   | Dl@12345!    | DELEGATION_LEADER | DL       | DL Dashboard, meetings, papers, live |
| co-user   | Co@12345!    | COORDINATOR       | CO       | CO Dashboard, create meetings/agenda/CGs, consolidate feedback |
| me-user   | Me@12345!    | MEMBER            | ME       | ME Dashboard, submit feedback, papers draft, my tasks |
| vw-user   | Vw@12345!    | VIEWER            | VW       | Read-only: calendar, notifications, meetings, documents |

**Role mapping (for RBAC):** The frontend reads `realm_access.roles` from the Keycloak access token (or id_token). Only these realm role names are used: `SYSTEM_ADMIN`, `IC_DIVISION_HEAD`, `DELEGATION_LEADER`, `COORDINATOR`, `MEMBER`, `VIEWER`. See `frontend/src/lib/routePermissions.ts` and SRS/ISEP-Screens-RBAC.md.

**If a user is missing** (e.g. realm was created before all six were added), either re-import the realm (see below) or add the user via the Admin UI (see “Add a user via Admin UI”).

---

## Access token for curl / smoke tests

Do **not** use angle brackets around secrets or passwords in the shell (`<` and `>` are redirection). Use **single quotes** around passwords that contain `!` so zsh/bash history expansion does not break them.

**Client secret (`isep-web`)** is resolved in this order:

1. Environment variable **`KEYCLOAK_CLIENT_SECRET`**
2. **`frontend/.env.local`** — first `KEYCLOAK_CLIENT_SECRET=` line (optional file; add this key if you only had other overrides before)
3. **`frontend/.env`**
4. Fallback: **`CHANGE-ME-IMPORT-REPLACE-WITH-SECRET`** (matches `infrastructure/keycloak/realm-isep.json` unless you changed the client in Keycloak Admin → **Clients** → **isep-web** → **Credentials**)

From the **repository root**, print the resolved secret (no trailing newline) or use it in `curl`:

```bash
SECRET=$(./scripts/resolve-keycloak-client-secret.sh)
set +H   # zsh: avoid ! in password triggering history expansion
TOKEN=$(curl -s -X POST \
  'http://localhost:8180/realms/isep-realm/protocol/openid-connect/token' \
  -d 'grant_type=password' \
  -d 'client_id=isep-web' \
  -d "client_secret=$SECRET" \
  -d 'username=co-user' \
  -d 'password=Co@12345!' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")
```

Confirm a token was returned: `echo "${#TOKEN}"` or `echo "${TOKEN:0:50}..."`.

**Smoke tests:** `./scripts/smoke-test.sh` test **7** sets **`MEMBER_ID` from Postgres** when unset (first active user with `system_role = 'MEMBER'`, same host/DB as `./scripts/smoke-test.sh uuids`). You still need **`MEETING_ID`**, **`ITEM_ID`**, and for tests **9–10** **`DOC_ID`**.

---

## Token missing realm roles (Access denied / "Your role: None")

**What’s wrong:** The app only recognises these six roles from the token: SYSTEM_ADMIN, IC_DIVISION_HEAD, DELEGATION_LEADER, COORDINATOR, MEMBER, VIEWER. If Keycloak does not put the user’s realm role into the access token, the app sees “Your role: None” and blocks access. This can affect all six test users (admin-sa, ih-user, dl-user, co-user, me-user, vw-user).

**What to do:** Use **either** Option A (fix in Keycloak UI) **or** Option B (re-import the realm). Option B is simpler if you are okay resetting the realm.

---

### Option A — Fix in Keycloak Admin UI (keep existing realm)

Do this once; it fixes the token for all six role users.

1. **Open Keycloak Admin**
   - In your browser go to: **http://localhost:8180**
   - Log in with username **admin** and password **admin**
   - In the **top-left** dropdown, select the realm **isep-realm** (not “master”)

2. **Open the isep-web client**
   - In the **left sidebar**, click **Clients**
   - In the table, find the row for **isep-web** and click the **isep-web** link

3. **Add the “roles” client scope**
   - Click the **Client scopes** tab
   - Find the section **“Assigned default client scopes”**
   - Look in the list for **roles**. If **roles** is **not** in that list:
     - Click **“Add client scope”**
     - In the list, tick **roles** (under “Default scope” or “realm default”)
     - Click **Add**
   - If **roles** is already there, do nothing and go to step 4

4. **Check that “roles” adds realm roles to the token**
   - In the **left sidebar**, click **Client scopes** (under the “Configure” area, same level as “Clients”)
   - Click the **roles** scope (the one for this realm)
   - Open the **Mappers** tab
   - Look for a mapper whose name contains **“realm”** or **“realm roles”** and that has **“Add to access token”** enabled. If you see one, you are done with Option A; go to step 5.
   - If there is **no** such mapper:
     - Click **Create**
     - Choose **“By configuration”** → **“User Realm Role”** (or **“realm roles”** if that appears)
     - Set **“Add to ID token”** to **ON**
     - Set **“Add to access token”** to **ON**
     - Click **Save**

5. **Get a new token in the app**
   - In the ISEP app (**http://localhost:3000**), **Sign out**
   - Sign in again with e.g. **co-user** / **Co@12345!**
   - You should no longer see “Your role: None” and role-based screens should work.

**Still seeing Access denied or “App role: None” in the sidebar?** In development, the sidebar shows “App role: COORDINATOR” (or your role) at the bottom when the token is correct. If it shows “App role: None”, the token is still missing the realm role: double-check in Keycloak that the **roles** scope’s mapper has **“Add to access token”** turned **ON**, then sign out and sign in again. If it still fails, use **Option B** (re-import the realm).

---

### Option B — Re-import the realm (reset realm from file)

This deletes the current **isep-realm** and recreates it from `realm-isep.json`, so all six users and the client config are reset. Use this if Option A is unclear or you prefer a clean reset.

1. **Delete the realm**
   - In your browser go to **http://localhost:8180**, log in as **admin** / **admin**
   - Select realm **isep-realm** (top-left dropdown)
   - In the **left sidebar**, click **Realm settings**
   - Open the **Action** dropdown (or the “…” menu) and choose **“Delete realm”**
   - Type the realm name **isep-realm** when asked and confirm

2. **Restart Keycloak so it re-imports the realm**
   - From your project root run:
     ```bash
     cd "/Users/sameerkhanna/Documents/Projects/DG Shipping"
     docker compose -f infrastructure/docker/docker-compose.dev.yml restart keycloak
     ```
   - Wait until Keycloak is up (e.g. open http://localhost:8180 again). On startup, Keycloak will import `realm-isep.json` and recreate **isep-realm** with the correct client scopes and all six users.

3. **Get a new token in the app**
   - In the ISEP app (**http://localhost:3000**), **Sign out**
   - Sign in again with e.g. **co-user** / **Co@12345!**
   - You should no longer see “Your role: None”.

---

### After Option A or B — Verify

| User     | Role in token        | Examples of what they can access |
|----------|----------------------|-----------------------------------|
| admin-sa | SYSTEM_ADMIN         | Dashboard, Add Body, Admin Home, User List, System health, Audit log, Backups |
| ih-user  | IC_DIVISION_HEAD     | Dashboard, Admin home, Audit log (read-only) |
| dl-user  | DELEGATION_LEADER    | Dashboard, Meetings, Papers, Live meeting |
| co-user  | COORDINATOR          | Dashboard, Bodies list, Create Meeting, Correspondence groups (not Add Body or Admin) |
| me-user  | MEMBER               | Dashboard, Meetings, My tasks, Papers, Feedback |
| vw-user  | VIEWER               | Dashboard, Bodies list, Meetings list, Documents, Calendar (read-only) |

If someone still sees “Your role: None”, check that the user has the correct **Realm role** in Keycloak: **Users** → click the user → **Role mapping** → **Assign role** → choose the realm role (e.g. COORDINATOR) → **Assign**.

---

## Add a user via Admin UI

1. Open **http://localhost:8180** and log in as `admin` / `admin`.
2. Select realm **isep-realm** (top-left dropdown).
3. **Users** → **Create user**  
   - Username: e.g. `dl-user`  
   - Email: e.g. `dl-user@isep.local`  
   - First / Last name as needed  
   - **Create**.
4. **Credentials** → **Set password** (e.g. `Dl@12345!`) → **Save** (turn off “Temporary” if desired).
5. **Role mapping** → **Assign role** → **Filter by realm roles** → select the role (e.g. **DELEGATION_LEADER**) → **Assign**.

---

## Use a role user in the app

1. Ensure Keycloak is running and the test user has the correct realm role.
2. In the app, go to **http://localhost:3000** and sign out if already logged in.
3. Sign in with the username and password from the table above (e.g. `co-user` / `Co@12345!` for Coordinator).
4. SA and IH must complete MFA in dev (if enabled).
5. You should land on the role-specific dashboard (SA, IH, DL, CO, ME, or VW).

**Creating users from the frontend:** Use **Admin → User list → New user** (SCR-USR-02). Full “create in Keycloak from app” requires the backend to call the Keycloak Admin API; until then, create users in Keycloak Admin Console or re-import the realm.

---

## Re-import realm (to get all six users from file)

If you want to re-import `realm-isep.json` (this will overwrite the realm):

1. In Admin Console, delete realm **isep-realm** (Realm settings → **Delete**).
2. Restart Keycloak with the same volume/import so it runs `--import-realm` again and recreates the realm from the JSON.

Or run Keycloak once with an empty data volume so it imports the realm from the file (and creates all six users: `admin-sa`, `ih-user`, `dl-user`, `co-user`, `me-user`, `vw-user`).
