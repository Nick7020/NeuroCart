import { useState } from 'react'
import { useFetch } from '../../hooks/useFetch'
import { analyticsService } from '../../services'
import { Spinner } from '../../components/ui/Spinner'
import { formatCurrency } from '../../utils'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts'

export function AdminReports() {
  const [range, setRange] = useState('30')
  const { data, loading } = useFetch(() => analyticsService.reports({ days: range }), [range])

  const sales = data?.sales || []
  const summary = data?.summary || {}

  const handleExport = (type) => {
    alert(`Export as ${type} — connect to backend /api/v1/analytics/reports/export?format=${type}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Reports</h1>
        <div className="flex gap-3">
          <select value={range} onChange={e => setRange(e.target.value)} className="input w-36">
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
          <button onClick={() => handleExport('csv')} className="btn-secondary flex items-center gap-2">
            📄 CSV
          </button>
          <button onClick={() => handleExport('pdf')} className="btn-secondary flex items-center gap-2">
            📑 PDF
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: formatCurrency(summary.revenue || 0), icon: '💰' },
          { label: 'Total Orders', value: summary.orders || 0, icon: '🛍️' },
          { label: 'Avg Order Value', value: formatCurrency(summary.avgOrderValue || 0), icon: '📊' },
          { label: 'New Customers', value: summary.newCustomers || 0, icon: '👥' },
        ].map(({ label, value, icon }) => (
          <div key={label} className="card p-5">
            <p className="text-gray-400 text-sm">{label}</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xl font-bold">{value}</span>
              <span className="text-2xl">{icon}</span>
            </div>
          </div>
        ))}
      </div>

      {loading ? <div className="flex justify-center py-20"><Spinner size="lg" /></div> : (
        <>
          <div className="card p-5">
            <h2 className="font-bold mb-5">Revenue vs Orders</h2>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={sales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="date" stroke="#6b7280" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" stroke="#6b7280" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" stroke="#6b7280" tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 12 }} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} dot={false} name="Revenue (₹)" />
                <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={2} dot={false} name="Orders" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="card p-5">
            <h2 className="font-bold mb-5">Sales by Category</h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data?.byCategory || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="category" stroke="#6b7280" tick={{ fontSize: 12 }} />
                <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 12 }} />
                <Bar dataKey="revenue" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="Revenue (₹)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  )
}
