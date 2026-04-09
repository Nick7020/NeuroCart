import { Link } from 'react-router-dom'
import { useFetch } from '../../hooks/useFetch'
import { orderService } from '../../services'
import { formatCurrency, formatDate } from '../../utils'
import { Badge } from '../../components/ui/Badge'
import { Spinner } from '../../components/ui/Spinner'
import { EmptyState } from '../../components/ui/EmptyState'

export function Orders() {
  const { data, loading } = useFetch(() => orderService.myOrders(), [])
  const orders = data?.orders || data || []

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  if (!orders.length) return (
    <EmptyState
      icon="📦"
      title="No orders yet"
      description="Place your first order to see it here"
      action={<Link to="/" className="btn-primary">Shop Now</Link>}
    />
  )

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">My Orders</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <Link
            key={order._id}
            to={`/orders/${order._id}`}
            className="card p-5 flex flex-wrap items-center justify-between gap-4 hover:border-indigo-500/50 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center text-xl">📦</div>
              <div>
                <p className="font-semibold">Order #{order._id?.slice(-8).toUpperCase()}</p>
                <p className="text-sm text-gray-400">{formatDate(order.createdAt)} · {order.items?.length} item(s)</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge status={order.status} />
              <span className="font-bold text-indigo-400">{formatCurrency(order.totalAmount)}</span>
              <span className="text-gray-400 text-sm">Track →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
