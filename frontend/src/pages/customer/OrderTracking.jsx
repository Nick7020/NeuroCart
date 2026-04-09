import { useParams, useNavigate } from 'react-router-dom'
import { useFetch } from '../../hooks/useFetch'
import { orderService } from '../../services'
import { PageLoader } from '../../components/ui/Spinner'
import { formatCurrency, formatDate, ORDER_STATUSES } from '../../utils'

export function OrderTracking() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data, loading } = useFetch(() => orderService.getById(id), [id])
  const order = data?.order || data

  if (loading) return <PageLoader />
  if (!order) return <div className="text-center py-20 text-gray-400">Order not found</div>

  const currentStep = ORDER_STATUSES.indexOf(order.status)

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white mb-6 flex items-center gap-2 text-sm">← Back</button>

      <div className="card p-6 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold">Order #{order._id?.slice(-8).toUpperCase()}</h1>
            <p className="text-gray-400 text-sm mt-1">Placed on {formatDate(order.createdAt)}</p>
          </div>
          <span className={`badge text-sm px-3 py-1 ${
            order.status === 'DELIVERED' ? 'bg-green-500/20 text-green-400' :
            order.status === 'CANCELLED' ? 'bg-red-500/20 text-red-400' :
            'bg-indigo-500/20 text-indigo-400'
          }`}>{order.status}</span>
        </div>
      </div>

      {/* Timeline */}
      <div className="card p-6 mb-6">
        <h2 className="font-bold mb-6">Tracking Timeline</h2>
        <div className="relative">
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-700" />
          <div
            className="absolute left-5 top-0 w-0.5 bg-indigo-500 transition-all duration-700"
            style={{ height: `${(currentStep / (ORDER_STATUSES.length - 1)) * 100}%` }}
          />
          <div className="space-y-8">
            {ORDER_STATUSES.map((status, i) => {
              const done = i <= currentStep
              const icons = { PENDING: '⏳', CONFIRMED: '✅', PROCESSING: '⚙️', SHIPPED: '🚚', DELIVERED: '📦' }
              return (
                <div key={status} className="flex items-start gap-4 relative">
                  <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all ${
                    done ? 'bg-indigo-600 border-indigo-500' : 'bg-gray-800 border-gray-600'
                  }`}>
                    {icons[status]}
                  </div>
                  <div className="pt-1.5">
                    <p className={`font-semibold ${done ? 'text-white' : 'text-gray-500'}`}>{status}</p>
                    {i === currentStep && order.updatedAt && (
                      <p className="text-xs text-indigo-400 mt-0.5">{formatDate(order.updatedAt)}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="card p-6 mb-6">
        <h2 className="font-bold mb-4">Items Ordered</h2>
        <div className="space-y-3">
          {order.items?.map((item, i) => (
            <div key={i} className="flex items-center gap-4">
              <img
                src={item.product?.images?.[0] || 'https://placehold.co/60x60/1f2937/6366f1?text=P'}
                alt={item.product?.name}
                className="w-14 h-14 rounded-xl object-cover bg-gray-800"
              />
              <div className="flex-1">
                <p className="font-medium">{item.product?.name}</p>
                <p className="text-sm text-gray-400">Qty: {item.quantity}</p>
              </div>
              <span className="font-bold">{formatCurrency(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
        <hr className="border-gray-700 my-4" />
        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span className="text-indigo-400">{formatCurrency(order.totalAmount)}</span>
        </div>
      </div>

      {/* Address */}
      {order.address && (
        <div className="card p-6">
          <h2 className="font-bold mb-3">Delivery Address</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            {order.address.name}<br />
            {order.address.street}, {order.address.city}<br />
            {order.address.state} - {order.address.pincode}<br />
            📞 {order.address.phone}
          </p>
        </div>
      )}
    </div>
  )
}
