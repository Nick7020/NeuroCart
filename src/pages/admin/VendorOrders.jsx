import { useState } from 'react'
import { useFetch } from '../../hooks/useFetch'
import { vendorService } from '../../services'
import { OrderCard } from '../../components/order/OrderCard'
import { Spinner } from '../../components/ui/Spinner'
import { EmptyState } from '../../components/ui/EmptyState'

const FILTERS = ['ALL', 'PENDING', 'CONFIRMED', 'CANCELLED']

export function VendorOrders() {
  const { data, loading } = useFetch(() => vendorService.getOrders(), [])
  const [orders, setOrders] = useState(null)
  const [filter, setFilter] = useState('ALL')

  const allOrders = orders ?? data?.results ?? data ?? []
  const filtered = filter === 'ALL' ? allOrders : allOrders.filter(o => o.status?.toUpperCase() === filter)

  const handleUpdate = (id, status) => {
    setOrders(prev => (prev ?? allOrders).map(o => (o.id || o._id) === id ? { ...o, status } : o))
  }

  const counts = FILTERS.reduce((acc, f) => {
    acc[f] = f === 'ALL' ? allOrders.length : allOrders.filter(o => o.status === f).length
    return acc
  }, {})

  const FILTER_STYLES = {
    PENDING:   { bg: '#fffbeb', color: '#d97706' },
    CONFIRMED: { bg: '#f0fdf4', color: '#16a34a' },
    CANCELLED: { bg: '#fef2f2', color: '#dc2626' },
    ALL:       { bg: '#eff6ff', color: '#2563eb' },
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Order Management</h1>
        <p className="text-gray-400 text-sm mt-1">Accept or reject customer orders — invoice auto-generates on accept</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(f => {
          const s = FILTER_STYLES[f]
          return (
            <button key={f} onClick={() => setFilter(f)}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 border"
              style={filter === f
                ? { background: '#1A3263', color: '#fff', borderColor: '#1A3263' }
                : { background: '#fff', color: '#6b7280', borderColor: '#e5e7eb' }}>
              {f}
              <span className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                style={filter === f ? { background: 'rgba(255,255,255,0.2)', color: '#fff' } : { background: s.bg, color: s.color }}>
                {counts[f]}
              </span>
            </button>
          )
        })}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : !filtered.length ? (
        <EmptyState icon="📦" title="No orders found" description="No orders in this category yet" />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(order => (
            <OrderCard key={order.id || order._id} order={order} onUpdate={handleUpdate} />
          ))}
        </div>
      )}
    </div>
  )
}
