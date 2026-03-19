import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Search, FileText, User, LogOut, LogIn, Sparkles } from 'lucide-react'
import { clearAuth, isAuthenticated } from '../../lib/auth'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/jobs', label: 'Find Jobs', icon: Search },
  { to: '/matches', label: 'AI Matches', icon: Sparkles },
  { to: '/applications', label: 'Applications', icon: FileText },
  { to: '/profile', label: 'Profile', icon: User },
]

// Claw gripping a suitcase
function JobsClawIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Briefcase body */}
      <rect x="2" y="12" width="20" height="10" rx="2" fill="#4f46e5" />
      {/* Briefcase handle */}
      <path d="M9 12V10.5C9 9.4 9.9 8.5 11 8.5H13C14.1 8.5 15 9.4 15 10.5V12" stroke="#4f46e5" strokeWidth="1.8" fill="none" />
      {/* Briefcase centre line */}
      <line x1="2" y1="17" x2="22" y2="17" stroke="#a5b4fc" strokeWidth="1.2" />
      {/* Clasp */}
      <rect x="10.5" y="15.5" width="3" height="3" rx="0.8" fill="#a5b4fc" />
      {/* Claw — palm base sitting on top of briefcase */}
      <ellipse cx="12" cy="11.5" rx="3.5" ry="1.8" fill="#6366f1" />
      {/* Three claw fingers curling downward and gripping */}
      {/* Left finger */}
      <path d="M8.8 11 C7.5 9.5 7 7.5 8 6 C8.6 5 9.5 5.2 9.8 6.2 C10 7 9.5 8 9.2 9.5" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Middle finger */}
      <path d="M12 10.8 C12 9 11.8 7 12.5 5.5 C13 4.5 14 4.6 14.1 5.8 C14.2 7 13.5 8.5 13 10" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Right finger */}
      <path d="M15.2 11 C16.2 9.5 17 7.5 16.2 6 C15.7 5 14.8 5.2 14.5 6.2 C14.2 7.2 14.8 8.5 15 10" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Claw tips */}
      <path d="M8 6 C7.2 5.2 7 4.2 7.8 3.8" stroke="#a5b4fc" strokeWidth="1.4" strokeLinecap="round" fill="none" />
      <path d="M12.5 5.5 C12.3 4.5 12.6 3.5 13.5 3.4" stroke="#a5b4fc" strokeWidth="1.4" strokeLinecap="round" fill="none" />
      <path d="M16.2 6 C17 5.2 17.4 4.2 16.6 3.7" stroke="#a5b4fc" strokeWidth="1.4" strokeLinecap="round" fill="none" />
    </svg>
  )
}

export default function Layout() {
  const navigate = useNavigate()
  const authed = isAuthenticated()

  function handleLogout() {
    clearAuth()
    navigate('/')
  }

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-200">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
            <JobsClawIcon className="w-7 h-7" />
            <span className="font-bold text-xl text-slate-900">JobsClaw</span>
          </button>
          <p className="text-xs text-slate-500 mt-1">Job Application Assistant</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200">
          {authed ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </button>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
