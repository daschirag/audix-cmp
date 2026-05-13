import { useState } from 'react'
import { Search, Filter, Download } from 'lucide-react'
import Header from '../components/Header'
import { auditLogs, auditStats } from '../data/mockData'

const actionOptions = [
  'All Actions',
  'Updated Complaint Status',
  'Exported Compliance Report',
  'Assigned Complaint Owner',
  'Updated Purpose Rules',
  'Uploaded Evidence',
  'Retrieved Consent Proof',
  'Created New Admin User',
  'Generated Closure Proof',
  'Bulk Status Update',
  'Submitted Regulator Report',
]

export default function AuditScreen() {
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [actionFilter, setActionFilter] = useState('All Actions')

  const filtered = auditLogs.filter((log) => {
    const matchSearch =
      !search ||
      log.adminUser.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.consentId.toLowerCase().includes(search.toLowerCase())
    const matchAction = actionFilter === 'All Actions' || log.action === actionFilter
    return matchSearch && matchAction
  })

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', backgroundColor: '#F8F9FA', minHeight: '100vh' }}>
      <Header />

      <main className="p-8 overflow-auto" style={{ paddingTop: 72 + 32 }}>
        <h1 className="text-2xl font-semibold mb-6" style={{ color: '#0A2540' }}>
          Audit Logs
        </h1>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {auditStats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl p-5"
              style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
            >
              <p className="text-xs text-gray-500 mb-2">{stat.label}</p>
              <p
                className="text-2xl font-semibold"
                style={{ color: stat.color === 'rose' ? '#9F1239' : '#0A2540' }}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Filter Bar */}
        <div
          className="bg-white rounded-xl p-5 mb-4"
          style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
        >
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search audit logs by user, action, consent ID..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2"
              />
            </div>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 bg-white"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 bg-white"
            />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 bg-white"
            >
              {actionOptions.map((a) => <option key={a}>{a}</option>)}
            </select>
            <button
              className="flex items-center gap-2 px-4 py-2.5 text-white text-sm rounded-xl"
              style={{ backgroundColor: '#00C4B4' }}
            >
              <Filter className="w-4 h-4" />
              Apply
            </button>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex justify-end gap-3 mb-4">
          <button className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-xl hover:bg-gray-50 bg-white">
            <Download className="w-4 h-4" />
            Export PDF
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 text-white text-sm rounded-xl"
            style={{ backgroundColor: '#00C4B4' }}
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {/* Audit Table */}
        <div
          className="bg-white rounded-xl overflow-hidden"
          style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
        >
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['Timestamp', 'Admin User', 'Action', 'Consent ID', 'IP Address', 'Details'].map((h) => (
                  <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((log, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{log.timestamp}</td>
                  <td className="px-6 py-4 text-sm font-medium" style={{ color: '#0A2540' }}>{log.adminUser}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{log.action}</td>
                  <td className="px-6 py-4 text-sm font-medium" style={{ color: '#00C4B4' }}>{log.consentId}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{log.ipAddress}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
