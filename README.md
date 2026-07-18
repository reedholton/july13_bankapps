# Simple Bank Application (Spring Boot + MongoDB + JWT Auth)

A REST API backend for a simple banking system

Users register and log in, open accounts, deposit/withdraw, and view transaction
history - all scoped to their own accounts. Admins can additionally view every account
and every user across the whole system.


## The default admin account

On first startup, if no user exists yet with the email in `app.admin.email`
(`application.properties`), one gets created automatically with role `ADMIN`. Defaults:

```
email:    admin@simplebank.local
password: ChangeMe123!
```

## API Endpoints

Base URL: `http://localhost:8080`

### Public (no token required)

| Method | Endpoint | Description | Request Body |
|---|---|---|---|
| POST | `/api/auth/register` | Create an account and log in immediately | `{ "name": "...", "email": "...", "password": "..." }` |
| POST | `/api/auth/login` | Log in | `{ "email": "...", "password": "..." }` |

Both return:
```json
{
  "token": "eyJ...",
  "tokenType": "Bearer",
  "userId": "665f1c2e8b3a4a5e6c7d8e9f",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "role": "USER"
}
```

### Requires a token (`Authorization: Bearer <token>`)

| Method | Endpoint | Description | Notes |
|---|---|---|---|
| GET | `/api/users/{id}` | Get a user's profile | Self or admin only |
| POST | `/api/accounts` | Open an account for yourself | `{ "accountType": "SAVINGS" }` - no `userId` needed |
| GET | `/api/accounts/{id}` | Get account details | Owner or admin only |
| GET | `/api/accounts` | List **your** accounts | |
| POST | `/api/accounts/{id}/deposit` | Deposit money | `{ "amount": 500 }` - owner or admin |
| POST | `/api/accounts/{id}/withdraw` | Withdraw money | `{ "amount": 200 }` - owner or admin |
| GET | `/api/accounts/{id}/transactions` | Transaction history | Owner or admin |

### Admin only (`role: ADMIN`)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/accounts` | Every account in the system |
| GET | `/api/admin/users` | Every registered user |

Any rejected request (missing token, expired token, wrong owner, non-admin hitting an
admin route) returns:
```json
{ "timestamp": "2026-07-16T10:15:30", "message": "Access Forbidden" }
```

## Environment variables

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `8080` | What port the app listens on. Render (and most hosts) set this automatically - don't set it yourself on Render. |
| `MONGODB_URI` | `mongodb://localhost:27017/simplebankdb` | Your MongoDB connection string (Atlas or local). |
| `JWT_SECRET` | a placeholder value | Signing key for JWTs. Set a real, private value for any real deployment. |
| `JWT_EXPIRATION_MS` | `86400000` (24h) | How long a token stays valid. |
| `ADMIN_NAME` / `ADMIN_EMAIL` / `ADMIN_PASSWORD` | see above | The seeded admin account's details. |
| `CORS_ALLOWED_ORIGINS` | `*` | Comma-separated list of frontend URLs allowed to call this API. Defaults wide open for local development. |

## Deploying to Render

Render doesn't offer Java as a native runtime, so this deploys as a **Docker** web
service using the `Dockerfile` already in this repo - no changes needed there.

1. Go to [dashboard.render.com](https://dashboard.render.com) → **New** → **Web Service**.
2. Connect your GitHub account if you haven't, then select this repo.
3. Pick the **`restapi_jwt`** branch.
4. Render should auto-detect the `Dockerfile` and set **Language/Environment** to
   **Docker**. If it doesn't, set it manually. Leave the Build and Start Commands empty -
   the Dockerfile handles both.
5. Under **Environment**, add the variables from the table above:
   - `MONGODB_URI` - your real Atlas connection string.
   - `JWT_SECRET` - generate a real random value (don't reuse the placeholder).
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD` - change these from the defaults.
   - Leave `CORS_ALLOWED_ORIGINS` unset for now (defaults to `*`) - you'll come back
     and set it once the frontend is deployed and you have its real URL (see below).
   - **Don't set `PORT`** - Render provides this automatically, and `application.properties`
     already reads it.
6. Click **Create Web Service**. Render builds the Docker image and deploys it - watch
   the **Logs** tab for `Started SimpleBankApplication...` to confirm a clean startup.
7. Note the URL Render gives you (something like `https://simple-bank-backend.onrender.com`)
   - the frontend needs this next.

### MongoDB Atlas: allow Render to connect

Render's outbound IPs aren't static by default, so in Atlas: **Network Access** → **Add
IP Address** → **Allow Access from Anywhere** (`0.0.0.0/0`). Without this, the backend
will start but every database call will time out.

### After the frontend is deployed too

Come back to this service's **Environment** tab and set:
```
CORS_ALLOWED_ORIGINS=https://your-frontend-name.onrender.com
```
(no trailing slash; comma-separate multiple origins if you ever need more than one).
This closes the wide-open `*` default down to just your real frontend. Save and let it
redeploy.
