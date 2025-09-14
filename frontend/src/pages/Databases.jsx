import { useEffect, useState } from 'react'
import {
  apiListDatabases,
  apiCreateDatabase,
  apiDeleteDatabase,
  apiCreateDbUser,
  apiResetDbUserPassword,
  apiDeleteDbUser,
} from '../services/api'

export default function Databases() {
  const [databases, setDatabases] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [engine, setEngine] = useState('mariadb')
  const [name, setName] = useState('')
  const [creatingDb, setCreatingDb] = useState(false)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await apiListDatabases()
      setDatabases(data.databases || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const onCreateDb = async (e) => {
    e.preventDefault()
    setCreatingDb(true)
    try {
      await apiCreateDatabase(engine, name.trim())
      setName('')
      await load()
    } catch (e) {
      setError(e.message)
    } finally {
      setCreatingDb(false)
    }
  }

  const onDeleteDb = async (id) => {
    if (!confirm('Delete this database?')) return
    try {
      await apiDeleteDatabase(id)
      await load()
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="mt-6">
      <h1 className="text-2xl font-bold">Databases</h1>
      <p className="text-slate-600 mt-1">Provision MySQL/MariaDB databases and users. System ops are stubbed in development.</p>

      <form onSubmit={onCreateDb} className="mt-6 grid gap-3 md:grid-cols-4">
        <select className="border rounded px-3 py-2" value={engine} onChange={(e) => setEngine(e.target.value)}>
          <option value="mariadb">MariaDB</option>
          <option value="mysql">MySQL</option>
        </select>
        <input
          className="border rounded px-3 py-2"
          placeholder="database name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          minLength={3}
        />
        <button disabled={creatingDb} className="px-3 py-2 bg-slate-900 text-white rounded hover:bg-black disabled:opacity-60">Create Database</button>
      </form>

      {error && <p className="text-red-600 mt-4">{error}</p>}

      <div className="mt-6 space-y-6">
        {loading ? (
          <div>Loading...</div>
        ) : databases.length === 0 ? (
          <div className="text-slate-500">No databases yet.</div>
        ) : (
          databases.map((db) => (
            <DbCard key={db.id} db={db} onDelete={() => onDeleteDb(db.id)} onChanged={load} />
          ))
        )}
      </div>
    </div>
  )
}

function DbCard({ db, onDelete, onChanged }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [host, setHost] = useState('%')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const onCreateUser = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await apiCreateDbUser(db.id, username.trim(), password, host.trim())
      setUsername('')
      setPassword('')
      setHost('%')
      await onChanged()
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const onResetPassword = async (userId) => {
    const pwd = prompt('New password (min 8 chars):')
    if (!pwd) return
    if (pwd.length < 8) return alert('Password must be at least 8 characters')
    try {
      await apiResetDbUserPassword(userId, pwd)
      alert('Password reset successfully')
    } catch (e) {
      setError(e.message)
    }
  }

  const onDeleteUser = async (userId) => {
    if (!confirm('Delete this DB user?')) return
    try {
      await apiDeleteDbUser(userId)
      await onChanged()
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="border rounded bg-white">
      <div className="p-4 flex items-center justify-between">
        <div>
          <div className="font-semibold">{db.name}</div>
          <div className="text-slate-500 text-sm">Engine: {db.engine} · Status: {db.status}</div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onDelete} className="text-red-600 hover:text-red-700">Delete DB</button>
        </div>
      </div>
      <div className="border-t p-4">
        <h3 className="font-medium">Users</h3>
        <table className="w-full text-sm mt-2">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left px-2 py-1">Username</th>
              <th className="text-left px-2 py-1">Host</th>
              <th className="text-right px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!db.users || db.users.length === 0 ? (
              <tr><td className="px-2 py-2 text-slate-500" colSpan={3}>No users yet.</td></tr>
            ) : (
              db.users.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="px-2 py-2">{u.username}</td>
                  <td className="px-2 py-2">{u.host}</td>
                  <td className="px-2 py-2 text-right space-x-3">
                    <button onClick={() => onResetPassword(u.id)} className="text-slate-700 hover:text-black">Reset Password</button>
                    <button onClick={() => onDeleteUser(u.id)} className="text-red-600 hover:text-red-700">Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <form onSubmit={onCreateUser} className="mt-4 grid gap-2 md:grid-cols-4">
          <input className="border rounded px-3 py-2" placeholder="username" value={username} onChange={(e) => setUsername(e.target.value)} required minLength={3} />
          <input className="border rounded px-3 py-2" placeholder="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
          <input className="border rounded px-3 py-2" placeholder="host (default %)" value={host} onChange={(e) => setHost(e.target.value)} />
          <button disabled={busy} className="px-3 py-2 bg-slate-900 text-white rounded hover:bg-black disabled:opacity-60">Create User</button>
        </form>

        {error && <p className="text-red-600 mt-2">{error}</p>}
      </div>
    </div>
  )
}
