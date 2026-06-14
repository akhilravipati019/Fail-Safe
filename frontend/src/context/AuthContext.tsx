import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import api, { TOKEN_STORAGE_KEY } from '../api/client'

interface AuthContextValue {
  token: string | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_STORAGE_KEY))

  const login = useCallback(async (username: string, password: string) => {
    const response = await api.post<{ access_token: string }>('/auth/login', {
      username,
      password,
    })
    localStorage.setItem(TOKEN_STORAGE_KEY, response.data.access_token)
    setToken(response.data.access_token)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    setToken(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ token, isAuthenticated: !!token, login, logout }),
    [token, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
