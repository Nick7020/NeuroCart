import { useParams, useNavigate } from 'react-router-dom'
import { useFetch } from '../../hooks/useFetch'
import { orderService } from '../../services'
import { PageLoader } from '../../components/ui/Spinner'
import { Badge } from '../../components/ui/Badge'
import { formatCurrency, formatDate, ORDER_STATUSES } from '../../utils'
import { ArrowLeft } from 'lucide-react'

const ICONS = { pending: '⏳', confirmed: '✅', partially_shipped: '⚙️', shipped: '🚚', delivered: '📦' }

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
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-gray-700 mb-6 text-sm transition-colors group">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back
      </button>

      {/* Header */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-5 shadow-sm flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">Order #{(order.id || order._id)?.toString().slice(-8).toUpperCase()}</h1>
          <p className="text-gray-400 text-sm mt-1">Placed on {formatDate(order.created_at || order.createdAt)}</p>
        </div>
        <Badge status={order.status} />
      </div>

      {/* Timeline */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-5 shadow-sm">
        <h2 className="font-bold text-gray-900 mb-6">Tracking Timeline</h2>
        <div className="relative">
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-100" />
          <div className="absolute left-5 top-0 w-0.5 bg-blue-500 transition-all duration-700"
            style={{ height: `${(currentStep / (ORDER_STATUSES.length - 1)) * 100}%` }} />
          <div className="space-y-7">
            {ORDER_STATUSES.map((status, i) => {
              const done = i <= currentStep
              return (
                <div key={status} className="flex items-start gap-4 relative">
                  <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all ${done ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}>
                    {ICONS[status]}
                  </div>
                  <div className="pt-2">
                    <p className={`font-semibold capitalize ${done ? 'text-gray-900' : 'text-gray-300'}`}>{status.replace('_', ' ')}</p>
                    {i === currentStep && (order.updated_at || order.updatedAt) && (
                      <p className="text-xs text-blue-500 mt-0.5">{formatDate(order.updated_at || order.updatedAt)}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-5 shadow-sm">
        <h2 className="font-bold text-gray-900 mb-4">Items Ordered</h2>
        <div className="space-y-3">
          {order.items?.map((item, i) => (
            <div key={i} className="flex items-center gap-4">
              <img src={item.product?.images?.[0] || 'https://placehold.co/60x60/f0f4ff/1A3263?text=P'}
                alt={item.product?.name} className="w-14 h-14 rounded-xl object-cover bg-gray-50 border border-gray-100" />
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{item.product?.name}</p>
                <p className="text-sm text-gray-400">Qty: {item.quantity}</p>
              </div>
              <span className="font-bold text-gray-900">{formatCurrency((item.unit_price || item.price) * item.quantity)}</span>
            </div>
          ))}
        </div>
        <hr className="border-gray-100 my-4" />
        <div className="flex justify-between font-extrabold text-lg">
          <span className="text-gray-900">Total</span>
          <span style={{ color: '#1A3263' }}>{formatCurrency(order.total_amount || order.totalAmount)}</span>
        </div>
      </div>

      {/* Address */}
      {order.address && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-3">Delivery Address</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
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
