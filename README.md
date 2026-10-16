# GSPL Employee Directory

A full-stack internal employee directory for Gujarat State Petronet Limited (GSPL). The public can search the directory; a **SUPER_ADMIN** can sign in to add, edit, delete and bulk-import employees from Excel.

> **Naming note:** the repository and several UI strings use "GSPL", while the backend health message and some UI branding use "GTL" (e.g. *"GTL Employee Directory Backend is running"*). Both names appear in the code as-is; this README preserves them.

> **Documentation basis:** this README was written by inspecting the repository at commit `2e3d093` (*"Add employee duplicate detection and replacement"*). Anything the repository cannot answer is marked **Developer must configure/confirm this**.

## 1. Project Overview

**What it does**

- **Public directory (`/`)** — anyone who can reach the site can search, sort and page through employees (name, designation, department, company, extension, mobile number, email). No login is required to read employee data.
- **Admin portal (`/admin/...`)** — a SUPER_ADMIN logs in to view dashboard statistics, add / edit / delete employees (single and bulk), import employees from Excel with a preview → correct → validate → import workflow, and change their own password (local auth mode only).

**Main purpose:** maintain and look up internal contact details (extensions and mobile numbers) with duplicate protection.

**Architecture (as found in the repository)**
GitHub (this repo, branch: main)
  ├── frontend/  → React SPA, intended for Vercel
  └── backend/   → Express API, intended for Render → MongoDB Atlas

The repo contains `frontend/vercel.json` (Vercel SPA rewrite). It contains **no** `render.yaml`, no GitHub Actions workflows and no other deployment configuration. The Render and Atlas setup is therefore documented from `backend/package.json` and `backend/server.js`; see sections 15–17 for items to confirm in the dashboards.

## 2. Technology Stack

| Layer | Technology (from `package.json` / source) |
|---|---|
| Frontend framework | React 19 (`react`, `react-dom` ^19.2.8) |
| Routing | `react-router-dom` ^7.18.4 (`BrowserRouter`) |
| Build tool / dev server | Vite ^8.3.0 with `@vitejs/plugin-react` |
| Styling | Tailwind CSS ^4.3.3 via `@tailwindcss/vite` |
| HTTP client | `axios` ^1.20.0 |
| Linting | ESLint ^10 (react-hooks, react-refresh plugins) |
| Backend framework | Express ^5.2.1 (CommonJS) |
| Database | MongoDB (MongoDB Atlas expected) |
| ODM | Mongoose ^9.10.2 |
| Authentication | JWT (`jsonwebtoken`) + `bcryptjs`; optional LDAP via `ldapjs` |
| Excel/import | `xlsx` ^0.18.5 (reading), `multer` ^2.4.0 (uploads) |
| Security middleware | `helmet`, `cors`, `express-rate-limit` (login only) |
| Other backend deps | `dotenv`, `cookie-parser` (registered, but no cookies are read or set in the code) |
| Dev tooling | `nodemon` (backend `dev` script) |
| Deployment | Vercel (frontend, `vercel.json` present); Render + MongoDB Atlas (backend/database, **not configured in repo**) |

Not used: TypeScript, any test framework, Docker, CI workflows.

## 3. Repository Structure

GSPL-Employee-Directory/
├── .gitignore                      # ignores node_modules, .env*, dist/build, uploads/*, logs
├── backend/
│   ├── .env.example                # backend variable names (no secrets)
│   ├── package.json                # scripts: start, dev
│   ├── server.js                   # entry point: env checks, middleware, routes, DB connect, listen
│   ├── config/db.js                # Mongoose connection (database name is hard-coded here)
│   ├── models/
│   │   ├── Employee.js             # employee schema
│   │   └── User.js                 # admin user schema (role enum: SUPER_ADMIN only)
│   ├── routes/
│   │   ├── employeeRoutes.js       # /api/employees
│   │   ├── authRoutes.js           # /api/auth
│   │   ├── adminRoutes.js          # /api/admin
│   │   └── importRoutes.js         # /api/import (multer upload config lives here)
│   ├── controllers/                # business logic: employee, auth, admin, import
│   ├── middleware/
│   │   ├── authMiddleware.js       # `protect` – verifies Bearer JWT
│   │   └── roleMiddleware.js       # `superAdminOnly` – requires role SUPER_ADMIN
│   ├── services/ldapService.js     # LDAP authentication (used only when AUTH_MODE=ldap)
│   ├── uploads/.gitkeep            # keeps the temp upload folder in git (see note below)
│   └── checkCompanies.js           # manual diagnostic script (see section 21)
└── frontend/
    ├── .env.example                # VITE_API_URL
    ├── package.json                # scripts: dev, build, lint, preview
    ├── vite.config.js              # react + tailwind plugins only
    ├── vercel.json                 # rewrites every path to /index.html (SPA routing)
    ├── eslint.config.js
    ├── index.html
    ├── README.md                   # unmodified Vite template text (not project docs)
    ├── public/                     # favicon.svg, icons.svg
    └── src/
        ├── main.jsx                # React entry
        ├── api.js                  # axios instance (baseURL = VITE_API_URL) + 401 handler
        ├── App.jsx                 # router + PublicDirectory, AdminLogin, ProtectedRoute,
        │                           #   AdminDashboard, AdminImport (all in one file)
        └── pages/
            ├── AdminEmployees.jsx  # admin list, search, sort, select, bulk delete
            ├── AddEmployee.jsx     # add form + duplicate modal (Replace / Add Anyway)
            ├── EditEmployee.jsx    # edit / delete one employee
            └── ChangePassword.jsx
