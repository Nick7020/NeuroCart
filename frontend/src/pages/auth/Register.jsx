import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useNotification } from '../../context/NotificationContext'
import { Spinner } from '../../components/ui/Spinner'
import logo from '../../assets/logo.png'

export function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const { notify } = useNotification()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) return notify('Passwords do not match', 'error')
    setLoading(true)
    try {
      await register({ name: form.name, email: form.email, password: form.password })
      notify('Account created! 🎉', 'success')
      navigate('/')
    } catch (err) {
      notify(err?.response?.data?.message || 'Registration failed', 'error')
    } finally { setLoading(false) }
  }

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#ffedce' }}>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src={logo} alt="NeuroCart" className="h-14 w-auto object-contain mx-auto mb-4" />
          <h1 className="text-3xl font-extrabold gradient-text">Join NeuroCart</h1>
          <p className="text-gray-400 text-sm mt-1">Create your account to get started</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { k: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe' },
              { k: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
              { k: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
              { k: 'confirmPassword', label: 'Confirm Password', type: 'password', placeholder: '••••••••' },
            ].map(({ k, label, type, placeholder }) => (
              <div key={k}>
                <label className="block text-sm font-semibold mb-2 text-gray-700">{label}</label>
                <input type={type} required value={form[k]} onChange={set(k)} className="input" placeholder={placeholder} />
              </div>
            ))}
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-2">
              {loading ? <Spinner size="sm" /> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold" style={{ color: '#1A3263' }}>Login</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
