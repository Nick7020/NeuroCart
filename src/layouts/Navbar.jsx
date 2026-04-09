import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Search, Heart, User, Zap, Menu, X, ChevronDown, Package } from 'lucide-react'
import logo from '../assets/logo.png'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export function Navbar({ onCartClick }) {
  const { user, logout } = useAuth()
  const { count } = useCart()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [profileOpen, setProfileOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) navigate(`/?search=${encodeURIComponent(search.trim())}`)
  }

  const handleLogout = async () => {
    setProfileOpen(false)
    await logout()
    navigate('/login')
  }

  return (
    <nav className="sticky top-0 z-50 px-4 py-3" style={{ background: '#ffedce' }}>
      <div className="mx-auto h-14 flex items-center gap-4 bg-white rounded-2xl px-5 shadow-md" style={{ maxWidth: '80%', border: '1px solid #e5e7eb' }}>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <img src={logo} alt="NeuroCart" className="h-12 w-auto object-contain" />
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-auto hidden md:flex">
          <div className="relative w-full">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products, brands, categories..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:bg-white transition-all"
            />
          </div>
        </form>

        {/* Right */}
        <div className="flex items-center gap-1 ml-auto">
          <button className="md:hidden p-2 text-gray-500 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors">
            <Search size={20} />
          </button>

          <button className="p-2 text-gray-400 hover:text-red-400 rounded-lg hover:bg-gray-100 transition-colors hidden sm:flex">
            <Heart size={20} />
          </button>

          {/* Cart */}
          <button onClick={onCartClick} className="relative p-2 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-gray-100 transition-colors">
            <ShoppingCart size={20} />
            {count > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
                style={{ background: '#1A3263' }}
              >
                {count > 9 ? '9+' : count}
              </motion.span>
            )}
          </button>

          {/* Profile */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 transition-all"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm" style={{ background: 'linear-gradient(135deg, #1A3263, #547792)' }}>
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-700 hidden sm:block max-w-[80px] truncate">{user.name?.split(' ')[0]}</span>
                <ChevronDown size={13} className="text-gray-400 hidden sm:block" />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-12 w-52 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden z-50"
                  >
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                      <p className="font-semibold text-sm text-gray-800">{user.name}</p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
                    {[
                      { to: '/profile', icon: <User size={14} />, label: 'Profile' },
                      { to: '/orders', icon: <Package size={14} />, label: 'My Orders' },
                      ...(user.role === 'admin' ? [{ to: '/admin', icon: <Zap size={14} />, label: 'Admin Panel' }] : []),
                    ].map((item) => (
                      <Link key={item.to} to={item.to} onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                        <span className="text-blue-600">{item.icon}</span> {item.label}
                      </Link>
                    ))}
                    <div className="border-t border-gray-100">
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                        Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex gap-2">
              <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all hidden sm:block font-medium">Login</Link>
              <Link to="/register" className="btn-primary text-sm py-2 px-4">Sign Up</Link>
            </div>
          )}

          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-gray-500 rounded-lg hover:bg-gray-100 transition-colors ml-1">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-gray-100 bg-white overflow-hidden rounded-b-2xl"
          >
            <div className="px-4 py-3 space-y-1">
              <form onSubmit={handleSearch} className="relative mb-3">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="input pl-9 text-sm" />
              </form>
              {[{ to: '/', label: '🏠 Home' }, { to: '/orders', label: '📦 Orders' }, { to: '/profile', label: '👤 Profile' }].map(({ to, label }) => (
                <Link key={to} to={to} onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors">{label}</Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
