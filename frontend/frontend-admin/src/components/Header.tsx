import { useNavigate, useLocation } from 'react-router-dom'
import { User } from 'lucide-react'

const tabs = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Complaints', path: '/complaints' },
  { label: 'Regulator', path: '/regulator' },
  { label: 'Audit', path: '/audit' },
]

export default function Header() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 flex items-center px-8"
      style={{ height: 72, backgroundColor: '#0A2540' }}
    >
      {/* Logo */}
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-3 mr-12"
      >
        <div
          className="flex items-center justify-center rounded w-10 h-10 flex-shrink-0"
          style={{ backgroundColor: '#00C4B4' }}
        >
          <span className="text-white text-xl font-semibold">A</span>
        </div>
        <span className="text-white text-lg font-semibold">Audix CMP</span>
      </button>

      {/* Nav Tabs */}
      <nav className="flex items-center gap-8 flex-1">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="relative pb-1 text-sm transition-colors"
              style={{
                color: isActive ? '#ffffff' : 'rgba(255,255,255,0.85)',
                fontWeight: isActive ? 500 : 400,
                paddingBottom: '4px',
              }}
            >
              {tab.label}
              {isActive && (
                <span
                  className="absolute left-0 right-0 rounded-full"
                  style={{
                    bottom: -22,
                    height: 3,
                    backgroundColor: '#00C4B4',
                  }}
                />
              )}
            </button>
          )
        })}
      </nav>

      {/* User Info */}
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.9)' }}>dpo@audix.in</p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.65)' }}>+91 98XXXXXXXX</p>
        </div>
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
        >
          <User className="w-5 h-5 text-white" />
        </div>
      </div>
    </header>
  )
}
