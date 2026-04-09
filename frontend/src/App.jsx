import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { NotificationProvider } from './context/NotificationContext'
import { ProtectedRoute } from './components/ui/ProtectedRoute'

import { CustomerLayout } from './layouts/CustomerLayout'
import { AdminLayout } from './layouts/AdminLayout'

import { Login } from './pages/auth/Login'
import { Register } from './pages/auth/Register'

import { Home } from './pages/customer/Home'
import { ProductDetail } from './pages/customer/ProductDetail'
import { Cart } from './pages/customer/Cart'
import { Checkout } from './pages/customer/Checkout'
import { OrderTracking } from './pages/customer/OrderTracking'
import { Profile } from './pages/customer/Profile'
import { Orders } from './pages/customer/Orders'

import { AdminDashboard } from './pages/admin/AdminDashboard'
import { AdminProducts } from './pages/admin/AdminProducts'
import { AdminOrders } from './pages/admin/AdminOrders'
import { AdminUsers } from './pages/admin/AdminUsers'
import { AdminReports } from './pages/admin/AdminReports'
import { VendorOrders } from './pages/admin/VendorOrders'
import { AdminInvoices } from './pages/admin/AdminInvoices'
import { VendorDashboard } from './pages/vendor/VendorDashboard'
import { VendorProducts } from './pages/vendor/VendorProducts'
import { VendorCustomers } from './pages/vendor/VendorCustomers'
import { VendorInvoices } from './pages/vendor/VendorInvoices'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <CartProvider>
            <Routes>
              {/* Auth */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Customer */}
              <Route element={<CustomerLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Home />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/cart" element={
                  <ProtectedRoute roles={['customer', 'admin', 'staff']}>
                    <Cart />
                  </ProtectedRoute>
                } />
                <Route path="/checkout" element={
                  <ProtectedRoute roles={['customer']}>
                    <Checkout />
                  </ProtectedRoute>
                } />
                <Route path="/orders" element={
                  <ProtectedRoute roles={['customer']}>
                    <Orders />
                  </ProtectedRoute>
                } />
                <Route path="/orders/:id" element={
                  <ProtectedRoute roles={['customer', 'admin', 'staff']}>
                    <OrderTracking />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
              </Route>

              {/* Admin + Vendor */}
              <Route path="/admin" element={
                <ProtectedRoute roles={['admin', 'staff', 'vendor']}>
                  <AdminLayout />
                </ProtectedRoute>
              }>
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="users" element={
                  <ProtectedRoute roles={['admin']}>
                    <AdminUsers />
                  </ProtectedRoute>
                } />
                <Route path="reports" element={<AdminReports />} />
                <Route path="vendor-orders" element={<VendorOrders />} />
                <Route path="vendor-dashboard" element={<VendorDashboard />} />
                <Route path="vendor-products" element={<VendorProducts />} />
                <Route path="vendor-customers" element={<VendorCustomers />} />
                <Route path="vendor-invoices" element={<VendorInvoices />} />
                <Route path="invoices" element={<AdminInvoices />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </CartProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
