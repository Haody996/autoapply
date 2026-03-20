import { useQuery } from '@tanstack/react-query'
import { Users, Mail, MapPin, Briefcase, Activity, TrendingUp } from 'lucide-react'
import api from '../lib/api'
import Spinner from '../components/ui/Spinner'
import { format } from 'date-fns'

interface AdminStats {
  stats: {
    totalUsers: number
    usersToday: number
    usersThisWeek: number
    usersThisMonth: number
    totalDigestRuns: number
    digestRunsThisWeek: number
    usersWithDigestEnabled: number
  }
  users: {
    id: string
    email: string
    createdAt: string
    signupMethod: string
    keywords: string
    location: string
    digestEnabled: boolean
    hasRunDigest: boolean
  }[]
  topLocations: { location: string; count: number }[]
  topKeywords: { keywords: string; count: number }[]
}

function StatCard({ icon: Icon, label, value, sub }: { icon: any; label: string; value: number; sub?: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
          <Icon className="w-4.5 h-4.5 text-indigo-600 w-5 h-5" />
        </div>
        <span className="text-sm text-slate-500 font-medium">{label}</span>
      </div>
      <p className="text-3xl font-bold text-slate-900">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  )
}

export default function Admin() {
  const { data, isLoading, error } = useQuery<AdminStats>({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const { data } = await api.get('/admin/stats')
      return data
    },
  })

  if (isLoading) return <div className="flex justify-center py-20"><Spinner /></div>
  if (error) return <div className="p-8 text-red-600">Failed to load admin data.</div>

  const { stats, users, topLocations, topKeywords } = data!

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Platform overview and user activity</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Users" value={stats.totalUsers} />
        <StatCard icon={TrendingUp} label="New Today" value={stats.usersToday} />
        <StatCard icon={TrendingUp} label="New This Week" value={stats.usersThisWeek} />
        <StatCard icon={TrendingUp} label="New This Month" value={stats.usersThisMonth} />
        <StatCard icon={Activity} label="Total Digest Runs" value={stats.totalDigestRuns} />
        <StatCard icon={Activity} label="Digest Runs (7d)" value={stats.digestRunsThisWeek} />
        <StatCard icon={Mail} label="Digest Enabled" value={stats.usersWithDigestEnabled} sub="users with daily email on" />
      </div>

      {/* Top locations + keywords */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-4 h-4 text-indigo-500" />
            <h2 className="font-semibold text-slate-900">Top Job Locations</h2>
          </div>
          {topLocations.length === 0 ? (
            <p className="text-sm text-slate-400">No data yet</p>
          ) : (
            <ul className="space-y-2">
              {topLocations.map(({ location, count }) => (
                <li key={location} className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">{location}</span>
                  <span className="text-xs font-semibold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">{count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="w-4 h-4 text-indigo-500" />
            <h2 className="font-semibold text-slate-900">Top Job Keywords</h2>
          </div>
          {topKeywords.length === 0 ? (
            <p className="text-sm text-slate-400">No data yet</p>
          ) : (
            <ul className="space-y-2">
              {topKeywords.map(({ keywords, count }) => (
                <li key={keywords} className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">{keywords}</span>
                  <span className="text-xs font-semibold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">{count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Users table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-500" />
          <h2 className="font-semibold text-slate-900">All Users</h2>
          <span className="ml-auto text-xs text-slate-400">{users.length} shown</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Signed Up</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Method</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Keywords</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Location</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Digest</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Has Run</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-slate-800">{u.email}</td>
                  <td className="px-5 py-3 text-slate-500">{format(new Date(u.createdAt), 'MMM d, yyyy HH:mm')}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${u.signupMethod === 'Google' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
                      {u.signupMethod}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-500 max-w-[160px] truncate">{u.keywords || '—'}</td>
                  <td className="px-5 py-3 text-slate-500">{u.location || '—'}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${u.digestEnabled ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                      {u.digestEnabled ? 'On' : 'Off'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${u.hasRunDigest ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                      {u.hasRunDigest ? 'Yes' : 'No'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
