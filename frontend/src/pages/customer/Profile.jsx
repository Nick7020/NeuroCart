import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useFetch } from '../../hooks/useFetch'
import { orderService } from '../../services'
import { formatCurrency, formatDate } from '../../utils'
import { Badge } from '../../components/ui/Badge'
import { Spinner } from '../../components/ui/Spinner'
import { EmptyState } from '../../components/ui/EmptyState'

export function Profile() {
  const { user } = useAuth()
  const [tab, setTab] = useState('orders')
  const { data, loading } = useFetch(() => orderService.myOrders(), [])
  const orders = data?.orders || data || []

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6 flex items-center gap-5 shadow-sm">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-extrabold text-white shadow-md" style={{ background: 'linear-gradient(135deg,#1A3263,#547792)' }}>
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">{user?.name}</h1>
          <p className="text-gray-400 text-sm">{user?.email}</p>
          <span className="badge bg-blue-50 text-blue-600 mt-1 capitalize">{user?.role}</span>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {[{ k: 'orders', label: '📦 Order History' }, { k: 'account', label: '⚙️ Account' }].map(({ k, label }) => (
          <button key={k} onClick={() => setTab(k)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${tab === k ? 'text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'}`}
            style={tab === k ? { background: 'linear-gradient(135deg,#1A3263,#547792)' } : {}}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'orders' && (
        loading ? <div className="flex justify-center py-10"><Spinner /></div> :
        !orders.length ? <EmptyState icon="📦" title="No orders yet" action={<Link to="/" className="btn-primary">Shop Now</Link>} /> :
        <div className="space-y-4">
          {orders.map(order => (
            <Link key={order._id} to={`/orders/${order._id}`}
              className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-sm hover:shadow-md hover:border-blue-200 transition-all block">
              <div>
                <p className="font-bold text-gray-800">Order #{order._id?.slice(-8).toUpperCase()}</p>
                <p className="text-sm text-gray-400 mt-0.5">{formatDate(order.createdAt)} · {order.items?.length} item(s)</p>
              </div>
              <div className="flex items-center gap-4">
                <Badge status={order.status} />
                <span className="font-extrabold" style={{ color: '#1A3263' }}>{formatCurrency(order.totalAmount)}</span>
                <span className="text-gray-400 text-sm">View →</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {tab === 'account' && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-lg text-gray-900 mb-4">Account Details</h2>
          {[
            { label: 'Full Name', value: user?.name },
            { label: 'Email', value: user?.email },
            { label: 'Role', value: user?.role },
            { label: 'Member Since', value: user?.createdAt ? formatDate(user.createdAt) : 'N/A' },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between py-3 border-b border-gray-50 last:border-0">
              <span className="text-gray-400 text-sm">{label}</span>
              <span className="font-semibold text-sm text-gray-800 capitalize">{value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