```

> **Important:** keep `backend/uploads/.gitkeep`. `multer` is configured with a function destination (`backend/routes/importRoutes.js`), so it does not create the folder itself. If `backend/uploads/` is missing on the server, Excel preview/import fails.


## 4. Prerequisites

| Requirement | Detail |
|---|---|
| **Node.js** | The repo declares **no** `engines` field and no `.nvmrc`. The locked dependencies require at least: Mongoose 9.10.2 → Node `>=20.19.0`; Vite 8.3.0 → `^20.19.0 \|\| >=22.12.0`; ESLint 10 → `^20.19.0 \|\| ^22.13.0 \|\| >=24`. **Use Node 20.19+ (or 22.13+).** The frontend build and backend syntax checks documented here were verified on Node v22.22.2 / npm 10.9.7. |
| **npm** | Both apps ship a `package-lock.json`, so npm is the package manager in use. |
| **Git** | To clone and push. |
| **MongoDB Atlas** | An Atlas cluster + database user (see section 9). A local MongoDB can also work if `MONGO_URI` points to it — **Developer must confirm**; the code was written for Atlas. |
| **Vercel account** | For frontend hosting. |
| **Render account** | For backend hosting. |
| **LDAP details from IT** | Only if enabling `AUTH_MODE=ldap` (section 22). |


## 5. Clone the Repository

```bash
git clone https://github.com/sarjnapandya-max/GSPL-Employee-Directory.git
cd GSPL-Employee-Directory

The repository has two independent npm projects: `backend/` and `frontend/`. There is **no root `package.json`**; run npm commands inside each folder.

## 6. Install Frontend Dependencies

```bash
cd frontend
npm install        # or: npm ci   (reproducible install from package-lock.json)
```

Scripts (from `frontend/package.json`):

| Command | What it does |
|---|---|
| `npm run dev` | Starts the Vite dev server (default `http://localhost:5173`; no port override in `vite.config.js`) |
| `npm run build` | `vite build` → output in `frontend/dist/` |
| `npm run preview` | Serves the built `dist/` locally |
| `npm run lint` | `eslint .` (see section 23 for current lint status) |

Create the frontend env file before starting (section 8):

```bash
cp .env.example .env      # then edit if your backend is not on localhost:5000

## 7. Install Backend Dependencies

```bash
cd backend
npm install        # or: npm ci

Scripts (from `backend/package.json`):

| Command | What it does |
|---|---|
| `npm start` | `node server.js` (use this in production) |
| `npm run dev` | `nodemon server.js` (auto-restart for local development) |

There is no build step and no `test` script in the backend.

Create the backend env file before starting (section 8):

```bash
cp .env.example .env      # then fill in MONGO_URI and JWT_SECRET

## 8. Environment Variables

Every variable below was found by searching the source for `process.env` / `import.meta.env`.

| Variable | Where | Required? | Purpose | Example (placeholder) |
|---|---|---|---|---|
| `MONGO_URI` | Backend | **Yes** | MongoDB connection string used by `config/db.js` (and `checkCompanies.js`). If missing/invalid the server logs `MongoDB connection failed:` and exits. | `YOUR_MONGODB_CONNECTION_STRING` |
| `JWT_SECRET` | Backend | **Yes** | Signs/verifies login tokens. `server.js` exits at startup if it is missing or **shorter than 32 characters**. | `YOUR_JWT_SECRET` (≥ 32 chars) |
| `PORT` | Backend | No (default `5000`) | HTTP port. The server binds to `0.0.0.0`. Render injects its own value. | `5000` |
| `FRONTEND_URL` | Backend | Effectively yes in production (default `http://localhost:5173`) | The **single** allowed CORS origin. | `http://localhost:5173` locally; `YOUR_FRONTEND_URL` in production |
| `AUTH_MODE` | Backend | No (default `local`) | `local` = username/password stored in MongoDB; `ldap` = verify password against LDAP (section 22). Any other value → login returns `Unsupported authentication mode`. | `local` |
| `LDAP_URL` | Backend | Only if `AUTH_MODE=ldap` | LDAP server host/URL. `ldap://` is prepended if no protocol is given. | `YOUR_LDAP_URL` |
| `LDAP_PORT` | Backend | Only if `AUTH_MODE=ldap` | Appended to `LDAP_URL` if the URL has no port. | `389` (value in `.env.example`) |
| `LDAP_BIND_DN` | Backend | Only if `AUTH_MODE=ldap` | Service account DN used to search for the user. | `YOUR_LDAP_BIND_DN` |
| `LDAP_BIND_PASSWORD` | Backend | Only if `AUTH_MODE=ldap` | Service account password. **Secret.** | `YOUR_LDAP_BIND_PASSWORD` |
| `LDAP_USER_SEARCH_BASE` | Backend | One of this or `LDAP_BASE_DN` | Search base for user lookup (takes precedence). | `YOUR_LDAP_USER_SEARCH_BASE` |
| `LDAP_BASE_DN` | Backend | One of this or `LDAP_USER_SEARCH_BASE` | Fallback search base. | `YOUR_LDAP_BASE_DN` |
| `LDAP_USER_SEARCH_FILTER` | Backend | Only if `AUTH_MODE=ldap` | Filter containing `{username}`; e.g. `(sAMAccountName={username})` is the pattern shown in a code comment. | `YOUR_LDAP_USER_SEARCH_FILTER` |
| `NODE_ENV` | Backend | No | Listed in `backend/.env.example`, but **not read by application code** (Express/libraries may read it internally). | `development` |
| `VITE_API_URL` | Frontend | **Yes** | Base URL of the backend API **including the `/api` suffix**. Used by `src/api.js` and by direct `axios` calls. | `http://localhost:5000/api` locally; `YOUR_API_URL` in production |

**Where to put them**

| Environment | Location |
|---|---|
| Local backend | `backend/.env` (copy of `backend/.env.example`) |
| Local frontend | `frontend/.env` (copy of `frontend/.env.example`) |
| Vercel | Project → **Settings → Environment Variables** |
| Render | Service → **Environment** tab |

> ⚠️ **Never commit `.env` files.** `.gitignore` already ignores `.env` and `.env.*` (but allows `.env.example`). Only put placeholders in `.env.example`.

> ℹ️ `VITE_*` variables are **inlined at build time** by Vite. After changing `VITE_API_URL` on Vercel you must **redeploy** the frontend. Also remember that everything in a `VITE_` variable is visible in the browser — never put secrets there.

## 9. MongoDB Atlas Configuration

**How the backend connects** (`backend/config/db.js`):

