import { useState } from 'react'
import { useFetch } from '../../hooks/useFetch'
import { userService } from '../../services'
import { Spinner } from '../../components/ui/Spinner'
import { formatDate } from '../../utils'
import { Search } from 'lucide-react'

export function VendorCustomers() {
  const { data, loading } = useFetch(() => userService.getCustomers(), [])
  const [search, setSearch] = useState('')

  const list = (data?.users ?? []).filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-400 mt-0.5">{data?.users?.length ?? 0} total customers</p>
        </div>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name / email..." className="input pl-9 w-60" />
        </div>
      </div>

      {loading ? <div className="flex justify-center py-20"><Spinner size="lg" /></div> : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{['Customer', 'Email', 'Joined', 'Status'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {list.map(u => (
                  <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                          style={{ background: 'linear-gradient(135deg,#7c3aed,#a78bfa)' }}>
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                        <span className="font-semibold text-gray-800">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-500">{u.email}</td>
                    <td className="px-5 py-4 text-gray-500">{u.createdAt ? formatDate(u.createdAt) : '—'}</td>
                    <td className="px-5 py-4">
                      <span className={`badge font-semibold ${u.isBlocked ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
                        {u.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!list.length && <p className="text-center text-gray-400 py-12">No customers found</p>}
          </div>
        </div>
      )}
    </div>
  )
}
