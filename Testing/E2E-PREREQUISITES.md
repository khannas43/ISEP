# E2E (Playwright) — What You Need Before Running

Before running **L5 E2E** (`npm run test:e2e`), do these in order. If any step is missing, tests can all fail or skip.

---

## 1. Start the app

From repo root:

```bash
cd frontend && npm run dev
```

Leave it running. The app must be at **http://localhost:3000**.  
In a browser, open http://localhost:3000 — you should see the **ISEP login page** (Username, Password, Sign in).

---

## 2. Start Keycloak (for RBAC tests)

Keycloak must be running with the **isep-realm** and test users.

- If you use Docker: start the stack that runs Keycloak (e.g. port **8180**).
- Realm **isep-realm** must be imported (e.g. from `infrastructure/keycloak/realm-isep.json`).
- Test users must exist: **admin-sa**, **co-user**, **dl-user**, **ih-user**, **me-user**, **vw-user** with the passwords in `frontend/tests/e2e/rbac-auth.ts` (e.g. Admin@12345!, Co@12345!, etc.).

---

## 3. Set Keycloak client secret in `.env`

In **frontend/.env**:

- **NEXTAUTH_SECRET** — must be set (any long random string). You have this.
- **NEXTAUTH_URL** — http://localhost:3000. You have this.
- **KEYCLOAK_CLIENT_SECRET** — must match the **isep-web** client secret in Keycloak.

To get the secret:

1. Open Keycloak Admin Console (e.g. http://localhost:8180).
2. Realm **isep-realm** → **Clients** → **isep-web** → **Credentials** tab.
3. Copy **Client secret** into `frontend/.env` as `KEYCLOAK_CLIENT_SECRET=...`.

If the realm was imported from **realm-isep.json**, the client secret might be exactly:

`CHANGE-ME-IMPORT-REPLACE-WITH-SECRET`

If you changed it in Keycloak, use that value in `.env`.

---

## 4. Run E2E from repo root

Open a **second** terminal. From repo root:

```bash
cd "/Users/sameerkhanna/Documents/Projects/DG Shipping"
cd frontend && npm run test:e2e
```

Do **not** run from a subfolder (e.g. not from `frontend/` if your shell is already in another project).

---

## If tests still fail

- **"Login form not found" / no Username field**  
  App not serving the login page at `/`. Check that `npm run dev` is running and http://localhost:3000 shows the ISEP login form.

- **"Session did not persist" / redirect to login after sign-in**  
  Usually **NEXTAUTH_SECRET** or **NEXTAUTH_URL** wrong, or app and tests not same origin. Ensure `.env` has `NEXTAUTH_URL=http://localhost:3000` and a non-empty `NEXTAUTH_SECRET`. Restart the app after changing `.env`.

- **Keycloak errors / "Invalid client" / 401**  
  **KEYCLOAK_CLIENT_SECRET** in `.env` must match Keycloak’s **isep-web** client secret. Keycloak must be running at **KEYCLOAK_ISSUER** (e.g. http://localhost:8180/realms/isep-realm).

- **Many tests skipped with "Session did not persist"**  
  Same as above: fix NEXTAUTH_* and Keycloak secret, restart app, run tests again.

- **Negative tests skip with "VW was allowed on /papers" or "ME was allowed on /reports/audit"**  
  The app did not redirect to `/unauthorized`. In Keycloak, ensure **vw-user** has only the **VIEWER** realm role and **me-user** only **MEMBER**. If a user has no realm roles, the app (in development) may allow access. Assign the correct role in Keycloak → Users → &lt;user&gt; → Role mapping → assign **VIEWER** or **MEMBER** from the realm roles list.

- **All or many tests fail**  
  1. Confirm the app is running: open http://localhost:3000 and you should see the ISEP login page.  
  2. Run a single test to see the real error:  
     `cd frontend && npx playwright test tests/e2e/smoke.spec.ts --reporter=list`  
     If that fails, the app may not be reachable or the page structure changed.  
  3. Run with one worker to avoid flakiness:  
     `cd frontend && npm run test:e2e -- --workers=1`  
  4. Restart the app after changing `.env` (NEXTAUTH_SECRET, KEYCLOAK_CLIENT_SECRET).
