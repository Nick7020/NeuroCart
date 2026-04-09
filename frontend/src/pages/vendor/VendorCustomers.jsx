import { useFetch } from '../../hooks/useFetch'
import { vendorService } from '../../services'
import { Spinner } from '../../components/ui/Spinner'
import { EmptyState } from '../../components/ui/EmptyState'
import { formatCurrency, formatDate } from '../../utils'
import { Search } from 'lucide-react'
import { useState } from 'react'

export function VendorCustomers() {
  const { data, loading } = useFetch(() => vendorService.getOrders(), [])
  const [search, setSearch] = useState('')
  const orders = data?.orders || []

  // Derive unique customers from orders
  const customerMap = {}
  orders.forEach(o => {
    const name = o.address?.name || o.user?.name || 'Unknown'
    const email = o.user?.email || '—'
    const key = email
    if (!customerMap[key]) {
      customerMap[key] = { name, email, orders: 0, spent: 0, lastOrder: o.createdAt }
    }
    customerMap[key].orders += 1
    customerMap[key].spent += (o.items || []).reduce((s, i) => s + i.price * i.quantity, 0) * 1.18
    if (new Date(o.createdAt) > new Date(customerMap[key].lastOrder)) {
      customerMap[key].lastOrder = o.createdAt
    }
  })

  const customers = Object.values(customerMap).filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Customers</h1>
          <p className="text-gray-400 text-sm mt-1">Customers who ordered from your store</p>
        </div>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers..." className="input pl-9 w-56" />
        </div>
      </div>

      {!customers.length ? (
        <EmptyState icon="👥" title="No customers yet" description="Customers appear here once they place orders" />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Customer', 'Email', 'Orders', 'Total Spent', 'Last Order'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {customers.map((c, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg,#1A3263,#547792)' }}>
                        {c.name[0]?.toUpperCase()}
                      </div>
                      <span className="font-semibold text-gray-800">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-500">{c.email}</td>
                  <td className="px-5 py-4">
                    <span className="bg-blue-50 text-blue-600 font-bold text-xs px-2.5 py-1 rounded-full">{c.orders}</span>
                  </td>
                  <td className="px-5 py-4 font-bold" style={{ color: '#1A3263' }}>{formatCurrency(c.spent)}</td>
                  <td className="px-5 py-4 text-gray-500">{formatDate(c.lastOrder)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
