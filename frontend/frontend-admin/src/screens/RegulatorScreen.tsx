import { useState, useEffect } from 'react'
import { Download, CheckCircle, AlertCircle, Shield, FileText, Upload } from 'lucide-react'
import Header from '../components/Header'
import ToggleSwitch from '../components/ToggleSwitch'
import { regulatorReports, communicationTimeline, reportsData } from '../data/mockData'

const BASE_URL = 'http://localhost:3001'

const reportStatusColors: Record<string, { bg: string; text: string; border: string }> = {
  Submitted: { bg: '#ECFDF5', text: '#065F46', border: '#A7F3D0' },
  Pending:   { bg: '#FFFBEB', text: '#92400E', border: '#FCD34D' },
  Draft:     { bg: '#F8FAFC', text: '#334155', border: '#CBD5E1' },
}

export default function RegulatorScreen() {
  const [activeTab, setActiveTab]   = useState<'reports' | 'access'>('reports')
  const [successMsg, setSuccessMsg] = useState('')
  const [reportAccess, setReportAccess] = useState<Record<string, { cmpAdmin: boolean; regulator: boolean }>>(
    Object.fromEntries(reportsData.map((r) => [r.id, { cmpAdmin: r.cmpAdmin, regulator: r.regulator }]))
  )

  // Load saved settings from database on mount
  useEffect(() => {
    const t = sessionStorage.getItem('accessToken')
    if (!t) return
    fetch(`${BASE_URL}/dashboard/access-control`, {
      headers: { Authorization: `Bearer ${t}` }
    })
      .then(r => r.json())
      .then(data => { if (data.success && data.data) setReportAccess(data.data) })
      .catch(() => {})
  }, [])

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  const token = () => sessionStorage.getItem('accessToken')

  const toggleAccess = (id: string, role: 'cmpAdmin' | 'regulator') => {
    setReportAccess((prev) => ({
      ...prev,
      [id]: { ...prev[id], [role]: !prev[id][role] },
    }))
  }

  const handleSaveAccess = async () => {
    try {
      const res  = await fetch(`${BASE_URL}/dashboard/access-control`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body:    JSON.stringify({ settings: reportAccess })
      })
      const data = await res.json()
      if (data.success) {
        sessionStorage.setItem('reportAccess', JSON.stringify(reportAccess))
        showSuccess('Access control settings saved to database')
      } else {
        showSuccess('Save failed — ' + data.message)
      }
    } catch {
      showSuccess('Save failed — server error')
    }
  }

  const handleResetAccess = async () => {
    const defaults = Object.fromEntries(
      reportsData.map((r) => [r.id, { cmpAdmin: r.cmpAdmin, regulator: r.regulator }])
    )
    setReportAccess(defaults)
    try {
      await fetch(`${BASE_URL}/dashboard/access-control`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body:    JSON.stringify({ settings: defaults })
      })
    } catch {}
    sessionStorage.removeItem('reportAccess')
    showSuccess('Access control settings reset to defaults')
  }

  const downloadCSV = (rows: string[][], filename: string) => {
    const csv  = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = filename; a.click()
    URL.revokeObjectURL(url)
  }

  const handlePrepareReport = () => {
    showSuccess('New regulator report prepared and queued for submission')
  }

  const handleDownloadReport = (reportId: string) => {
    downloadCSV([
      [`Audix CMP - Regulator Report ${reportId}`],
      ['Generated', new Date().toISOString()],
      ['Report ID', reportId],
      ['Platform', 'Audix CMP'],
      ['Compliance', 'DPDPA 2023'],
    ], `report_${reportId}.csv`)
    showSuccess(`Report ${reportId} downloaded`)
  }

  const handleExportComplianceSummary = async () => {
    try {
      const [s, c] = await Promise.all([
        fetch(`${BASE_URL}/dashboard/summary`,   { headers: { Authorization: `Bearer ${token()}` } }),
        fetch(`${BASE_URL}/complaints`,           { headers: { Authorization: `Bearer ${token()}` } }),
      ])
      const summary    = (await s.json()).data
      const complaints = (await c.json()).data || []
      downloadCSV([
        ['Audix CMP - Compliance Summary'],
        ['Generated', new Date().toISOString()],
        [''],
        ['CONSENT METRICS'],
        ['Active Consents',    String(summary.totalActiveConsents.value)],
        ['Withdrawn Consents', String(summary.withdrawnConsents.value)],
        ['Expired Consents',   String(summary.expiredConsents.value)],
        ['Pending Renewals',   String(summary.pendingRenewals.value)],
        [''],
        ['COMPLAINT METRICS'],
        ['Total',        String(complaints.length)],
        ['Open',         String(complaints.filter((c: any) => c.status === 'RECEIVED').length)],
        ['Under Review', String(complaints.filter((c: any) => c.status === 'UNDER_REVIEW').length)],
        ['Escalated',    String(complaints.filter((c: any) => c.status === 'ESCALATED').length)],
        ['Closed',       String(complaints.filter((c: any) => c.status === 'CLOSED').length)],
      ], `compliance_summary_${new Date().toISOString().split('T')[0]}.csv`)
      showSuccess('Compliance summary exported')
    } catch {
      showSuccess('Export failed — please try again')
    }
  }

  const handleGenerateConsentProofPack = async () => {
    try {
      const res  = await fetch(`${BASE_URL}/consent`, { headers: { Authorization: `Bearer ${token()}` } })
      const data = (await res.json()).data || []
      downloadCSV([
        ['Audix CMP - Consent Proof Pack'],
        ['Generated', new Date().toISOString()],
        [''],
        ['Consent ID', 'Principal ID', 'Status', 'Language', 'Notice Version', 'Created At'],
        ...data.map((c: any) => [c.id, c.dataPrincipalId, c.status, c.language, c.noticeVersionId, c.createdAt]),
      ], `consent_proof_pack_${new Date().toISOString().split('T')[0]}.csv`)
      showSuccess('Consent proof pack generated')
    } catch {
      showSuccess('Generation failed — please try again')
    }
  }

  const handleDownloadAuditLogs = async () => {
    try {
      const res  = await fetch(`${BASE_URL}/complaints`, { headers: { Authorization: `Bearer ${token()}` } })
      const data = (await res.json()).data || []
      downloadCSV([
        ['Audix CMP - Activity Logs'],
        ['Generated', new Date().toISOString()],
        [''],
        ['ID', 'Category', 'Status', 'Created At', 'Updated At'],
        ...data.map((c: any) => [c.id, c.category, c.status, c.createdAt, c.updatedAt]),
      ], `audit_logs_${new Date().toISOString().split('T')[0]}.csv`)
      showSuccess('Audit logs downloaded')
    } catch {
      showSuccess('Download failed — please try again')
    }
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', backgroundColor: '#F8F9FA', minHeight: '100vh' }}>
      <Header />
      <main className="p-8 overflow-auto" style={{ paddingTop: 72 + 32 }}>

        {/* Success toast */}
        {successMsg && (
          <div className="fixed top-20 right-6 z-50 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl shadow text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            {successMsg}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-6">
          {[
            { key: 'reports', label: 'Regulator Reports & Timeline' },
            { key: 'access',  label: 'Access Control Settings' },
          ].map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as 'reports' | 'access')}
              className="pb-3 px-1 mr-8 text-sm font-medium transition-colors border-b-2"
              style={{
                color:       activeTab === tab.key ? '#00C4B4' : '#6B7280',
                borderColor: activeTab === tab.key ? '#00C4B4' : 'transparent',
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: Reports & Timeline */}
        {activeTab === 'reports' && (
          <>
            <div className="bg-white rounded-xl p-6 mb-6" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
              <h2 className="text-base font-semibold mb-4" style={{ color: '#0A2540' }}>Regulator Reports</h2>
              <div className="overflow-hidden rounded-xl border border-gray-200">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      {['Report ID','Date','Type','Regulator','Description','Status','Actions'].map((h) => (
                        <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{h}</th>
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
                            <button onClick={() => handleDownloadReport(r.id)}
                              className="flex items-center gap-1 text-xs hover:underline" style={{ color: '#00C4B4' }}>
                              <Download className="w-3 h-3" /> Download
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Communication Timeline */}
              <div className="bg-white rounded-xl p-6" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
                <h2 className="text-base font-semibold mb-4" style={{ color: '#0A2540' }}>Communication Timeline</h2>
                <div className="space-y-4">
                  {communicationTimeline.map((item, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: item.status === 'completed' ? '#ECFDF5' : '#FFFBEB' }}>
                        {item.status === 'completed'
                          ? <CheckCircle className="w-5 h-5 text-emerald-600" />
                          : <AlertCircle className="w-5 h-5 text-amber-600" />}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">{item.date}</p>
                        <span className="text-xs px-2 py-0.5 rounded-full border font-medium"
                          style={item.type === 'Notice Received'
                            ? { backgroundColor: '#F8FAFC', color: '#334155', borderColor: '#CBD5E1' }
                            : { backgroundColor: '#F0FDFA', color: '#0F766E', borderColor: '#99F6E4' }}>
                          {item.type}
                        </span>
                        <p className="text-sm text-gray-700 mt-1">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl p-6" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
                <h2 className="text-base font-semibold mb-4" style={{ color: '#0A2540' }}>Quick Actions</h2>
                <div className="space-y-3 mb-6">
                  <button onClick={handlePrepareReport}
                    className="w-full flex items-center gap-2 px-4 py-3 text-white text-sm rounded-xl transition-colors"
                    style={{ backgroundColor: '#00C4B4' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#00B3A3')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#00C4B4')}>
                    <FileText className="w-4 h-4" /> Prepare New Regulator Report
                  </button>
                  {[
                    { label: 'Export Compliance Summary',   icon: <Download className="w-4 h-4" />, action: handleExportComplianceSummary },
                    { label: 'Generate Consent Proof Pack', icon: <FileText className="w-4 h-4" />, action: handleGenerateConsentProofPack },
                    { label: 'Download Audit Logs',         icon: <Download className="w-4 h-4" />, action: handleDownloadAuditLogs },
                  ].map((btn) => (
                    <button key={btn.label} onClick={btn.action}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm rounded-xl border-2 transition-all"
                      style={{ borderColor: '#00C4B4', color: '#00C4B4', backgroundColor: '#ffffff' }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#00C4B4'; e.currentTarget.style.color = '#ffffff' }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.color = '#00C4B4' }}>
                      {btn.icon} {btn.label}
                    </button>
                  ))}
                </div>

                {/* Compliance Status */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <p className="text-sm font-medium mb-3" style={{ color: '#0A2540' }}>Compliance Status</p>
                  <div className="space-y-2">
                    {[
                      { label: 'SEBI Compliance',  status: 'Up to date',      ok: true },
                      { label: 'RBI Compliance',   status: 'Action Required', ok: false },
                      { label: 'DPDPA Compliance', status: 'Up to date',      ok: true },
                    ].map((row) => (
                      <div key={row.label} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{row.label}</span>
                        <span className="text-sm font-medium flex items-center gap-1"
                          style={{ color: row.ok ? '#065F46' : '#92400E' }}>
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

        {/* TAB 2: Access Control */}
        {activeTab === 'access' && (
          <div className="bg-white rounded-xl p-6" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6" style={{ color: '#00C4B4' }} />
              <div>
                <h2 className="text-base font-semibold" style={{ color: '#0A2540' }}>Access Control Settings</h2>
                <p className="text-sm text-gray-600">Configure which reports are visible to CMP Admin and Regulators</p>
              </div>
            </div>
            <div className="overflow-hidden rounded-xl border border-gray-200">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-1/2">Report Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-1/3">Description</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      <div className="flex flex-col items-center gap-1"><Shield className="w-4 h-4" />CMP Admin</div>
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      <div className="flex flex-col items-center gap-1"><Upload className="w-4 h-4" />Regulator</div>
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
                            onChange={() => toggleAccess(report.id, 'cmpAdmin')} />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center">
                          <ToggleSwitch
                            checked={reportAccess[report.id]?.regulator ?? report.regulator}
                            onChange={() => toggleAccess(report.id, 'regulator')} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={handleResetAccess}
                className="px-6 py-3 border border-gray-300 rounded-xl text-sm hover:bg-gray-50 transition-colors">
                Reset
              </button>
              <button onClick={handleSaveAccess}
                className="px-6 py-3 text-white text-sm font-medium rounded-xl transition-colors"
                style={{ backgroundColor: '#00C4B4' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#00B3A3')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#00C4B4')}>
                Save Changes
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}