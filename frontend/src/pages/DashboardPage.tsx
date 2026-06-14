import { useState } from 'react'
import { Link } from 'react-router-dom'
import CsvUploadPanel from '../components/CsvUploadPanel'
import StudentForm from '../components/StudentForm'
import { useAuth } from '../context/AuthContext'

type Tab = 'csv' | 'single'

export default function DashboardPage() {
  const { logout } = useAuth()
  const [tab, setTab] = useState<Tab>('csv')

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b border-[#e5e5e7] bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1d1d1f] text-sm font-semibold text-white">
              FS
            </div>
            <div>
              <h1 className="text-base font-semibold tracking-tight text-[#1d1d1f]">FAILSAFE</h1>
              <p className="text-xs text-[#86868b]">Early-warning dashboard for at-risk students</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="rounded-full border border-[#d2d2d7] px-4 py-1.5 text-sm font-medium text-[#1d1d1f] transition-colors hover:bg-[#f5f5f7]"
          >
            Log out
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
        <div className="mb-6 inline-flex gap-1 rounded-full border border-[#e5e5e7] bg-white p-1">
          <button
            onClick={() => setTab('csv')}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              tab === 'csv' ? 'bg-[#1d1d1f] text-white' : 'text-[#1d1d1f] hover:bg-[#f5f5f7]'
            }`}
          >
            Upload class CSV
          </button>
          <button
            onClick={() => setTab('single')}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              tab === 'single' ? 'bg-[#1d1d1f] text-white' : 'text-[#1d1d1f] hover:bg-[#f5f5f7]'
            }`}
          >
            Single student check
          </button>
        </div>

        {tab === 'csv' ? <CsvUploadPanel /> : <StudentForm />}
      </main>

      <footer className="border-t border-[#e5e5e7] bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-6 text-sm text-[#86868b] sm:flex-row">
          <p>© {new Date().getFullYear()} FAILSAFE. Early-warning intelligence for educators.</p>
          <div className="flex items-center gap-4">
            <Link to="/about" className="font-medium text-[#0071e3] hover:underline">
              About
            </Link>
            <Link to="/team" className="font-medium text-[#0071e3] hover:underline">
              Team
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
