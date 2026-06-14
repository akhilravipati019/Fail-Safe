import { Link } from 'react-router-dom'

export default function SiteHeader({ backTo = '/' }: { backTo?: string }) {
  return (
    <header className="border-b border-[#e5e5e7] bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1d1d1f] text-sm font-semibold text-white">
            FS
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight text-[#1d1d1f]">FAILSAFE</h1>
            <p className="text-xs text-[#86868b]">Early-warning dashboard for at-risk students</p>
          </div>
        </Link>
        <Link
          to={backTo}
          className="rounded-full border border-[#d2d2d7] px-4 py-1.5 text-sm font-medium text-[#1d1d1f] transition-colors hover:bg-[#f5f5f7]"
        >
          {backTo === '/' ? 'Back to dashboard' : 'Back'}
        </Link>
      </div>
    </header>
  )
}
