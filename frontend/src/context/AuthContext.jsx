import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services'
import { setAccessToken } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    authService.refresh()
      .then(({ data }) => {
        setAccessToken(data.accessToken)
        return authService.me()
      })
      .then(({ data }) => setUser(data))
      .catch(() => {
        // No session — that's fine, user just isn't logged in
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = async (credentials) => {
    const { data } = await authService.login(credentials)
    setAccessToken(data.accessToken)
    // If backend returns user directly in login response, use it
    if (data.user) { setUser(data.user); return data.user }
    const { data: me } = await authService.me()
    setUser(me)
    return me
  }

  const register = async (payload) => {
    const { data } = await authService.register(payload)
    setAccessToken(data.accessToken)
    if (data.user) { setUser(data.user); return data.user }
    const { data: me } = await authService.me()
    setUser(me)
    return me
  }

  const logout = async () => {
    await authService.logout().catch(() => {})
    setAccessToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
