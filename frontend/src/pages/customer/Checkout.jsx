import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useNotification } from '../../context/NotificationContext'
import { orderService } from '../../services'
import { formatCurrency, formatDate } from '../../utils'
import { Spinner } from '../../components/ui/Spinner'
import { MapPin, CreditCard, Smartphone, Banknote, CheckCircle, Package, ArrowRight } from 'lucide-react'

const PAYMENT_METHODS = [
  { id: 'card', label: 'Credit / Debit Card', icon: <CreditCard size={18} /> },
  { id: 'upi',  label: 'UPI',                 icon: <Smartphone size={18} /> },
  { id: 'cod',  label: 'Cash on Delivery',    icon: <Banknote size={18} /> },
]

export function Checkout() {
  const { items, total, clearCart } = useCart()
  const { notify } = useNotification()
  const navigate = useNavigate()
  const [loading, setLoading]     = useState(false)
  const [payMethod, setPayMethod] = useState('cod')
  const [address, setAddress]     = useState({ name: '', phone: '', street: '', city: '', state: '', pincode: '' })
  const [placedOrder, setPlacedOrder] = useState(null)

  const tax        = total * 0.18
  const grandTotal = total + tax
  const set = (k) => (e) => setAddress({ ...address, [k]: e.target.value })

  const handleOrder = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await orderService.create({
        payment_method: payMethod,
        address,
        items: items.map(i => ({ product: i.productId || i.product?.id || i.product?._id, quantity: i.quantity, price: i.price })),
        total_amount: grandTotal,
      })
      // Save to mock order history
      const saved = JSON.parse(sessionStorage.getItem('mockOrders') || '[]')
      const newOrder = {
        id: data?.id || 'ord_' + Date.now(),
        _id: data?.id || 'ord_' + Date.now(),
        status: 'pending',
        created_at: new Date().toISOString(),
        total_amount: grandTotal,
        payment_method: payMethod,
        address,
        items: items.map(i => ({
          product: i.product,
          quantity: i.quantity,
          unit_price: i.price,
          price: i.price,
        })),
        item_count: items.length,
        ...data,
      }
      saved.unshift(newOrder)
      sessionStorage.setItem('mockOrders', JSON.stringify(saved))
      await clearCart()
      setPlacedOrder(newOrder)
      notify('Order placed successfully!', 'success')
    } catch (err) {
      notify(err?.response?.data?.message || 'Order failed', 'error')
    } finally { setLoading(false) }
  }

  // ── Order Success Screen ──────────────────────────────────────────────────
  if (placedOrder) {
    const orderId = (placedOrder.id || placedOrder._id)?.toString() || ''
    return (
      <div className="max-w-2xl mx-auto py-8">
        {/* Success header */}
        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm text-center mb-6">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: '#f0fdf4' }}>
            <CheckCircle size={36} className="text-green-500" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Order Placed!</h1>
          <p className="text-gray-400 text-sm">Order #{orderId.slice(-8).toUpperCase()}</p>
          <p className="text-gray-400 text-xs mt-1">{formatDate(placedOrder.created_at)}</p>
        </div>

        {/* Items */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm mb-4">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Package size={16} className="text-indigo-500" /> Items Ordered
          </h2>
          <div className="space-y-3">
            {placedOrder.items?.map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <img
                  src={item.product?.images?.[0] || `https://placehold.co/56x56/EEF2FF/4F46E5?text=P`}
                  alt={item.product?.name}
                  className="w-14 h-14 rounded-xl object-cover border border-gray-100 bg-gray-50"
                />
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 text-sm">{item.product?.name || '—'}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Qty: {item.quantity}</p>
                </div>
                <span className="font-bold text-gray-900 text-sm">
                  {formatCurrency((item.unit_price || item.price) * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <hr className="border-gray-100 my-4" />
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{formatCurrency(total)}</span></div>
            <div className="flex justify-between text-gray-500"><span>GST (18%)</span><span>{formatCurrency(tax)}</span></div>
            <div className="flex justify-between text-gray-500"><span>Shipping</span><span className="text-green-600 font-medium">Free</span></div>
            <div className="flex justify-between font-extrabold text-base text-gray-900 pt-2 border-t border-gray-100">
              <span>Total Paid</span>
              <span style={{ color: '#4F46E5' }}>{formatCurrency(grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm mb-4">
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <MapPin size={16} className="text-indigo-500" /> Delivery Address
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            <span className="font-semibold">{placedOrder.address?.name}</span><br />
            {placedOrder.address?.street}, {placedOrder.address?.city}<br />
            {placedOrder.address?.state} — {placedOrder.address?.pincode}<br />
            <span className="text-gray-400">Phone: {placedOrder.address?.phone}</span>
          </p>
        </div>

        {/* Payment */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm mb-6">
          <h2 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
            <CreditCard size={16} className="text-indigo-500" /> Payment
          </h2>
          <p className="text-sm text-gray-600 capitalize">
            {PAYMENT_METHODS.find(m => m.id === placedOrder.payment_method)?.label || placedOrder.payment_method}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link to="/orders" className="btn-primary flex-1 justify-center">
            View Order History <ArrowRight size={15} />
          </Link>
          <Link to="/" className="btn-secondary flex-1 justify-center">
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  // ── Checkout Form ─────────────────────────────────────────────────────────
  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900 mb-8">Checkout</h1>
      <form onSubmit={handleOrder} className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">

          {/* Address */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <MapPin size={18} style={{ color: '#4F46E5' }} />
              <h2 className="font-bold text-gray-900">Delivery Address</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { k: 'name',    label: 'Full Name',      placeholder: 'John Doe' },
                { k: 'phone',   label: 'Phone',          placeholder: '+91 9876543210' },
                { k: 'street',  label: 'Street Address', placeholder: '123 Main St', full: true },
                { k: 'city',    label: 'City',           placeholder: 'Mumbai' },
                { k: 'state',   label: 'State',          placeholder: 'Maharashtra' },
                { k: 'pincode', label: 'Pincode',        placeholder: '400001' },
              ].map(({ k, label, placeholder, full }) => (
                <div key={k} className={full ? 'sm:col-span-2' : ''}>
                  <label className="block text-sm font-semibold mb-1.5 text-gray-700">{label}</label>
                  <input required value={address[k]} onChange={set(k)} placeholder={placeholder} className="input" />
                </div>
              ))}
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <CreditCard size={18} style={{ color: '#4F46E5' }} />
              <h2 className="font-bold text-gray-900">Payment Method</h2>
            </div>
            <div className="space-y-3">
              {PAYMENT_METHODS.map(m => (
                <label key={m.id} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${payMethod === m.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-100 hover:border-gray-200'}`}>
                  <input type="radio" name="payment" value={m.id} checked={payMethod === m.id} onChange={() => setPayMethod(m.id)} className="accent-indigo-600" />
                  <span style={{ color: '#4F46E5' }}>{m.icon}</span>
                  <span className="font-semibold text-gray-700">{m.label}</span>
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
            {payMethod === 'upi' && <input className="input mt-4" placeholder="UPI ID (e.g. name@upi)" />}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 h-fit sticky top-24 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-5">Order Summary</h2>
          <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
            {items.map(item => {
              const price = item.product?.price ?? item.price ?? 0
              const name  = item.product?.name  ?? item.name  ?? '—'
              return (
                <div key={item.id ?? item._id} className="flex justify-between text-sm text-gray-500">
                  <span className="truncate mr-2">{name} × {item.quantity}</span>
                  <span className="flex-shrink-0">{formatCurrency(price * item.quantity)}</span>
                </div>
              )
            })}
          </div>
          <hr className="border-gray-100 mb-4" />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{formatCurrency(total)}</span></div>
            <div className="flex justify-between text-gray-500"><span>GST (18%)</span><span>{formatCurrency(tax)}</span></div>
            <div className="flex justify-between text-gray-500"><span>Shipping</span><span className="text-green-600 font-medium">Free</span></div>
            <hr className="border-gray-100" />
            <div className="flex justify-between font-extrabold text-lg text-gray-900">
              <span>Total</span>
              <span style={{ color: '#4F46E5' }}>{formatCurrency(grandTotal)}</span>
            </div>
          </div>
          <button type="submit" disabled={loading || !items.length} className="btn-primary w-full mt-6 py-3 text-base">
            {loading ? <Spinner size="sm" /> : `Place Order · ${formatCurrency(grandTotal)}`}
          </button>
        </div>
      </form>
    </div>
  )
}
