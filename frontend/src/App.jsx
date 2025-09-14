import { Routes, Route, Navigate, Link } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import FileManager from './pages/FileManager'
import Domains from './pages/Domains'
import FTP from './pages/FTP'
import SSL from './pages/SSL'
import Databases from './pages/Databases'
import Email from './pages/Email'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'

export default function App() {
  return (
    <div className="min-h-screen text-slate-800">
      <Navbar />
      <main className="max-w-5xl mx-auto p-4">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/files"
            element={
              <ProtectedRoute>
                <FileManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/domains"
            element={
              <ProtectedRoute>
                <Domains />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ftp"
            element={
              <ProtectedRoute>
                <FTP />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ssl"
            element={
              <ProtectedRoute>
                <SSL />
              </ProtectedRoute>
            }
          />
          <Route
            path="/databases"
            element={
              <ProtectedRoute>
                <Databases />
              </ProtectedRoute>
            }
          />
          <Route
            path="/email"
            element={
              <ProtectedRoute>
                <Email />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  )
}

function NotFound() {
  return (
    <div className="py-20 text-center">
      <h1 className="text-3xl font-bold">404 - Not Found</h1>
      <p className="text-slate-500 mt-2">The page you are looking for does not exist.</p>
      <Link className="inline-block mt-6 text-blue-600 hover:underline" to="/">Go Home</Link>
    </div>
  )
}
