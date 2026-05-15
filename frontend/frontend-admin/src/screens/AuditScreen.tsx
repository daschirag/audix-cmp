import { useState, useEffect } from 'react'
import { Search, Filter, Download } from 'lucide-react'
import Header from '../components/Header'

const BASE_URL = 'http://localhost:3001'

interface AuditLog {
  id:        string
  actorId:   string
  actorRole: string
  action:    string
  resource:  string | null | Record<string, unknown>
  ip:        string
  timestamp: string
}

function parseResource(resource: string | null | Record<string, unknown>): string {
  if (!resource) return '—'
  // Already an object
  if (typeof resource === 'object') {
    const obj = resource as Record<string, unknown>
    if (obj.collection && obj.id)
      return `${obj.collection} — ${String(obj.id).slice(-8).toUpperCase()}`
    if (obj.cmpAdmin !== undefined)
      return 'Access control settings updated'
    const keys = Object.keys(obj)
    if (keys.length > 0)
      return `${keys[0]}: ${String(obj[keys[0]]).slice(0, 40)}`
    return '—'
  }
  // String — try to parse as JSON
  try {
    const parsed = JSON.parse(resource as string)
    if (parsed.collection && parsed.id)
      return `${parsed.collection} — ${String(parsed.id).slice(-8).toUpperCase()}`
    if (parsed.cmpAdmin !== undefined)
      return 'Access control settings updated'
    const keys = Object.keys(parsed)
    if (keys.length > 0)
      return `${keys[0]}: ${String(parsed[keys[0]]).slice(0, 40)}`
    return '—'
  } catch {
    return String(resource).slice(0, 60)
  }
}

function formatIP(ip: string): string {
  if (ip === '::1' || ip === '::ffff:127.0.0.1') return '127.0.0.1 (local)'
  return ip.replace('::ffff:', '')
}

export default function AuditScreen() {
  const [logs, setLogs]         = useState<AuditLog[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo]     = useState('')
  const [actionFilter, setActionFilter] = useState('All Actions')

  useEffect(() => {
    const token = sessionStorage.getItem('accessToken')
    fetch(`${BASE_URL}/dashboard/audit-logs`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => { if (data.success) setLogs(data.data || []) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const actionOptions = ['All Actions', ...Array.from(new Set(logs.map(l => l.action)))]

  const filtered = logs.filter((log) => {
    const resourceStr = typeof log.resource === 'object' && log.resource
      ? JSON.stringify(log.resource)
      : String(log.resource || '')
    const matchSearch = !search ||
      log.actorId.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      resourceStr.toLowerCase().includes(search.toLowerCase())
    const matchAction = actionFilter === 'All Actions' || log.action === actionFilter
    const logDate     = log.timestamp.split('T')[0]
    const matchFrom   = !dateFrom || logDate >= dateFrom
    const matchTo     = !dateTo   || logDate <= dateTo
    return matchSearch && matchAction && matchFrom && matchTo
  })

  const handleExportCSV = () => {
    const headers = ['Timestamp', 'Actor ID', 'Role', 'Action', 'Resource', 'IP']
    const rows    = filtered.map(l => [
      new Date(l.timestamp).toLocaleString(),
      l.actorId.slice(-8).toUpperCase(),
      l.actorRole, l.action,
      parseResource(l.resource),
      formatIP(l.ip)
    ])
    const csv  = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url
    a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportPDF = () => {
    const content = `
      <html><head><title>Audit Logs</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; font-size: 12px; }
        h1 { color: #0A2540; margin-bottom: 4px; }
        p  { color: #666; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #00C4B4; color: white; padding: 8px; text-align: left; font-size: 11px; }
        td { padding: 6px 8px; border-bottom: 1px solid #eee; font-size: 11px; }
        tr:nth-child(even) { background: #f9fafb; }
      </style></head>
      <body>
        <h1>Audix CMP — Audit Logs</h1>
        <p>Generated: ${new Date().toLocaleString()} | Total Records: ${filtered.length}</p>
        <table>
          <thead><tr>
            <th>Timestamp</th><th>Actor ID</th><th>Role</th><th>Action</th><th>Resource</th><th>IP</th>
          </tr></thead>
          <tbody>
            ${filtered.map(l => `<tr>
              <td>${new Date(l.timestamp).toLocaleString()}</td>
              <td>${l.actorId.slice(-8).toUpperCase()}</td>
              <td>${l.actorRole}</td>
              <td>${l.action}</td>
              <td>${parseResource(l.resource)}</td>
              <td>${formatIP(l.ip)}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </body></html>
    `
    const blob = new Blob([content], { type: 'text/html' })
    const url  = URL.createObjectURL(blob)
    const win  = window.open(url, '_blank')
    if (win) win.onload = () => { win.print(); URL.revokeObjectURL(url) }
  }

  const today        = new Date().toISOString().split('T')[0]
  const todayCount   = logs.filter(l => l.timestamp.startsWith(today)).length
  const uniqueActors = new Set(logs.map(l => l.actorId)).size
  const criticalAct  = logs.filter(l => l.action.includes('access.control')).length
  const failedLogin  = logs.filter(l => l.action.includes('failed')).length

  const stats = [
    { label: 'Total Events Today',   value: todayCount || logs.length, color: 'default' },
    { label: 'Active Admin Users',    value: uniqueActors,              color: 'default' },
    { label: 'Critical Actions',      value: criticalAct,               color: 'default' },
    { label: 'Failed Login Attempts', value: failedLogin,               color: 'rose'    },
  ]

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', backgroundColor: '#F8F9FA', minHeight: '100vh' }}>
      <Header />
      <main className="p-8 overflow-auto" style={{ paddingTop: 72 + 32 }}>
        <h1 className="text-2xl font-semibold mb-6" style={{ color: '#0A2540' }}>Audit Logs</h1>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl p-5"
              style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
              <p className="text-xs text-gray-500 mb-2">{stat.label}</p>
              <p className="text-2xl font-semibold"
                style={{ color: stat.color === 'rose' ? '#9F1239' : '#0A2540' }}>
                {loading ? '—' : stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl p-5 mb-4" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by actor, action, resource..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2" />
            </div>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none bg-white" />
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none bg-white" />
            <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none bg-white">
              {actionOptions.map((a) => <option key={a}>{a}</option>)}
            </select>
            <button className="flex items-center gap-2 px-4 py-2.5 text-white text-sm rounded-xl"
              style={{ backgroundColor: '#00C4B4' }}>
              <Filter className="w-4 h-4" /> Apply
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-3 mb-4">
          <button onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-xl hover:bg-gray-50 bg-white">
            <Download className="w-4 h-4" /> Export PDF
          </button>
          <button onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 text-white text-sm rounded-xl"
            style={{ backgroundColor: '#00C4B4' }}>
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>

        <div className="bg-white rounded-xl overflow-hidden" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['Timestamp','Actor ID','Role','Action','Resource','IP Address'].map((h) => (
                  <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">Loading audit logs...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">No audit logs found</td></tr>
              ) : filtered.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium" style={{ color: '#0A2540' }}>
                    {log.actorId.slice(-8).toUpperCase()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{log.actorRole}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{log.action}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {parseResource(log.resource)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{formatIP(log.ip)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}