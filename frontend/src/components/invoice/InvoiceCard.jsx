import { FileText, Download, Eye, Calendar, DollarSign, User, Package } from 'lucide-react'
import { motion } from 'framer-motion'

export function InvoiceCard({ invoice, onView, onDownload }) {
  const formatCurrency = (amount) => `$${amount.toFixed(2)}`

  const STATUS_STYLES = {
    generated: { bg: '#f0fdf4', color: '#16a34a', text: 'Generated' },
    sent: { bg: '#dbeafe', color: '#2563eb', text: 'Sent' },
    paid: { bg: '#f0fdf4', color: '#16a34a', text: 'Paid' },
    cancelled: { bg: '#fef2f2', color: '#dc2626', text: 'Cancelled' },
  }

  const statusStyle = STATUS_STYLES[invoice.status] || STATUS_STYLES.generated

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
              <FileText size={20} className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">{invoice.invoice_number}</h3>
              <p className="text-sm text-gray-500">{invoice.product_name}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="px-3 py-1 rounded-full text-xs font-semibold mb-2"
              style={{ background: statusStyle.bg, color: statusStyle.color }}>
              {statusStyle.text}
            </div>
            <div className="text-lg font-bold text-gray-900">
              {formatCurrency(invoice.total_amount)}
            </div>
          </div>
        </div>

        {/* Customer/Vendor Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <User size={14} />
            <span>{invoice.customer_name || invoice.vendor_name}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar size={14} />
            <span>{new Date(invoice.generated_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Invoice Details */}
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500">Quantity</p>
            <p className="font-semibold text-gray-900">{invoice.quantity}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Unit Price</p>
            <p className="font-semibold text-gray-900 flex items-center gap-1">
              <DollarSign size={14} />
              {invoice.unit_price}
            </p>
          </div>
        </div>

        <div className="border-t border-gray-50 pt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Subtotal</span>
            <span className="font-semibold">{formatCurrency(invoice.subtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Tax</span>
            <span className="font-semibold">{formatCurrency(invoice.tax_amount)}</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <span className="font-semibold text-gray-900">Total</span>
            <span className="font-bold text-lg text-gray-900">{formatCurrency(invoice.total_amount)}</span>
          </div>
        </div>

        {invoice.due_date && (
          <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-100">
            <div className="flex items-center gap-2 text-sm text-amber-700">
              <Calendar size={14} />
              <span>Due Date: {new Date(invoice.due_date).toLocaleDateString()}</span>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-6 pb-6">
        <div className="flex gap-2">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => onView(invoice)}
            className="flex-1 flex items-center justify-center gap-2 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-md"
            style={{ background: 'linear-gradient(135deg,#1A3263,#547792)', boxShadow: '0 4px 12px rgba(26,50,99,0.3)' }}
          >
            <Eye size={16} /> View Invoice
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => onDownload(invoice)}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 font-bold py-3 rounded-xl text-sm transition-all hover:bg-gray-200 shadow-md"
          >
            <Download size={16} /> Download
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}