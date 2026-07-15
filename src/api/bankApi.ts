import type { Account, AccountType, Transaction, User } from '../types/bank'

/**
 * Base URL for the Spring Boot backend. Falls back to the local default so this works
 * out of the box with zero setup - set VITE_API_BASE_URL in a .env file (see
 * .env.example) if you ever need to point at a different host, e.g. when this gets
 * deployed somewhere other than localhost.
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

/** Thrown for both network failures (backend not running) and API error responses. */
export class ApiError extends Error {}

interface ErrorBody {
  message?: string
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: options?.body ? { 'Content-Type': 'application/json' } : undefined,
      ...options,
    })
  } catch {
    throw new ApiError(
      `Could not reach the API at ${API_BASE_URL}. Is the Spring Boot app running?`
    )
  }

  const text = await response.text()
  const body = text ? JSON.parse(text) : null

  if (!response.ok) {
    const message = (body as ErrorBody | null)?.message ?? `Request failed (${response.status})`
    throw new ApiError(message)
  }

  return body as T
}

// ---- Users -----------------------------------------------------------------

export function createUser(input: { name: string; email: string }): Promise<User> {
  return request<User>('/api/users', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

// ---- Accounts ----------------------------------------------------------------

export function createAccount(input: {
  userId: string
  accountType: AccountType
}): Promise<Account> {
  return request<Account>('/api/accounts', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function getAccount(accountId: string): Promise<Account> {
  return request<Account>(`/api/accounts/${accountId}`)
}

export function listAccounts(): Promise<Account[]> {
  return request<Account[]>('/api/accounts')
}

export function deposit(accountId: string, amount: number): Promise<Account> {
  return request<Account>(`/api/accounts/${accountId}/deposit`, {
    method: 'POST',
    body: JSON.stringify({ amount }),
  })
}

export function withdraw(accountId: string, amount: number): Promise<Account> {
  return request<Account>(`/api/accounts/${accountId}/withdraw`, {
    method: 'POST',
    body: JSON.stringify({ amount }),
  })
}

export function getTransactions(accountId: string): Promise<Transaction[]> {
  return request<Transaction[]>(`/api/accounts/${accountId}/transactions`)
}
