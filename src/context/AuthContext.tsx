import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import * as api from '../api/bankApi'
import type { AuthResult, Role } from '../types/bank'

const STORAGE_KEY = 'simplebank.auth'

interface AuthContextValue {
  token: string | null
  userId: string | null
  name: string | null
  email: string | null
  role: Role | null
  isAuthenticated: boolean
  isAdmin: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function loadStoredAuth(): AuthResult | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as AuthResult) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthResult | null>(() => loadStoredAuth())

  // Keep localStorage in sync so a page refresh doesn't log the person out.
  useEffect(() => {
    if (auth) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(auth))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [auth])

  async function login(email: string, password: string) {
    const result = await api.login({ email, password })
    setAuth(result)
  }

  async function register(name: string, email: string, password: string) {
    const result = await api.register({ name, email, password })
    setAuth(result)
  }

  function logout() {
    setAuth(null)
  }

  const value: AuthContextValue = {
    token: auth?.token ?? null,
    userId: auth?.userId ?? null,
    name: auth?.name ?? null,
    email: auth?.email ?? null,
    role: auth?.role ?? null,
    isAuthenticated: auth !== null,
    isAdmin: auth?.role === 'ADMIN',
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside an AuthProvider')
  return ctx
}
