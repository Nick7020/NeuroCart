import { useFetch } from '../../hooks/useFetch'
import { vendorService } from '../../services'
import { Spinner } from '../../components/ui/Spinner'
import { formatCurrency } from '../../utils'
import { ShoppingBag, Package, Users, TrendingUp } from 'lucide-react'

export function VendorDashboard() {
  const { data, loading } = useFetch(() => vendorService.getOrders(), [])
  const orders = data?.orders || []

  const pending   = orders.filter(o => o.status === 'PENDING').length
  const accepted  = orders.filter(o => o.status === 'CONFIRMED').length
  const rejected  = orders.filter(o => o.status === 'CANCELLED').length
  const revenue   = orders.filter(o => o.status === 'CONFIRMED')
    .reduce((s, o) => s + (o.items || []).reduce((a, i) => a + i.price * i.quantity, 0) * 1.18, 0)

  const kpis = [
    { label: 'Total Orders',     value: orders.length, icon: <ShoppingBag size={20} />, bg: '#eff6ff', color: '#2563eb' },
    { label: 'Pending',          value: pending,        icon: <Package size={20} />,     bg: '#fffbeb', color: '#d97706' },
    { label: 'Accepted',         value: accepted,       icon: <TrendingUp size={20} />,  bg: '#f0fdf4', color: '#16a34a' },
    { label: 'Total Revenue',    value: formatCurrency(revenue), icon: <Users size={20} />, bg: '#f5f3ff', color: '#7c3aed' },
  ]

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Vendor Dashboard</h1>
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

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-bold text-gray-800 mb-4">Recent Orders</h2>
        {!orders.length ? (
          <p className="text-gray-400 text-sm text-center py-8">No orders yet</p>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 5).map(o => {
              const total = (o.items || []).reduce((s, i) => s + i.price * i.quantity, 0) * 1.18
              const statusStyle = {
                PENDING:   { bg: '#fffbeb', color: '#d97706' },
                CONFIRMED: { bg: '#f0fdf4', color: '#16a34a' },
                CANCELLED: { bg: '#fef2f2', color: '#dc2626' },
              }[o.status] || { bg: '#f3f4f6', color: '#6b7280' }

              return (
                <div key={o._id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">#{o._id?.slice(-8).toUpperCase()}</p>
                    <p className="text-xs text-gray-400">{o.address?.name} · {o.items?.length} item(s)</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm" style={{ color: '#1A3263' }}>{formatCurrency(total)}</span>
                    <span className="badge text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: statusStyle.bg, color: statusStyle.color }}>
                      {o.status}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
