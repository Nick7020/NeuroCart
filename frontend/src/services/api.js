import axios from 'axios'
import { MOCK_PRODUCTS, MOCK_ORDERS, MOCK_ANALYTICS, MOCK_USERS, MOCK_REPORTS } from '../utils/mockData'

const MOCK_MODE = true // Set false when backend is ready

let accessToken = null
export const setAccessToken = (t) => (accessToken = t)
export const getAccessToken = () => accessToken

// ─── Mock Handler ────────────────────────────────────────────────────────────
function mockHandler(config) {
  const url = config.url || ''
  const method = config.method?.toLowerCase()
  const body = (() => { try { return JSON.parse(config.data || '{}') } catch { return {} } })()

  // Auth
  if (url.includes('/auth/logout')) {
    sessionStorage.removeItem('mockUser')
    return { message: 'Logged out' }
  }
  if (url.includes('/auth/refresh')) {
    const stored = sessionStorage.getItem('mockUser')
    if (!stored) throw { response: { status: 401, data: { message: 'No session' } } }
    return { accessToken: 'mock-token' }
  }
  if (url.includes('/auth/login')) {
    const isAdmin = body.email?.includes('admin')
    const isStaff = body.email?.includes('staff')
    const role = isAdmin ? 'admin' : isStaff ? 'staff' : 'customer'
    const name = isAdmin ? 'Admin User' : isStaff ? 'Staff User' : 'Demo User'
    const mockUser = { _id: 'demo-' + role, name, email: body.email || 'demo@neurocart.com', role }
    sessionStorage.setItem('mockUser', JSON.stringify(mockUser))
    return { accessToken: 'mock-token-' + role, user: mockUser }
  }
  if (url.includes('/auth/register')) {
    const mockUser = { _id: 'demo-customer', name: body.name || 'Demo User', email: body.email, role: 'customer' }
    sessionStorage.setItem('mockUser', JSON.stringify(mockUser))
    return { accessToken: 'mock-token', user: mockUser }
  }
  if (url.includes('/auth/me')) {
    const stored = sessionStorage.getItem('mockUser')
    return stored ? JSON.parse(stored) : { _id: 'demo', name: 'Demo User', email: 'demo@neurocart.com', role: 'customer' }
  }

  // Products
  if (url.match(/\/products\/[^?]+$/) && method === 'get') {
    const id = url.split('/products/')[1]
    return { product: MOCK_PRODUCTS.find(p => p._id === id) || MOCK_PRODUCTS[0] }
  }
  if (url.includes('/products') && method === 'get') {
    let products = [...MOCK_PRODUCTS]
    const qs = url.includes('?') ? new URLSearchParams(url.split('?')[1]) : new URLSearchParams(config.params || {})
    const category = qs.get('category')
    const search = qs.get('search')
    const maxPrice = Number(qs.get('maxPrice')) || Infinity
    if (category) products = products.filter(p => p.category === category)
    if (search) products = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    products = products.filter(p => p.price <= maxPrice)
    return { products }
  }
  if (url.includes('/products') && method === 'post') {
    const newP = { _id: String(Date.now()), ...body, images: body.images || [] }
    MOCK_PRODUCTS.unshift(newP)
    return { product: newP }
  }
  if (url.includes('/products/') && method === 'put') {
    const id = url.split('/products/')[1]
    const idx = MOCK_PRODUCTS.findIndex(p => p._id === id)
    if (idx !== -1) MOCK_PRODUCTS[idx] = { ...MOCK_PRODUCTS[idx], ...body }
    return { product: MOCK_PRODUCTS[idx] }
  }
  if (url.includes('/products/') && method === 'delete') return { message: 'Deleted' }

  // Cart
  if (url.includes('/cart')) return { items: [] }

  // Orders
  if (url.includes('/orders/my')) return { orders: MOCK_ORDERS }
  if (url.match(/\/orders\/[^?]+\/status/)) return { message: 'Status updated' }
  if (url.match(/\/orders\/[^?]+$/) && method === 'get') {
    const id = url.split('/orders/')[1]
    return { order: MOCK_ORDERS.find(o => o._id === id) || MOCK_ORDERS[0] }
  }
  if (url.includes('/orders') && method === 'get') return { orders: MOCK_ORDERS }
  if (url.includes('/orders') && method === 'post') {
    const newOrder = { _id: 'ord' + Date.now(), status: 'PENDING', createdAt: new Date().toISOString(), totalAmount: 10000, items: [], ...body }
    return { order: newOrder }
  }

  // Analytics
  if (url.includes('/analytics/dashboard')) return MOCK_ANALYTICS
  if (url.includes('/analytics/reports')) return MOCK_REPORTS

  // AI
  if (url.includes('/ai/chat')) return { reply: 'Hi! I\'m NeuroBot 🤖 Demo mode — connect backend for real AI!' }
  if (url.includes('/ai/recommendations')) return { products: MOCK_PRODUCTS.slice(0, 5) }

  // Users
  if (url.includes('/users') && method === 'get') return { users: MOCK_USERS }
  if (url.includes('/users/') && method === 'put') return { message: 'Updated' }

  return { message: 'Mock OK' }
}

// ─── Axios Instance ───────────────────────────────────────────────────────────
const api = axios.create({ baseURL: '/api/v1', withCredentials: true })

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`

  if (MOCK_MODE) {
    // Cancel real request, return mock data directly
    config._mock = true
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    // Mock mode: intercept any network/proxy error
    if (MOCK_MODE && err.config?._mock) {
      try {
        const data = mockHandler(err.config)
        return { data, status: 200, config: err.config }
      } catch (mockErr) {
        return Promise.reject(mockErr)
      }
    }

    // Real backend 401 refresh logic
    const original = err.config
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const { data } = await axios.post('/api/v1/auth/refresh', {}, { withCredentials: true })
        setAccessToken(data.accessToken)
        original.headers.Authorization = `Bearer ${data.accessToken}`
        return api(original)
      } catch {
        setAccessToken(null)
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export default api
