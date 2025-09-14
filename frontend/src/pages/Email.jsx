import { useEffect, useMemo, useState } from 'react'
import {
  apiListDomains,
} from '../services/api'
import {
  apiListEmailAccounts,
  apiCreateEmailAccount,
  apiUpdateEmailStatus,
  apiResetEmailPassword,
  apiDeleteEmailAccount,
  apiListEmailForwarders,
  apiCreateEmailForwarder,
  apiDeleteEmailForwarder,
} from '../services/api'

export default function Email() {
  const [domains, setDomains] = useState([])
  const [selectedDomainId, setSelectedDomainId] = useState('')

  const [accounts, setAccounts] = useState([])
  const [fwd, setFwd] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const selectedDomain = useMemo(() => domains.find(d => d.id === selectedDomainId) || null, [domains, selectedDomainId])

  const load = async (domainId = selectedDomainId) => {
    setLoading(true)
    setError('')
    try {
      const [domRes, accRes, fwdRes] = await Promise.all([
        domains.length ? Promise.resolve({ domains }) : apiListDomains(),
        apiListEmailAccounts(domainId || undefined),
        apiListEmailForwarders(domainId || undefined),
      ])
      if (!domains.length) setDomains(domRes.domains || [])
      setAccounts(accRes.accounts || [])
      setFwd(fwdRes.forwarders || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load('') }, [])

  const onDomainChange = async (e) => {
    const id = e.target.value
    setSelectedDomainId(id)
    await load(id)
  }

  return (
    <div className="mt-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">Email Management</h1>
          <p className="text-slate-600 mt-1">Create mailboxes and forwarders. System operations are stubbed in development.</p>
        </div>
        <div>
          <label className="text-sm text-slate-600 mr-2">Filter by domain</label>
          <select className="border rounded px-3 py-2" value={selectedDomainId} onChange={onDomainChange}>
            <option value="">All</option>
            {domains.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="text-red-600 mt-4">{error}</p>}

      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <EmailAccounts
          domains={domains}
          selectedDomainId={selectedDomainId}
          onChanged={() => load(selectedDomainId)}
          accounts={accounts}
        />
        <Forwarders
          domains={domains}
          selectedDomainId={selectedDomainId}
          onChanged={() => load(selectedDomainId)}
          items={fwd}
        />
      </div>
    </div>
  )
}

function EmailAccounts({ domains, selectedDomainId, onChanged, accounts }) {
  const [domainId, setDomainId] = useState('')
  const [localPart, setLocalPart] = useState('')
  const [password, setPassword] = useState('')
  const [quotaMb, setQuotaMb] = useState('1024')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (selectedDomainId) setDomainId(selectedDomainId)
  }, [selectedDomainId])

  const onCreate = async (e) => {
    e.preventDefault()
    if (!domainId) return setError('Select a domain')
    setBusy(true)
    setError('')
    try {
      const quota = quotaMb ? parseInt(quotaMb, 10) : undefined
      await apiCreateEmailAccount(domainId, localPart.trim(), password, quota)
      setLocalPart('')
      setPassword('')
      await onChanged()
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const onToggle = async (acc) => {
    try {
      const next = acc.status === 'active' ? 'disabled' : 'active'
      await apiUpdateEmailStatus(acc.id, next)
      await onChanged()
    } catch (e) {
      setError(e.message)
    }
  }

  const onReset = async (acc) => {
    const pwd = prompt(`New password for ${acc.email}`)
    if (!pwd) return
    if (pwd.length < 8) return alert('Password must be at least 8 characters')
    try {
      await apiResetEmailPassword(acc.id, pwd)
      alert('Password reset successfully')
    } catch (e) {
      setError(e.message)
    }
  }

  const onDelete = async (acc) => {
    if (!confirm(`Delete mailbox ${acc.email}?`)) return
    try {
      await apiDeleteEmailAccount(acc.id)
      await onChanged()
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="border rounded bg-white">
      <div className="p-4 border-b">
        <h2 className="font-semibold">Mailboxes</h2>
        <form onSubmit={onCreate} className="grid md:grid-cols-5 gap-2 mt-3">
          <select className="border rounded px-2 py-2" value={domainId} onChange={e => setDomainId(e.target.value)}>
            <option value="">Select domain</option>
            {domains.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <input className="border rounded px-2 py-2" placeholder="local part (e.g. info)" value={localPart} onChange={e => setLocalPart(e.target.value)} required />
          <input className="border rounded px-2 py-2" type="password" placeholder="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />
          <input className="border rounded px-2 py-2" placeholder="quota (MB)" value={quotaMb} onChange={e => setQuotaMb(e.target.value)} />
          <button disabled={busy} className="px-3 py-2 bg-slate-900 text-white rounded hover:bg-black disabled:opacity-60">Create</button>
        </form>
        {error && <p className="text-red-600 mt-2">{error}</p>}
      </div>
      <div className="p-4">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left px-2 py-1">Email</th>
              <th className="text-left px-2 py-1">Quota</th>
              <th className="text-left px-2 py-1">Status</th>
              <th className="text-right px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {accounts.length === 0 ? (
              <tr><td className="px-2 py-2 text-slate-500" colSpan={4}>No mailboxes.</td></tr>
            ) : accounts.map(acc => (
              <tr key={acc.id} className="border-t">
                <td className="px-2 py-2">{acc.email}</td>
                <td className="px-2 py-2">{acc.quotaMb} MB</td>
                <td className="px-2 py-2">{acc.status}</td>
                <td className="px-2 py-2 text-right space-x-3">
                  <button onClick={() => onToggle(acc)} className="text-slate-700 hover:text-black">{acc.status === 'active' ? 'Disable' : 'Enable'}</button>
                  <button onClick={() => onReset(acc)} className="text-slate-700 hover:text-black">Reset Password</button>
                  <button onClick={() => onDelete(acc)} className="text-red-600 hover:text-red-700">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Forwarders({ domains, selectedDomainId, onChanged, items }) {
  const [sourceDomainId, setSourceDomainId] = useState('')
  const [sourceLocalPart, setSourceLocalPart] = useState('')
  const [destinationEmail, setDestinationEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (selectedDomainId) setSourceDomainId(selectedDomainId)
  }, [selectedDomainId])

  const onCreate = async (e) => {
    e.preventDefault()
    if (!sourceDomainId) return setError('Select a domain')
    setBusy(true)
    setError('')
    try {
      await apiCreateEmailForwarder(sourceDomainId, sourceLocalPart.trim(), destinationEmail.trim())
      setSourceLocalPart('')
      setDestinationEmail('')
      await onChanged()
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const onDelete = async (id) => {
    if (!confirm('Delete this forwarder?')) return
    try {
      await apiDeleteEmailForwarder(id)
      await onChanged()
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="border rounded bg-white">
      <div className="p-4 border-b">
        <h2 className="font-semibold">Forwarders</h2>
        <form onSubmit={onCreate} className="grid md:grid-cols-4 gap-2 mt-3">
          <select className="border rounded px-2 py-2" value={sourceDomainId} onChange={e => setSourceDomainId(e.target.value)}>
            <option value="">Select domain</option>
            {domains.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <input className="border rounded px-2 py-2" placeholder="source local part (e.g. sales)" value={sourceLocalPart} onChange={e => setSourceLocalPart(e.target.value)} required />
          <input className="border rounded px-2 py-2" placeholder="destination email" type="email" value={destinationEmail} onChange={e => setDestinationEmail(e.target.value)} required />
          <button disabled={busy} className="px-3 py-2 bg-slate-900 text-white rounded hover:bg-black disabled:opacity-60">Create Forwarder</button>
        </form>
        {error && <p className="text-red-600 mt-2">{error}</p>}
      </div>
      <div className="p-4">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left px-2 py-1">Source</th>
              <th className="text-left px-2 py-1">Destination</th>
              <th className="text-right px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td className="px-2 py-2 text-slate-500" colSpan={3}>No forwarders.</td></tr>
            ) : items.map(fr => (
              <tr key={fr.id} className="border-t">
                <td className="px-2 py-2">{fr.sourceEmail}</td>
                <td className="px-2 py-2">{fr.destinationEmail}</td>
                <td className="px-2 py-2 text-right">
                  <button onClick={() => onDelete(fr.id)} className="text-red-600 hover:text-red-700">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
