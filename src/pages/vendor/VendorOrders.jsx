import { useFetch } from '../../hooks/useFetch'
import { orderService } from '../../services'
import { Spinner } from '../../components/ui/Spinner'
import { formatDate, formatCurrency } from '../../utils'

const STATUS_STYLE = {
  DELIVERED:  'bg-green-50 text-green-600',
  SHIPPED:    'bg-blue-50 text-blue-600',
  PROCESSING: 'bg-yellow-50 text-yellow-600',
  PENDING:    'bg-gray-50 text-gray-500',
  CANCELLED:  'bg-red-50 text-red-500',
}

export function VendorOrders() {
  const { data, loading } = useFetch(() => orderService.getAll(), [])
  const orders = data?.orders ?? data ?? []

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-gray-900">My Orders</h1>

      {loading ? <div className="flex justify-center py-20"><Spinner size="lg" /></div> : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{['Order ID', 'Items', 'Total', 'Date', 'Status'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map(o => (
                  <tr key={o._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 font-mono text-xs text-gray-600">#{o._id.slice(-8).toUpperCase()}</td>
                    <td className="px-5 py-4 text-gray-700">{o.items?.length ?? 0} item(s)</td>
                    <td className="px-5 py-4 font-bold" style={{ color: '#7c3aed' }}>{formatCurrency(o.totalAmount)}</td>
                    <td className="px-5 py-4 text-gray-500">{o.createdAt ? formatDate(o.createdAt) : '—'}</td>
                    <td className="px-5 py-4">
                      <span className={`badge font-semibold ${STATUS_STYLE[o.status] ?? 'bg-gray-50 text-gray-500'}`}>{o.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!orders.length && <p className="text-center text-gray-400 py-12">No orders yet</p>}
          </div>
        </div>
      )}
    </div>
  )
}
