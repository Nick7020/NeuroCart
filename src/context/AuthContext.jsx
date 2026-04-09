import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services'
import { setAccessToken, MOCK_MODE } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In mock mode, check sessionStorage directly — no network call needed
    if (MOCK_MODE) {
      const stored = sessionStorage.getItem('mockUser')
      if (stored) {
        setAccessToken('mock-token')
        setUser(JSON.parse(stored))
      }
      setLoading(false)
      return
    }

    authService.refresh()
      .then(({ data }) => {
        setAccessToken(data.accessToken)
        return authService.me()
      })
      .then(({ data }) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const login = async (credentials) => {
    const { data } = await authService.login(credentials)
    setAccessToken(data.accessToken)
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
    if (MOCK_MODE) sessionStorage.removeItem('mockUser')
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
