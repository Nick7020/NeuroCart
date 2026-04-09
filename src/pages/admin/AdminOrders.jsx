import { useState } from 'react'
import { useFetch } from '../../hooks/useFetch'
import { adminService } from '../../services'
import { useNotification } from '../../context/NotificationContext'
import { Badge } from '../../components/ui/Badge'
import { Spinner } from '../../components/ui/Spinner'
import { formatCurrency, formatDate, ORDER_STATUSES } from '../../utils'
import { Search } from 'lucide-react'

export function AdminOrders() {
  const { notify } = useNotification()
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [search, setSearch] = useState('')

  const { data, loading } = useFetch(
    () => adminService.getOrders(statusFilter !== 'ALL' ? { status: statusFilter } : undefined),
    [statusFilter]
  )

  const orders = data?.results ?? data ?? []

  const list = orders.filter(o => {
    const matchSearch = o.id?.includes(search) || o.user?.toLowerCase().includes(search.toLowerCase())
    return matchSearch
  })

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
            {[...ORDER_STATUSES, 'cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {loading ? <div className="flex justify-center py-20"><Spinner size="lg" /></div> : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{['Order ID', 'Customer', 'Date', 'Items', 'Total', 'Status'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {list.map(o => (
                  <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 font-mono text-xs text-gray-400">#{o.id?.slice(-8).toUpperCase()}</td>
                    <td className="px-5 py-4 font-semibold text-gray-800">{o.user || 'N/A'}</td>
                    <td className="px-5 py-4 text-gray-500">{formatDate(o.created_at)}</td>
                    <td className="px-5 py-4 text-gray-500">{o.item_count}</td>
                    <td className="px-5 py-4 font-bold" style={{ color: '#1A3263' }}>{formatCurrency(o.total_amount)}</td>
                    <td className="px-5 py-4"><Badge status={o.status} /></td>
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
