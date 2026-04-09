import axios from 'axios'
import { MOCK_PRODUCTS, MOCK_ORDERS, MOCK_ANALYTICS, MOCK_USERS, MOCK_REPORTS } from '../utils/mockData'

export const MOCK_MODE = true // flip to false when backend is ready

let accessToken = null
export const setAccessToken = (t) => (accessToken = t)
export const getAccessToken = () => accessToken

// ─── Mock Handler (pure data, no network) ────────────────────────────────────
function mockHandler(config) {
  const url = config.url || ''
  const method = (config.method || 'get').toLowerCase()
  const body = (() => { try { return JSON.parse(config.data || '{}') } catch { return {} } })()
  const params = config.params || {}

  // ── Auth ──────────────────────────────────────────────────────────────────
  if (url.includes('/auth/logout')) {
    sessionStorage.removeItem('mockUser')
    return { message: 'Logged out' }
  }
  if (url.includes('/auth/refresh')) {
    const stored = sessionStorage.getItem('mockUser')
    if (!stored) { const e = new Error('No session'); e.response = { status: 401 }; throw e }
    return { accessToken: 'mock-token' }
  }
  if (url.includes('/auth/login')) {
    const isAdmin = body.email?.includes('admin')
    const isVendor = body.email?.includes('vendor')
    const role = isAdmin ? 'admin' : isVendor ? 'vendor' : 'customer'
    const name = isAdmin ? 'Admin User' : isVendor ? 'Meera Joshi' : 'Demo User'
    const mockUser = { _id: 'demo-' + role, name, email: body.email || 'demo@neurocart.com', role, storeName: isVendor ? 'Meera Electronics' : undefined, isApproved: isVendor ? true : undefined, createdAt: new Date().toISOString() }
    sessionStorage.setItem('mockUser', JSON.stringify(mockUser))
    return { accessToken: 'mock-token-' + role, user: mockUser }
  }
  if (url.includes('/auth/register')) {
    const role = body.role === 'vendor' ? 'vendor' : 'customer'
    const mockUser = { _id: 'demo-' + role, name: body.name || 'Demo User', email: body.email, role, storeName: body.storeName, isApproved: role === 'vendor' ? false : undefined, createdAt: new Date().toISOString() }
    sessionStorage.setItem('mockUser', JSON.stringify(mockUser))
    return { accessToken: 'mock-token', user: mockUser }
  }
  if (url.includes('/auth/me')) {
    const stored = sessionStorage.getItem('mockUser')
    return stored ? JSON.parse(stored) : { _id: 'demo', name: 'Demo User', email: 'demo@neurocart.com', role: 'customer' }
  }

  // ── Products ──────────────────────────────────────────────────────────────
  if (url.match(/\/products\/[^/?]+$/) && method === 'delete') return { message: 'Deleted' }
  if (url.match(/\/products\/[^/?]+$/) && method === 'put') {
    const id = url.split('/products/')[1]
    const idx = MOCK_PRODUCTS.findIndex(p => p._id === id)
    if (idx !== -1) MOCK_PRODUCTS[idx] = { ...MOCK_PRODUCTS[idx], ...body }
    return { product: MOCK_PRODUCTS[idx] }
  }
  if (url.match(/\/products\/[^/?]+$/) && method === 'get') {
    const id = url.split('/products/')[1]
    return { product: MOCK_PRODUCTS.find(p => p._id === id) || MOCK_PRODUCTS[0] }
  }
  if (url.includes('/products') && method === 'post') {
    const newP = { _id: String(Date.now()), ...body, images: Array.isArray(body.images) ? body.images : (body.images || '').split(',').map(s => s.trim()).filter(Boolean) }
    MOCK_PRODUCTS.unshift(newP)
    return { product: newP }
  }
  if (url.includes('/products')) {
    let list = [...MOCK_PRODUCTS]
    const cat = params.category || ''
    const search = params.search || ''
    const maxPrice = Number(params.maxPrice) || Infinity
    const minPrice = Number(params.minPrice) || 0
    if (cat) list = list.filter(p => p.category === cat)
    if (search) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    list = list.filter(p => p.price >= minPrice && p.price <= maxPrice)
    return { products: list }
  }

  // ── Cart (local state only in mock) ───────────────────────────────────────
  if (url.includes('/cart')) return { items: [] }

  // ── Orders ────────────────────────────────────────────────────────────────
  if (url.includes('/orders/my')) return { orders: MOCK_ORDERS }
  if (url.match(/\/orders\/[^/?]+\/status/) && method === 'put') return { message: 'Status updated' }
  if (url.match(/\/orders\/[^/?]+$/) && method === 'get') {
    const id = url.split('/orders/')[1]
    return { order: MOCK_ORDERS.find(o => o._id === id) || MOCK_ORDERS[0] }
  }
  if (url.includes('/orders') && method === 'post') {
    const o = { _id: 'ord' + Date.now(), status: 'PENDING', createdAt: new Date().toISOString(), totalAmount: 10000, items: [], ...body }
    MOCK_ORDERS.unshift(o)
    return { order: o }
  }
  if (url.includes('/orders')) return { orders: MOCK_ORDERS }

  // ── Analytics ─────────────────────────────────────────────────────────────
  if (url.includes('/analytics/dashboard')) {
    const invoices = JSON.parse(sessionStorage.getItem('invoices') || '[]')
    const vendorRevenue = invoices.reduce((s, inv) => {
      const items = inv.order?.items || []
      return s + items.reduce((a, i) => a + i.price * i.quantity, 0) * 1.18
    }, 0)
    const vendorOrders = MOCK_ORDERS
    const vendorStats = [
      { vendorName: 'Meera Electronics', orders: 12, revenue: 284750, accepted: 10, rejected: 2 },
      { vendorName: 'TechZone Store',    orders: 8,  revenue: 156200, accepted: 7,  rejected: 1 },
      { vendorName: 'Fashion Hub',       orders: 15, revenue: 98500,  accepted: 13, rejected: 2 },
      { vendorName: 'BookWorld',         orders: 6,  revenue: 12400,  accepted: 6,  rejected: 0 },
    ]
    return {
      ...MOCK_ANALYTICS,
      vendorStats,
      vendorRevenue: vendorRevenue || vendorStats.reduce((s, v) => s + v.revenue, 0),
      vendorOrders: vendorOrders.length,
      totalVendors: vendorStats.length,
    }
  }
  if (url.includes('/analytics/reports')) return MOCK_REPORTS
  if (url.includes('/analytics/sales')) return { sales: MOCK_ANALYTICS.salesTrend }

  // ── AI ────────────────────────────────────────────────────────────────────
  if (url.includes('/ai/chat')) return { reply: 'Hi! I\'m NeuroBot 🤖 Demo mode active. Connect backend for real AI responses!' }
  if (url.includes('/ai/recommendations')) return { products: MOCK_PRODUCTS.slice(0, 5) }

  // ── Users ─────────────────────────────────────────────────────────────────
  if (url.includes('/users/customers') && method === 'get') return { users: MOCK_USERS.filter(u => u.role === 'customer') }
  if (url.includes('/users') && method === 'get') return { users: MOCK_USERS }
  if (url.match(/\/users\/[^/?]+\/block/)) {
    const id = url.split('/users/')[1].split('/')[0]
    const u = MOCK_USERS.find(u => u._id === id)
    if (u) u.isBlocked = true
    return { message: 'Blocked' }
  }
  if (url.match(/\/users\/[^/?]+\/unblock/)) {
    const id = url.split('/users/')[1].split('/')[0]
    const u = MOCK_USERS.find(u => u._id === id)
    if (u) u.isBlocked = false
    return { message: 'Unblocked' }
  }
  if (url.match(/\/users\/[^/?]+\/approve/)) {
    const id = url.split('/users/')[1].split('/')[0]
    const u = MOCK_USERS.find(u => u._id === id)
    if (u) u.isApproved = true
    return { message: 'Vendor approved' }
  }
  if (url.match(/\/users\/[^/?]+$/) && method === 'put') {
    const id = url.split('/users/')[1]
    const u = MOCK_USERS.find(u => u._id === id)
    if (u) Object.assign(u, body)
    return { message: 'Updated' }
  }

  // ── Payments ──────────────────────────────────────────────────────────────
  if (url.includes('/payments')) return { success: true, transactionId: 'txn_' + Date.now() }

  // ── Vendor Orders ─────────────────────────────────────────────────────────
  if (url.includes('/vendor/orders') && method === 'get') return { orders: MOCK_ORDERS }
  if (url.match(/\/vendor\/orders\/[^/?]+\/accept/)) {
    const id = url.split('/vendor/orders/')[1].split('/')[0]
    const o = MOCK_ORDERS.find(o => o._id === id)
    if (o) o.status = 'CONFIRMED'
    return { message: 'Accepted' }
  }
  if (url.match(/\/vendor\/orders\/[^/?]+\/reject/)) {
    const id = url.split('/vendor/orders/')[1].split('/')[0]
    const o = MOCK_ORDERS.find(o => o._id === id)
    if (o) o.status = 'CANCELLED'
    return { message: 'Rejected' }
  }

  // ── Invoices ──────────────────────────────────────────────────────────────
  if (url.includes('/invoices') && method === 'get') {
    const invoices = JSON.parse(sessionStorage.getItem('invoices') || '[]')
    return { invoices }
  }
  if (url.includes('/invoices') && method === 'post') {
    const invoices = JSON.parse(sessionStorage.getItem('invoices') || '[]')
    const inv = { ...JSON.parse(config.data || '{}'), _id: 'inv_' + Date.now(), createdAt: new Date().toISOString() }
    invoices.unshift(inv)
    sessionStorage.setItem('invoices', JSON.stringify(invoices))
    return { invoice: inv }
  }

  return { message: 'Mock OK' }
}

// ─── Custom Adapter (zero network calls in mock mode) ─────────────────────────
function mockAdapter(config) {
  return new Promise((resolve, reject) => {
    try {
      const data = mockHandler(config)
      resolve({ data, status: 200, statusText: 'OK', headers: {}, config })
    } catch (err) {
      reject(err)
    }
  })
}

// ─── Axios Instance ───────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  ...(MOCK_MODE && { adapter: mockAdapter }),
})

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
  return config
})

// Only needed for real backend — 401 auto-refresh
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (MOCK_MODE) return Promise.reject(err)
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
