# Simple Bank - Frontend (BankUI, TypeScript)

React + TypeScript frontend for the Simple Bank Application

## Running both together

You need **both** the backend and this frontend running at the same time, in two
separate terminals (or two Eclipse/VS Code windows):

**Terminal 1 - backend:**
```bash
cd simple-bank-application
./mvnw spring-boot:run
```

**Terminal 2 - frontend:**
```bash
cd BankUI-ts
npm install
npm run dev
```
Opens at `http://localhost:5173` (or the next free port). Open that in your browser.

If the Home screen shows a connection error instead of the account list, the backend
either isn't running yet or isn't reachable at `http://localhost:8080` - double check
Terminal 1's console for a clean startup with no stack trace.

## Screens 

| Doc section | Screen | Route |
|---|---|---|
| 7.1 | Home | `/` |
| 7.2 | Create Account | `/accounts/new` |
| 7.3 | Account Details | `/accounts/:accountId` |
| 7.4 | Deposit | `/accounts/:accountId/deposit` |
| 7.5 | Withdraw | `/accounts/:accountId/withdraw` |
| 7.6 | Transaction History | `/accounts/:accountId/transactions` |

## Project structure

```
src/
├── main.tsx                     # React Router setup
├── App.tsx                      # Route definitions
├── index.css                    # Design tokens + all styles
├── types/bank.ts                # Account, Transaction, User types (match backend DTOs)
├── api/bankApi.ts               # Real fetch() calls to the Spring Boot backend
├── components/
│   ├── PassbookFrame.tsx        # Shared letterhead/breadcrumb chrome
│   └── StampBadge.tsx           # Deposit/Withdraw stamp badge
├── pages/
│   ├── Home.tsx
│   ├── CreateAccount.tsx
│   ├── AccountDetails.tsx
│   ├── Deposit.tsx
│   ├── Withdraw.tsx
│   └── TransactionHistory.tsx
└── utils/format.ts              # Currency + date formatting helpers
```

## Not done yet (by design - saved for later)

- **Authentication / JWT** - every account is currently open to anyone using the app.
- **Deployment / hosting** - this is set up for `localhost` only right now.

