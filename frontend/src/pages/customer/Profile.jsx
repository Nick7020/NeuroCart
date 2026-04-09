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
      {/* Header */}
      <div className="card p-6 mb-6 flex items-center gap-5">
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-2xl font-bold">
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <h1 className="text-xl font-bold">{user?.name}</h1>
          <p className="text-gray-400 text-sm">{user?.email}</p>
          <span className="badge bg-indigo-500/20 text-indigo-300 mt-1">{user?.role}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {['orders', 'account'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition-all capitalize ${tab === t ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
          >
            {t === 'orders' ? '📦 Order History' : '⚙️ Account'}
          </button>
        ))}
      </div>

      {tab === 'orders' && (
        <div>
          {loading ? (
            <div className="flex justify-center py-10"><Spinner /></div>
          ) : !orders.length ? (
            <EmptyState icon="📦" title="No orders yet" description="Start shopping to see your orders here" action={<Link to="/" className="btn-primary">Shop Now</Link>} />
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Link key={order._id} to={`/orders/${order._id}`} className="card p-5 flex flex-wrap items-center justify-between gap-4 hover:border-indigo-500/50 transition-all">
                  <div>
                    <p className="font-semibold">Order #{order._id?.slice(-8).toUpperCase()}</p>
                    <p className="text-sm text-gray-400 mt-0.5">{formatDate(order.createdAt)} · {order.items?.length} item(s)</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge status={order.status} />
                    <span className="font-bold text-indigo-400">{formatCurrency(order.totalAmount)}</span>
                    <span className="text-gray-400 text-sm">View →</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'account' && (
        <div className="card p-6 space-y-4">
          <h2 className="font-bold text-lg mb-2">Account Details</h2>
          {[
            { label: 'Full Name', value: user?.name },
            { label: 'Email', value: user?.email },
            { label: 'Role', value: user?.role },
            { label: 'Member Since', value: user?.createdAt ? formatDate(user.createdAt) : 'N/A' },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between py-3 border-b border-gray-800 last:border-0">
              <span className="text-gray-400 text-sm">{label}</span>
              <span className="font-medium text-sm">{value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
