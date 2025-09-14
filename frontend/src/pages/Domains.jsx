import { useEffect, useState } from 'react'
import { apiListDomains, apiCreateDomain, apiDeleteDomain } from '../services/api'

export default function Domains() {
  const [domains, setDomains] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [type, setType] = useState('addon')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await apiListDomains()
      setDomains(data.domains)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const onSubmit = async (e) => {
    e.preventDefault()
    try {
      await apiCreateDomain(name.trim(), type)
      setName('')
      setType('addon')
      await load()
    } catch (e) {
      setError(e.message)
    }
  }

  const onDelete = async (id) => {
    if (!confirm('Delete this domain?')) return
    try {
      await apiDeleteDomain(id)
      await load()
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="mt-6">
      <h1 className="text-2xl font-bold">Domains</h1>
      <p className="text-slate-600 mt-1">Manage addon, subdomain, and parked domains.</p>

      <form onSubmit={onSubmit} className="mt-6 grid gap-3 md:grid-cols-3">
        <input
          type="text"
          placeholder="example.com"
          className="border rounded px-3 py-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <select className="border rounded px-3 py-2" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="addon">Addon</option>
          <option value="subdomain">Subdomain</option>
          <option value="parked">Parked</option>
        </select>
        <button className="px-3 py-2 bg-slate-900 text-white rounded hover:bg-black">Add Domain</button>
      </form>

      {error && <p className="text-red-600 mt-4">{error}</p>}

      <div className="mt-6 border rounded bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left px-3 py-2">Domain</th>
              <th className="text-left px-3 py-2">Type</th>
              <th className="text-right px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-3 py-4" colSpan={3}>Loading...</td></tr>
            ) : (!domains || domains.length === 0) ? (
              <tr><td className="px-3 py-6 text-slate-500" colSpan={3}>No domains yet.</td></tr>
            ) : (
              domains.map((d) => (
                <tr key={d.id} className="border-t">
                  <td className="px-3 py-2">{d.name}</td>
                  <td className="px-3 py-2">{d.type}</td>
                  <td className="px-3 py-2 text-right">
                    <button onClick={() => onDelete(d.id)} className="text-red-600 hover:text-red-700">Delete</button>
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