```js
mongoose.connect(process.env.MONGO_URI, { dbName: "Gspl_Link" });
```

- The database name is **hard-coded as `Gspl_Link`** and is applied through the `dbName` option, so it applies regardless of any database name in the URI.
- On success the server logs `MongoDB connected: <host>` and `Database: Gspl_Link`.
- On failure the process logs `MongoDB connection failed: <reason>` and exits with code 1.
- The HTTP server starts listening immediately and the DB connects in parallel; there is no retry logic.

**Setup steps**

1. Create an Atlas cluster (tier/region: **Developer must configure/confirm this**).
2. **Database Access:** create a database user with a strong password and read/write permission on the `Gspl_Link` database. Atlas generates the permission model; choose the least privilege that allows read/write on that database.
3. **Network Access:** allow the IP addresses the backend connects from.
   - Local development: your own IP.
   - Render: use Render's outbound IP addresses as shown in Render's documentation/dashboard (**Developer must confirm** the current values), or — as a conscious trade-off — allow `0.0.0.0/0` and rely on a strong database password. Prefer the narrower option.
4. **Connect → Drivers:** copy the `mongodb+srv://…` connection string and place it in `MONGO_URI`. If the password contains special characters, URL-encode them.
5. Do not paste the real string into the README, issues, or commit history.

**Collections and indexes**

- Models: `Employee` → collection `employees`; `User` → collection `users` (Mongoose default pluralisation).
- The code does not disable Mongoose's default `autoCreate` / `autoIndex`, so collections and indexes defined in schemas are created automatically on first connection/use. The only explicit index in the schemas is `unique` on `User.username`. `Employee` has no explicit indexes.
- There is **no seed/migration script** in the repository. A new database starts empty — including the `users` collection, so the first admin must be created manually (section 11).

## 10. Run the Application Locally

**Terminal 1 — backend**

```bash
cd backend
npm install
cp .env.example .env        # edit: set MONGO_URI and JWT_SECRET (≥ 32 chars)
npm run dev                 # or: npm start
```

Expected log lines: `Server running on http://0.0.0.0:5000` and `MongoDB connected: …`.
Quick check: open `http://localhost:5000/api/health` → JSON `{"success":true,"message":"GTL Employee Directory Backend is running"}`.

**Terminal 2 — frontend**

```bash
cd frontend
npm install
cp .env.example .env        # default VITE_API_URL=http://localhost:5000/api
npm run dev
```

**URLs**

| What | URL |
|---|---|
| Frontend (public directory) | `http://localhost:5173/` |
| Admin login | `http://localhost:5173/admin/login` |
| API base used by the frontend | `VITE_API_URL` → `http://localhost:5000/api` |

For CORS to work locally, `FRONTEND_URL` in `backend/.env` must equal the exact origin the browser uses (`http://localhost:5173`, which is also the default if unset).

**Frontend routes** (`src/App.jsx`)

| Path | Access |
|---|---|
| `/` | Public directory |
| `/admin/login` | Login page |
| `/admin/dashboard` | Requires stored token |
| `/admin/employees` | Requires stored token |
| `/admin/employees/add` | Requires stored token |
| `/admin/employees/edit/:id` | Requires stored token |
| `/admin/import` | Requires stored token |
| `/admin/change-password` | Requires stored token |

## 11. Authentication / Admin Access

**Login flow**

1. The login page posts `{ username, password }` to `POST /api/auth/login`.
2. In `AUTH_MODE=local` (default), the backend finds the `User` by `username`, compares the password with `bcryptjs` against `passwordHash`, and on success returns a JWT (`expiresIn: 1h`) containing `userId`, `username`, `role`.
3. The frontend stores the token in browser `localStorage` under `gspl_admin_token` and the user object under `gspl_admin_user`, then navigates to `/admin/dashboard`.
4. Protected API calls send `Authorization: Bearer <token>`.
5. On a `401`, the frontend clears both keys and redirects to `/admin/login`. Tokens expire after 1 hour, so admins must log in again.

**Authorization**

- `protect` (`middleware/authMiddleware.js`): requires a valid Bearer JWT, else `401`.
- `superAdminOnly` (`middleware/roleMiddleware.js`): requires `req.user.role === "SUPER_ADMIN"`, else `403 SUPER_ADMIN access required`.
- The frontend `ProtectedRoute` only checks that a token **exists** in `localStorage` (it does not validate it). Real enforcement is on the server.
- The `User` schema's `role` enum contains only `SUPER_ADMIN`, so every user is a super admin; a `403` from `superAdminOnly` cannot normally be triggered through this schema.

**Login rate limit:** `POST /api/auth/login` allows **5 requests per 15 minutes** per client (`express-rate-limit`). Exceeding it returns *"Too many login attempts. Please try again later."*

> ⚠️ **Observation (confirm in production):** the code does not call `app.set("trust proxy", …)`. Behind Render's reverse proxy, confirm that the login rate limiter behaves as intended (it may count requests by the proxy's address and/or log an `express-rate-limit` proxy warning). **Developer must confirm this.**

**Admin bootstrap — IMPORTANT**

The repository contains **no admin-creation script, seed script, or registration endpoint**. The first admin must be inserted manually into the `users` collection of the `Gspl_Link` database. A user document has this shape:

```json
{
  "username": "YOUR_ADMIN_USERNAME",
  "passwordHash": "<bcrypt hash of the password>",
  "role": "SUPER_ADMIN"
}
```

- For `AUTH_MODE=local`, `passwordHash` must be a bcrypt hash (the app uses `bcryptjs`, cost 10, when changing passwords). Generate the hash with your own tooling; do not store plaintext passwords and do not put the real password or hash in the repository or this README.
- For `AUTH_MODE=ldap`, the password is verified by LDAP, but a matching `users` document with `role: "SUPER_ADMIN"` is still required for admin access (otherwise the response is `403 … not authorized for admin access`). `passwordHash` is optional in the schema.
- Any local scripts you write for this are **local-only** — see section 21. If one is used in production, delete the script and clear shell history afterwards.

