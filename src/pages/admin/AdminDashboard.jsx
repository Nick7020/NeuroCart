import { useFetch } from '../../hooks/useFetch'
import { analyticsService } from '../../services'
import { KpiCard } from '../../components/ui/KpiCard'
import { Spinner } from '../../components/ui/Spinner'
import { formatCurrency } from '../../utils'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'
import { TrendingUp, Store, ShoppingBag, CheckCircle, XCircle } from 'lucide-react'

const PIE_COLORS = ['#1A3263', '#547792', '#FFC570', '#93c5fd', '#6ee7b7']

export function AdminDashboard() {
  const { data, loading } = useFetch(() => analyticsService.dashboard(), [])
  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  const kpis        = data?.kpis        || {}
  const salesTrend  = data?.salesTrend  || []
  const orderStatus = data?.orderStatus || []
  const vendorStats = data?.vendorStats || []
  const vendorRevenue = data?.vendorRevenue || 0
  const vendorOrders  = data?.vendorOrders  || 0
  const totalVendors  = data?.totalVendors  || 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Complete overview of NeuroCart platform</p>
      </div>

      {/* Platform KPIs */}
      <div>
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Platform Overview</h2>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <KpiCard label="Total Revenue"  value={formatCurrency(kpis.revenue || 0)} icon="💰" trend={kpis.revenueTrend}    color="blue"   />
          <KpiCard label="Total Orders"   value={kpis.orders || 0}                  icon="🛍️" trend={kpis.ordersTrend}     color="purple" />
          <KpiCard label="Customers"      value={kpis.customers || 0}               icon="👥" trend={kpis.customersTrend}  color="green"  />
          <KpiCard label="Products"       value={kpis.products || 0}                icon="📦" trend={null}                 color="orange" />
        </div>
      </div>

      {/* Vendor KPIs */}
      <div>
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Vendor Overview</h2>
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
          <KpiCard label="Vendor Revenue" value={formatCurrency(vendorRevenue)} icon="🏪" trend={8.2}  color="blue"   />
          <KpiCard label="Vendor Orders"  value={vendorOrders}                  icon="📋" trend={12.5} color="purple" />
          <KpiCard label="Active Vendors" value={totalVendors}                  icon="🤝" trend={null} color="green"  />
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm lg:col-span-2">
          <h2 className="font-bold text-gray-800 mb-5">Sales Trend</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={salesTrend}>
              <defs>
                <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#1A3263" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#1A3263" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" stroke="#9ca3af" tick={{ fontSize: 11 }} />
              <YAxis stroke="#9ca3af" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12 }} />
              <Area type="monotone" dataKey="revenue" stroke="#1A3263" fill="url(#sg)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h2 className="font-bold text-gray-800 mb-5">Order Status</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={orderStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={75}
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}>
                {orderStatus.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Vendor Performance Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#eff6ff' }}>
            <Store size={16} style={{ color: '#1A3263' }} />
          </div>
          <h2 className="font-bold text-gray-800">Vendor Performance</h2>
          <span className="ml-auto text-xs text-gray-400 font-medium">{vendorStats.length} vendors</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Vendor', 'Total Orders', 'Accepted', 'Rejected', 'Revenue', 'Performance'].map(h => (
                  <th key={h} className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {vendorStats.map((v, i) => {
                const acceptRate = Math.round((v.accepted / v.orders) * 100)
                return (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white"
                          style={{ background: 'linear-gradient(135deg,#1A3263,#547792)' }}>
                          {v.vendorName[0]}
                        </div>
                        <span className="font-semibold text-gray-800">{v.vendorName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <ShoppingBag size={13} className="text-gray-400" />
                        <span className="font-semibold text-gray-700">{v.orders}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle size={13} className="text-green-500" />
                        <span className="font-semibold text-green-600">{v.accepted}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <XCircle size={13} className="text-red-400" />
                        <span className="font-semibold text-red-500">{v.rejected}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-bold" style={{ color: '#1A3263' }}>
                      {formatCurrency(v.revenue)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-2 w-24">
                          <div className="h-2 rounded-full transition-all"
                            style={{ width: `${acceptRate}%`, background: acceptRate >= 80 ? '#16a34a' : acceptRate >= 60 ? '#d97706' : '#dc2626' }} />
                        </div>
                        <span className="text-xs font-bold" style={{ color: acceptRate >= 80 ? '#16a34a' : acceptRate >= 60 ? '#d97706' : '#dc2626' }}>
                          {acceptRate}%
                        </span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Vendor Revenue Bar Chart */}
        <div className="px-6 py-5 border-t border-gray-100">
          <h3 className="font-bold text-gray-700 mb-4 text-sm">Revenue by Vendor</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={vendorStats} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
              <XAxis type="number" stroke="#9ca3af" tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
              <YAxis type="category" dataKey="vendorName" stroke="#9ca3af" tick={{ fontSize: 11 }} width={110} />
              <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12 }}
                formatter={v => formatCurrency(v)} />
              <Bar dataKey="revenue" fill="#1A3263" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Orders Per Day */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <h2 className="font-bold text-gray-800 mb-5">Orders Per Day</h2>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={salesTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="date" stroke="#9ca3af" tick={{ fontSize: 11 }} />
            <YAxis stroke="#9ca3af" tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12 }} />
            <Bar dataKey="orders" fill="#547792" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
