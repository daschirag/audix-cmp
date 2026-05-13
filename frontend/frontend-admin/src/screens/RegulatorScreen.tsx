import { useState } from 'react'
import { Download, CheckCircle, AlertCircle, Shield, FileText, Upload } from 'lucide-react'
import Header from '../components/Header'
import ToggleSwitch from '../components/ToggleSwitch'
import { regulatorReports, communicationTimeline, reportsData } from '../data/mockData'

const reportStatusColors: Record<string, { bg: string; text: string; border: string }> = {
  Submitted: { bg: '#ECFDF5', text: '#065F46', border: '#A7F3D0' },
  Pending: { bg: '#FFFBEB', text: '#92400E', border: '#FCD34D' },
  Draft: { bg: '#F8FAFC', text: '#334155', border: '#CBD5E1' },
}

export default function RegulatorScreen() {
  const [activeTab, setActiveTab] = useState<'reports' | 'access'>('reports')
  const [reportAccess, setReportAccess] = useState<Record<string, { cmpAdmin: boolean; regulator: boolean }>>(
    Object.fromEntries(reportsData.map((r) => [r.id, { cmpAdmin: r.cmpAdmin, regulator: r.regulator }]))
  )

  const toggleAccess = (id: string, role: 'cmpAdmin' | 'regulator') => {
    setReportAccess((prev) => ({
      ...prev,
      [id]: { ...prev[id], [role]: !prev[id][role] },
    }))
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', backgroundColor: '#F8F9FA', minHeight: '100vh' }}>
      <Header />

      <main className="p-8 overflow-auto" style={{ paddingTop: 72 + 32 }}>
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-6">
          {[
            { key: 'reports', label: 'Regulator Reports & Timeline' },
            { key: 'access', label: 'Access Control Settings' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as 'reports' | 'access')}
              className="pb-3 px-1 mr-8 text-sm font-medium transition-colors border-b-2"
              style={{
                color: activeTab === tab.key ? '#00C4B4' : '#6B7280',
                borderColor: activeTab === tab.key ? '#00C4B4' : 'transparent',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── TAB 1: Reports & Timeline ── */}
        {activeTab === 'reports' && (
          <>
            {/* Reports Table */}
            <div
              className="bg-white rounded-xl p-6 mb-6"
              style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
            >
              <h2 className="text-base font-semibold mb-4" style={{ color: '#0A2540' }}>
                Regulator Reports
              </h2>
              <div className="overflow-hidden rounded-xl border border-gray-200">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      {['Report ID', 'Date', 'Type', 'Regulator', 'Description', 'Status', 'Actions'].map((h) => (
                        <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {regulatorReports.map((r) => {
                      const sc = reportStatusColors[r.status]
                      return (
                        <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium" style={{ color: '#00C4B4' }}>{r.id}</td>
                          <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{r.date}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">{r.type}</td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 text-xs font-medium rounded-full border bg-slate-50 text-slate-700 border-slate-200">
                              {r.regulator}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{r.description}</td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 text-xs font-medium rounded-full border"
                              style={{ backgroundColor: sc.bg, color: sc.text, borderColor: sc.border }}>
                              {r.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button className="flex items-center gap-1 text-xs hover:underline" style={{ color: '#00C4B4' }}>
                              <Download className="w-3 h-3" />
                              Download
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Timeline + Quick Actions */}
            <div className="grid grid-cols-2 gap-6">
              {/* Communication Timeline */}
              <div
                className="bg-white rounded-xl p-6"
                style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
              >
                <h2 className="text-base font-semibold mb-4" style={{ color: '#0A2540' }}>
                  Communication Timeline
                </h2>
                <div className="space-y-4">
                  {communicationTimeline.map((item, i) => (
                    <div key={i} className="flex gap-4">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          backgroundColor: item.status === 'completed' ? '#ECFDF5' : '#FFFBEB',
                        }}
                      >
                        {item.status === 'completed' ? (
                          <CheckCircle className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-amber-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">{item.date}</p>
                        <span className="text-xs px-2 py-0.5 rounded-full border font-medium"
                          style={
                            item.type === 'Notice Received'
                              ? { backgroundColor: '#F8FAFC', color: '#334155', borderColor: '#CBD5E1' }
                              : { backgroundColor: '#F0FDFA', color: '#0F766E', borderColor: '#99F6E4' }
                          }
                        >
                          {item.type}
                        </span>
                        <p className="text-sm text-gray-700 mt-1">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions Panel */}
              <div
                className="bg-white rounded-xl p-6"
                style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
              >
                <h2 className="text-base font-semibold mb-4" style={{ color: '#0A2540' }}>
                  Quick Actions
                </h2>
                <div className="space-y-3 mb-6">
                  <button
                    className="w-full flex items-center gap-2 px-4 py-3 text-white text-sm rounded-xl transition-colors"
                    style={{ backgroundColor: '#00C4B4' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#00B3A3')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#00C4B4')}
                  >
                    <FileText className="w-4 h-4" />
                    Prepare New Regulator Report
                  </button>
                  {[
                    { label: 'Export Compliance Summary', icon: <Download className="w-4 h-4" /> },
                    { label: 'Generate Consent Proof Pack', icon: <FileText className="w-4 h-4" /> },
                    { label: 'Download Audit Logs', icon: <Download className="w-4 h-4" /> },
                  ].map((btn) => (
                    <button
                      key={btn.label}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm rounded-xl border-2 transition-all"
                      style={{ borderColor: '#00C4B4', color: '#00C4B4', backgroundColor: '#ffffff' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#00C4B4'
                        e.currentTarget.style.color = '#ffffff'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#ffffff'
                        e.currentTarget.style.color = '#00C4B4'
                      }}
                    >
                      {btn.icon}
                      {btn.label}
                    </button>
                  ))}
                </div>

                {/* Compliance Status */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <p className="text-sm font-medium mb-3" style={{ color: '#0A2540' }}>
                    Compliance Status
                  </p>
                  <div className="space-y-2">
                    {[
                      { label: 'SEBI Compliance', status: 'Up to date', ok: true },
                      { label: 'RBI Compliance', status: 'Action Required', ok: false },
                      { label: 'DPDPA Compliance', status: 'Up to date', ok: true },
                    ].map((row) => (
                      <div key={row.label} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{row.label}</span>
                        <span
                          className="text-sm font-medium flex items-center gap-1"
                          style={{ color: row.ok ? '#065F46' : '#92400E' }}
                        >
                          {row.ok ? '✓' : '⚠'} {row.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── TAB 2: Access Control ── */}
        {activeTab === 'access' && (
          <div
            className="bg-white rounded-xl p-6"
            style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6" style={{ color: '#00C4B4' }} />
              <div>
                <h2 className="text-base font-semibold" style={{ color: '#0A2540' }}>
                  Access Control Settings
                </h2>
                <p className="text-sm text-gray-600">
                  Configure which reports are visible to CMP Admin and Regulators
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-1/2">
                      Report Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-1/3">
                      Description
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      <div className="flex flex-col items-center gap-1">
                        <Shield className="w-4 h-4" />
                        CMP Admin
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      <div className="flex flex-col items-center gap-1">
                        <Upload className="w-4 h-4" />
                        Regulator
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reportsData.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-700">{report.name}</td>
                      <td className="px-6 py-4 text-xs text-gray-600">{report.description}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center">
                          <ToggleSwitch
                            checked={reportAccess[report.id]?.cmpAdmin ?? report.cmpAdmin}
                            onChange={() => toggleAccess(report.id, 'cmpAdmin')}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center">
                          <ToggleSwitch
                            checked={reportAccess[report.id]?.regulator ?? report.regulator}
                            onChange={() => toggleAccess(report.id, 'regulator')}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button className="px-6 py-3 border border-gray-300 rounded-xl text-sm hover:bg-gray-50 transition-colors">
                Reset
              </button>
              <button
                className="px-6 py-3 text-white text-sm font-medium rounded-xl transition-colors"
                style={{ backgroundColor: '#00C4B4' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#00B3A3')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#00C4B4')}
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
