import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight, Package } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useNavigate } from 'react-router-dom'
import { formatCurrency } from '../../utils'

export function CartSidebar({ open, onClose }) {
  const { items, total, updateItem, removeItem } = useCart()
  const navigate = useNavigate()
  const tax = total * 0.18
  const grandTotal = total + tax

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(10,12,20,0.35)', backdropFilter: 'blur(4px)' }}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed right-0 top-0 h-full w-full max-w-sm z-50 flex flex-col"
            style={{
              background: '#ffffff',
              borderLeft: '1px solid rgba(0,0,0,0.07)',
              boxShadow: '-8px 0 40px rgba(0,0,0,0.12)',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4 flex-shrink-0"
              style={{ borderBottom: '1px solid rgba(0,0,0,0.07)' }}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(26,47,107,0.08)' }}>
                  <ShoppingBag size={16} style={{ color: '#1a2f6b' }} />
                </div>
                <h2 className="font-bold text-base" style={{ color: '#0f0f0f' }}>Your Cart</h2>
                {items.length > 0 && (
                  <span
                    className="w-5 h-5 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg,#1a2f6b,#2d4fa0)' }}
                  >
                    {items.length}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-xl transition-all"
                style={{ background: 'rgba(0,0,0,0.05)', color: '#6b7280' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.09)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
              >
                <X size={15} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5">
              {!items.length ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-16">
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5"
                    style={{ background: 'rgba(26,47,107,0.06)' }}
                  >
                    <Package size={32} style={{ color: '#1a2f6b', opacity: 0.5 }} />
                  </div>
                  <p className="font-semibold text-gray-800 mb-1">Your cart is empty</p>
                  <p className="text-sm text-gray-400 mb-5">Add some products to get started</p>
                  <button onClick={onClose} className="btn-primary text-sm">Browse Products</button>
                </div>
              ) : (
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -16, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex gap-3 rounded-2xl p-3"
                      style={{ background: '#f8fafc', border: '1px solid rgba(15,23,42,0.06)' }}
                    >
                      <img
                        src={item.product?.images?.[0] || 'https://placehold.co/64x64/f0f4ff/1a2f6b?text=P'}
                        alt={item.product?.name}
                        className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                        style={{ border: '1px solid rgba(0,0,0,0.06)' }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate leading-snug">{item.product?.name}</p>
                        <p className="text-sm font-bold mt-0.5" style={{ color: '#1a2f6b' }}>{formatCurrency(item.price)}</p>
                        <div className="flex items-center justify-between mt-2.5">
                          {/* Qty stepper */}
                          <div
                            className="flex items-center gap-0.5 rounded-lg p-0.5"
                            style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.1)' }}
                          >
                            <button
                              onClick={() => updateItem(item._id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="w-6 h-6 flex items-center justify-center rounded-md transition-all disabled:opacity-30 text-gray-500 hover:bg-gray-100"
                            >
                              <Minus size={10} />
                            </button>
                            <span className="w-6 text-center text-xs font-bold text-gray-800">{item.quantity}</span>
                            <button
                              onClick={() => updateItem(item._id, item.quantity + 1)}
                              className="w-6 h-6 flex items-center justify-center rounded-md transition-all text-gray-500 hover:bg-gray-100"
                            >
                              <Plus size={10} />
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item._id)}
                            className="p-1.5 rounded-lg transition-all text-gray-300 hover:text-red-400 hover:bg-red-50"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Summary + Checkout */}
            {items.length > 0 && (
              <div
                className="flex-shrink-0 px-5 py-4 space-y-3"
                style={{ borderTop: '1px solid rgba(15,23,42,0.07)', background: '#f8fafc' }}
              >
                <div className="space-y-2">
                  {[
                    { label: 'Subtotal', value: formatCurrency(total), muted: true },
                    { label: 'GST (18%)', value: formatCurrency(tax), muted: true },
                    { label: 'Shipping', value: 'Free', green: true },
                  ].map(({ label, value, muted, green }) => (
                    <div key={label} className="flex justify-between text-sm">
                      <span style={{ color: '#9898a8' }}>{label}</span>
                      <span className={`font-medium ${green ? 'text-green-600' : 'text-gray-800'}`}>{value}</span>
                    </div>
                  ))}
                  <div
                    className="flex justify-between font-bold text-base pt-2.5"
                    style={{ borderTop: '1px solid rgba(0,0,0,0.07)' }}
                  >
                    <span style={{ color: '#0f0f0f' }}>Total</span>
                    <span style={{ color: '#1a2f6b' }}>{formatCurrency(grandTotal)}</span>
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { onClose(); navigate('/checkout') }}
                  className="btn-primary w-full py-3.5 text-sm"
                >
                  Proceed to Checkout <ArrowRight size={15} />
                </motion.button>

                <button
                  onClick={onClose}
                  className="w-full text-center text-sm py-1 transition-colors"
                  style={{ color: '#9898a8' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#5a5a6e'}
                  onMouseLeave={e => e.currentTarget.style.color = '#9898a8'}
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
