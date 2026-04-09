import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useNotification } from '../../context/NotificationContext'
import { Spinner } from '../../components/ui/Spinner'

export function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const { notify } = useNotification()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(form)
      notify('Login successful!', 'success')
      navigate(user.role === 'admin' ? '/admin' : '/')
    } catch (err) {
      notify(err.response?.data?.message || 'Login failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-400 text-sm">Login to your NeuroCart account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="input"
              placeholder="••••••••"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? <Spinner size="sm" /> : 'Login'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium">
            Sign up
          </Link>
        </p>

        {/* Demo Quick Login */}
        <div className="mt-6 pt-6 border-t border-gray-800">
          <p className="text-center text-xs text-gray-500 mb-3">🎭 Demo Quick Login</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => { setForm({ email: 'demo@neurocart.com', password: 'demo123' }); setTimeout(() => document.querySelector('form').requestSubmit(), 100) }}
              className="btn-secondary text-xs py-2 flex flex-col items-center gap-1"
            >
              <span>👤</span>
              <span>Customer</span>
            </button>
            <button
              type="button"
              onClick={() => { setForm({ email: 'admin@neurocart.com', password: 'admin123' }); setTimeout(() => document.querySelector('form').requestSubmit(), 100) }}
              className="bg-purple-700 hover:bg-purple-600 text-white text-xs py-2 rounded-xl transition-all flex flex-col items-center gap-1"
            >
              <span>🛡️</span>
              <span>Admin</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
