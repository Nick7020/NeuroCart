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
  pending:    'bg-gray-100 text-gray-500',
  cancelled:  'bg-red-50 text-red-500',
}

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
    const next = NEXT_STATUS[item.status?.toLowerCase()]
    if (!next) return
    setUpdating(item.id)
    try {
      await vendorService.updateOrderStatus(item.id, next)
      setItems((prev ?? list).map(i => i.id === item.id ? { ...i, status: next } : i))
      notify(`Order marked as ${next}`, 'success')
    } catch (err) {
      notify(err?.response?.data?.message || 'Update failed', 'error')
    } finally { setUpdating(null) }
  }

  const handleReject = async (item) => {
    setUpdating(item.id)
    try {
      await vendorService.rejectOrder(item.id)
      setItems((prev ?? list).map(i => i.id === item.id ? { ...i, status: 'cancelled' } : i))
      notify('Order rejected', 'success')
    } catch (err) {
      notify(err?.response?.data?.message || 'Reject failed', 'error')
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
        <EmptyState title="No orders yet" description="Orders from customers will appear here" />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Item ID', 'Product', 'Qty', 'Subtotal', 'Date', 'Status', 'Action'].map(h => (
                    <th key={h} className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {list.map(item => {
                  const statusKey = item.status?.toLowerCase()
                  const next = NEXT_STATUS[statusKey]
                  const isPending = statusKey === 'pending'
                  return (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4 font-mono text-xs text-gray-500">
                        #{String(item.id).slice(-8).toUpperCase()}
                      </td>
                      <td className="px-5 py-4 font-semibold text-gray-800">
                        {item.product?.name ?? '—'}
                      </td>
                      <td className="px-5 py-4 text-gray-600">{item.quantity}</td>
                      <td className="px-5 py-4 font-bold text-indigo-600">
                        {formatCurrency(item.subtotal)}
                      </td>
                      <td className="px-5 py-4 text-gray-500 text-xs">
                        {item.order?.created_at ? formatDate(item.order.created_at) : '—'}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLE[statusKey] ?? 'bg-gray-50 text-gray-500'}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {updating === item.id ? <Spinner size="sm" /> : isPending ? (
                          <div className="flex gap-2">
                            <button onClick={() => handleAdvance(item)}
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors">
                              Accept
                            </button>
                            <button onClick={() => handleReject(item)}
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                              Reject
                            </button>
                          </div>
                        ) : next ? (
                          <button onClick={() => handleAdvance(item)}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors capitalize">
                            Mark {next}
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
