import { useAuth } from '../../context/AuthContext'
import { Package, ShoppingBag, IndianRupee, AlertCircle } from 'lucide-react'
import { MOCK_PRODUCTS, MOCK_ORDERS } from '../../utils/mockData'

const kpis = [
  { label: 'My Products', value: 4, icon: <Package size={20} />, color: '#7c3aed' },
  { label: 'My Orders',   value: 12, icon: <ShoppingBag size={20} />, color: '#0ea5e9' },
  { label: 'Revenue',     value: '₹48,200', icon: <IndianRupee size={20} />, color: '#16a34a' },
  { label: 'Pending',     value: 3, icon: <AlertCircle size={20} />, color: '#f59e0b' },
]

export function VendorDashboard() {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Welcome, {user?.name}</h1>
        <p className="text-gray-400 text-sm mt-1">{user?.storeName || 'Your Store'} — Vendor Dashboard</p>
      </div>

      {!user?.isApproved && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-center gap-3">
          <AlertCircle size={18} className="text-yellow-500 flex-shrink-0" />
          <p className="text-sm text-yellow-700 font-medium">Your vendor account is pending admin approval. You can browse but cannot list products yet.</p>
        </div>
      )}

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map(k => (
          <div key={k.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white flex-shrink-0" style={{ background: k.color }}>
              {k.icon}
            </div>
            <div>
              <p className="text-2xl font-extrabold text-gray-900">{k.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{k.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <h2 className="font-bold text-gray-800 mb-4">Recent Orders</h2>
        <div className="space-y-3">
          {MOCK_ORDERS.slice(0, 3).map(o => (
            <div key={o._id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
              <div>
                <p className="text-sm font-semibold text-gray-800">#{o._id.slice(-6).toUpperCase()}</p>
                <p className="text-xs text-gray-400">{o.items.length} item(s)</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-800">₹{o.totalAmount.toLocaleString()}</p>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  o.status === 'DELIVERED' ? 'bg-green-50 text-green-600' :
                  o.status === 'SHIPPED'   ? 'bg-blue-50 text-blue-600' :
                  'bg-yellow-50 text-yellow-600'
                }`}>{o.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
