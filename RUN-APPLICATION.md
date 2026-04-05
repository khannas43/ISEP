# How to run the entire ISEP application

Use this **one way** to run the app: load sample data (once), then backend API, then frontend.

---

## (Optional) Load sample data into PostgreSQL

To have **70 meetings** (Jan 2023 – present), bodies, users, correspondence groups, tasks, papers, and other sample data in the app:

1. Ensure PostgreSQL is running (e.g. on port 5432 or 5433).
2. From the project root:
   ```bash
   cd database
   PGPASSWORD=isep_dev_password ./run-migrations-and-seeds.sh localhost 5433
   PGPASSWORD=isep_dev_password ./run-remaining-and-seeds.sh localhost 5433
   ```
   *(Use your actual host and port, e.g. `localhost 5432` if Postgres is local.)*

After this, start the backend and frontend; all list and detail screens will show data from the database.

**Coordinator dropdown (Add/Edit Agenda Item):** The "Assigned coordinator" list is filled from **core.users** via the backend `GET /api/v1/users` endpoint. If the dropdown is empty, (1) run the database seeds above so that `04_seed_users.sql` inserts users into `core.users`, and (2) ensure meeting-service is running. The same user list is used for **Admin → User list** and for participant/coordinator pickers.

---

## What you need first

1. **PostgreSQL** – running with database `isep`, user `isep_app`, password `isep_dev_password`  
   - If you use Docker or another setup, see `database/README.md` for migrations.

2. **Java 21** – for the backend.  
   - If `./mvnw` says "Unable to locate a Java Runtime", set `JAVA_HOME` or use `mvn` instead of `./mvnw`.

3. **Keycloak** (optional) – for real login (e.g. admin-sa).  
   - If Keycloak runs on **port 8180**, start the backend with:
     ```bash
     KEYCLOAK_JWKS_URI=http://localhost:8180/realms/isep-realm/protocol/openid-connect/certs \
     KEYCLOAK_ISSUER_URI=http://localhost:8180/realms/isep-realm \
     mvn spring-boot:run
     ```
   - If you skip Keycloak, you can still use the frontend with **demo/demo** when the backend is down (sample data only).

4. **Node.js** – for the frontend (e.g. Node 18+).

---

## Step 1: Start the backend API

Open a terminal and run:

```bash
cd "backend/meeting-service"
mvn spring-boot:run
```

*(Or use `./mvnw spring-boot:run` if the Maven wrapper works.)*

- Wait until you see something like: **"Started MeetingServiceApplication"**.
- The API will be at **http://localhost:8081**.

If your Keycloak is on port **8180**, run this instead:

```bash
cd "backend/meeting-service"
KEYCLOAK_JWKS_URI=http://localhost:8180/realms/isep-realm/protocol/openid-connect/certs \
KEYCLOAK_ISSUER_URI=http://localhost:8180/realms/isep-realm \
mvn spring-boot:run
```

Leave this terminal open.

---

## Step 2: Start the frontend

Open a **second** terminal and run:

```bash
cd frontend
npm install
npm run dev
```

- Wait until you see: **"Ready on http://localhost:3000"** (or similar).
- Leave this terminal open.

---

## Step 3: Use the application

Local development uses **no URL prefix** (see `frontend/next.config.js`: `basePath` is derived from the pathname of **`NEXTAUTH_URL` / `NEXT_PUBLIC_NEXTAUTH_URL`**). With **`http://localhost:3000`** in **`frontend/.env`**, open:

**http://localhost:3000/**

Production builds (e.g. Docker) set the same variables to **`http://…/isep`** so the app is served under **`/isep`**.

1. Open a browser and go to: **http://localhost:3000/**
2. Log in:
   - With Keycloak: use your Keycloak user (e.g. admin-sa).
   - Without Keycloak / demo: use **demo** / **demo** if the app allows it when the backend is down (sample data only).

The frontend is configured (in `frontend/.env`) to call the API at **http://localhost:8081**, so as long as the backend from Step 1 is running, the app will work end-to-end.

---

## Quick check

- **Backend OK:**  
  ```bash
  curl -s http://localhost:8081/actuator/health
  ```  
  You should get JSON with `"status":"UP"`.

- **Frontend:**  
  Open **http://localhost:3000** and you should see the ISEP app.

---

## If something fails

- **"Connection refused" or "Backend API is unavailable"**  
  The backend is not running or not on 8081. Do Step 1 again and wait for "Started MeetingServiceApplication".

- **Backend fails to start (e.g. database or Keycloak)**  
  Check PostgreSQL is running and that the `isep` database and user exist. If you use Keycloak on 8180, set `KEYCLOAK_JWKS_URI` and `KEYCLOAK_ISSUER_URI` as in Step 1.

- **Frontend shows old data or wrong API URL**  
  Restart the frontend (`Ctrl+C` in the frontend terminal, then `npm run dev` again). If you changed `NEXT_PUBLIC_API_URL`, restart the dev server so it picks up the new value.

---

## Summary

| Step | Command | Where it runs |
|------|---------|----------------|
| 1 | `cd backend/meeting-service && mvn spring-boot:run` | Terminal 1 – API on **8081** |
| 2 | `cd frontend && npm run dev` | Terminal 2 – UI on **3000** |
| 3 | Open **http://localhost:3000** | Browser |

You only need **meeting-service** for the full application; the other microservices are for future or advanced use.
