import { useFetch } from '../../hooks/useFetch'
import { analyticsService } from '../../services'
import { KpiCard } from '../../components/ui/KpiCard'
import { Spinner } from '../../components/ui/Spinner'
import { formatCurrency } from '../../utils'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'

const PIE_COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b']

export function AdminDashboard() {
  const { data, loading } = useFetch(() => analyticsService.dashboard(), [])

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  const kpis = data?.kpis || {}
  const salesTrend = data?.salesTrend || []
  const orderStatus = data?.orderStatus || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Welcome back! Here's what's happening.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard label="Total Revenue" value={formatCurrency(kpis.revenue || 0)} icon="💰" trend={kpis.revenueTrend} color="indigo" />
        <KpiCard label="Total Orders" value={kpis.orders || 0} icon="🛍️" trend={kpis.ordersTrend} color="purple" />
        <KpiCard label="Customers" value={kpis.customers || 0} icon="👥" trend={kpis.customersTrend} color="green" />
        <KpiCard label="Products" value={kpis.products || 0} icon="📦" trend={null} color="orange" />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="card p-5 lg:col-span-2">
          <h2 className="font-bold mb-5">Sales Trend</h2>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={salesTrend}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="date" stroke="#6b7280" tick={{ fontSize: 12 }} />
              <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 12 }} />
              <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="url(#salesGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h2 className="font-bold mb-5">Order Status</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={orderStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {orderStatus.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Orders by day bar chart */}
      <div className="card p-5">
        <h2 className="font-bold mb-5">Orders Per Day</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={salesTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="date" stroke="#6b7280" tick={{ fontSize: 12 }} />
            <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 12 }} />
            <Bar dataKey="orders" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