**Change password** (`/admin/change-password` → `PUT /api/auth/change-password`)

- Only works when `AUTH_MODE=local` (otherwise `403`).
- Requires current password, new password and confirmation; new must differ from current and match confirmation. No minimum-length or complexity rule was found in the code.


## 12. Employee Management

**Employee fields** (`models/Employee.js`): `employeeName`, `designation`, `department`, `company`, `extension`, `mobileNo` (all required strings, trimmed) and `email` (optional, trimmed, lower-cased). Timestamps are added automatically.

**Listing / search / filtering** (`GET /api/employees`, public)

| Query param | Behavior |
|---|---|
| `search` | Case-insensitive match across `employeeName`, `designation`, `department`, `company`, `extension`, `mobileNo`, `email` |
| `sortBy` | One of `employeeName` (default), `designation`, `department`, `company`, `extension`, `mobileNo`; anything else falls back to `employeeName` |
| `sortOrder` | `asc` (default) or `desc` |
| `page` | Default 1 |
| `limit` | Default 10, maximum 100. The public page offers 10/25/50/100 (default 25); the admin list uses 10 per page |

> ⚠️ **Known behavior:** the `search` text is passed to `new RegExp(search.trim(), "i")` without escaping, so it is interpreted as a regular expression. Input such as `(` is an invalid regex and results in a `500 Failed to fetch employees`. This is current behavior, documented as-is.

**Adding** (`/admin/employees/add` → `POST /api/employees`, SUPER_ADMIN)

- Required: all fields except email. Missing fields → `400` with `missingFields`.
- `mobileNo` must be **exactly 10 digits** (`/^\d{10}$/`) on the backend.
- Email has no format validation in the backend.
- If a duplicate is found the API returns `409` with `duplicateDetected: true`, the list of `duplicates` and `matchingEmployees`; the UI shows a duplicate modal with **Replace Existing** and **Add Employee Anyway** (section 14).

**Editing** (`/admin/employees/edit/:id` → `PUT /api/employees/:id`, SUPER_ADMIN)

- Same required fields and 10-digit mobile rule. Submitting an empty email **clears** the stored email.
- The new values are checked against **other** employees (same four fields as below). A collision returns `409` with `conflicts`; there is no "save anyway" override on edit.

**Deleting**

- `DELETE /api/employees/:id` and `DELETE /api/employees/bulk-delete` (body `{ "ids": [...] }`) — SUPER_ADMIN. Deletion is **permanent** (hard delete). The admin list has row checkboxes and a **Delete Selected** button.

**Dashboard** (`/admin/dashboard` → `GET /api/admin/stats`, SUPER_ADMIN): total employees, total departments, total companies, plus per-department and per-company counts and an employee list.


## 13. Excel Import

All import endpoints require a valid token **and** SUPER_ADMIN. The UI (`/admin/import`) uses these endpoints in order:

1. **Upload / Preview** — admin selects a `.xlsx` or `.xls` file (max **5 MB**) and clicks **Preview Excel** → `POST /api/import/preview` (multipart field name `file`). The backend reads the **first sheet only**, deletes the temporary file afterwards, and returns the rows as JSON.
2. **Column check** — header names are trimmed and internal whitespace collapsed; header matching is otherwise **case-sensitive**. Accepted headers:

   | Field | Accepted header(s) | Required |
   |---|---|---|
   | Employee name | `Employee Name` **or** `Name of the Employee` | Yes |
   | Designation | `Designation` | Yes |
   | Department | `Department` | Yes |
   | Company | `Company` | Yes |
   | Extension | `Extension` **or** `New Ext.` | Yes |
   | Mobile | `Mobile No` | Yes |
   | Email | `Email` | No (column may be absent) |

   Missing columns → `400 Excel file has missing required columns.` with `missingColumns`.
3. **Duplicate detection at preview** — the preview checks duplicates inside the file and against MongoDB (rules in section 14). If duplicates exist the response is `400` but **still includes the rows**, so the UI can highlight them.
4. **Row editing / correction** — the admin can click **Edit Row N** (Excel row numbers: header = row 1, first data row = row 2), change values and re-validate → `POST /api/import/validate-corrected` with `{ rows }`. This checks required fields, mobile format, and duplicates again.
5. **Value validation** — on validate/import, every row needs all required fields, and `mobileNo` must be **10 or 11 digits** (`/^\d{10,11}$/`). Note this differs from the manual Add/Edit forms, which require exactly 10 digits. Preview itself reports column and duplicate problems only; value validation runs on validate-corrected and the import calls.
6. **Clean import** — when no duplicates or errors remain, **Import** → `POST /api/import/import-corrected` with `{ rows }`. All rows are validated and duplicate-checked first; nothing is created if any problem remains. (Rows are then created one by one without a database transaction.)
7. **Duplicate handling** — when duplicates exist the admin can select duplicate rows and choose:
   - **Replace Selected Existing Records** — for each selected row, pick the existing employee to overwrite from a dropdown (*"Choose matching employee…"*), which lists every existing record that matched, so ambiguous matches are resolved explicitly. Rows that only duplicate *other Excel rows* have no existing employee to select and must be corrected or imported as intentional duplicates. The call is `POST /api/import/import-duplicates` with `{ rows, rowNumbers, replaceMappings, forceDuplicateImport: true }`.
   - **Upload Selected Duplicates (n)** — saves the selected duplicate rows as **new, separate** employee records (intentional duplicates), via the same endpoint without `replaceMappings`.
   - In both cases all non-duplicate rows in the file are also imported, a browser confirmation dialog is shown first, and unselected duplicate rows are skipped.

**Replacement details** (`importDuplicateExcelData`): `forceDuplicateImport` must be exactly `true`. The mapped employee is looked up by its Mongo `_id` (invalid → `400`, not found → `404`). Before overwriting, the Excel row's name/extension/mobile/email are checked against **other** employees; a collision returns `409 Cannot replace row N: …`. A replacement overwrites all seven fields; a blank Excel email clears the stored email.

