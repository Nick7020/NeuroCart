import { useState } from 'react'
import { useFetch } from '../../hooks/useFetch'
import { orderService } from '../../services'
import { useNotification } from '../../context/NotificationContext'
import { Badge } from '../../components/ui/Badge'
import { Spinner } from '../../components/ui/Spinner'
import { formatCurrency, formatDate, ORDER_STATUSES } from '../../utils'

export function AdminOrders() {
  const { notify } = useNotification()
  const { data, loading } = useFetch(() => orderService.getAll({ limit: 100 }), [])
  const [orders, setOrders] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [updating, setUpdating] = useState(null)

  const list = (orders ?? data?.orders ?? data ?? []).filter(o => {
    const matchSearch = o._id?.includes(search) || o.user?.name?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'ALL' || o.status === statusFilter
    return matchSearch && matchStatus
  })

  const handleStatusChange = async (orderId, status) => {
    setUpdating(orderId)
    try {
      await orderService.updateStatus(orderId, status)
      setOrders(prev => (prev ?? data?.orders ?? []).map(o => o._id === orderId ? { ...o, status } : o))
      notify('Status updated', 'success')
    } catch { notify('Update failed', 'error') }
    finally { setUpdating(null) }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Orders</h1>
        <div className="flex flex-wrap gap-3">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search order / customer..." className="input w-52" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input w-40">
            <option value="ALL">All Status</option>
            {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      {loading ? <div className="flex justify-center py-20"><Spinner size="lg" /></div> : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-800">
                <tr className="text-gray-400">
                  {['Order ID', 'Customer', 'Date', 'Items', 'Total', 'Status', 'Action'].map(h => (
                    <th key={h} className="text-left px-5 py-4 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {list.map(o => (
                  <tr key={o._id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-5 py-4 font-mono text-xs text-gray-400">#{o._id?.slice(-8).toUpperCase()}</td>
                    <td className="px-5 py-4 font-medium">{o.user?.name || 'N/A'}</td>
                    <td className="px-5 py-4 text-gray-400">{formatDate(o.createdAt)}</td>
                    <td className="px-5 py-4 text-gray-400">{o.items?.length}</td>
                    <td className="px-5 py-4 font-semibold text-indigo-400">{formatCurrency(o.totalAmount)}</td>
                    <td className="px-5 py-4"><Badge status={o.status} /></td>
                    <td className="px-5 py-4">
                      {updating === o._id ? <Spinner size="sm" /> : (
                        <select
                          value={o.status}
                          onChange={e => handleStatusChange(o._id, e.target.value)}
                          className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
                        >
                          {[...ORDER_STATUSES, 'CANCELLED'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!list.length && <p className="text-center text-gray-500 py-12">No orders found</p>}
          </div>
        </div>
      )}
    </div>
  )
}
