import { useState } from 'react'
import { useFetch } from '../../hooks/useFetch'
import { userService, adminService } from '../../services'
import { useNotification } from '../../context/NotificationContext'
import { Spinner } from '../../components/ui/Spinner'
import { formatDate } from '../../utils'
import { Search, Store, CheckCircle } from 'lucide-react'

const ROLES = ['customer', 'admin', 'vendor']
const TABS  = ['all', 'vendor', 'customer', 'admin']

export function AdminUsers() {
  const { notify } = useNotification()
  const { data, loading }           = useFetch(() => userService.getAll(), [])
  const { data: vendorData }        = useFetch(() => adminService.getVendors(), [])
  const [users, setUsers]           = useState(null)
  const [search, setSearch]         = useState('')
  const [tab, setTab]               = useState('all')
  const [busy, setBusy]             = useState(null)

  const rawUsers   = data?.results ?? data?.users ?? []
  const allUsers   = users ?? (Array.isArray(rawUsers) ? rawUsers : [])
  const rawVendors = vendorData?.results ?? vendorData?.vendors ?? []
  const allVendors = Array.isArray(rawVendors) ? rawVendors : []

  // Build vendor store map: userId -> vendor profile
  const vendorMap = allVendors.reduce((acc, v) => {
    if (v.user?.id) acc[v.user.id] = v
    return acc
  }, {})

  const list = (Array.isArray(allUsers) ? allUsers : []).filter(u => {
    const name = u.first_name || u.email?.split('@')[0] || ''
    const matchSearch = name.toLowerCase().includes(search.toLowerCase()) ||
                        u.email?.toLowerCase().includes(search.toLowerCase())
    const matchTab = tab === 'all' || u.role === tab
    return matchSearch && matchTab
  })

  const counts = TABS.reduce((acc, t) => {
    const userList = Array.isArray(allUsers) ? allUsers : []
    acc[t] = t === 'all' ? userList.length : userList.filter(u => u.role === t).length
    return acc
  }, {})

  const toggleBlock = async (u) => {
    setBusy(u.id)
    try {
      const action = u.is_active ? 'block' : 'unblock'
      await userService[action](u.id)
      const userList = Array.isArray(allUsers) ? allUsers : []
      setUsers(userList.map(x => x.id === u.id ? { ...x, is_active: !x.is_active } : x))
      notify(u.is_active ? 'User blocked' : 'User unblocked', 'success')
    } catch { notify('Action failed', 'error') }
    finally { setBusy(null) }
  }

  const unblockAll = async () => {
    const userList = Array.isArray(allUsers) ? allUsers : []
    const blocked = userList.filter(u => !u.is_active)
    if (!blocked.length) return notify('No blocked users', 'info')
    setBusy('all')
    try {
      await Promise.all(blocked.map(u => userService.unblock(u.id)))
      setUsers(userList.map(x => ({ ...x, is_active: true })))
      notify(`${blocked.length} user(s) unblocked`, 'success')
    } catch { notify('Unblock all failed', 'error') }
    finally { setBusy(null) }
  }

  const changeRole = async (u, role) => {
    setBusy(u.id + role)
    try {
      await userService.updateUser(u.id, { role })
      const userList = Array.isArray(allUsers) ? allUsers : []
      setUsers(userList.map(x => x.id === u.id ? { ...x, role } : x))
      notify('Role updated', 'success')
    } catch { notify('Update failed', 'error') }
    finally { setBusy(null) }
  }

  const verifyVendor = async (vendorId) => {
    setBusy('v' + vendorId)
    try {
      await adminService.verifyVendor(vendorId)
      notify('Vendor verified', 'success')
    } catch { notify('Verify failed', 'error') }
    finally { setBusy(null) }
  }

  const pendingVendors = allUsers.filter(u => u.role === 'vendor')

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Users</h1>
          <p className="text-sm text-gray-400 mt-0.5">{allUsers.length} total users</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search name / email..." className="input pl-9 w-60" />
          </div>
          <button onClick={unblockAll} disabled={busy === 'all'}
            className="text-xs font-semibold px-4 py-2 rounded-xl bg-green-50 text-green-600 hover:bg-green-100 border border-green-200 transition-colors">
            {busy === 'all' ? <Spinner size="sm" /> : 'Unblock All'}
          </button>
        </div>
      </div>

      {/* Vendor alert */}
      {pendingVendors.length > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 flex items-center gap-3">
          <Store size={18} className="text-purple-500 flex-shrink-0" />
          <p className="text-sm text-purple-700 font-medium">
            {pendingVendors.length} vendor{pendingVendors.length > 1 ? 's' : ''} in system —{' '}
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
            style={tab === t ? { background: t === 'vendor' ? 'linear-gradient(135deg,#7c3aed,#a78bfa)' : 'linear-gradient(135deg,#4F46E5,#6366f1)' } : {}}>
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
                <tr>
                  {['User', 'Email', tab === 'vendor' ? 'Store' : 'Role', 'Joined', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {list.map(u => {
                  const vendor = vendorMap[u.id]
                  const displayName = u.first_name ? `${u.first_name} ${u.last_name || ''}`.trim() : u.email?.split('@')[0]
                  return (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                            style={{ background: u.role === 'vendor' ? 'linear-gradient(135deg,#7c3aed,#a78bfa)' : 'linear-gradient(135deg,#4F46E5,#6366f1)' }}>
                            {displayName?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{displayName}</p>
                            <p className="text-xs text-gray-400 capitalize">{u.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-500">{u.email}</td>
                      <td className="px-5 py-4">
                        {tab === 'vendor' ? (
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{vendor?.shop_name || '—'}</p>
                            {vendor && (
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${vendor.verification_status === 'approved' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>
                                {vendor.verification_status}
                              </span>
                            )}
                          </div>
                        ) : (
                          <select value={u.role} onChange={e => changeRole(u, e.target.value)} disabled={!!busy}
                            className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-indigo-400 text-gray-700">
                            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                        )}
                      </td>
                      <td className="px-5 py-4 text-gray-500 text-xs">{u.created_at ? formatDate(u.created_at) : 'N/A'}</td>
                      <td className="px-5 py-4">
                        <span className={`badge font-semibold ${!u.is_active ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
                          {!u.is_active ? 'Blocked' : 'Active'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {busy === u.id ? <Spinner size="sm" /> : (
                          <div className="flex gap-2 flex-wrap">
                            <button onClick={() => toggleBlock(u)}
                              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${!u.is_active ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-red-50 text-red-500 hover:bg-red-100'}`}>
                              {!u.is_active ? 'Unblock' : 'Block'}
                            </button>
                            {u.role === 'vendor' && vendor && vendor.verification_status !== 'approved' && (
                              <button onClick={() => verifyVendor(vendor.id)} disabled={busy === 'v' + vendor.id}
                                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors flex items-center gap-1">
                                <CheckCircle size={12} /> Verify
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {!list.length && <p className="text-center text-gray-400 py-12">No users found</p>}
          </div>
        </div>
      )}
    </div>
  )
}
