import { Link } from 'react-router-dom'
import { useFetch } from '../../hooks/useFetch'
import { orderService } from '../../services'
import { formatCurrency, formatDate } from '../../utils'
import { Badge } from '../../components/ui/Badge'
import { Spinner } from '../../components/ui/Spinner'
import { EmptyState } from '../../components/ui/EmptyState'

export function Orders() {
  const { data, loading } = useFetch(() => orderService.myOrders(), [])
  const raw = data?.results ?? data
  const orders = Array.isArray(raw) ? raw : []

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  if (!orders.length) return (
    <EmptyState icon="📦" title="No orders yet" description="Place your first order to see it here"
      action={<Link to="/" className="btn-primary">Shop Now</Link>} />
  )

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900 mb-8">My Orders</h1>
      <div className="space-y-4">
        {orders.map(order => {
          const orderId = (order.id || order._id)?.toString() || ''
          const itemCount = order.item_count || order.items?.length || 0
          return (
            <Link key={orderId} to={`/orders/${orderId}`}
              className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-sm hover:shadow-md hover:border-blue-200 transition-all block">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style={{ background: '#eff6ff' }}>📦</div>
                <div>
                  <p className="font-bold text-gray-800">Order #{orderId.slice(-8).toUpperCase()}</p>
                  <p className="text-sm text-gray-400 mt-0.5">{formatDate(order.created_at)} · {itemCount} item(s)</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge status={order.status} />
                <span className="font-extrabold" style={{ color: '#1A3263' }}>{formatCurrency(order.total_amount || 0)}</span>
                <span className="text-gray-400 text-sm">Track →</span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
