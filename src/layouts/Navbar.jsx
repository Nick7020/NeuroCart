import { useState, useEffect } from 'react'
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
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) {
      navigate(`/?search=${encodeURIComponent(search.trim())}`)
    } else {
      navigate('/')
    }
    setSearch('')
    setMobileSearchOpen(false)
  }

  const handleLogout = async () => {
    setProfileOpen(false)
    await logout()
    navigate('/login')
  }

  return (
    <nav className="sticky top-0 z-50 flex justify-center" style={{ paddingTop: '8px' }}>
      <div
        className="transition-all duration-300"
        style={{
          width: '80%',
          borderRadius: '16px',
          background: scrolled
            ? 'rgba(15,23,42,0.92)'
            : 'linear-gradient(135deg, #0f172a 0%, #1e2d4f 60%, #1e3a5f 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.25)' : '0 2px 16px rgba(0,0,0,0.18)',
        }}
      >
      <div className="px-5">
        <div className="flex items-center gap-3 h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0 mr-2">
            <img src={logo} alt="NeuroCart" className="h-10 w-auto object-contain" />
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-lg hidden md:flex">
            <div className="relative w-full group">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors" style={{ color: 'rgba(255,255,255,0.4)' }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products, brands, categories…"
                className="w-full border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: '#f1f5f9',
                }}
                onFocus={e => { e.target.style.background = 'rgba(255,255,255,0.13)'; e.target.style.borderColor = 'rgba(99,179,237,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.15)' }}
                onBlur={e => { e.target.style.background = 'rgba(255,255,255,0.08)'; e.target.style.borderColor = 'rgba(255,255,255,0.12)'; e.target.style.boxShadow = 'none' }}
              />
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-0.5 ml-auto">

            {/* Mobile search */}
            <button
              onClick={() => { setMobileSearchOpen(p => !p); setMobileOpen(false) }}
              className="md:hidden p-2.5 rounded-xl transition-all"
              style={{ color: mobileSearchOpen ? '#93c5fd' : 'rgba(255,255,255,0.6)', background: mobileSearchOpen ? 'rgba(255,255,255,0.1)' : 'transparent' }}
            >
              <Search size={19} />
            </button>

            {/* Wishlist */}
            <button className="p-2.5 rounded-xl transition-all hidden sm:flex" style={{ color: 'rgba(255,255,255,0.5)' }} onMouseEnter={e=>{e.currentTarget.style.color='#f87171';e.currentTarget.style.background='rgba(255,255,255,0.08)'}} onMouseLeave={e=>{e.currentTarget.style.color='rgba(255,255,255,0.5)';e.currentTarget.style.background='transparent'}}>
              <Heart size={19} />
            </button>

            {/* Cart */}
            <button
              onClick={onCartClick}
              className="relative p-2.5 rounded-xl transition-all"
              style={{ color: 'rgba(255,255,255,0.7)' }}
              onMouseEnter={e=>{e.currentTarget.style.color='#93c5fd';e.currentTarget.style.background='rgba(255,255,255,0.08)'}}
              onMouseLeave={e=>{e.currentTarget.style.color='rgba(255,255,255,0.7)';e.currentTarget.style.background='transparent'}}
            >
              <ShoppingCart size={19} />
              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    key="badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-0.5 -right-0.5 w-[18px] h-[18px] rounded-full text-[9px] font-bold text-white flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg,#1a2f6b,#2d4fa0)' }}
                  >
                    {count > 9 ? '9+' : count}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {/* Profile / Auth */}
            {user ? (
              <div className="relative ml-1">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl transition-all"
                  style={{ color: '#f1f5f9' }}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.1)'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,#1a2f6b,#4a6fd4)' }}
                  >
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm font-medium hidden sm:block max-w-[72px] truncate" style={{ color: 'rgba(255,255,255,0.85)' }}>
                    {user.name?.split(' ')[0]}
                  </span>
                  <ChevronDown
                    size={13}
                    className={`hidden sm:block transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`}
                    style={{ color: 'rgba(255,255,255,0.4)' }}
                  />
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.96 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      className="absolute right-0 top-[calc(100%+8px)] w-56 rounded-2xl overflow-hidden z-50"
                      style={{
                        background: 'rgba(255,255,255,0.95)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(0,0,0,0.08)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
                      }}
                    >
                      {/* User info */}
                      <div className="px-4 py-3.5 border-b border-black/[0.06]" style={{ background: 'rgba(26,47,107,0.04)' }}>
                        <p className="font-semibold text-sm text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-400 truncate mt-0.5">{user.email}</p>
                      </div>

                      {/* Links */}
                      <div className="py-1.5">
                        {[
                          { to: '/profile', icon: <User size={14} />, label: 'Profile' },
                          { to: '/orders', icon: <Package size={14} />, label: 'My Orders' },
                          ...(user.role === 'admin' ? [{ to: '/admin', icon: <Zap size={14} />, label: 'Admin Panel' }] : []),
                          ...(user.role === 'vendor' ? [{ to: '/vendor', icon: <Zap size={14} />, label: 'Vendor Panel' }] : []),
                        ].map((item) => (
                          <Link
                            key={item.to}
                            to={item.to}
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-black/[0.04] hover:text-gray-900 transition-colors"
                          >
                            <span style={{ color: '#1a2f6b' }}>{item.icon}</span>
                            {item.label}
                          </Link>
                        ))}
                      </div>

                      <div className="border-t border-black/[0.06] py-1.5">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50/80 transition-colors"
                        >
                          Sign out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-1">
                <Link
                  to="/login"
                  className="text-sm font-medium px-3 py-2 rounded-xl transition-all hidden sm:block"
                  style={{ color: 'rgba(255,255,255,0.75)', border: '1px solid rgba(255,255,255,0.15)' }}
                  onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.1)';e.currentTarget.style.color='#fff'}}
                  onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='rgba(255,255,255,0.75)'}}
                >
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => { setMobileOpen(!mobileOpen); setMobileSearchOpen(false) }}
              className="md:hidden p-2.5 rounded-xl transition-all ml-1"
              style={{ color: 'rgba(255,255,255,0.7)' }}
              onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.1)'}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}
            >
              <AnimatePresence mode="wait">
                {mobileOpen
                  ? <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}><X size={19} /></motion.div>
                  : <motion.div key="m" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}><Menu size={19} /></motion.div>
                }
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <AnimatePresence>
        {mobileSearchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="md:hidden overflow-hidden"
            style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
          >
            <form onSubmit={(e) => { handleSearch(e); setMobileSearchOpen(false) }} className="px-4 py-3">
              <div className="relative">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.4)' }} />
                <input
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products, brands…"
                  className="w-full rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: '#f1f5f9' }}
                />
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="md:hidden overflow-hidden"
            style={{ background: 'rgba(15,23,42,0.97)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.07)', borderRadius: '0 0 16px 16px' }}
          >
            <div className="px-4 py-4 space-y-1 max-w-7xl mx-auto">
              <form onSubmit={handleSearch} className="relative mb-3">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search…"
                  className="input pl-10 text-sm"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#f1f5f9' }}
                />
              </form>
              {[
                { to: '/', label: 'Home' },
                { to: '/orders', label: 'My Orders' },
                { to: '/profile', label: 'Profile' },
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2.5 text-sm font-medium rounded-xl transition-colors"
                  style={{ color: 'rgba(255,255,255,0.7)' }}
                  onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.08)';e.currentTarget.style.color='#fff'}}
                  onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='rgba(255,255,255,0.7)'}}
                >
                  {label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </nav>
  )
}
