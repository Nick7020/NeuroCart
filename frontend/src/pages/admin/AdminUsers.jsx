import { useState } from 'react'
import { useFetch } from '../../hooks/useFetch'
import { userService } from '../../services'
import { useNotification } from '../../context/NotificationContext'
import { Spinner } from '../../components/ui/Spinner'
import { formatDate } from '../../utils'

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
        <h1 className="text-2xl font-bold">Users</h1>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name / email..." className="input w-60" />
      </div>

      {loading ? <div className="flex justify-center py-20"><Spinner size="lg" /></div> : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-800">
                <tr className="text-gray-400">
                  {['User', 'Email', 'Role', 'Joined', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-5 py-4 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {list.map(u => (
                  <tr key={u._id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-indigo-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                        <span className="font-medium">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-400">{u.email}</td>
                    <td className="px-5 py-4">
                      <select
                        value={u.role}
                        onChange={e => changeRole(u, e.target.value)}
                        disabled={!!busy}
                        className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
                      >
                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                    <td className="px-5 py-4 text-gray-400">{u.createdAt ? formatDate(u.createdAt) : 'N/A'}</td>
                    <td className="px-5 py-4">
                      <span className={`badge ${u.isBlocked ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                        {u.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {busy === u._id ? <Spinner size="sm" /> : (
                        <button
                          onClick={() => toggleBlock(u)}
                          className={u.isBlocked ? 'btn-secondary text-xs py-1.5 px-3' : 'btn-danger text-xs py-1.5 px-3'}
                        >
                          {u.isBlocked ? 'Unblock' : 'Block'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!list.length && <p className="text-center text-gray-500 py-12">No users found</p>}
          </div>
        </div>
      )}
    </div>
  )
}
