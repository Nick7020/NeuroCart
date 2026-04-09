import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { useNotification } from '../../context/NotificationContext'
import { useRazorpay } from '../../hooks/useRazorpay'
import { orderService, paymentService } from '../../services'
import { formatCurrency } from '../../utils'
import { Spinner } from '../../components/ui/Spinner'
import { MapPin, CreditCard, Smartphone, Banknote } from 'lucide-react'

// Razorpay SVG logo icon
const RazorpayIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 20L9.5 4H14L11.5 12H16L8 20H4Z" fill="#072654" />
    <path d="M11.5 12L14 4H18.5L16 12H11.5Z" fill="#3395FF" />
  </svg>
)

const PAYMENT_METHODS = [
  { id: 'card',     label: 'Credit / Debit Card', icon: <CreditCard size={18} /> },
  { id: 'upi',      label: 'UPI',                 icon: <Smartphone size={18} /> },
  { id: 'cod',      label: 'Cash on Delivery',    icon: <Banknote size={18} /> },
  { id: 'razorpay', label: 'Pay with Razorpay',   icon: <RazorpayIcon /> },
]

export function Checkout() {
  const { items, total, clearCart } = useCart()
  const { user } = useAuth()
  const { notify } = useNotification()
  const navigate = useNavigate()
  const { openCheckout } = useRazorpay()
  const [loading, setLoading] = useState(false)
  const [payMethod, setPayMethod] = useState('card')
  const [address, setAddress] = useState({ name: '', phone: '', street: '', city: '', state: '', pincode: '' })

  const tax = total * 0.18
  const grandTotal = total + tax
  const set = (k) => (e) => setAddress({ ...address, [k]: e.target.value })

  const handleOrder = async (e) => {
    e.preventDefault()
    setLoading(true)

    if (payMethod === 'razorpay') {
      try {
        // Step 1: Create NeuroCart order
        const { data: orderData } = await orderService.create({ address, paymentMethod: payMethod, items })
        const orderId = orderData.order?._id || orderData.order?.id || orderData.id

        // Step 2: Create Razorpay order on backend
        const { data: rzpData } = await paymentService.createRazorpayOrder(orderId)
        const { razorpay_order_id, amount, key_id } = rzpData

        // Step 3: Open Razorpay checkout modal
        await openCheckout({
          key: key_id,
          amount,
          currency: 'INR',
          order_id: razorpay_order_id,
          name: 'NeuroCart',
          prefill: {
            name: user?.name || address.name || '',
            email: user?.email || '',
            contact: user?.phone || address.phone || '',
          },
          handler: async (response) => {
            try {
              await paymentService.verifyRazorpayPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              })
              await clearCart()
              notify('Payment successful! Order confirmed 🎉', 'success')
              navigate(`/orders/${orderId}`)
            } catch (err) {
              notify(err?.response?.data?.message || 'Payment verification failed', 'error')
              setLoading(false)
            }
          },
          modal: {
            ondismiss: () => {
              notify('Payment cancelled', 'info')
              setLoading(false)
            },
          },
          onPaymentFailed: (response) => {
            notify(response?.error?.description || 'Payment failed', 'error')
            setLoading(false)
          },
        })
      } catch (err) {
        notify(err?.response?.data?.message || 'Could not initiate payment', 'error')
        setLoading(false)
      }
      return
    }

    // Non-Razorpay flow
    try {
      const { data } = await orderService.create({ address, paymentMethod: payMethod, items })
      await clearCart()
      notify('Order placed successfully! 🎉', 'success')
      navigate(`/orders/${data.order._id}`)
    } catch (err) {
      notify(err?.response?.data?.message || 'Order failed', 'error')
    } finally { setLoading(false) }
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900 mb-8">Checkout</h1>
      <form onSubmit={handleOrder} className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">

          {/* Address */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <MapPin size={18} style={{ color: '#1A3263' }} />
              <h2 className="font-bold text-gray-900">Delivery Address</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { k: 'name',    label: 'Full Name',       placeholder: 'John Doe' },
                { k: 'phone',   label: 'Phone',           placeholder: '+91 9876543210' },
                { k: 'street',  label: 'Street Address',  placeholder: '123 Main St', full: true },
                { k: 'city',    label: 'City',            placeholder: 'Mumbai' },
                { k: 'state',   label: 'State',           placeholder: 'Maharashtra' },
                { k: 'pincode', label: 'Pincode',         placeholder: '400001' },
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
              <CreditCard size={18} style={{ color: '#1A3263' }} />
              <h2 className="font-bold text-gray-900">Payment Method</h2>
            </div>
            <div className="space-y-3">
              {PAYMENT_METHODS.map(m => (
                <label key={m.id} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${payMethod === m.id ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:border-gray-200 bg-white'}`}>
                  <input type="radio" name="payment" value={m.id} checked={payMethod === m.id} onChange={() => setPayMethod(m.id)} className="accent-blue-600" />
                  <span style={{ color: '#1A3263' }}>{m.icon}</span>
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
              <span style={{ color: '#1A3263' }}>{formatCurrency(grandTotal)}</span>
            </div>
          </div>
          <button type="submit" disabled={loading || !items.length} className="btn-primary w-full mt-6 py-3 text-base">
            {loading ? <Spinner size="sm" /> : `Place Order ${formatCurrency(grandTotal)}`}
          </button>
        </div>
      </form>
    </div>
  )
}
