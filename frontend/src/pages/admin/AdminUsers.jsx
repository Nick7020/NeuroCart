import { useState } from 'react'
import { useFetch } from '../../hooks/useFetch'
import { userService } from '../../services'
import { useNotification } from '../../context/NotificationContext'
import { Spinner } from '../../components/ui/Spinner'
import { formatDate } from '../../utils'
import { Search, CheckCircle, Store } from 'lucide-react'

const TABS = ['all', 'vendor', 'customer', 'admin']

export function AdminUsers() {
  const { notify } = useNotification()
  const { data, loading } = useFetch(() => userService.getAll(), [])
  const [users, setUsers] = useState(null)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('all')
  const [busy, setBusy] = useState(null)

  // Backend returns paginated { results: [...] } or flat array
  const rawUsers = data?.results ?? data?.users ?? data ?? []
  // Normalise backend field names to what the UI expects
  const normalise = (u) => ({
    ...u,
    name: u.name ?? (`${u.first_name ?? ''} ${u.last_name ?? ''}`.trim() || u.email),
    isBlocked: u.isBlocked ?? !u.is_active,
    isApproved: u.isApproved ?? u.is_approved,
    createdAt: u.createdAt ?? u.created_at,
  })
  const allUsers = (users ?? rawUsers).map(normalise)

  const list = allUsers.filter(u => {
    const matchSearch = u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
    const matchTab = tab === 'all' || u.role === tab
    return matchSearch && matchTab
  })

  const counts = TABS.reduce((acc, t) => {
    acc[t] = t === 'all' ? allUsers.length : allUsers.filter(u => u.role === t).length
    return acc
  }, {})

  const toggleBlock = async (u) => {
    setBusy(u.id)
    try {
      if (u.isBlocked) await userService.unblock(u.id)
      else await userService.block(u.id)
      setUsers(allUsers.map(x => x.id === u.id ? { ...x, isBlocked: !x.isBlocked, is_active: x.isBlocked } : x))
      notify(u.isBlocked ? 'User unblocked' : 'User blocked', 'success')
    } catch { notify('Action failed', 'error') }
    finally { setBusy(null) }
  }

  const approveVendor = async (u) => {
    setBusy(u.id + 'approve')
    try {
      await userService.approve(u.id)
      setUsers(allUsers.map(x => x.id === u.id ? { ...x, isApproved: true, is_approved: true } : x))
      notify('Vendor approved', 'success')
    } catch { notify('Approve failed', 'error') }
    finally { setBusy(null) }
  }

  const pendingVendors = allUsers.filter(u => u.role === 'vendor' && !u.isApproved)

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Users</h1>
          <p className="text-sm text-gray-400 mt-0.5">{allUsers.length} total users</p>
        </div>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name / email..." className="input pl-9 w-60" />
        </div>
      </div>

      {/* Pending Vendors Alert */}
      {pendingVendors.length > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 flex items-center gap-3">
          <Store size={18} className="text-purple-500 flex-shrink-0" />
          <p className="text-sm text-purple-700 font-medium">
            {pendingVendors.length} vendor{pendingVendors.length > 1 ? 's' : ''} waiting for approval —{' '}
            <button onClick={() => setTab('vendor')} className="underline font-semibold">View Vendors</button>
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all capitalize flex items-center gap-1.5 ${
              tab === t ? 'text-white shadow-sm' : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'
            }`}
            style={tab === t ? { background: t === 'vendor' ? 'linear-gradient(135deg,#7c3aed,#a78bfa)' : 'linear-gradient(135deg,#1A3263,#547792)' } : {}}>
            {t === 'vendor' && ''}
            {t === 'customer' && ''}
            {t === 'admin' && ''}
            {t === 'all' && ''}
            {t.charAt(0).toUpperCase() + t.slice(1)}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === t ? 'bg-white/20' : 'bg-gray-100 text-gray-400'}`}>
              {counts[t]}
            </span>
          </button>
        ))}
      </div>

      {loading ? <div className="flex justify-center py-20"><Spinner size="lg" /></div> : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{['User', 'Email', 'Role', 'Joined', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {list.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                          style={{ background: u.role === 'vendor' ? 'linear-gradient(135deg,#7c3aed,#a78bfa)' : 'linear-gradient(135deg,#1A3263,#547792)' }}>
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{u.name}</p>
                          {u.role === 'vendor' && (
                            <p className="text-xs text-purple-500 font-medium">{u.isApproved ? 'Approved' : 'Pending'}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-500">{u.email}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${
                        u.role === 'vendor' ? 'bg-purple-50 text-purple-600' :
                        u.role === 'admin' ? 'bg-blue-50 text-blue-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>{u.role}</span>
                    </td>
                    <td className="px-5 py-4 text-gray-500">{u.createdAt ? formatDate(u.createdAt) : 'N/A'}</td>
                    <td className="px-5 py-4">
                      <span className={`badge font-semibold ${u.isBlocked ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
                        {u.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {busy === u.id ? <Spinner size="sm" /> : (
                        <div className="flex gap-2 flex-wrap">
                          <button onClick={() => toggleBlock(u)}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${u.isBlocked ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-red-50 text-red-500 hover:bg-red-100'}`}>
                            {u.isBlocked ? 'Unblock' : 'Block'}
                          </button>
                          {u.role === 'vendor' && !u.isApproved && (
                            <button onClick={() => approveVendor(u)} disabled={busy === u.id + 'approve'}
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors flex items-center gap-1">
                              <CheckCircle size={12} /> Approve
                            </button>
                          )}
                          {u.role === 'vendor' && u.isApproved && (
                            <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-purple-50 text-purple-600">Approved</span>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!list.length && <p className="text-center text-gray-400 py-12">No users found</p>}
          </div>
        </div>
      )}
    </div>
  )
}
