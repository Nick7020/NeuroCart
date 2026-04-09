import { useState } from 'react'
import { useFetch } from '../../hooks/useFetch'
import { userService } from '../../services'
import { useNotification } from '../../context/NotificationContext'
import { Spinner } from '../../components/ui/Spinner'
import { formatDate } from '../../utils'
import { Search } from 'lucide-react'

const ROLES = ['customer', 'staff', 'admin']

export function AdminUsers() {
  const { notify } = useNotification()
  const { data, loading } = useFetch(() => userService.getAll({ limit: 100 }), [])
  const [users, setUsers] = useState(null)
  const [search, setSearch] = useState('')
  const [busy, setBusy] = useState(null)

  const list = (users ?? data?.users ?? data ?? []).filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  const toggleBlock = async (u) => {
    setBusy(u._id)
    try {
      if (u.isBlocked) await userService.unblock(u._id)
      else await userService.block(u._id)
      setUsers(prev => (prev ?? data?.users ?? []).map(x => x._id === u._id ? { ...x, isBlocked: !x.isBlocked } : x))
      notify(u.isBlocked ? 'User unblocked' : 'User blocked', 'success')
    } catch { notify('Action failed', 'error') }
    finally { setBusy(null) }
  }

  const changeRole = async (u, role) => {
    setBusy(u._id + role)
    try {
      await userService.update(u._id, { role })
      setUsers(prev => (prev ?? data?.users ?? []).map(x => x._id === u._id ? { ...x, role } : x))
      notify('Role updated', 'success')
    } catch { notify('Update failed', 'error') }
    finally { setBusy(null) }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-extrabold text-gray-900">Users</h1>
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
                <tr>{['User', 'Email', 'Role', 'Joined', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {list.map(u => (
                  <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0" style={{ background: 'linear-gradient(135deg,#1A3263,#547792)' }}>
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                        <span className="font-semibold text-gray-800">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-500">{u.email}</td>
                    <td className="px-5 py-4">
                      <select value={u.role} onChange={e => changeRole(u, e.target.value)} disabled={!!busy}
                        className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-blue-400 text-gray-700">
                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                    <td className="px-5 py-4 text-gray-500">{u.createdAt ? formatDate(u.createdAt) : 'N/A'}</td>
                    <td className="px-5 py-4">
                      <span className={`badge font-semibold ${u.isBlocked ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
                        {u.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {busy === u._id ? <Spinner size="sm" /> : (
                        <button onClick={() => toggleBlock(u)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${u.isBlocked ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-red-50 text-red-500 hover:bg-red-100'}`}>
                          {u.isBlocked ? 'Unblock' : 'Block'}
                        </button>
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
