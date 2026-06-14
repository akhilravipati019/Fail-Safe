import { Link } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader'

interface Creator {
  name: string
  role: string
  linkedin?: string
}

const CREATORS: Creator[] = [
  {
    name: 'Akhil Ravipati',
    role: 'Civil Engineering, IIT Guwahati (Class of 2027)',
    linkedin: 'https://www.linkedin.com/in/akhilravipati01/',
  },
  {
    name: 'Jagu Sri Mohan',
    role: 'Civil Engineering, IIT Guwahati (Class of 2027)',
  },
  {
    name: 'Varshini Reddy',
    role: 'Civil Engineering, IIT Guwahati (Class of 2027)',
  },
]

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export default function TeamPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader backTo="/about" />

      <main className="mx-auto max-w-6xl px-6 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-[#1d1d1f]">About the creators</h2>
          <p className="mt-3 text-base text-[#86868b]">
            FAILSAFE was built by three Civil Engineering students from IIT Guwahati (Class of 2027) with a shared
            curiosity for technology and a passion for using data to help teachers support students early.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-3">
          {CREATORS.map((creator) => (
            <div
              key={creator.name}
              className="flex flex-col items-center rounded-2xl border border-[#e5e5e7] bg-white p-6 text-center"
            >
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f5f5f7] text-lg font-semibold text-[#1d1d1f]">
                {initials(creator.name)}
              </div>
              <h3 className="text-base font-semibold text-[#1d1d1f]">{creator.name}</h3>
              <p className="mt-1.5 text-sm text-[#86868b]">{creator.role}</p>
              {creator.linkedin && (
                <a
                  href={creator.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#0071e3]/10 px-3 py-1.5 text-xs font-medium text-[#0071e3] transition-colors hover:bg-[#0071e3]/15"
                >
                  LinkedIn
                </a>
              )}
            </div>
          ))}
        </div>

        <div className="mx-auto mt-12 max-w-4xl text-center">
          <Link to="/about" className="text-sm font-medium text-[#0071e3] hover:underline">
            ← About the FAILSAFE project
          </Link>
        </div>
      </main>
    </div>
  )
}
