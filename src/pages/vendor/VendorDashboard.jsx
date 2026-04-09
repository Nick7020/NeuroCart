import { useFetch } from '../../hooks/useFetch'
import { vendorService } from '../../services'
import { useAuth } from '../../context/AuthContext'
import { Spinner } from '../../components/ui/Spinner'
import { formatCurrency } from '../../utils'
import { ShoppingBag, TrendingUp, DollarSign, Clock } from 'lucide-react'

export function VendorDashboard() {
  const { user } = useAuth()
  const { data, loading } = useFetch(() => vendorService.dashboard(), [])

  const shopName      = data?.shop_name      ?? ''
  const totalRevenue  = data?.total_revenue  ?? 0
  const orderCount    = data?.order_count    ?? 0
  const pendingOrders = data?.pending_orders ?? 0
  const topProducts   = data?.top_products   ?? []

  const kpis = [
    { label: 'Total Revenue',   value: formatCurrency(totalRevenue), icon: <DollarSign size={20} />,  bg: '#f5f3ff', color: '#7c3aed' },
    { label: 'Total Orders',    value: orderCount,                   icon: <ShoppingBag size={20} />, bg: '#eff6ff', color: '#2563eb' },
    { label: 'Pending Orders',  value: pendingOrders,                icon: <Clock size={20} />,       bg: '#fffbeb', color: '#d97706' },
    { label: 'Top Products',    value: topProducts.length,           icon: <TrendingUp size={20} />,  bg: '#f0fdf4', color: '#16a34a' },
  ]

  // Show pending approval banner if vendor is not yet approved
  if (!loading && user?.isApproved === false) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-16 h-16 rounded-full bg-yellow-50 flex items-center justify-center">
          <Clock size={32} className="text-yellow-500" />
        </div>
        <h2 className="text-xl font-extrabold text-gray-900">Awaiting Approval</h2>
        <p className="text-gray-400 text-sm text-center max-w-sm">
          Your vendor account is pending admin review. You'll be able to list products and manage orders once approved.
        </p>
      </div>
    )
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">{shopName || 'Vendor Dashboard'}</h1>
        <p className="text-gray-400 text-sm mt-1">Overview of your store performance</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ label, value, icon, bg, color }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{label}</p>
                <p className="text-2xl font-extrabold text-gray-900 mt-1">{value}</p>
              </div>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: bg, color }}>
                {icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-bold text-gray-800 mb-4">Top Products by Revenue</h2>
        {!topProducts.length ? (
          <p className="text-gray-400 text-sm text-center py-8">No sales data yet</p>
        ) : (
          <div className="space-y-3">
            {topProducts.map((p, i) => (
              <div key={p.product__id || i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <p className="font-semibold text-gray-800 text-sm">{p.product__name}</p>
                </div>
                <span className="font-bold text-sm" style={{ color: '#1A3263' }}>{formatCurrency(p.revenue)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
