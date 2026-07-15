export type AccountType = 'SAVINGS' | 'CURRENT'

export type TransactionType = 'DEPOSIT' | 'WITHDRAW'

export interface Account {
  accountId: string
  userName: string
  email: string
  accountType: AccountType
  balance: number
}

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

export interface OperationResult {
  success: boolean
  error?: string
}
