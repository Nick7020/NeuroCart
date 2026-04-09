import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, FileText, User, MapPin, Package } from 'lucide-react'
import { vendorService, invoiceService } from '../../services'
import { useNotification } from '../../context/NotificationContext'
import { InvoicePreview } from './InvoicePreview'
import { formatCurrency, formatDate } from '../../utils'

const STATUS_STYLE = {
  PENDING:   { bg: '#fffbeb', color: '#d97706', label: 'Pending' },
  CONFIRMED: { bg: '#f0fdf4', color: '#16a34a', label: 'Accepted' },
  CANCELLED: { bg: '#fef2f2', color: '#dc2626', label: 'Rejected' },
}

export function OrderCard({ order, onUpdate }) {
  const { notify } = useNotification()
  const [loading, setLoading] = useState(null)
  const [invoice, setInvoice] = useState(null)

  const s = STATUS_STYLE[order.status] || STATUS_STYLE.PENDING
  const subtotal = (order.items || []).reduce((s, i) => s + i.price * i.quantity, 0)
  const total = subtotal * 1.18

  const handleAccept = async () => {
    setLoading('accept')
    try {
      await vendorService.acceptOrder(order._id)
      const orderId = 'VLO' + Date.now()
      const inv = {
        orderId,
        order: { ...order, status: 'CONFIRMED' },
        createdAt: new Date().toISOString(),
      }
      const { data } = await invoiceService.create(inv)
      setInvoice(data.invoice || inv)
      onUpdate(order._id, 'CONFIRMED')
      notify('Order accepted & invoice generated!', 'success')
    } catch { notify('Failed to accept', 'error') }
    finally { setLoading(null) }
  }

  const handleReject = async () => {
    setLoading('reject')
    try {
      await vendorService.rejectOrder(order._id)
      onUpdate(order._id, 'CANCELLED')
      notify('Order rejected', 'info')
    } catch { notify('Failed to reject', 'error') }
    finally { setLoading(null) }
  }

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="font-bold text-gray-900 text-sm">#{order._id?.slice(-8).toUpperCase()}</p>
            <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.createdAt)}</p>
          </div>
          <span className="badge font-semibold text-xs px-3 py-1 rounded-full" style={{ background: s.bg, color: s.color }}>
            {s.label}
          </span>
        </div>

        {/* Customer */}
        <div className="flex items-start gap-2 mb-3">
          <User size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-gray-800">{order.address?.name || order.user?.name || 'Customer'}</p>
            <p className="text-xs text-gray-400">{order.user?.email}</p>
          </div>
        </div>

        {/* Address */}
        {order.address && (
          <div className="flex items-start gap-2 mb-3">
            <MapPin size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-gray-500">{order.address.street}, {order.address.city}, {order.address.state} - {order.address.pincode}</p>
          </div>
        )}

        {/* Items */}
        <div className="flex items-start gap-2 mb-4">
          <Package size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            {(order.items || []).slice(0, 2).map((item, i) => (
              <p key={i} className="text-xs text-gray-600">{item.product?.name} × {item.quantity} — {formatCurrency(item.price * item.quantity)}</p>
            ))}
            {order.items?.length > 2 && <p className="text-xs text-gray-400">+{order.items.length - 2} more items</p>}
          </div>
        </div>

        {/* Total */}
        <div className="flex items-center justify-between mb-4 pt-3 border-t border-gray-100">
          <span className="text-sm text-gray-500">Total (incl. GST)</span>
          <span className="font-extrabold text-base" style={{ color: '#1A3263' }}>{formatCurrency(total)}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-2">
          {order.status === 'PENDING' && (
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
          {order.status === 'CONFIRMED' && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setInvoice({ orderId: 'VLO' + order._id, order, createdAt: order.createdAt })}
              className="flex-1 flex items-center justify-center gap-2 font-bold py-3 rounded-xl text-sm text-white shadow-md"
              style={{ background: 'linear-gradient(135deg,#1A3263,#547792)', boxShadow: '0 4px 12px rgba(26,50,99,0.25)' }}
            >
              <FileText size={16} /> View Invoice
            </motion.button>
          )}
          {order.status === 'CANCELLED' && (
            <div className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold bg-red-50 text-red-500 border border-red-100">
              <XCircle size={15} /> Order Rejected
            </div>
          )}
        </div>
      </motion.div>

      {invoice && <InvoicePreview invoice={invoice} onClose={() => setInvoice(null)} />}
    </>
  )
}
