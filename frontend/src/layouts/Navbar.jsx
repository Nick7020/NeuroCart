import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingCart, Search, Heart, User, Zap, Menu, X,
  ChevronDown, Bell, Package
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export function Navbar() {
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
    await logout()
    navigate('/login')
  }

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-[#0f172a] via-[#1e1b4b] to-[#0f172a] shadow-2xl shadow-indigo-950/50 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent hidden sm:block">
            NeuroCart
          </span>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-auto hidden md:flex">
          <div className="relative w-full">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products, brands, categories..."
              className="w-full bg-white/10 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:bg-white/15 transition-all"
            />
          </div>
        </form>

        {/* Right Actions */}
        <div className="flex items-center gap-1 ml-auto">
          {/* Mobile search */}
          <button className="md:hidden p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10">
            <Search size={20} />
          </button>

          <Link to="/" className="p-2 text-gray-400 hover:text-pink-400 transition-colors rounded-lg hover:bg-white/10 hidden sm:flex">
            <Heart size={20} />
          </Link>

          <Link to="/cart" className="relative p-2 text-gray-400 hover:text-indigo-400 transition-colors rounded-lg hover:bg-white/10">
            <ShoppingCart size={20} />
            {count > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-indigo-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
              >
                {count > 9 ? '9+' : count}
              </motion.span>
            )}
          </Link>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-white/10 transition-all"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-sm font-bold text-white">
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <span className="text-sm text-gray-300 hidden sm:block max-w-[80px] truncate">{user.name?.split(' ')[0]}</span>
                <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-12 w-52 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden z-50"
                  >
                    <div className="px-4 py-3 border-b border-gray-800">
                      <p className="font-semibold text-sm">{user.name}</p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
                    {[
                      { to: '/profile', icon: <User size={14} />, label: 'Profile' },
                      { to: '/orders', icon: <Package size={14} />, label: 'My Orders' },
                      ...(user.role === 'admin' ? [{ to: '/admin', icon: <Zap size={14} />, label: 'Admin Panel' }] : []),
                    ].map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                      >
                        {item.icon} {item.label}
                      </Link>
                    ))}
                    <div className="border-t border-gray-800">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-gray-800 transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex gap-2">
              <Link to="/login" className="text-sm text-gray-300 hover:text-white px-3 py-2 rounded-lg hover:bg-white/10 transition-all hidden sm:block">
                Login
              </Link>
              <Link to="/register" className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl transition-all font-medium">
                Sign Up
              </Link>
            </div>
          )}

          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors ml-1">
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
            className="md:hidden border-t border-white/10 bg-gray-950/95 overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1">
              <form onSubmit={handleSearch} className="relative mb-3">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
                />
              </form>
              {[
                { to: '/', label: '🏠 Home' },
                { to: '/cart', label: '🛒 Cart' },
                { to: '/orders', label: '📦 Orders' },
                { to: '/profile', label: '👤 Profile' },
              ].map(({ to, label }) => (
                <Link key={to} to={to} onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-xl transition-colors">
                  {label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