**Endpoints present but not called by the current UI:** `POST /api/import/upload` (saves the file and returns its details; the uploaded file is **not** deleted by this endpoint) and `POST /api/import/import` (direct file import with the same validation/duplicate blocking).

## 14. Duplicate Detection Rules

**Fields checked:** employee name, extension, mobile number, email (email only when provided). Matching is **exact** after trimming — not fuzzy or partial.

| Field | Manual Add (`POST /api/employees`) | Excel vs. database | Within the Excel file |
|---|---|---|---|
| Employee name | exact, **case-insensitive** | exact, **case-insensitive** | exact, case-insensitive (trimmed) |
| Extension | exact, **case-insensitive** | exact, **case-sensitive** | exact, case-insensitive (trimmed) |
| Mobile number | exact | exact | exact (trimmed) |
| Email | exact, case-insensitive (skipped if blank) | exact, case-insensitive (skipped if blank) | exact, case-insensitive (blank ignored) |
| Name + Company | — | — | extra check: same name **and** same company in more than one row |

Additional facts confirmed in the code:

- A record that matches on **any one** field is reported as a duplicate (not all four).
- Multiple existing employees can match (up to 100 per field). All are returned so the admin can choose which one to replace.
- Excel row numbers in messages are spreadsheet row numbers (header = 1).
- Special characters in names/emails are regex-escaped for the duplicate lookups.
- Editing a record (`PUT`) checks the new values against *other* records only.

**Duplicate detection vs. Replace Existing vs. Add Employee Anyway**

| Action | What it does |
|---|---|
| **Duplicate detection** | Automatic. Blocks the save and shows the matching existing record(s). Nothing is written. |
| **Replace Existing** | Admin picks one matching existing employee; the form values **overwrite that record** (`PUT /api/employees/:id`). No new record is created. The overwrite is rejected if the new values also collide with a *different* record. |
| **Add Employee Anyway** | Resends the create request with `allowDuplicate: true`, which **skips all duplicate checks** and creates a new record, intentionally leaving two records with the same name/extension/mobile/email. |


## 15. Production Deployment — Vercel

Settings derived from `frontend/package.json`, `frontend/vite.config.js` and `frontend/vercel.json`.

1. **Connect GitHub:** Vercel dashboard → **Add New… → Project** → import `sarjnapandya-max/GSPL-Employee-Directory`.
2. **Root Directory:** set to **`frontend`** (the repo root has no `package.json`).
3. **Build settings:**

   | Setting | Value |
   |---|---|
   | Framework Preset | Vite (Vercel normally auto-detects this from `frontend/`; confirm) |
   | Install Command | default (`npm install`) |
   | Build Command | `npm run build` (runs `vite build`) |
   | Output Directory | `dist` (Vite default; `vite.config.js` sets no `outDir`) |

4. **Environment variables:** add `VITE_API_URL` = `https://YOUR_RENDER_SERVICE_URL/api` (must include `/api`, no trailing slash). Apply to Production (and Preview if used).
5. **Deploy.**
6. **Verify:** open the Vercel URL; the directory should load (needs the backend running). Then open `/admin/login` **directly** and refresh a deep link such as `/admin/employees` — it must not 404. `frontend/vercel.json` rewrites every path to `/index.html`, which makes client-side routing work.
7. **Set the backend CORS origin:** copy the final Vercel production URL into `FRONTEND_URL` on Render (section 16) and redeploy/restart the backend.
8. **Future deployments:** with the standard Vercel–GitHub integration, a push to the project's Production Branch triggers a new production deployment. The repository's default branch is `main`. **Developer must confirm** in Vercel → Settings → Git that the Production Branch is `main`; the repo contains no GitHub Actions or other deployment config to prove this.

## 16. Production Deployment — Render

There is no `render.yaml` in the repo. The values below come from `backend/package.json` and `backend/server.js`; confirm them in the Render dashboard.

1. **Create Web Service:** Render dashboard → **New → Web Service**.
2. **Connect GitHub:** select `sarjnapandya-max/GSPL-Employee-Directory`, branch `main`.
3. **Root Directory:** `backend`.
4. **Runtime:** Node (use a version satisfying section 4; **Developer must confirm** how the Node version is selected in your Render service, since the repo pins none).
5. **Build Command:** `npm install` (the backend has no build step; `npm ci` also works because `package-lock.json` is committed).
6. **Start Command:** `npm start` (runs `node server.js`).
7. **Environment variables:** add `MONGO_URI`, `JWT_SECRET` (≥ 32 chars), `FRONTEND_URL`, and `AUTH_MODE` (plus the `LDAP_*` variables only for LDAP). Do **not** set `PORT` unless Render requires it — the app reads `process.env.PORT` and binds `0.0.0.0`, which is what Render expects.
8. **Deploy.**
9. **Verify service health:** open `https://YOUR_RENDER_SERVICE_URL/api/health`. Expected JSON: `{"success":true,"message":"GTL Employee Directory Backend is running"}`. Render logs should show `Server running on http://0.0.0.0:<port>` and `MongoDB connected: …` / `Database: Gspl_Link`. You may set `/api/health` as the Render health check path (optional).
10. **Future deployments:** Render's auto-deploy on new commits to the connected branch is a Render service setting (the repo configures nothing). **Developer must confirm** Auto-Deploy is enabled for `main`.

Notes for Render: the service's filesystem is used only for short-lived Excel temp files in `backend/uploads/` (deleted after preview/import). No persistent disk is needed by the code.

---

## 17. Production Environment Variables

**Frontend / Vercel**

| Variable | Value source | Required |
|---|---|---|
| `VITE_API_URL` | Public URL of the Render service + `/api` (e.g. `https://YOUR_RENDER_SERVICE_URL/api`) | Yes |

**Backend / Render**

