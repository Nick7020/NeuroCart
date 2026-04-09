import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight } from 'lucide-react'
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" />

          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 h-full w-full max-w-sm bg-white z-50 flex flex-col shadow-2xl border-l border-gray-100">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <ShoppingBag size={20} style={{ color: '#1A3263' }} />
                <h2 className="font-bold text-lg text-gray-900">Your Cart</h2>
                {items.length > 0 && (
                  <span className="w-5 h-5 rounded-full text-xs font-bold text-white flex items-center justify-center" style={{ background: '#1A3263' }}>
                    {items.length}
                  </span>
                )}
              </div>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors text-gray-500">
                <X size={16} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {!items.length ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-16">
                  <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center text-4xl mb-4">🛒</div>
                  <p className="font-semibold text-gray-700">Cart is empty</p>
                  <p className="text-sm text-gray-400 mt-1">Add some products!</p>
                  <button onClick={onClose} className="btn-primary mt-4 text-sm">Browse Products</button>
                </div>
              ) : (
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div key={item._id}
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20, height: 0 }}
                      className="flex gap-3 bg-gray-50 border border-gray-100 rounded-2xl p-3">
                      <img src={item.product?.images?.[0] || 'https://placehold.co/60x60/f0f4ff/1A3263?text=P'}
                        alt={item.product?.name} className="w-16 h-16 rounded-xl object-cover bg-white flex-shrink-0 border border-gray-100" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{item.product?.name}</p>
                        <p className="text-sm font-bold mt-0.5" style={{ color: '#1A3263' }}>{formatCurrency(item.price)}</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-0.5">
                            <button onClick={() => updateItem(item._id, item.quantity - 1)} disabled={item.quantity <= 1}
                              className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded-md transition-colors disabled:opacity-40 text-gray-600">
                              <Minus size={11} />
                            </button>
                            <span className="w-6 text-center text-xs font-bold text-gray-800">{item.quantity}</span>
                            <button onClick={() => updateItem(item._id, item.quantity + 1)}
                              className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded-md transition-colors text-gray-600">
                              <Plus size={11} />
                            </button>
                          </div>
                          <button onClick={() => removeItem(item._id)} className="text-gray-300 hover:text-red-400 transition-colors p-1">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-gray-100 px-5 py-4 space-y-3 bg-gray-50">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-500"><span>Subtotal</span><span className="font-medium text-gray-800">{formatCurrency(total)}</span></div>
                  <div className="flex justify-between text-gray-500"><span>GST (18%)</span><span className="font-medium text-gray-800">{formatCurrency(tax)}</span></div>
                  <div className="flex justify-between text-gray-500"><span>Shipping</span><span className="font-medium text-green-600">Free</span></div>
                  <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-200">
                    <span className="text-gray-900">Total</span>
                    <span style={{ color: '#1A3263' }}>{formatCurrency(grandTotal)}</span>
                  </div>
                </div>
                <motion.button whileTap={{ scale: 0.97 }}
                  onClick={() => { onClose(); navigate('/checkout') }}
                  className="btn-primary w-full py-3.5 text-base">
                  Checkout <ArrowRight size={16} />
                </motion.button>
                <button onClick={onClose} className="w-full text-center text-sm text-gray-400 hover:text-gray-600 transition-colors py-1">
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
