import { useFetch } from '../../hooks/useFetch'
import { analyticsService } from '../../services'
import { KpiCard } from '../../components/ui/KpiCard'
import { Spinner } from '../../components/ui/Spinner'
import { formatCurrency } from '../../utils'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const PIE_COLORS = ['#1A3263', '#547792', '#FFC570', '#93c5fd', '#6ee7b7']

export function AdminDashboard() {
  const { data, loading } = useFetch(() => analyticsService.dashboard(), [])
  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  const kpis = data?.kpis || {}
  const salesTrend = data?.salesTrend || []
  const orderStatus = data?.orderStatus || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Welcome back! Here's what's happening.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard label="Total Revenue" value={formatCurrency(kpis.revenue || 0)} icon="💰" trend={kpis.revenueTrend} color="blue" />
        <KpiCard label="Total Orders"  value={kpis.orders || 0}    icon="🛍️" trend={kpis.ordersTrend}    color="purple" />
        <KpiCard label="Customers"     value={kpis.customers || 0} icon="👥" trend={kpis.customersTrend} color="green" />
        <KpiCard label="Products"      value={kpis.products || 0}  icon="📦" trend={null}                color="orange" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm lg:col-span-2">
          <h2 className="font-bold text-gray-800 mb-5">Sales Trend</h2>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={salesTrend}>
              <defs>
                <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#1A3263" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#1A3263" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" stroke="#9ca3af" tick={{ fontSize: 12 }} />
              <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12 }} />
              <Area type="monotone" dataKey="revenue" stroke="#1A3263" fill="url(#sg)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h2 className="font-bold text-gray-800 mb-5">Order Status</h2>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={orderStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={75}
                label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}>
                {orderStatus.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <h2 className="font-bold text-gray-800 mb-5">Orders Per Day</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={salesTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="date" stroke="#9ca3af" tick={{ fontSize: 12 }} />
            <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12 }} />
            <Bar dataKey="orders" fill="#547792" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