| Variable | Value source | Required |
|---|---|---|
| `MONGO_URI` | Atlas → Connect → Drivers (`YOUR_MONGODB_CONNECTION_STRING`) | Yes |
| `JWT_SECRET` | You generate a long random value (≥ 32 chars) and keep it private | Yes |
| `FRONTEND_URL` | Exact Vercel production origin, e.g. `https://YOUR_VERCEL_URL` (scheme included, **no trailing slash**) | Yes (CORS) |
| `AUTH_MODE` | `local` (default) or `ldap` | Optional |
| `LDAP_URL`, `LDAP_PORT`, `LDAP_BIND_DN`, `LDAP_BIND_PASSWORD`, `LDAP_USER_SEARCH_BASE` / `LDAP_BASE_DN`, `LDAP_USER_SEARCH_FILTER` | Provided by IT | Only for `AUTH_MODE=ldap` |
| `PORT` | Supplied by Render | Not set manually |

**What must change between local and production**

| Variable | Local | Production |
|---|---|---|
| `VITE_API_URL` | `http://localhost:5000/api` | Render URL + `/api` (rebuild required) |
| `FRONTEND_URL` | `http://localhost:5173` | Vercel production URL |
| `MONGO_URI` | Dev/local database string | Production Atlas string (database name is `Gspl_Link` either way, so use separate clusters/users if you need isolation) |
| `JWT_SECRET` | Throw-away dev value | A different, private production value |

CORS allows exactly **one** origin. A Vercel preview URL will be rejected unless `FRONTEND_URL` is set to it.

---

## 18. Production Verification / Smoke Test

Run after every deployment. Use a clearly named test employee and delete it afterwards.

```bash
# Backend is up
curl https://YOUR_RENDER_SERVICE_URL/api/health

# Protected route rejects anonymous access (expect HTTP 401)
curl -i https://YOUR_RENDER_SERVICE_URL/api/admin/stats
```

- [ ] `GET /api/health` returns `success: true`
- [ ] Frontend loads at the Vercel URL, and a refresh on `/admin/login` does not 404
- [ ] Browser dev tools show no CORS errors on the directory page
- [ ] Employee directory loads (public, no login)
- [ ] Search works (e.g. by name, extension)
- [ ] Column sorting and page-size / pagination work
- [ ] Login works with a valid admin; wrong password is rejected
- [ ] Dashboard (`/admin/dashboard`) shows totals
- [ ] Anonymous request to a protected endpoint returns `401` (curl above)
- [ ] Add Employee works (10-digit mobile)
- [ ] Edit Employee works
- [ ] Duplicate detection works (re-adding the same name/extension/mobile shows the duplicate modal)
- [ ] **Replace Existing** works and does not create a second record
- [ ] **Add Employee Anyway** creates a second record (then delete it)
- [ ] Excel upload + **Preview Excel** works
- [ ] Excel validation works (e.g. a row with a bad mobile number is flagged on revalidation/import)
- [ ] Excel duplicate detection works (file-internal and against existing data)
- [ ] Excel **Replace Selected Existing Records** works
- [ ] Excel **Upload Selected Duplicates** works (intentional duplicates)
- [ ] Change Password works (only when `AUTH_MODE=local`)
- [ ] Database updates correctly (verify the changes in Atlas → `Gspl_Link` → `employees`)
- [ ] Delete test records created during the smoke test

> The SUPER_ADMIN `403` path can't normally be exercised, because `SUPER_ADMIN` is the only role in the `User` schema; protection is verified through the `401` check above.

---

## 19. API / Backend Routes

