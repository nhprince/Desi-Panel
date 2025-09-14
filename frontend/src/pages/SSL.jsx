import { useEffect, useState } from 'react'
import { apiSSLListDomains, apiSSLIssue, apiSSLRevoke, apiSSLDelete } from '../services/api'

export default function SSL() {
  const [domains, setDomains] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await apiSSLListDomains()
      setDomains(data.domains || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const onIssue = async (domainId) => {
    try {
      await apiSSLIssue(domainId)
      await load()
    } catch (e) {
      setError(e.message)
    }
  }

  const onRevoke = async (id) => {
    try {
      await apiSSLRevoke(id)
      await load()
    } catch (e) {
      setError(e.message)
    }
  }

  const onDelete = async (id) => {
    if (!confirm('Delete this certificate?')) return
    try {
      await apiSSLDelete(id)
      await load()
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="mt-6">
      <h1 className="text-2xl font-bold">SSL Certificates</h1>
      <p className="text-slate-600 mt-1">Issue self-signed certificates for development. In production, integrate with Let’s Encrypt.</p>

      {error && <p className="text-red-600 mt-4">{error}</p>}

      <div className="mt-4 border rounded bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left px-3 py-2">Domain</th>
              <th className="text-left px-3 py-2">Cert Status</th>
              <th className="text-left px-3 py-2">Expires</th>
              <th className="text-right px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-3 py-4" colSpan={4}>Loading...</td></tr>
            ) : (domains.length === 0 ? (
              <tr><td className="px-3 py-6 text-slate-500" colSpan={4}>No domains yet.</td></tr>
            ) : (
              domains.map((d) => {
                const cert = d.sslCert
                return (
                  <tr key={d.id} className="border-t">
                    <td className="px-3 py-2">{d.name}</td>
                    <td className="px-3 py-2">{cert ? cert.status : 'none'}</td>
                    <td className="px-3 py-2">{cert?.expiresAt ? new Date(cert.expiresAt).toLocaleString() : '-'}</td>
                    <td className="px-3 py-2 text-right space-x-3">
                      {!cert && (
                        <button onClick={() => onIssue(d.id)} className="text-slate-700 hover:text-black">Issue</button>
                      )}
                      {cert && cert.status === 'active' && (
                        <button onClick={() => onRevoke(cert.id)} className="text-slate-700 hover:text-black">Revoke</button>
                      )}
                      {cert && (
                        <button onClick={() => onDelete(cert.id)} className="text-red-600 hover:text-red-700">Delete</button>
                      )}
                    </td>
                  </tr>
                )
              })
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
