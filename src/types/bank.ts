export type AccountType = 'SAVINGS' | 'CHECKING'

export type TransactionType = 'DEPOSIT' | 'WITHDRAW'

/** Matches the backend's UserResponse DTO (POST/GET /api/users). */
export interface User {
  userId: string
  name: string
  email: string
}

/** Matches the backend's AccountResponse DTO (POST/GET /api/accounts). */
export interface Account {
  accountId: string
  userName: string
  accountType: AccountType
  balance: number
}

/** Matches the backend's TransactionResponse DTO (GET /api/accounts/{id}/transactions). */
export interface Transaction {
  txnId: string
  type: TransactionType
  amount: number
  date: string
}

export interface CreateAccountInput {
  name: string
  email: string
  accountType: AccountType
}
