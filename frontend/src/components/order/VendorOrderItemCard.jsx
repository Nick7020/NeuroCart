import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Package, User, Calendar, DollarSign, FileText } from 'lucide-react'
import { vendorService } from '../../services'
import { useContext } from 'react'
import { NotificationContext } from '../../context/NotificationContext'

export function VendorOrderItemCard({ orderItem, onUpdate }) {
  const [loading, setLoading] = useState(null)
  const { notify } = useContext(NotificationContext)

  const handleAccept = async () => {
    setLoading('accept')
    try {
      await vendorService.acceptOrder(orderItem.id)
      onUpdate(orderItem.id, 'processing')
      notify('Order accepted successfully!', 'success')
    } catch (error) {
      console.error('Failed to accept order:', error)
      notify(error?.response?.data?.message || 'Failed to accept order. Please try again.', 'error')
    } finally {
      setLoading(null)
    }
  }

  const handleReject = async () => {
    setLoading('reject')
    try {
      await vendorService.rejectOrder(orderItem.id)
      onUpdate(orderItem.id, 'cancelled')
      notify('Order rejected successfully!', 'success')
    } catch (error) {
      console.error('Failed to reject order:', error)
      notify(error?.response?.data?.message || 'Failed to reject order. Please try again.', 'error')
    } finally {
      setLoading(null)
    }
  }

  const STATUS_STYLES = {
    pending: { bg: '#fffbeb', color: '#d97706', text: 'Pending' },
    processing: { bg: '#fef3c7', color: '#d97706', text: 'Processing' },
    shipped: { bg: '#dbeafe', color: '#2563eb', text: 'Shipped' },
    delivered: { bg: '#f0fdf4', color: '#16a34a', text: 'Delivered' },
    cancelled: { bg: '#fef2f2', color: '#dc2626', text: 'Cancelled' },
  }

  const statusStyle = STATUS_STYLES[orderItem.status] || STATUS_STYLES.pending

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Package size={20} className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">{orderItem.product.name}</h3>
              <p className="text-sm text-gray-500">Order Item #{orderItem.id}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="px-3 py-1 rounded-full text-xs font-semibold"
              style={{ background: statusStyle.bg, color: statusStyle.color }}>
              {statusStyle.text}
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <User size={14} />
          <span>{orderItem.order?.user?.first_name} {orderItem.order?.user?.last_name}</span>
        </div>

        {/* Date */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar size={14} />
          <span>{new Date(orderItem.order?.created_at).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500">Quantity</p>
            <p className="font-semibold text-gray-900">{orderItem.quantity}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Unit Price</p>
            <p className="font-semibold text-gray-900 flex items-center gap-1">
              <DollarSign size={14} />
              {orderItem.unit_price}
            </p>
          </div>
        </div>

        <div className="border-t border-gray-50 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Subtotal</span>
            <span className="font-bold text-lg text-gray-900 flex items-center gap-1">
              <DollarSign size={16} />
              {orderItem.subtotal}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 pb-6">
        <div className="flex gap-2">
          {orderItem.status === 'pending' && (
            <>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleAccept}
                disabled={!!loading}
                className="flex-1 flex items-center justify-center gap-2 text-white font-bold py-3 rounded-xl text-sm transition-all disabled:opacity-60 shadow-md"
                style={{ background: loading === 'accept' ? '#15803d' : 'linear-gradient(135deg,#16a34a,#15803d)', boxShadow: '0 4px 12px rgba(22,163,74,0.3)' }}
              >
                {loading === 'accept'
                  ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Accepting...</>
                  : <><CheckCircle size={16} /> Accept Order</>
                }
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleReject}
                disabled={!!loading}
                className="flex-1 flex items-center justify-center gap-2 text-white font-bold py-3 rounded-xl text-sm transition-all disabled:opacity-60 shadow-md"
                style={{ background: loading === 'reject' ? '#b91c1c' : 'linear-gradient(135deg,#ef4444,#b91c1c)', boxShadow: '0 4px 12px rgba(239,68,68,0.3)' }}
              >
                {loading === 'reject'
                  ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Rejecting...</>
                  : <><XCircle size={16} /> Reject Order</>
                }
              </motion.button>
            </>
          )}
          {orderItem.status === 'processing' && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => {/* TODO: Navigate to invoice */}}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-md"
              style={{ background: 'linear-gradient(135deg,#2563eb,#3b82f6)', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}
            >
              <FileText size={16} /> View Invoice
            </motion.button>
          )}
          {orderItem.status === 'shipped' && (
            <div className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold bg-purple-50 text-purple-600 border border-purple-100">
              <Package size={15} /> Order Shipped
            </div>
          )}
          {orderItem.status === 'delivered' && (
            <div className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold bg-green-50 text-green-600 border border-green-100">
              <CheckCircle size={15} /> Order Delivered
            </div>
          )}
          {orderItem.status === 'cancelled' && (
            <div className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold bg-red-50 text-red-500 border border-red-100">
              <XCircle size={15} /> Order Rejected
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}