import { useEffect, useState, useMemo } from 'react'
import { apiListFiles, apiMkdir, apiUploadFile, apiDeletePath, apiRenamePath, apiMovePath, apiCopyPath, apiDownloadFile } from '../services/api'
import { Folder, File, Upload, Plus, Trash2, ArrowLeft, Pencil, Copy, Move, Download } from 'lucide-react'

function joinPath(a = '', b = '') {
  const parts = [...(a || '').split('/').filter(Boolean), ...(b || '').split('/').filter(Boolean)]
  return parts.join('/')
}

function formatBytes(bytes = 0) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export default function FileManager() {
  const [currentPath, setCurrentPath] = useState('')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [folderName, setFolderName] = useState('')
  const [uploading, setUploading] = useState(false)

  const crumbs = useMemo(() => {
    const parts = currentPath.split('/').filter(Boolean)
    const out = []
    let acc = ''
    for (const p of parts) {
      acc = joinPath(acc, p)
      out.push({ label: p, path: acc })
    }
    return out
  }, [currentPath])

  const load = async (p = currentPath) => {
    setLoading(true)
    setError('')
    try {
      const data = await apiListFiles(p)
      setItems(data.items)
      setCurrentPath(data.path || '')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load('') }, [])

  const goUp = () => {
    if (!currentPath) return
    const parts = currentPath.split('/').filter(Boolean)
    parts.pop()
    load(parts.join('/'))
  }

  const onCreateFolder = async (e) => {
    e.preventDefault()
    if (!folderName.trim()) return
    try {
      await apiMkdir(currentPath, folderName.trim())
      setFolderName('')
      await load()
    } catch (e) {
      setError(e.message)
    }
  }

  const onUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')
    try {
      await apiUploadFile(currentPath, file)
      await load()
    } catch (e) {
      setError(e.message)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const onDelete = async (name) => {
    const p = joinPath(currentPath, name)
    if (!confirm(`Delete ${p}?`)) return
    try {
      await apiDeletePath(p)
      await load()
    } catch (e) {
      setError(e.message)
    }
  }

  const onRename = async (name) => {
    const p = joinPath(currentPath, name)
    const newName = prompt(`Rename ${p} to:`, name)
    if (!newName || newName === name) return
    try {
      await apiRenamePath(p, newName.trim())
      await load()
    } catch (e) { setError(e.message) }
  }

  const onMove = async (name) => {
    const p = joinPath(currentPath, name)
    const toDir = prompt('Move to directory (relative path):', currentPath)
    if (toDir == null) return
    try {
      await apiMovePath(p, toDir.trim())
      await load()
    } catch (e) { setError(e.message) }
  }

  const onCopy = async (name) => {
    const p = joinPath(currentPath, name)
    const toDir = prompt('Copy to directory (relative path):', currentPath)
    if (toDir == null) return
    try {
      await apiCopyPath(p, toDir.trim())
      await load()
    } catch (e) { setError(e.message) }
  }

  const onDownload = async (name) => {
    try {
      const p = joinPath(currentPath, name)
      const blob = await apiDownloadFile(p)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = name
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">File Manager</h1>
          <div className="text-sm text-slate-600 mt-1">
            <span className="font-mono">/{currentPath}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="inline-flex items-center gap-1 px-3 py-2 border rounded bg-white hover:bg-slate-50 cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>Upload</span>
            <input type="file" className="hidden" onChange={onUpload} disabled={uploading} />
          </label>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button onClick={goUp} disabled={!currentPath} className="inline-flex items-center gap-1 px-2 py-1.5 border rounded bg-white disabled:opacity-50">
          <ArrowLeft className="w-4 h-4" /> Up
        </button>
        <nav className="text-sm text-slate-600">
          <span className="cursor-pointer hover:underline" onClick={() => load('')}>root</span>
          {crumbs.map((c, i) => (
            <span key={c.path}>
              {' / '}<span className="cursor-pointer hover:underline" onClick={() => load(c.path)}>{c.label}</span>
            </span>
          ))}
        </nav>
      </div>

      <form onSubmit={onCreateFolder} className="mt-4 flex items-center gap-2">
        <input
          type="text"
          placeholder="New folder name"
          className="border rounded px-3 py-2"
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
        />
        <button className="inline-flex items-center gap-1 px-3 py-2 border rounded bg-white hover:bg-slate-50">
          <Plus className="w-4 h-4" /> Create Folder
        </button>
      </form>

      {error && <p className="text-red-600 mt-4">{error}</p>}

      <div className="mt-4 border rounded bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left px-3 py-2">Name</th>
              <th className="text-left px-3 py-2">Type</th>
              <th className="text-left px-3 py-2">Size</th>
              <th className="text-right px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-3 py-4" colSpan={4}>Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td className="px-3 py-6 text-slate-500" colSpan={4}>Empty folder</td></tr>
            ) : (
              items.map((it) => (
                <tr key={it.name} className="border-t">
                  <td className="px-3 py-2">
                    <span
                      className={`inline-flex items-center gap-2 ${it.type === 'dir' ? 'cursor-pointer hover:underline' : ''}`}
                      onClick={() => it.type === 'dir' ? load(joinPath(currentPath, it.name)) : null}
                    >
                      {it.type === 'dir' ? <Folder className="w-4 h-4" /> : <File className="w-4 h-4" />}
                      {it.name}
                    </span>
                  </td>
                  <td className="px-3 py-2">{it.type}</td>
                  <td className="px-3 py-2">{it.type === 'file' ? formatBytes(it.size) : '-'}</td>
                  <td className="px-3 py-2 text-right">
                    <div className="inline-flex items-center gap-3">
                      <button onClick={() => onRename(it.name)} className="inline-flex items-center gap-1 text-slate-700 hover:text-black">
                        <Pencil className="w-4 h-4" /> Rename
                      </button>
                      <button onClick={() => onMove(it.name)} className="inline-flex items-center gap-1 text-slate-700 hover:text-black">
                        <Move className="w-4 h-4" /> Move
                      </button>
                      <button onClick={() => onCopy(it.name)} className="inline-flex items-center gap-1 text-slate-700 hover:text-black">
                        <Copy className="w-4 h-4" /> Copy
                      </button>
                      {it.type === 'file' && (
                        <button onClick={() => onDownload(it.name)} className="inline-flex items-center gap-1 text-slate-700 hover:text-black">
                          <Download className="w-4 h-4" /> Download
                        </button>
                      )}
                      <button onClick={() => onDelete(it.name)} className="inline-flex items-center gap-1 text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    </div>
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
