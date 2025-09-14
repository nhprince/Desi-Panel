import { useEffect, useState } from 'react'
import { apiAccountDetails } from '../services/api'
import useAuthStore from '../store/authStore'

export default function Dashboard() {
  const { user } = useAuthStore()
  const [details, setDetails] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let ignore = false
    apiAccountDetails()
      .then((data) => { if (!ignore) setDetails(data.user) })
      .catch((e) => setError(e.message))
    return () => { ignore = true }
  }, [])

  return (
    <div className="mt-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-slate-600 mt-1">Welcome back{user?.email ? `, ${user.email}` : ''}.</p>

      {error && <p className="text-red-600 mt-4">{error}</p>}

      {!details ? (
        <p className="mt-6 text-slate-500">Loading account details...</p>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="p-4 border rounded bg-white">
            <h2 className="font-semibold mb-2">Account</h2>
            <ul className="text-sm text-slate-700 space-y-1">
              <li><span className="text-slate-500">Email:</span> {details.email}</li>
              <li><span className="text-slate-500">User ID:</span> {details.id}</li>
              <li><span className="text-slate-500">Created:</span> {new Date(details.createdAt).toLocaleString()}</li>
            </ul>
          </div>

          <div className="p-4 border rounded bg-white">
            <h2 className="font-semibold mb-2">Hosting</h2>
            {details.hostingAccount ? (
              <ul className="text-sm text-slate-700 space-y-1">
                <li><span className="text-slate-500">Account ID:</span> {details.hostingAccount.id}</li>
                <li><span className="text-slate-500">Disk Space:</span> {details.hostingAccount.diskSpaceLimitMb} MB</li>
                <li><span className="text-slate-500">Bandwidth:</span> {details.hostingAccount.bandwidthLimitGb} GB</li>
              </ul>
            ) : (
              <p className="text-sm text-slate-500">No hosting account found.</p>
            )}
          </div>

          <div className="md:col-span-2 p-4 border rounded bg-white">
            <h2 className="font-semibold mb-2">Domains</h2>
            {details.hostingAccount?.domains?.length ? (
              <ul className="text-sm text-slate-700 list-disc pl-4">
                {details.hostingAccount.domains.map((d) => (
                  <li key={d.id}>{d.name} <span className="text-slate-500">({d.type})</span></li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">No domains yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
