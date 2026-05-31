import { createContext, useContext, useState, useEffect } from 'react'
import { apiFetch } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // undefined = loading, null = not authenticated, object = authenticated
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    apiFetch('/api/auth/me')
      .then(setSession)
      .catch(() => setSession(null))
  }, [])

  const login = async (username, password) => {
    const user = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: { username, password },
    })
    setSession(user)
    return user
  }

  const logout = async () => {
    await apiFetch('/api/auth/logout', { method: 'POST' })
    setSession(null)
  }

  return (
    <AuthContext.Provider value={{ session, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
