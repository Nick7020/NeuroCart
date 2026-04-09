import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { authService } from '../services'
import { setAccessToken, MOCK_MODE } from '../services/api'

// Normalize backend user shape to match frontend expectations
function normalizeUser(data) {
  if (!data) return null
  return {
    ...data,
    _id: data._id || data.id,
    name: data.name || [data.first_name, data.last_name].filter(Boolean).join(' ') || data.email,
  }
}



const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null)
  const [loading, setLoading] = useState(true)
  const refreshTokenRef = useRef(null)

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

    const storedRefresh = localStorage.getItem('refreshToken')
    if (!storedRefresh) { setLoading(false); return }

    authService.refresh(storedRefresh)
      .then(({ data }) => {
        setAccessToken(data.access)
        if (data.refresh) {
          refreshTokenRef.current = data.refresh
          localStorage.setItem('refreshToken', data.refresh)
        }
        return authService.me()
      })
      .then(({ data }) => setUser(normalizeUser(data)))
      .catch(() => {
        setUser(null)
        localStorage.removeItem('refreshToken')
      })
      .finally(() => setLoading(false))
  }, [])

  const login = async (credentials) => {
    const { data } = await authService.login(credentials)
    setAccessToken(data.access)
    refreshTokenRef.current = data.refresh
    localStorage.setItem('refreshToken', data.refresh)
    if (data.user) { setUser(normalizeUser(data.user)); return normalizeUser(data.user) }
    const { data: me } = await authService.me()
    setUser(normalizeUser(me))
    return normalizeUser(me)
  }

  const register = async (payload) => {
    const { data } = await authService.register(payload)
    setAccessToken(data.access)
    refreshTokenRef.current = data.refresh
    localStorage.setItem('refreshToken', data.refresh)
    if (data.user) { setUser(normalizeUser(data.user)); return normalizeUser(data.user) }
    const { data: me } = await authService.me()
    setUser(normalizeUser(me))
    return normalizeUser(me)
  }

  const logout = async () => {
    const rt = refreshTokenRef.current || localStorage.getItem('refreshToken')
    await authService.logout(rt).catch(() => {})
    setAccessToken(null)
    refreshTokenRef.current = null
    localStorage.removeItem('refreshToken')
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
