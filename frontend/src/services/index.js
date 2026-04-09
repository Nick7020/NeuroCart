import api from './api'

export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  refresh: () => api.post('/auth/refresh'),
}

export const productService = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
}

export const cartService = {
  get: () => api.get('/cart'),
  add: (data) => api.post('/cart', data),
  update: (id, data) => api.put(`/cart/${id}`, data),
  remove: (id) => api.delete(`/cart/${id}`),
  clear: () => api.delete('/cart'),
}

export const orderService = {
  create: (data) => api.post('/orders', data),
  getAll: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
  myOrders: () => api.get('/orders/my'),
}

export const paymentService = {
  initiate: (data) => api.post('/payments/initiate', data),
  verify: (data) => api.post('/payments/verify', data),
}

export const analyticsService = {
  dashboard: () => api.get('/analytics/dashboard'),
  salesTrend: (params) => api.get('/analytics/sales', { params }),
  reports: (params) => api.get('/analytics/reports', { params }),
}

export const aiService = {
  chat: (data) => api.post('/ai/chat', data),
  recommendations: (params) => api.get('/ai/recommendations', { params }),
}

export const userService = {
  getAll: (params) => api.get('/users', { params }),
  update: (id, data) => api.put(`/users/${id}`, data),
  block: (id) => api.put(`/users/${id}/block`),
  unblock: (id) => api.put(`/users/${id}/unblock`),
}

export const vendorService = {
  getOrders: () => api.get('/vendor/orders'),
  acceptOrder: (id) => api.post(`/vendor/orders/${id}/accept`),
  rejectOrder: (id) => api.post(`/vendor/orders/${id}/reject`),
}

export const invoiceService = {
  getAll: () => api.get('/invoices'),
  create: (data) => api.post('/invoices', data),
}
