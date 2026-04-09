import { X, FileText, Calendar, DollarSign, User, Package, Download } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function InvoiceModal({ invoice, isOpen, onClose, onDownload }) {
  if (!invoice) return null

  const formatCurrency = (amount) => `$${amount.toFixed(2)}`

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText size={24} />
                  <div>
                    <h2 className="text-xl font-bold">{invoice.invoice_number}</h2>
                    <p className="text-blue-100">Invoice Details</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {/* Invoice Info */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Invoice Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <FileText size={14} className="text-gray-500" />
                      <span className="font-medium">{invoice.invoice_number}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-gray-500" />
                      <span>Generated: {new Date(invoice.generated_at).toLocaleDateString()}</span>
                    </div>
                    {invoice.due_date && (
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-500" />
                        <span>Due: {new Date(invoice.due_date).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Parties</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-gray-500" />
                      <span>Customer: {invoice.customer_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package size={14} className="text-gray-500" />
                      <span>Vendor: {invoice.vendor_name}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Details */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Product Details</h3>
                <div className="flex items-center gap-4 mb-3">
                  {invoice.product_image && (
                    <img
                      src={invoice.product_image}
                      alt={invoice.product_name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  )}
                  <div>
                    <h4 className="font-medium text-gray-900">{invoice.product_name}</h4>
                    <p className="text-sm text-gray-500">Quantity: {invoice.quantity}</p>
                  </div>
                </div>
              </div>

              {/* Billing Details */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Billing Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Unit Price</span>
                    <span className="font-medium">{formatCurrency(invoice.unit_price)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Quantity</span>
                    <span className="font-medium">{invoice.quantity}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-gray-100 pt-2">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Tax (18% GST)</span>
                    <span className="font-medium">{formatCurrency(invoice.tax_amount)}</span>
                  </div>
                  <div className="flex items-center justify-between border-t-2 border-gray-300 pt-2">
                    <span className="font-bold text-gray-900">Total Amount</span>
                    <span className="font-bold text-xl text-gray-900">{formatCurrency(invoice.total_amount)}</span>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="mt-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-blue-900">Status</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                    invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                    invoice.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-6 bg-gray-50">
              <div className="flex gap-3">
                <button
                  onClick={() => onDownload(invoice)}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <Download size={16} /> Download PDF
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}