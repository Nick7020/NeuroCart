import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShoppingBag, Store } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useNotification } from '../../context/NotificationContext'
import { Spinner } from '../../components/ui/Spinner'
import logo from '../../assets/logo.png'

export function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'customer', storeName: '', gstNo: '' })
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const { notify } = useNotification()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) return notify('Passwords do not match', 'error')
    setLoading(true)
    try {
      const user = await register({
        first_name: form.name.split(' ')[0] || form.name,
        last_name: form.name.split(' ').slice(1).join(' ') || '',
        email: form.email,
        password: form.password,
        role: form.role,
        shop_name: form.storeName,
        description: form.gstNo ? `GST: ${form.gstNo}` : '',
      })
      notify('Account created!', 'success')
      navigate(user.role === 'vendor' ? '/admin/vendor-dashboard' : '/')
    } catch (err) {
      notify(err?.response?.data?.message || 'Registration failed', 'error')
    } finally { setLoading(false) }
  }

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #EEF2FF 0%, #F0F9FF 100%)' }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src={logo} alt="NeuroCart" className="h-14 w-auto object-contain mx-auto mb-4" />
          <h1 className="text-3xl font-extrabold gradient-text">Join NeuroCart</h1>
          <p className="text-sm mt-1" style={{ color: '#94A3B8' }}>Create your account to get started</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm" style={{ border: '1px solid #E2E8F0' }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { k: 'name',            label: 'Full Name',        type: 'text',     placeholder: 'e.g. Rahul Sharma' },
              { k: 'email',           label: 'Email',            type: 'email',    placeholder: 'you@example.com' },
              { k: 'password',        label: 'Password',         type: 'password', placeholder: '••••••••' },
              { k: 'confirmPassword', label: 'Confirm Password', type: 'password', placeholder: '••••••••' },
            ].map(({ k, label, type, placeholder }) => (
              <div key={k}>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#0F172A' }}>{label}</label>
                <input type={type} required value={form[k]} onChange={set(k)} className="input" placeholder={placeholder} />
              </div>
            ))}

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#0F172A' }}>I want to</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'customer', label: 'Shop',  sub: 'Buy products',       icon: <ShoppingBag size={18} /> },
                  { value: 'vendor',   label: 'Sell',  sub: 'List & sell products', icon: <Store size={18} /> },
                ].map(opt => (
                  <button key={opt.value} type="button" onClick={() => setForm({ ...form, role: opt.value })}
                    className="flex flex-col items-center gap-1.5 py-3 px-4 rounded-2xl transition-all"
                    style={{
                      border: `2px solid ${form.role === opt.value ? '#4F46E5' : '#E2E8F0'}`,
                      background: form.role === opt.value ? '#EEF2FF' : '#F8FAFC',
                    }}>
                    <span style={{ color: form.role === opt.value ? '#4F46E5' : '#94A3B8' }}>{opt.icon}</span>
                    <span className="text-xs font-semibold" style={{ color: form.role === opt.value ? '#4F46E5' : '#475569' }}>{opt.label}</span>
                    <span className="text-[10px]" style={{ color: '#94A3B8' }}>{opt.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {form.role === 'vendor' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#0F172A' }}>Store Name</label>
                  <input type="text" required value={form.storeName} onChange={set('storeName')} className="input" placeholder="My Awesome Store" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#0F172A' }}>GST Number</label>
                  <input type="text" required value={form.gstNo} onChange={e => setForm({ ...form, gstNo: e.target.value.toUpperCase() })} className="input" placeholder="22AAAAA0000A1Z5" maxLength={15} />
                  <p className="text-[11px] mt-1" style={{ color: '#94A3B8' }}>15-digit GST Identification Number (GSTIN)</p>
                </div>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-2">
              {loading ? <Spinner size="sm" /> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm mt-5" style={{ color: '#94A3B8' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-semibold" style={{ color: '#4F46E5' }}>Login</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
