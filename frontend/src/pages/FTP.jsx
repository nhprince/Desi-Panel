import { useEffect, useState } from 'react'
import { apiListFTP, apiCreateFTP, apiUpdateFTPStatus, apiResetFTPPassword, apiDeleteFTP } from '../services/api'

export default function FTP() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [homeDir, setHomeDir] = useState('')
  const [creating, setCreating] = useState(false)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await apiListFTP()
      setItems(data.items || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const onCreate = async (e) => {
    e.preventDefault()
    setCreating(true)
    setError('')
    try {
      await apiCreateFTP(username.trim(), password, homeDir.trim())
      setUsername('')
      setPassword('')
      setHomeDir('')
      await load()
    } catch (e) {
      setError(e.message)
    } finally {
      setCreating(false)
    }
  }

  const onToggleStatus = async (id, cur) => {
    try {
      const next = cur === 'active' ? 'disabled' : 'active'
      await apiUpdateFTPStatus(id, next)
      await load()
    } catch (e) {
      setError(e.message)
    }
  }

  const onResetPassword = async (id) => {
    const pwd = prompt('New password (min 8 chars):')
    if (!pwd) return
    if (pwd.length < 8) return alert('Password must be at least 8 characters')
    try {
      await apiResetFTPPassword(id, pwd)
      alert('Password reset successfully')
    } catch (e) {
      setError(e.message)
    }
  }

  const onDelete = async (id) => {
    if (!confirm('Delete this FTP account?')) return
    try {
      await apiDeleteFTP(id)
      await load()
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="mt-6">
      <h1 className="text-2xl font-bold">FTP Accounts</h1>
      <p className="text-slate-600 mt-1">Create and manage FTP accounts. In development, system operations are stubbed.</p>

      <form onSubmit={onCreate} className="mt-6 grid gap-3 md:grid-cols-4">
        <input
          className="border rounded px-3 py-2"
          placeholder="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          minLength={3}
        />
        <input
          className="border rounded px-3 py-2"
          placeholder="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />
        <input
          className="border rounded px-3 py-2"
          placeholder="home dir (relative, optional)"
          value={homeDir}
          onChange={(e) => setHomeDir(e.target.value)}
        />
        <button disabled={creating} className="px-3 py-2 bg-slate-900 text-white rounded hover:bg-black disabled:opacity-60">Create</button>
      </form>

      {error && <p className="text-red-600 mt-4">{error}</p>}

      <div className="mt-6 border rounded bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left px-3 py-2">Username</th>
              <th className="text-left px-3 py-2">Home Dir</th>
              <th className="text-left px-3 py-2">Status</th>
              <th className="text-right px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-3 py-4" colSpan={4}>Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td className="px-3 py-6 text-slate-500" colSpan={4}>No FTP accounts yet.</td></tr>
            ) : (
              items.map((it) => (
                <tr key={it.id} className="border-t">
                  <td className="px-3 py-2">{it.username}</td>
                  <td className="px-3 py-2">{it.homeDir || '/'}</td>
                  <td className="px-3 py-2">{it.status}</td>
                  <td className="px-3 py-2 text-right space-x-3">
                    <button onClick={() => onToggleStatus(it.id, it.status)} className="text-slate-700 hover:text-black">
                      {it.status === 'active' ? 'Disable' : 'Enable'}
                    </button>
                    <button onClick={() => onResetPassword(it.id)} className="text-slate-700 hover:text-black">
                      Reset Password
                    </button>
                    <button onClick={() => onDelete(it.id)} className="text-red-600 hover:text-red-700">
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
