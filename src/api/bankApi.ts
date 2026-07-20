import type {
  Account,
  AccountType,
  AuthResult,
  LoginInput,
  RegisterInput,
  Transaction,
  User,
} from '../types/bank'
import { startLoading, stopLoading } from '../utils/loadingStore'

/**
 * Base URL for the Spring Boot backend. Falls back to the local default so this works
 * out of the box with zero setup - set VITE_API_BASE_URL (e.g. in Render's dashboard,
 * or a local .env file) if you ever need to point at a different host. Trailing slash
 * stripped in case it gets pasted in with one - avoids double slashes in request paths.
 */
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080').replace(/\/$/, '')

/** Thrown for both network failures (backend not running) and API error responses. */
export class ApiError extends Error {}

interface ErrorBody {
  message?: string
}

/**
 * token is optional - omit it for the two public endpoints (register/login). Every
 * other function below requires one, since the backend now rejects unauthenticated
 * requests to anything except /api/auth/**.
 */
async function request<T>(path: string, token?: string, options?: RequestInit): Promise<T> {
  startLoading()
  try {
    const headers: Record<string, string> = {}
    if (options?.body) headers['Content-Type'] = 'application/json'
    if (token) headers['Authorization'] = `Bearer ${token}`

    let response: Response
    try {
      response = await fetch(`${API_BASE_URL}${path}`, { headers, ...options })
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
  } finally {
    // Runs on success AND on any thrown error - the overlay must never get
    // stuck on screen just because a request failed.
    stopLoading()
  }
}

// ---- Auth (public - no token) ------------------------------------------------

export function register(input: RegisterInput): Promise<AuthResult> {
  return request<AuthResult>('/api/auth/register', undefined, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function login(input: LoginInput): Promise<AuthResult> {
  return request<AuthResult>('/api/auth/login', undefined, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

// ---- Accounts (requires a token) ----------------------------------------------

export function createAccount(accountType: AccountType, token: string): Promise<Account> {
  return request<Account>('/api/accounts', token, {
    method: 'POST',
    body: JSON.stringify({ accountType }),
  })
}

export function getMyAccounts(token: string): Promise<Account[]> {
  return request<Account[]>('/api/accounts', token)
}

export function getAccount(accountId: string, token: string): Promise<Account> {
  return request<Account>(`/api/accounts/${accountId}`, token)
}

export function deposit(accountId: string, amount: number, token: string): Promise<Account> {
  return request<Account>(`/api/accounts/${accountId}/deposit`, token, {
    method: 'POST',
    body: JSON.stringify({ amount }),
  })
}

export function withdraw(accountId: string, amount: number, token: string): Promise<Account> {
  return request<Account>(`/api/accounts/${accountId}/withdraw`, token, {
    method: 'POST',
    body: JSON.stringify({ amount }),
  })
}

export function getTransactions(accountId: string, token: string): Promise<Transaction[]> {
  return request<Transaction[]>(`/api/accounts/${accountId}/transactions`, token)
}

// ---- Admin only (requires a token belonging to an ADMIN) -----------------------

export function getAllAccountsAdmin(token: string): Promise<Account[]> {
  return request<Account[]>('/api/admin/accounts', token)
}

export function getAllUsersAdmin(token: string): Promise<User[]> {
  return request<User[]>('/api/admin/users', token)
}
