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

---

## Testing with Postman

`postman/SimpleBankAPI.postman_collection.json` has 19 requests, grouped into four
folders, run top to bottom:

1. **Setup** - registers two users (Alice, Bob) and logs in as the seeded admin,
   capturing all three tokens into collection variables automatically.
2. **Alice's normal usage** - the full happy path: open an account, deposit, withdraw,
   view transactions.
3. **Ownership + RBAC checks** - the actual security tests: no token → 403; Bob trying
   to view Alice's account → 403; admin viewing Alice's account → 200 (bypass works);
   Bob hitting an admin route → 403; admin hitting the same route → 200.
4. **Validation + error cases** - duplicate email → 409, short password → 400, wrong
   login password → 401, business rule violations → 400.

Run the whole collection with the **Runner** to see a pass/fail summary across all 19.
