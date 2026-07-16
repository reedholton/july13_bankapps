# JWT Admin Demo

A standalone Spring Boot project demonstrating JWT authentication and role-based access
control (RBAC).This is a separate, self-contained project - it does **not**
touch the Simple Bank Application backend or frontend.

## What it does

| Endpoint | Access | Method |
|---|---|---|
| `/public/hello` | Anyone, no token | GET |
| `/auth/login` | Anyone, no token (this is how you get a token) | POST |
| `/admin` | Requires a valid JWT **and** the `ADMIN` role | GET |

Anyone hitting `/admin` without a token, with an expired/tampered token, or with a valid
token that isn't an admin's, gets back:
```json
{ "error": "Access Forbidden" }
```
with HTTP status `403`.

## Demo users (in-memory, not a database)

| Username | Password | Role |
|---|---|---|
| `admin` | `admin123` | ADMIN |
| `user` | `user123` | USER |

## Running it

**Eclipse:** Import as an existing Maven project (File → Import → Maven → Existing Maven
Projects), then run `JwtAdminDemoApplication.java` as a Java Application.

**Command line:**
```bash
./mvnw spring-boot:run        # macOS/Linux
mvnw.cmd spring-boot:run      # Windows
```

Runs on `http://localhost:8080` - same port as the bank app, so **don't run both at the
same time** unless you change one of their `server.port` values.

## Testing with Postman

Import `postman/JWT-Admin-Demo.postman_collection.json`. It has 9 requests, in the order
to run them:

1. **Public Endpoint** - works with no token, confirms "regular endpoints need no token."
2. **Login as Admin** - captures the returned JWT into the `adminToken` variable automatically.
3. **Login as Regular User** - same, into `userToken`.
4. **Login - Wrong Password** - expects `401`.
5. **Admin Endpoint - No Token** - expects `403 Access Forbidden`.
6. **Admin Endpoint - With Admin Token** - expects `200`, proves the happy path works.
7. **Admin Endpoint - With User Token** - a *valid* token, but the wrong role. Expects
   `403` - this is the actual RBAC check, not just "is there a token."
8. **Admin Endpoint - Expired Token** - uses a token that was pre-generated already
   expired (signed with the same default secret from `application.properties`), so this
   test works immediately with no waiting required. Expects `403`.
9. **Admin Endpoint - Garbage Token** - a malformed token string. Expects `403`, not a
   500 error (this is the exact case that would have broken with the original reference
   filter code - see point 5 above).

### Testing a "real" expiration (optional)

If you want to see a token expire naturally rather than using the pre-baked one: stop
the app, set `jwt.expiration-ms=5000` in `application.properties` (5 seconds), restart,
log in, wait 6 seconds, then try request #6 again with that same token - it'll now come
back `403`. Set it back to `86400000` (24 hours) afterward.

## Project structure

```
src/main/java/com/example/
├── JwtAdminDemoApplication.java
├── security/
│   ├── JwtService.java              # generate/validate tokens
│   ├── JwtAuthenticationFilter.java # runs on every request, reads the Bearer token
│   └── SecurityConfiguration.java   # filter chain, path rules, demo users, all the beans
├── controllers/
│   ├── AuthController.java          # POST /auth/login
│   ├── PublicController.java        # GET /public/hello
│   └── AdminController.java         # GET /admin
└── dto/
    ├── LoginRequest.java
    └── LoginResponse.java
```
