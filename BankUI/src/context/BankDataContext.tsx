import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type {
  Account,
  Transaction,
  CreateAccountInput,
  OperationResult,
} from '../types/bank'

/**
 * MOCK DATA LAYER
 * ----------------
 * This app isn't calling the Spring Boot API yet - everything below lives in memory,
 * seeded once when the app loads. It's built to mirror the shape of the real API
 * responses (see section 8 of the project doc) so that swapping this context's
 * internals for real `fetch()` calls to the backend later is a small, contained change
 * - nothing in the page components below needs to know the difference.
 */

interface BankDataContextValue {
  getAccount: (id: string) => Account | undefined
  listAccounts: () => Account[]
  getTransactions: (id: string) => Transaction[]
  createAccount: (input: CreateAccountInput) => Account
  deposit: (accountId: string, amount: number) => OperationResult
  withdraw: (accountId: string, amount: number) => OperationResult
}

const BankDataContext = createContext<BankDataContextValue | null>(null)

let nextAccountId = 1002
let nextTxnId = 4

const seedAccounts: Record<string, Account> = {
  '1001': {
    accountId: '1001',
    userName: 'John Doe',
    email: 'john.doe@example.com',
    accountType: 'SAVINGS',
    balance: 1000.0,
  },
}

const seedTransactions: Record<string, Transaction[]> = {
  '1001': [
    { txnId: '1', type: 'DEPOSIT', amount: 700.0, date: '2026-03-18' },
    { txnId: '2', type: 'DEPOSIT', amount: 500.0, date: '2026-03-20' },
    { txnId: '3', type: 'WITHDRAW', amount: 200.0, date: '2026-03-22' },
  ],
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

export function BankDataProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<Record<string, Account>>(seedAccounts)
  const [transactions, setTransactions] =
    useState<Record<string, Transaction[]>>(seedTransactions)

  const getAccount = useCallback((id: string) => accounts[id], [accounts])

  const listAccounts = useCallback(
    () => Object.values(accounts).sort((a, b) => a.accountId.localeCompare(b.accountId)),
    [accounts]
  )

  const getTransactions = useCallback(
    (id: string) => transactions[id] ?? [],
    [transactions]
  )

  // Mirrors POST /api/accounts - here it just writes into local state instead of the DB.
  const createAccount = useCallback(({ name, email, accountType }: CreateAccountInput): Account => {
    const accountId = String(nextAccountId++)
    const account: Account = {
      accountId,
      userName: name,
      email,
      accountType,
      balance: 0,
    }
    setAccounts((prev) => ({ ...prev, [accountId]: account }))
    setTransactions((prev) => ({ ...prev, [accountId]: [] }))
    return account
  }, [])

  // Mirrors POST /api/accounts/{id}/deposit, including business rule #2: amount must be positive.
  const deposit = useCallback((accountId: string, amount: number): OperationResult => {
    if (!(amount > 0)) {
      return { success: false, error: 'Deposit amount must be positive' }
    }
    setAccounts((prev) => {
      const current = prev[accountId]
      return { ...prev, [accountId]: { ...current, balance: current.balance + amount } }
    })
    setTransactions((prev) => ({
      ...prev,
      [accountId]: [
        { txnId: String(nextTxnId++), type: 'DEPOSIT', amount, date: today() },
        ...(prev[accountId] ?? []),
      ],
    }))
    return { success: true }
  }, [])

  // Mirrors POST /api/accounts/{id}/withdraw, including business rule #1: no overdrafts.
  const withdraw = useCallback(
    (accountId: string, amount: number): OperationResult => {
      if (!(amount > 0)) {
        return { success: false, error: 'Withdrawal amount must be positive' }
      }
      const current = accounts[accountId]
      if (!current || amount > current.balance) {
        return { success: false, error: 'Insufficient balance for this withdrawal' }
      }
      setAccounts((prev) => ({
        ...prev,
        [accountId]: { ...current, balance: current.balance - amount },
      }))
      setTransactions((prev) => ({
        ...prev,
        [accountId]: [
          { txnId: String(nextTxnId++), type: 'WITHDRAW', amount, date: today() },
          ...(prev[accountId] ?? []),
        ],
      }))
      return { success: true }
    },
    [accounts]
  )

  const value: BankDataContextValue = {
    getAccount,
    listAccounts,
    getTransactions,
    createAccount,
    deposit,
    withdraw,
  }

  return (
    <BankDataContext.Provider value={value}>{children}</BankDataContext.Provider>
  )
}

export function useBankData(): BankDataContextValue {
  const ctx = useContext(BankDataContext)
  if (!ctx) throw new Error('useBankData must be used inside a BankDataProvider')
  return ctx
}
