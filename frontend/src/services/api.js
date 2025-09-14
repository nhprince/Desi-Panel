import useAuthStore from '../store/authStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

function isFormData(val) {
  return typeof FormData !== 'undefined' && val instanceof FormData
}

function encodePath(p = '') {
  if (!p) return ''
  return p.split('/').filter(Boolean).map(encodeURIComponent).join('/')
}

async function request(path, { method = 'GET', body, headers = {} } = {}) {
  const token = useAuthStore.getState().token
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      ...(isFormData(body) ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? (isFormData(body) ? body : JSON.stringify(body)) : undefined,
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    const msg = data?.message || data?.errors?.[0]?.msg || 'Request failed'
    throw new Error(msg)
  }
  return data
}

export function apiLogin(email, password) {
  return request('/api/auth/login', { method: 'POST', body: { email, password } })
}

export function apiRegister(email, password) {
  return request('/api/auth/register', { method: 'POST', body: { email, password } })
}

export function apiAccountDetails() {
  return request('/api/account/details')
}

// Files API
export function apiListFiles(p = '') {
  const encoded = encodePath(p)
  const path = encoded ? `/api/files/${encoded}` : '/api/files/'
  return request(path)
}

export function apiMkdir(dir = '', name) {
  const q = encodeURIComponent(dir || '')
  return request(`/api/files/mkdir?dir=${q}`, { method: 'POST', body: { name } })
}

export function apiDeletePath(p) {
  const encoded = encodePath(p)
  return request(`/api/files/${encoded}`, { method: 'DELETE' })
}

export function apiUploadFile(dir = '', file) {
  const q = encodeURIComponent(dir || '')
  const fd = new FormData()
  fd.append('file', file)
  return request(`/api/files/upload?dir=${q}`, { method: 'POST', body: fd })
}

// Domains API
export function apiListDomains() {
  return request('/api/domains/')
}

// File Manager extra actions
export function apiRenamePath(p, newName) {
  return request('/api/files/rename', { method: 'POST', body: { path: p, newName } })
}

export function apiMovePath(from, toDir = '') {
  return request('/api/files/move', { method: 'POST', body: { from, toDir } })
}

export function apiCopyPath(from, toDir = '') {
  return request('/api/files/copy', { method: 'POST', body: { from, toDir } })
}

export async function apiDownloadFile(p) {
  const token = useAuthStore.getState().token
  const encoded = encodePath(p)
  const res = await fetch(`${API_URL}/api/files/download/${encoded}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
  if (!res.ok) throw new Error('Download failed')
  return await res.blob()
}

export function apiCreateDomain(name, type) {
  return request('/api/domains/', { method: 'POST', body: { name, type } })
}

export function apiDeleteDomain(id) {
  return request(`/api/domains/${id}`, { method: 'DELETE' })
}

// FTP API
export function apiListFTP() {
  return request('/api/ftp/')
}

export function apiCreateFTP(username, password, homeDir = '') {
  return request('/api/ftp/', { method: 'POST', body: { username, password, homeDir } })
}

export function apiUpdateFTPStatus(id, status) {
  return request(`/api/ftp/${id}/status`, { method: 'PATCH', body: { status } })
}

export function apiResetFTPPassword(id, password) {
  return request(`/api/ftp/${id}/reset-password`, { method: 'POST', body: { password } })
}

export function apiDeleteFTP(id) {
  return request(`/api/ftp/${id}`, { method: 'DELETE' })
}

// SSL API
export function apiSSLListDomains() {
  return request('/api/ssl/domains')
}

export function apiSSLIssue(domainId) {
  return request('/api/ssl/issue', { method: 'POST', body: { domainId } })
}

export function apiSSLRevoke(id) {
  return request(`/api/ssl/${id}/revoke`, { method: 'POST' })
}

export function apiSSLDelete(id) {
  return request(`/api/ssl/${id}`, { method: 'DELETE' })
}

// Databases API
export function apiListDatabases() {
  return request('/api/db/')
}

export function apiCreateDatabase(engine, name) {
  return request('/api/db/', { method: 'POST', body: { engine, name } })
}

export function apiDeleteDatabase(id) {
  return request(`/api/db/${id}`, { method: 'DELETE' })
}

export function apiCreateDbUser(dbId, username, password, host) {
  return request(`/api/db/${dbId}/users`, { method: 'POST', body: { username, password, host } })
}

export function apiResetDbUserPassword(userId, password) {
  return request(`/api/db/users/${userId}/reset-password`, { method: 'POST', body: { password } })
}

export function apiDeleteDbUser(userId) {
  return request(`/api/db/users/${userId}`, { method: 'DELETE' })
}

// Email API
export function apiListEmailAccounts(domainId) {
  const qs = domainId ? `?domainId=${encodeURIComponent(domainId)}` : ''
  return request(`/api/email/accounts${qs}`)
}

export function apiCreateEmailAccount(domainId, localPart, password, quotaMb) {
  const body = { domainId, localPart, password }
  if (quotaMb) body.quotaMb = quotaMb
  return request('/api/email/accounts', { method: 'POST', body })
}

export function apiUpdateEmailStatus(id, status) {
  return request(`/api/email/accounts/${id}/status`, { method: 'PATCH', body: { status } })
}

export function apiResetEmailPassword(id, password) {
  return request(`/api/email/accounts/${id}/reset-password`, { method: 'POST', body: { password } })
}

export function apiDeleteEmailAccount(id) {
  return request(`/api/email/accounts/${id}`, { method: 'DELETE' })
}

export function apiListEmailForwarders(domainId) {
  const qs = domainId ? `?domainId=${encodeURIComponent(domainId)}` : ''
  return request(`/api/email/forwarders${qs}`)
}

export function apiCreateEmailForwarder(sourceDomainId, sourceLocalPart, destinationEmail) {
  return request('/api/email/forwarders', { method: 'POST', body: { sourceDomainId, sourceLocalPart, destinationEmail } })
}

export function apiDeleteEmailForwarder(id) {
  return request(`/api/email/forwarders/${id}`, { method: 'DELETE' })
}
