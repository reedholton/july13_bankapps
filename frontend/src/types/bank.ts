export type AccountType = 'SAVINGS' | 'CHECKING'

export type TransactionType = 'DEPOSIT' | 'WITHDRAW'

export type Role = 'USER' | 'ADMIN'

/** Matches the backend's UserResponse DTO (GET /api/users/{id}, GET /api/admin/users). */
export interface User {
  userId: string
  name: string
  email: string
  role: Role
}

/** Matches the backend's AccountResponse DTO. */
export interface Account {
  accountId: string
  userName: string
  accountType: AccountType
  balance: number
}

/** Matches the backend's TransactionResponse DTO. */
export interface Transaction {
  txnId: string
  type: TransactionType
  amount: number
  date: string
}

/**
 * Matches the backend's AuthResponse DTO (POST /api/auth/register, POST /api/auth/login).
 * This is also what gets persisted to localStorage to survive a page refresh - see AuthContext.
 */
export interface AuthResult {
  token: string
  tokenType: string
  userId: string
  name: string
  email: string
  role: Role
}

export interface RegisterInput {
  name: string
  email: string
  password: string
}

export interface LoginInput {
  email: string
  password: string
}

/** Opening a new account no longer needs a userId - the backend infers it from the JWT. */
export interface CreateAccountInput {
  accountType: AccountType
}
