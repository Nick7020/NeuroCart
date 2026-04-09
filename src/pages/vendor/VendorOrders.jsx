import { useState } from 'react'
import { useFetch } from '../../hooks/useFetch'
import { vendorService } from '../../services'
import { useNotification } from '../../context/NotificationContext'
import { Spinner } from '../../components/ui/Spinner'
import { EmptyState } from '../../components/ui/EmptyState'
import { formatCurrency, formatDate } from '../../utils'

const STATUS_STYLE = {
  delivered:  'bg-green-50 text-green-600',
  shipped:    'bg-blue-50 text-blue-600',
  processing: 'bg-yellow-50 text-yellow-600',
  pending:    'bg-gray-50 text-gray-500',
  cancelled:  'bg-red-50 text-red-500',
}

// Valid next statuses a vendor can set
const NEXT_STATUS = {
  pending:    'processing',
  processing: 'shipped',
  shipped:    'delivered',
}

export function VendorOrders() {
  const { notify } = useNotification()
  const { data, loading } = useFetch(() => vendorService.getOrders(), [])
  const [items, setItems] = useState(null)
  const [updating, setUpdating] = useState(null)

  const list = items ?? data?.results ?? data ?? []

  const handleAdvance = async (item) => {
    const next = NEXT_STATUS[item.status]
    if (!next) return
    setUpdating(item.id)
    try {
      await vendorService.acceptOrder(item.id)
      setItems(prev => (prev ?? list).map(i => i.id === item.id ? { ...i, status: next } : i))
      notify(`Order item marked as ${next}`, 'success')
    } catch (err) {
      notify(err?.response?.data?.message || 'Update failed', 'error')
    } finally { setUpdating(null) }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">My Orders</h1>
        <p className="text-gray-400 text-sm mt-1">Order items assigned to your store</p>
      </div>

      {!list.length ? (
        <EmptyState icon="📦" title="No orders yet" description="Orders from customers will appear here" />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Item ID', 'Product', 'Qty', 'Subtotal', 'Status', 'Action'].map(h => (
                    <th key={h} className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {list.map(item => {
                  const next = NEXT_STATUS[item.status]
                  return (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4 font-mono text-xs text-gray-600">
                        #{String(item.id).slice(-8).toUpperCase()}
                      </td>
                      <td className="px-5 py-4 font-semibold text-gray-800">
                        {item.product?.name ?? '—'}
                      </td>
                      <td className="px-5 py-4 text-gray-600">{item.quantity}</td>
                      <td className="px-5 py-4 font-bold" style={{ color: '#1A3263' }}>
                        {formatCurrency(item.subtotal)}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLE[item.status] ?? 'bg-gray-50 text-gray-500'}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {next ? (
                          <button
                            disabled={updating === item.id}
                            onClick={() => handleAdvance(item)}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                          >
                            {updating === item.id ? '...' : `Mark ${next}`}
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
