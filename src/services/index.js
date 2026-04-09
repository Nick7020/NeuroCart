import api from './api'

export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: (refreshToken) => api.post('/auth/logout', { refresh: refreshToken }),
  me: () => api.get('/users/me'),
  refresh: (refreshToken) => api.post('/auth/token/refresh', { refresh: refreshToken }),
}

export const productService = {
  getAll: (params) => api.get('/products/', { params }),
  getById: (id) => api.get(`/products/${id}/`),
  create: (data) => api.post('/products/', data),
  update: (id, data) => api.put(`/products/${id}/update/`, data),
  delete: (id) => api.delete(`/products/${id}/delete/`),
  trending: () => api.get('/products/trending/'),
  recommendations: (id) => api.get(`/products/${id}/recommendations/`),
  getReviews: (id) => api.get(`/products/${id}/reviews/`),
  createReview: (id, data) => api.post(`/products/${id}/reviews/create/`, data),
}

export const cartService = {
  get: () => api.get('/cart/'),
  add: (data) => api.post('/cart/items/', data),
  update: (id, data) => api.put(`/cart/items/${id}/`, data),
  remove: (id) => api.delete(`/cart/items/${id}/delete/`),
  clear: () => api.delete('/cart/clear/'),
}

export const orderService = {
  create: (data) => api.post('/orders/checkout/', data),
  getAll: (params) => api.get('/orders/', { params }),
  getById: (id) => api.get(`/orders/${id}/`),
  cancel: (id) => api.post(`/orders/${id}/cancel/`),
  myOrders: () => api.get('/orders/'),
}

export const paymentService = {
  initiate: (data) => api.post('/payments/process/', data),
  getByOrder: (orderId) => api.get(`/payments/${orderId}/`),
}

export const analyticsService = {
  dashboard: () => api.get('/admin/analytics/overview'),
  salesTrend: (params) => api.get('/admin/analytics/sales', { params }),
  topVendors: () => api.get('/admin/analytics/top-vendors'),
  vendorAnalytics: () => api.get('/vendor/analytics'),
}

export const userService = {
  me: () => api.get('/users/me'),
  update: (data) => api.put('/users/me', data),
  getAll: (params) => api.get('/admin/users/users/', { params }),
  getById: (id) => api.get(`/admin/users/users/${id}/`),
  block: (id) => api.post(`/admin/users/users/${id}/block/`, { action: 'block' }),
  unblock: (id) => api.post(`/admin/users/users/${id}/block/`, { action: 'unblock' }),
  updateUser: (id, data) => api.put(`/admin/users/users/${id}/`, data),
  deleteUser: (id) => api.delete(`/admin/users/users/${id}/`),
  getCustomers: () => api.get('/admin/users/users/', { params: { role: 'customer' } }),
}

export const vendorService = {
  register: (data) => api.post('/vendors/register', data),
  dashboard: () => api.get('/vendor/dashboard'),
  getOrders: () => api.get('/vendor/orders/'),
  updateOrderStatus: (id, status) => api.patch(`/vendor/orders/${id}/status/`, { new_status: status }),
  acceptOrder: (id) => api.patch(`/vendor/orders/${id}/status/`, { new_status: 'processing' }),
  rejectOrder: (id) => api.patch(`/vendor/orders/${id}/status/`, { new_status: 'cancelled' }),
  analytics: () => api.get('/vendor/analytics'),
  getProducts: () => api.get('/vendor/products'),
  updateProfile: (data) => api.put('/vendor/profile', data),
}

export const categoryService = {
  getAll: () => api.get('/categories/'),
}

export const adminService = {
  getVendors: () => api.get('/admin/vendors'),
  verifyVendor: (id) => api.patch(`/admin/vendors/${id}/verify`),
}

// No backend implementation yet — frontend/mock only
export const aiService = {
  chat: (data) => api.post('/ai/chat', data),
  recommendations: (params) => api.get('/ai/recommendations', { params }),
}

export const invoiceService = {
  getAll: () => api.get('/invoices'),
  getById: (id) => api.get(`/invoices/${id}`),
  vendorGetAll: () => api.get('/vendor/invoices'),
}
