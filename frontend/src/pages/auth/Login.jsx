import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, Zap } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useNotification } from '../../context/NotificationContext'
import { Spinner } from '../../components/ui/Spinner'
import logo from '../../assets/logo.png'

export function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const { notify } = useNotification()
  const navigate = useNavigate()

  const doLogin = async (email, password) => {
    setLoading(true)
    try {
      const user = await login({ email, password })
      notify('Login successful! 🎉', 'success')
      navigate(user.role === 'admin' || user.role === 'staff' ? '/admin' : '/')
    } catch (err) {
      notify(err?.response?.data?.message || 'Login failed', 'error')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#ffedce' }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src={logo} alt="NeuroCart" className="h-14 w-auto object-contain mx-auto mb-4" />
          <h1 className="text-3xl font-extrabold gradient-text">Welcome Back</h1>
          <p className="text-gray-400 text-sm mt-1">Login to your NeuroCart account</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
          <form onSubmit={e => { e.preventDefault(); doLogin(form.email, form.password) }} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input pl-10" placeholder="you@example.com" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="password" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="input pl-10" placeholder="••••••••" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? <Spinner size="sm" /> : 'Login'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-5">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold" style={{ color: '#1A3263' }}>Sign up</Link>
          </p>

          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-center text-xs text-gray-400 mb-3">🎭 Demo Quick Login</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Customer', icon: '👤', email: 'demo@neurocart.com', sub: 'demo@neurocart.com' },
                { label: 'Admin', icon: '🛡️', email: 'admin@neurocart.com', sub: 'admin@neurocart.com' },
              ].map(({ label, icon, email, sub }) => (
                <motion.button key={label} whileTap={{ scale: 0.97 }} type="button" disabled={loading}
                  onClick={() => doLogin(email, 'demo123')}
                  className="flex flex-col items-center gap-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-2xl py-3 px-4 transition-all">
                  <span className="text-2xl">{icon}</span>
                  <span className="text-xs font-semibold text-gray-700">{label}</span>
                  <span className="text-[10px] text-gray-400 truncate w-full text-center">{sub}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
