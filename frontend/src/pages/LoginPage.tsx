import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) {
    const dest = (location.state as { from?: string } | null)?.from ?? '/'
    return <Navigate to={dest} replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(username, password)
      navigate('/', { replace: true })
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Login failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1d1d1f] text-lg font-semibold text-white">
            FS
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#1d1d1f]">FAILSAFE</h1>
          <p className="mt-1.5 text-sm text-[#86868b]">Faculty sign-in for at-risk student insights</p>
        </div>

        <div className="rounded-2xl border border-[#e5e5e7] bg-white p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-[#1d1d1f]">Username</span>
              <input
                type="text"
                required
                autoFocus
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border border-[#d2d2d7] bg-[#fbfbfd] px-3.5 py-2.5 text-[#1d1d1f] transition-colors focus:border-[#0071e3] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/15"
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-[#1d1d1f]">Password</span>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-[#d2d2d7] bg-[#fbfbfd] px-3.5 py-2.5 text-[#1d1d1f] transition-colors focus:border-[#0071e3] focus:outline-none focus:ring-2 focus:ring-[#0071e3]/15"
              />
            </label>

            {error && (
              <p className="rounded-lg bg-[#ff3b30]/10 px-3 py-2 text-sm text-[#d70015]">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#0071e3] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#0077ed] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-[#86868b]">
          Accounts are provisioned by an administrator. Repeated failed attempts will temporarily lock the account.
        </p>

        <p className="mt-3 flex justify-center gap-4 text-center text-xs">
          <Link to="/about" className="font-medium text-[#0071e3] hover:underline">
            About
          </Link>
          <Link to="/team" className="font-medium text-[#0071e3] hover:underline">
            Team
          </Link>
        </p>
      </div>
    </div>
  )
}
