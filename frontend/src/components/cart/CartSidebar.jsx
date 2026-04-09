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
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 h-full w-full max-w-sm bg-gray-950 border-l border-gray-800 z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <ShoppingBag size={20} className="text-indigo-400" />
                <h2 className="font-bold text-lg">Your Cart</h2>
                {items.length > 0 && (
                  <span className="bg-indigo-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {items.length}
                  </span>
                )}
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-xl transition-colors text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {!items.length ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-16">
                  <div className="text-6xl mb-4">🛒</div>
                  <p className="font-semibold text-gray-300">Cart is empty</p>
                  <p className="text-sm text-gray-500 mt-1">Add some products!</p>
                  <button onClick={onClose} className="mt-4 btn-primary text-sm">Browse Products</button>
                </div>
              ) : (
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20, height: 0 }}
                      className="flex gap-3 bg-gray-900 border border-gray-800 rounded-2xl p-3"
                    >
                      <img
                        src={item.product?.images?.[0] || 'https://placehold.co/60x60/1e1b4b/818cf8?text=P'}
                        alt={item.product?.name}
                        className="w-16 h-16 rounded-xl object-cover bg-gray-800 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{item.product?.name}</p>
                        <p className="text-indigo-400 text-sm font-bold mt-0.5">{formatCurrency(item.price)}</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-0.5">
                            <button
                              onClick={() => updateItem(item._id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="w-6 h-6 flex items-center justify-center hover:bg-gray-700 rounded-md transition-colors disabled:opacity-40"
                            >
                              <Minus size={11} />
                            </button>
                            <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                            <button
                              onClick={() => updateItem(item._id, item.quantity + 1)}
                              className="w-6 h-6 flex items-center justify-center hover:bg-gray-700 rounded-md transition-colors"
                            >
                              <Plus size={11} />
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item._id)}
                            className="text-gray-500 hover:text-red-400 transition-colors p-1"
                          >
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
              <div className="border-t border-gray-800 px-5 py-4 space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-400">
                    <span>Subtotal</span><span>{formatCurrency(total)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>GST (18%)</span><span>{formatCurrency(tax)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Shipping</span><span className="text-green-400">Free</span>
                  </div>
                  <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-800">
                    <span>Total</span>
                    <span className="text-indigo-400">{formatCurrency(grandTotal)}</span>
                  </div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { onClose(); navigate('/checkout') }}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
                >
                  Checkout <ArrowRight size={16} />
                </motion.button>
                <button onClick={onClose} className="w-full text-center text-sm text-gray-400 hover:text-white transition-colors py-1">
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
