import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api } from '../services/api'

interface User {
  id: number
  username: string
  role?: string
}

interface AuthContextType {
  user: User | null
  token: string | undefined
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | undefined>(undefined)

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    if (storedToken) {
      setToken(storedToken)
      // TODO: Fetch user info from API when endpoint is available
    }
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    const data = await api.login(username, password)
    setToken(data.accessToken)
  }, [])

  const logout = useCallback(() => {
    api.logout()
    setToken(undefined)
    setUser(null)
  }, [])

  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
