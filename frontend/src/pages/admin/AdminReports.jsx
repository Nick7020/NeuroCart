import { useState } from 'react'
import { useFetch } from '../../hooks/useFetch'
import { analyticsService } from '../../services'
import { Spinner } from '../../components/ui/Spinner'
import { formatCurrency } from '../../utils'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Download } from 'lucide-react'

export function AdminReports() {
  const [range, setRange] = useState('30')
  const { data, loading } = useFetch(() => analyticsService.reports({ days: range }), [range])
  const summary = data?.summary || {}
  const sales = data?.sales || []

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-extrabold text-gray-900">Reports</h1>
        <div className="flex gap-3">
          <select value={range} onChange={e => setRange(e.target.value)} className="input w-36">
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
          <button onClick={() => alert('Export CSV — connect backend')} className="btn-secondary gap-2"><Download size={15} /> CSV</button>
          <button onClick={() => alert('Export PDF — connect backend')} className="btn-secondary gap-2"><Download size={15} /> PDF</button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Revenue',       value: formatCurrency(summary.revenue || 0),       icon: '💰', color: '#1A3263', bg: '#eff6ff' },
          { label: 'Orders',        value: summary.orders || 0,                         icon: '🛍️', color: '#7c3aed', bg: '#f5f3ff' },
          { label: 'Avg Order',     value: formatCurrency(summary.avgOrderValue || 0),  icon: '📊', color: '#0891b2', bg: '#ecfeff' },
          { label: 'New Customers', value: summary.newCustomers || 0,                   icon: '👥', color: '#16a34a', bg: '#f0fdf4' },
        ].map(({ label, value, icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{label}</p>
                <p className="text-xl font-extrabold text-gray-900 mt-1">{value}</p>
              </div>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl" style={{ background: bg }}>{icon}</div>
            </div>
          </div>
        ))}
      </div>

      {loading ? <div className="flex justify-center py-10"><Spinner size="lg" /></div> : (
        <>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h2 className="font-bold text-gray-800 mb-5">Revenue vs Orders</h2>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={sales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="l" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="r" orientation="right" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12 }} />
                <Legend />
                <Line yAxisId="l" type="monotone" dataKey="revenue" stroke="#1A3263" strokeWidth={2} dot={false} name="Revenue (₹)" />
                <Line yAxisId="r" type="monotone" dataKey="orders"  stroke="#547792" strokeWidth={2} dot={false} name="Orders" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h2 className="font-bold text-gray-800 mb-5">Sales by Category</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data?.byCategory || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="category" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12 }} />
                <Bar dataKey="revenue" fill="#547792" radius={[6, 6, 0, 0]} name="Revenue (₹)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  )
}
