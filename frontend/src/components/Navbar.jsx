import { Link, useNavigate } from 'react-router-dom'
import { PanelLeft, LogOut } from 'lucide-react'
import useAuthStore from '../store/authStore'

export default function Navbar() {
  const navigate = useNavigate()
  const { token, user, logout } = useAuthStore()

  return (
    <header className="border-b bg-white/80 backdrop-blur">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <PanelLeft className="w-5 h-5" />
          Desi Panel
        </Link>
        <nav className="flex items-center gap-4">
          {!token ? (
            <>
              <Link className="text-sm text-slate-600 hover:text-slate-900" to="/login">Login</Link>
              <Link className="text-sm text-white bg-slate-900 px-3 py-1.5 rounded hover:bg-black" to="/register">Register</Link>
            </>
          ) : (
            <>
              <Link className="text-sm text-slate-600 hover:text-slate-900" to="/dashboard">Dashboard</Link>
              <Link className="text-sm text-slate-600 hover:text-slate-900" to="/files">Files</Link>
              <Link className="text-sm text-slate-600 hover:text-slate-900" to="/domains">Domains</Link>
              <Link className="text-sm text-slate-600 hover:text-slate-900" to="/ftp">FTP</Link>
              <Link className="text-sm text-slate-600 hover:text-slate-900" to="/ssl">SSL</Link>
              <Link className="text-sm text-slate-600 hover:text-slate-900" to="/databases">Databases</Link>
              <Link className="text-sm text-slate-600 hover:text-slate-900" to="/email">Email</Link>
              <span className="text-sm text-slate-600">{user?.email}</span>
              <button
                onClick={() => { logout(); navigate('/login') }}
                className="inline-flex items-center gap-1 text-sm text-slate-700 hover:text-black"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
