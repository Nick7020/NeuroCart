import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useNotification } from '../../context/NotificationContext'
import { formatCurrency } from '../../utils'
import { EmptyState } from '../../components/ui/EmptyState'
import { Spinner } from '../../components/ui/Spinner'
import { Trash2, Plus, Minus } from 'lucide-react'

export function Cart() {
  const { items, loading, total, updateItem, removeItem } = useCart()
  const { notify } = useNotification()
  const navigate = useNavigate()
  const tax = total * 0.18
  const grandTotal = total + tax

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>
  if (!items.length) return (
    <EmptyState icon="🛒" title="Your cart is empty" description="Add some products to get started"
      action={<Link to="/" className="btn-primary">Browse Products</Link>} />
  )

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900 mb-8">Shopping Cart</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <div key={item.id} className="bg-white border border-gray-100 rounded-2xl p-4 flex gap-4 shadow-sm">
              <img src={item.product?.images?.[0] || 'https://placehold.co/80x80/f0f4ff/1A3263?text=P'}
                alt={item.product?.name} className="w-20 h-20 rounded-xl object-cover bg-gray-50 flex-shrink-0 border border-gray-100" />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 truncate">{item.product?.name}</h3>
                <p className="font-bold mt-1" style={{ color: '#1A3263' }}>{formatCurrency(item.price)}</p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl p-1">
                    <button onClick={() => updateItem(item.id, item.quantity - 1)} disabled={item.quantity <= 1}
                      className="w-7 h-7 flex items-center justify-center hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-40 text-gray-600">
                      <Minus size={12} />
                    </button>
                    <span className="w-6 text-center text-sm font-bold text-gray-800">{item.quantity}</span>
                    <button onClick={() => updateItem(item.id, item.quantity + 1)}
                      className="w-7 h-7 flex items-center justify-center hover:bg-gray-200 rounded-lg transition-colors text-gray-600">
                      <Plus size={12} />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-900">{formatCurrency(item.price * item.quantity)}</span>
                    <button onClick={async () => { await removeItem(item.id); notify('Removed', 'info') }}
                      className="p-1.5 text-gray-300 hover:text-red-400 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-6 h-fit sticky top-24 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-5">Order Summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-gray-500"><span>Subtotal ({items.length} items)</span><span>{formatCurrency(total)}</span></div>
            <div className="flex justify-between text-gray-500"><span>Tax (18% GST)</span><span>{formatCurrency(tax)}</span></div>
            <div className="flex justify-between text-gray-500"><span>Shipping</span><span className="text-green-600 font-medium">Free</span></div>
            <hr className="border-gray-100" />
            <div className="flex justify-between text-lg font-extrabold text-gray-900">
              <span>Total</span><span style={{ color: '#1A3263' }}>{formatCurrency(grandTotal)}</span>
            </div>
          </div>
          <button onClick={() => navigate('/checkout')} className="btn-primary w-full mt-6 py-3 text-base">
            Proceed to Checkout →
          </button>
        </div>
      </div>
    </div>
  )
}
