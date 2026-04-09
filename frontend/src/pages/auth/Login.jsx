import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, User, Shield, Store } from 'lucide-react'
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
      notify('Login successful!', 'success')
      if (user.role === 'admin') navigate('/admin')
      else if (user.role === 'vendor') navigate('/vendor')
      else navigate('/')
    } catch (err) {
      notify(err?.response?.data?.message || 'Login failed', 'error')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #EEF2FF 0%, #F0F9FF 100%)' }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src={logo} alt="NeuroCart" className="h-14 w-auto object-contain mx-auto mb-4" />
          <h1 className="text-3xl font-extrabold gradient-text">Welcome Back</h1>
          <p className="text-sm mt-1" style={{ color: '#94A3B8' }}>Login to your NeuroCart account</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm" style={{ border: '1px solid #E2E8F0' }}>
          <form onSubmit={e => { e.preventDefault(); doLogin(form.email, form.password) }} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#0F172A' }}>Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#94A3B8' }} />
                <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input" style={{ paddingLeft: '2.25rem' }} placeholder="you@example.com" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#0F172A' }}>Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#94A3B8' }} />
                <input type="password" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="input" style={{ paddingLeft: '2.25rem' }} placeholder="••••••••" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? <Spinner size="sm" /> : 'Login'}
            </button>
          </form>

          <p className="text-center text-sm mt-5" style={{ color: '#94A3B8' }}>
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold" style={{ color: '#4F46E5' }}>Sign up</Link>
          </p>

          <div className="mt-6 pt-5" style={{ borderTop: '1px solid #E2E8F0' }}>
            <p className="text-center text-xs font-medium mb-3" style={{ color: '#94A3B8' }}>Demo Quick Login</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Customer', icon: <User size={16} />,   email: 'demo@neurocart.com' },
                { label: 'Admin',    icon: <Shield size={16} />, email: 'admin@neurocart.com' },
                { label: 'Vendor',   icon: <Store size={16} />,  email: 'vendor@neurocart.com' },
              ].map(({ label, icon, email }) => (
                <motion.button key={label} whileTap={{ scale: 0.97 }} type="button" disabled={loading}
                  onClick={() => doLogin(email, 'demo123')}
                  className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl transition-all"
                  style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#EEF2FF'; e.currentTarget.style.borderColor = '#C7D2FE' }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = '#E2E8F0' }}>
                  <span style={{ color: '#4F46E5' }}>{icon}</span>
                  <span className="text-xs font-semibold" style={{ color: '#475569' }}>{label}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
      <footer style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px', color: '#6b7280' }}>
        © 2026 NeuroCart. All rights reserved.
      </footer>
    </div>
  )
}
