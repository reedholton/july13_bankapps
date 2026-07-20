# Simple Bank - Frontend (BankUI, TypeScript)

React + TypeScript frontend for the Simple Bank Application, now with login/registration,
role-based views (regular user vs. admin), and real per-field validation messages on
every form. Connected to the real Spring Boot + MongoDB + JWT backend - no mock data.

## Auth flow

1. Register or log in → the backend returns a JWT plus your name/email/role.
2. That gets stored in React state (`AuthContext`) **and** `localStorage`, so refreshing
   the page doesn't log you out.
3. Every subsequent API call attaches that token as an `Authorization: Bearer` header.
4. Logging out just clears both.

There's no "refresh token" flow here - if the token expires (24 hours by default, set on
the backend), you'll start getting rejected requests and need to log in again. Fine for
a project at this stage; a real production app would add silent token refresh.

## Screens

| Route | Page | Requires |
|---|---|---|
| `/` | Public landing page | - |
| `/login` | Log in | - |
| `/register` | Register | - |
| `/dashboard` | Dashboard - your accounts, or every account + every user if you're an admin | Logged in |
| `/accounts/new` | Open a new account | Logged in |
| `/accounts/:accountId` | Account details | Logged in, owner or admin |
| `/accounts/:accountId/deposit` | Deposit | Logged in, owner or admin |
| `/accounts/:accountId/withdraw` | Withdraw | Logged in, owner or admin |
| `/accounts/:accountId/transactions` | Transaction history | Logged in, owner or admin |

There's no separate admin page to navigate to - `/dashboard` shows different content
depending on who's logged in. A regular user sees their own accounts; an admin sees
every account and every registered user instead, right there on login. Same route,
role-aware content.

"Owner or admin" is enforced by the **backend**, not just hidden in the frontend - even
if you somehow navigated straight to someone else's account URL, the API would reject
the request with `403 Access Forbidden`. The frontend's route guard (`RequireAuth`) is
about UX (redirecting you to `/login` immediately if you're not signed in), not the
actual security boundary.

## Running it

You need the backend running too - see its README. Then:
```bash
npm install
npm run dev
```
Opens at `http://localhost:5173` (or the next free port).


## Deploying to Render

This deploys as a **Static Site** (not a web service) - it's just built HTML/CSS/JS with
no server needed.

1. Deploy the backend first (see its README) - you need its live URL for step 4.
2. Go to [dashboard.render.com](https://dashboard.render.com) → **New** → **Static Site**.
3. Connect this repo and pick the **`frontend_jwt`** branch.
4. Configure:
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
5. Under **Environment**, add:
   ```
   VITE_API_BASE_URL=https://your-backend-name.onrender.com
   ```
   (the backend's real Render URL from step 1, no trailing slash). This has to be set
   **before** the build runs - Vite bakes `VITE_*` variables into the built files at
   build time, not runtime. If you add or change this later, trigger a manual redeploy
   ("Save, rebuild, and deploy") to pick it up - just saving without rebuilding won't.
6. Click **Create Static Site**. Once it's live, note its URL - go back to the
   **backend's** Render settings and set `CORS_ALLOWED_ORIGINS` to this exact URL (see
   the backend README), or every API call will fail with a CORS error in the browser
   console even though the backend itself is fine.
7. **Add the SPA rewrite rule** - this app uses client-side routing (React Router), so
   without this, refreshing on any route other than `/` (like `/dashboard`) will 404. In
   this static site's Render dashboard: **Redirects/Rewrites** → add a rule:
   - **Source**: `/*`
   - **Destination**: `/index.html`
   - **Action**: `Rewrite`

Every push to the `frontend_jwt` branch triggers an automatic rebuild and redeploy.

```
src/
├── main.tsx
├── App.tsx                        # routes, wrapped in AuthProvider
├── index.css
├── types/bank.ts                  # Account, Transaction, User, AuthResult, etc.
├── api/bankApi.ts                 # fetch() calls to the backend, token-aware
├── context/AuthContext.tsx        # login state, localStorage persistence
├── components/
│   ├── PassbookFrame.tsx          # shared chrome, shows signed-in status + logout
│   ├── StampBadge.tsx
│   └── RequireAuth.tsx            # route guard - redirects to /login if not signed in
├── pages/
│   ├── Home.tsx                   # public landing page (no login required)
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Dashboard.tsx              # "my accounts", or the admin view - role-aware
│   ├── CreateAccount.tsx
│   ├── AccountDetails.tsx
│   ├── Deposit.tsx
│   ├── Withdraw.tsx
│   └── TransactionHistory.tsx
└── utils/format.ts                # currency + date formatting
```
