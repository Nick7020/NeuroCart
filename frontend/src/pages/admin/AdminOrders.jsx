import { useState } from 'react'
import { useFetch } from '../../hooks/useFetch'
import { orderService } from '../../services'
import { useNotification } from '../../context/NotificationContext'
import { Badge } from '../../components/ui/Badge'
import { Spinner } from '../../components/ui/Spinner'
import { formatCurrency, formatDate, ORDER_STATUSES } from '../../utils'
import { Search } from 'lucide-react'

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
        <h1 className="text-2xl font-extrabold text-gray-900">Orders</h1>
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="input pl-9 w-52" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input w-40">
            <option value="ALL">All Status</option>
            {[...ORDER_STATUSES, 'CANCELLED'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {loading ? <div className="flex justify-center py-20"><Spinner size="lg" /></div> : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{['Order ID', 'Customer', 'Date', 'Items', 'Total', 'Status', 'Action'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {list.map(o => (
                  <tr key={o._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 font-mono text-xs text-gray-400">#{o._id?.slice(-8).toUpperCase()}</td>
                    <td className="px-5 py-4 font-semibold text-gray-800">{o.user?.name || 'N/A'}</td>
                    <td className="px-5 py-4 text-gray-500">{formatDate(o.createdAt)}</td>
                    <td className="px-5 py-4 text-gray-500">{o.items?.length}</td>
                    <td className="px-5 py-4 font-bold" style={{ color: '#1A3263' }}>{formatCurrency(o.totalAmount)}</td>
                    <td className="px-5 py-4"><Badge status={o.status} /></td>
                    <td className="px-5 py-4">
                      {updating === o._id ? <Spinner size="sm" /> : (
                        <select value={o.status} onChange={e => handleStatusChange(o._id, e.target.value)}
                          className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-blue-400 text-gray-700">
                          {[...ORDER_STATUSES, 'CANCELLED'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!list.length && <p className="text-center text-gray-400 py-12">No orders found</p>}
          </div>
        </div>
      )}
    </div>
  )
}
