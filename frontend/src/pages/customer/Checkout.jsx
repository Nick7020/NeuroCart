import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useNotification } from '../../context/NotificationContext'
import { orderService } from '../../services'
import { formatCurrency } from '../../utils'
import { Spinner } from '../../components/ui/Spinner'

const PAYMENT_METHODS = [
  { id: 'card', label: 'Credit / Debit Card', icon: '💳' },
  { id: 'upi', label: 'UPI', icon: '📱' },
  { id: 'cod', label: 'Cash on Delivery', icon: '💵' },
]

export function Checkout() {
  const { items, total, clearCart } = useCart()
  const { notify } = useNotification()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [payMethod, setPayMethod] = useState('card')
  const [address, setAddress] = useState({ name: '', phone: '', street: '', city: '', state: '', pincode: '' })

  const tax = total * 0.18
  const grandTotal = total + tax

  const set = (k) => (e) => setAddress({ ...address, [k]: e.target.value })

  const handleOrder = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await orderService.create({ address, paymentMethod: payMethod, items })
      await clearCart()
      notify('Order placed successfully! 🎉', 'success')
      navigate(`/orders/${data.order._id}`)
    } catch (err) {
      notify(err.response?.data?.message || 'Order failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Checkout</h1>

      <form onSubmit={handleOrder} className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Address */}
          <div className="card p-6">
            <h2 className="font-bold text-lg mb-5">📍 Delivery Address</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { k: 'name', label: 'Full Name', placeholder: 'John Doe' },
                { k: 'phone', label: 'Phone', placeholder: '+91 9876543210' },
                { k: 'street', label: 'Street Address', placeholder: '123 Main St', full: true },
                { k: 'city', label: 'City', placeholder: 'Mumbai' },
                { k: 'state', label: 'State', placeholder: 'Maharashtra' },
                { k: 'pincode', label: 'Pincode', placeholder: '400001' },
              ].map(({ k, label, placeholder, full }) => (
                <div key={k} className={full ? 'sm:col-span-2' : ''}>
                  <label className="block text-sm font-medium mb-2">{label}</label>
                  <input required value={address[k]} onChange={set(k)} placeholder={placeholder} className="input" />
                </div>
              ))}
            </div>
          </div>

          {/* Payment */}
          <div className="card p-6">
            <h2 className="font-bold text-lg mb-5">💳 Payment Method</h2>
            <div className="space-y-3">
              {PAYMENT_METHODS.map((m) => (
                <label key={m.id} className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${payMethod === m.id ? 'border-indigo-500 bg-indigo-500/10' : 'border-gray-700 hover:border-gray-600'}`}>
                  <input type="radio" name="payment" value={m.id} checked={payMethod === m.id} onChange={() => setPayMethod(m.id)} className="accent-indigo-500" />
                  <span className="text-xl">{m.icon}</span>
                  <span className="font-medium">{m.label}</span>
                </label>
              ))}
            </div>

            {payMethod === 'card' && (
              <div className="mt-4 space-y-3">
                <input className="input" placeholder="Card Number" maxLength={19} />
                <div className="grid grid-cols-2 gap-3">
                  <input className="input" placeholder="MM/YY" />
                  <input className="input" placeholder="CVV" maxLength={3} />
                </div>
              </div>
            )}
            {payMethod === 'upi' && (
              <input className="input mt-4" placeholder="UPI ID (e.g. name@upi)" />
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="card p-6 h-fit sticky top-24">
          <h2 className="font-bold text-lg mb-5">Order Summary</h2>
          <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
            {items.map((item) => (
              <div key={item._id} className="flex justify-between text-sm text-gray-400">
                <span className="truncate mr-2">{item.product?.name} × {item.quantity}</span>
                <span className="flex-shrink-0">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <hr className="border-gray-700 mb-4" />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-400"><span>Subtotal</span><span>{formatCurrency(total)}</span></div>
            <div className="flex justify-between text-gray-400"><span>GST (18%)</span><span>{formatCurrency(tax)}</span></div>
            <div className="flex justify-between text-gray-400"><span>Shipping</span><span className="text-green-400">Free</span></div>
            <hr className="border-gray-700" />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-indigo-400">{formatCurrency(grandTotal)}</span>
            </div>
          </div>
          <button type="submit" disabled={loading || !items.length} className="btn-primary w-full mt-6 flex items-center justify-center gap-2">
            {loading ? <Spinner size="sm" /> : `Place Order ${formatCurrency(grandTotal)}`}
          </button>
        </div>
      </form>
    </div>
  )
}