Base URL: `https://YOUR_RENDER_SERVICE_URL` (local: `http://localhost:5000`). Defined in `backend/server.js` and `backend/routes/*`.

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/api/health` | None | Health check |
| POST | `/api/auth/login` | None (rate-limited: 5 / 15 min) | Log in; returns JWT |
| PUT | `/api/auth/change-password` | Bearer JWT | Change own password (`AUTH_MODE=local` only) |
| GET | `/api/employees` | None | List/search/sort/paginate employees |
| GET | `/api/employees/:id` | None | Get one employee |
| POST | `/api/employees` | SUPER_ADMIN | Create employee (409 on duplicate unless `allowDuplicate: true`) |
| PUT | `/api/employees/:id` | SUPER_ADMIN | Update/replace an employee |
| DELETE | `/api/employees/bulk-delete` | SUPER_ADMIN | Delete many (`{ "ids": [...] }`) |
| DELETE | `/api/employees/:id` | SUPER_ADMIN | Delete one |
| GET | `/api/admin/stats` | SUPER_ADMIN | Dashboard statistics |
| POST | `/api/import/preview` | SUPER_ADMIN | Parse Excel (`file`), check columns & duplicates |
| POST | `/api/import/validate-corrected` | SUPER_ADMIN | Re-validate corrected rows (`{ rows }`) |
| POST | `/api/import/import-corrected` | SUPER_ADMIN | Import validated, duplicate-free rows (`{ rows }`) |
| POST | `/api/import/import-duplicates` | SUPER_ADMIN | Import non-duplicates + replace/duplicate-create selected rows |
| POST | `/api/import/upload` | SUPER_ADMIN | Upload only (not used by the UI) |
| POST | `/api/import/import` | SUPER_ADMIN | Direct Excel import (not used by the UI) |

"SUPER_ADMIN" means `protect` + `superAdminOnly` (valid Bearer token whose role is `SUPER_ADMIN`). Error responses use `{ "success": false, "message": "…" }`. Upload limits: `.xlsx`/`.xls` only, 5 MB.

> The employee list and single-employee endpoints are **public** and return email and mobile number to any caller. This is current behavior of the application.

---

## 20. Security Notes

- Never commit `.env` files (`backend/.env`, `frontend/.env`). Only `.env.example` files with empty/placeholder values belong in Git.
- Never commit passwords, password hashes, JWT secrets, MongoDB connection strings or `LDAP_BIND_PASSWORD`.
- Keep `JWT_SECRET` private, ≥ 32 characters, and different between environments. Changing it invalidates all existing tokens.
- Configure secrets only in the Render / Vercel dashboards for production. Remember `VITE_API_URL` is public — never put a secret in any `VITE_` variable.
- Restrict MongoDB Atlas **Network Access** to the IPs that need it; use a dedicated database user with minimal permissions.
- Do not commit debugging/bootstrap scripts that contain credentials; remove credentials from shell history after use.
- Do not use development credentials in production. Rotate any credential that was ever committed or shared.
- Admin tokens are stored in `localStorage` (`gspl_admin_token`) and last 1 hour.
- The backend uses `helmet` and a single-origin CORS policy; keep `FRONTEND_URL` exact.
- Excel uploads are limited to `.xlsx`/`.xls` and 5 MB.

---

## 21. Files That Must NOT Be Committed

Already ignored by `.gitignore`: `.env`, `.env.*` (except `.env.example`), `node_modules/`, `dist/`, `build/`, `backend/uploads/*` (except `.gitkeep`), logs, OS files.

Inspection of the repository found:

| File | Purpose | Commit it? |
|---|---|---|
| `backend/.env.example`, `frontend/.env.example` | Variable-name templates, no secrets | **Yes** (keep placeholders only) |
| `backend/uploads/.gitkeep` | Keeps the upload folder present | **Yes** — required (section 3) |
| `backend/checkCompanies.js` | Manual diagnostic that prints distinct `company` values. Contains no credentials; reads `MONGO_URI` from `.env`. **It does not set `dbName: "Gspl_Link"`**, so it queries whichever database the URI selects — include `/Gspl_Link` in the URI when running it. Run with `node checkCompanies.js` from `backend/`. | Already committed; harmless, not used by the app. Leave as-is unless the team decides otherwise. |
| `frontend/README.md` | Unmodified Vite template text | Already committed; not project documentation |

Not present in the repository (and not ignored by `.gitignore`), so keep them **local-only** if they exist on a developer machine:

- **Admin creation / bootstrap scripts** — contain or need an admin password; never commit.
- **LDAP / Active Directory test scripts** — would contain a bind DN/password or real usernames; never commit.
- **Temporary diff/patch files** and any file containing connection strings or credentials.

`.gitignore` has no patterns for these, so check `git status` carefully before every commit and add files by name (section 23).

---

## 22. LDAP / Active Directory

**Status: code exists, disabled by default, and its production use is deferred to GSPL IT.**

- `AUTH_MODE` defaults to `local`. LDAP is used only when `AUTH_MODE=ldap`. The code comment in `authController.js` says LDAP is *"Used when GSPL IT enables LDAP."*
- `backend/services/ldapService.js` implements a search-then-bind flow: bind with a service account (`LDAP_BIND_DN` / `LDAP_BIND_PASSWORD`), find the user's DN with `LDAP_USER_SEARCH_FILTER` (`{username}` is substituted, special characters escaped), then bind as that DN with the user's password. Exactly one match is required.
- After LDAP succeeds, MongoDB is still consulted: the username must exist in `users` with `role: "SUPER_ADMIN"`, otherwise login returns `403`.
- In LDAP mode the local change-password endpoint is disabled.
- Missing LDAP settings return `500 LDAP authentication is not configured.`
- `LDAP_URL` is prefixed with `ldap://` when no protocol is given (use an explicit `ldaps://…` URL if IT requires TLS; the code sets no extra TLS options).
- **Not determinable from the repository:** whether this flow has been tested against GSPL's real directory, and the real values for the LDAP variables. **Developer must configure/confirm this with GSPL IT.** Do not enable `AUTH_MODE=ldap` in production until IT supplies the settings and the flow has been tested.

---

## 23. Deployment Maintenance Workflow

1. **Branch/change:** `git checkout -b my-change` (or work on `main` if that is team practice).
2. **Test locally:** run backend (`npm run dev`) and frontend (`npm run dev`) per section 10 and exercise the changed feature.
3. **Run build/syntax checks:**
   ```bash
   # Frontend
   cd frontend
   npm run build
   npm run lint

   # Backend (no build/test scripts exist; syntax-check what you changed)
   cd ../backend
   node --check server.js
   node --check controllers/importController.js   # example: any file you edited
   ```
   > **Current lint status (verified at commit `2e3d093`):** `npm run lint` reports **3 errors and 1 warning** that already exist (unused variables `errorDetails`, `handleSearch`, `token` in `src/App.jsx`; a `react-hooks/exhaustive-deps` warning in `src/pages/AdminEmployees.jsx`). They do not affect `npm run build`, which succeeds. Do not add new lint problems. There are no automated tests.
4. **Commit only intended files** — never `git add .`:
   ```bash
   git status
   git diff
   git add path/to/changed-file1 path/to/changed-file2
   git commit -m "Describe the change"
   ```
5. **Push:** `git push origin <branch>` (production deploys come from `main` — see sections 15/16 for the deployment-trigger items to confirm).
6. **Verify Vercel deployment:** Vercel → Deployments → latest is *Ready*; open the site.
7. **Verify Render deployment:** Render → Events/Logs show a successful deploy, `MongoDB connected`, and `/api/health` responds.
8. **Run the production smoke test** (section 18).

If you change `VITE_API_URL`, redeploy the frontend. If you change `FRONTEND_URL`, restart/redeploy the backend.

---

## 24. Troubleshooting

| Symptom | Likely cause / fix (based on this code) |
|---|---|
| Directory shows *"Unable to load employee directory."* | Backend unreachable or CORS blocked. Check `VITE_API_URL`, the Render service status, and `/api/health`. |
| Requests go to a URL containing the word `undefined` | `VITE_API_URL` was not set when the frontend was built. Set it on Vercel (or `frontend/.env`) and rebuild/restart. |
| Browser console shows a CORS error | `FRONTEND_URL` must exactly equal the browser origin (scheme + host, no trailing slash). Only one origin is allowed; Vercel preview URLs are blocked unless set. Restart the backend after changing it. |
| API returns HTML instead of JSON | `VITE_API_URL` points at the frontend host, or is missing `/api`. |
| Backend exits: `JWT_SECRET is missing in backend .env` | Set `JWT_SECRET` in `backend/.env` / Render. |
| Backend exits: `JWT_SECRET must be at least 32 characters long.` | Use a longer secret. |
| Backend exits: `MongoDB connection failed: …` | Check `MONGO_URI` (spelling, URL-encoded password), Atlas database user, and Atlas **Network Access** allow-list for the host running the backend. |
| Logged in but data missing | The app reads database `Gspl_Link` (hard-coded). Confirm your data is in that database. |
| Login always fails (`Invalid username or password`) | The `users` document is missing, `passwordHash` is not a valid bcrypt hash, or `AUTH_MODE` is wrong. |
| `Too many login attempts` | Login limiter (5 per 15 minutes). Wait, or restart the service if it was exhausted by a proxy-IP effect (see section 11 observation). |
| `Unsupported authentication mode` | `AUTH_MODE` is neither `local` nor `ldap`. |
| `LDAP authentication is not configured.` / `…not authorized for admin access.` | Missing `LDAP_*` variables / no matching `SUPER_ADMIN` user in MongoDB (section 22). |
| Redirected to `/admin/login` unexpectedly | JWT expired (1 hour) or was rejected (`JWT_SECRET` changed). Log in again. |
| `Invalid or expired token` (401) / `SUPER_ADMIN access required` (403) | Token invalid / role not `SUPER_ADMIN`. |
| Deep link such as `/admin/login` 404s on Vercel | `frontend/vercel.json` missing or Root Directory not set to `frontend`. |
| Vercel build fails | Root Directory must be `frontend`; Node version must meet section 4; run `npm ci && npm run build` locally to reproduce. |
| Render deploy fails | Root Directory must be `backend`; start command `npm start`; Node version must be ≥ 20.19; check logs for the env-var errors above. |
| Excel: `Only .xlsx and .xls files are allowed.` / `File size cannot exceed 5 MB.` | Wrong format or file too large. |
| Excel: `Excel file has missing required columns.` | Header names must match section 13 exactly (case-sensitive); data must be on the **first sheet**. |
| Excel preview/import fails on the server | Confirm `backend/uploads/` exists (keep `.gitkeep`). |
| Excel: rows flagged as duplicates | Expected behavior; see section 14. Fix the rows or use Replace / intentional duplicate. |
| Excel: *"Mobile No must contain 10 or 11 digits."* | Excel allows 10–11 digits, digits only. |
| Search returns a 500 for input like `(` | Search text is treated as a regular expression (section 12). |

---

## 25. Backup / Recovery Notes

A future administrator must preserve:

| Asset | What to keep |
|---|---|
| **GitHub repository** | `sarjnapandya-max/GSPL-Employee-Directory` — ownership/admin access, and a clone or mirror. |
| **Vercel project** | Project settings (Root Directory `frontend`, build settings), domain settings, `VITE_API_URL`; access for at least two people. |
| **Render service** | Service configuration (root `backend`, build/start commands), env vars, access for at least two people. |
| **MongoDB Atlas database** | The `Gspl_Link` database (`employees`, `users`). Configure Atlas backups/snapshots or take periodic exports — **Developer must configure/confirm the Atlas backup tier and schedule**. |
| **Environment variables / secrets** | A secure record in a password manager (never in Git) of `MONGO_URI`, `JWT_SECRET`, `FRONTEND_URL`, `AUTH_MODE` and any `LDAP_*` values. Losing `JWT_SECRET` only forces re-login; losing `MONGO_URI` credentials means resetting the Atlas user. |
| **Admin/access credentials** | The SUPER_ADMIN account(s) in the `users` collection, plus Atlas, Render, Vercel and GitHub account access. Do not store them in the repo. |

Recovery outline: restore the Atlas data → recreate/redeploy the Render service from the repo with the saved environment variables → recreate/redeploy the Vercel project with `VITE_API_URL` → ensure `FRONTEND_URL` matches the new Vercel URL → run the smoke test.

---

## 26. Final Production Architecture

```
User (browser)
  |
  v
Vercel Frontend            (React + Vite SPA, frontend/, VITE_API_URL → backend)
  |   HTTPS, JSON, Authorization: Bearer <JWT>
  v
Render Backend API         (Express, backend/, `npm start`; CORS origin = FRONTEND_URL)
  |   Mongoose, database "Gspl_Link"
  v
MongoDB Atlas              (collections: employees, users)

Optional (AUTH_MODE=ldap, not enabled by default):
Render Backend API --> GSPL LDAP / Active Directory (credential check only)

## 27. Developer Handover

**Implemented in the code**

- Public directory with search, sort and pagination.
- JWT-based SUPER_ADMIN authentication (local mode), login rate limiting, local password change.
- Admin dashboard, add / edit / delete / bulk-delete employees.
- Duplicate detection on manual add and edit, **Replace Existing**, **Add Employee Anyway**.
- Excel import: preview, column check, row correction, revalidation, duplicate detection (in-file and database), replace-selected-existing, intentional-duplicate import.
- LDAP authentication code path (disabled by default).

**Deployment**

- Frontend is set up for Vercel (`frontend/vercel.json`). Backend is set up to run on Render with `npm start`. Which services are *currently live*, and their URLs/settings, cannot be determined from the repository — **Developer must confirm this in the Vercel/Render/Atlas dashboards**.

**Intentionally deferred / not in the repo**

- LDAP/Active Directory use in production (pending GSPL IT configuration and testing).
- Admin account creation tooling (no script; first admin is inserted manually).
- Render/Vercel configuration-as-code, CI, automated tests, database migrations/seed data.

**Know before changing anything**

- Database name `Gspl_Link` is hard-coded in `backend/config/db.js`.
- Only one CORS origin is allowed (`FRONTEND_URL`).
- `VITE_API_URL` is baked in at build time and must include `/api`.
- Duplicate rules differ slightly between manual add (extension case-insensitive) and Excel (extension case-sensitive), and mobile validation differs (exactly 10 digits manually; 10–11 digits in Excel). Keep these in mind before "fixing" either side.
- Public `GET /api/employees` endpoints expose all employee fields without authentication.
- `src/App.jsx` is a large single file (~3,000 lines) containing the public directory, login, dashboard and import screens.
- `npm run lint` currently has pre-existing findings (section 23).
- Keep `backend/uploads/.gitkeep`; never commit `.env` files or credential-bearing scripts.
