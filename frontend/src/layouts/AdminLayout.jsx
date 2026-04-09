import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'
import { LayoutDashboard, Package, ShoppingBag, Users, BarChart2, Home, LogOut, Zap, ChevronLeft, ChevronRight } from 'lucide-react'
import logo from '../assets/logo.png'

const LINKS = [
  { to: '/admin',          label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { to: '/admin/products', label: 'Products',  icon: <Package size={18} /> },
  { to: '/admin/orders',   label: 'Orders',    icon: <ShoppingBag size={18} /> },
  { to: '/admin/users',    label: 'Users',     icon: <Users size={18} /> },
  { to: '/admin/reports',  label: 'Reports',   icon: <BarChart2 size={18} /> },
]

export function AdminLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = async () => { await logout(); navigate('/login') }

  return (
    <div className="min-h-screen flex" style={{ background: '#ffedce' }}>
      {/* Sidebar */}
      <aside className={`${collapsed ? 'w-16' : 'w-60'} bg-white border-r border-gray-100 flex flex-col transition-all duration-300 shadow-sm flex-shrink-0`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <img src={logo} alt="NeuroCart" className="h-8 w-auto object-contain" />
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 ml-auto">
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {LINKS.map(link => {
            const active = location.pathname === link.to
            return (
              <Link key={link.to} to={link.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${active ? 'text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}
                style={active ? { background: 'linear-gradient(135deg,#1A3263,#547792)' } : {}}>
                <span className={active ? 'text-white' : 'text-gray-400'}>{link.icon}</span>
                {!collapsed && link.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-gray-100 space-y-1">
          <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-all text-sm font-medium">
            <Home size={18} className="text-gray-400" />{!collapsed && 'Home'}
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-50 transition-all text-sm font-medium">
            <LogOut size={18} />{!collapsed && 'Logout'}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 shadow-sm">
          <h1 className="text-lg font-bold text-gray-800">Admin Panel</h1>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm" style={{ background: 'linear-gradient(135deg,#1A3263,#547792)' }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="text-sm hidden sm:block">
              <p className="font-semibold text-gray-800">{user?.name}</p>
              <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
            </div>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
