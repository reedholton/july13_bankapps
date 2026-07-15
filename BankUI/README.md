# Simple Bank - Frontend (BankUI, TypeScript)

## Screens (mapped to project doc section 7)

| Doc section | Screen | Route |
|---|---|---|
| 7.1 | Home | `/` |
| 7.2 | Create Account | `/accounts/new` |
| 7.3 | Account Details | `/accounts/:accountId` |
| 7.4 | Deposit | `/accounts/:accountId/deposit` |
| 7.5 | Withdraw | `/accounts/:accountId/withdraw` |
| 7.6 | Transaction History | `/accounts/:accountId/transactions` |

## Running it

```bash
npm install
npm run dev
```
Opens at `http://localhost:5173` by default (or the next free port).

`
## Project structure

```
src/
├── main.tsx                     # React Router setup
├── App.tsx                      # Route definitions
├── index.css                    # Design tokens + all styles
├── types/bank.ts                # Account, Transaction, and related types
├── context/BankDataContext.tsx  # Mock data layer (swap for real API calls later)
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
└── utils/format.ts              # Currency formatting helper
```