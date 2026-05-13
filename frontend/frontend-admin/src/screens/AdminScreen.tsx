import { useState } from 'react'
import { Building2, Users, Clock, AlertTriangle, Search, Edit } from 'lucide-react'
import Header from '../components/Header'
import SuccessMessage from '../components/SuccessMessage'
import ToggleSwitch from '../components/ToggleSwitch'
import { organizations, consentPurposes, ConsentPurpose } from '../data/mockData'

export default function AdminScreen() {
  const [successMsg, setSuccessMsg] = useState('')
  const [orgSearch, setOrgSearch] = useState('')
  const [purposes, setPurposes] = useState<ConsentPurpose[]>(consentPurposes)

  const [slaConfig, setSlaConfig] = useState({
    complaintStandard: 48,
    complaintAtRisk: 36,
    complaintBreach: 24,
    regulatorStandard: 15,
    regulatorUrgent: 7,
    consentRenewal: 30,
  })

  const [riskConfig, setRiskConfig] = useState({
    expiryWarning: 60,
    expiryCritical: 30,
    clusterHigh: 3,
    clusterPeriod: 90,
    gracePeriod: 7,
    autoSuspend: 14,
    withdrawalRate: 5,
  })

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  const togglePurpose = (id: string) => {
    setPurposes((prev) =>
      prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p))
    )
  }

  const toggleField = (purposeId: string, fieldName: string) => {
    setPurposes((prev) =>
      prev.map((p) =>
        p.id === purposeId
          ? {
              ...p,
              fields: p.fields.map((f) =>
                f.name === fieldName ? { ...f, checked: !f.checked } : f
              ),
            }
          : p
      )
    )
  }

  const filteredOrgs = organizations.filter((o) =>
    !orgSearch || o.name.toLowerCase().includes(orgSearch.toLowerCase())
  )

  const orgStatusColors = {
    Active: { bg: '#ECFDF5', text: '#065F46', border: '#A7F3D0' },
    Pending: { bg: '#FFFBEB', text: '#92400E', border: '#FCD34D' },
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', backgroundColor: '#F8F9FA', minHeight: '100vh' }}>
      <Header />

      <main className="p-8 overflow-auto" style={{ paddingTop: 72 + 32 }}>
        {successMsg && (
          <SuccessMessage
            message={successMsg}
            subtext="All users will be notified via email and in-app"
            onClose={() => setSuccessMsg('')}
          />
        )}

        <h1 className="text-2xl font-semibold mb-6" style={{ color: '#0A2540' }}>
          Admin Settings
        </h1>

        {/* KPI Cards */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          {[
            { icon: <Building2 className="w-8 h-8" style={{ color: '#00C4B4' }} />, value: 142, label: 'Total Organizations' },
            { icon: <Users className="w-8 h-8" style={{ color: '#00C4B4' }} />, value: 89, label: 'Active DPOs' },
            { icon: <Clock className="w-8 h-8" style={{ color: '#00C4B4' }} />, value: 7, label: 'Pending Approvals' },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="bg-white rounded-xl p-6"
              style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
            >
              <div className="flex items-start justify-between">
                {kpi.icon}
                <p className="text-3xl font-semibold" style={{ color: '#0A2540' }}>{kpi.value}</p>
              </div>
              <p className="text-sm text-gray-600 mt-3">{kpi.label}</p>
            </div>
          ))}
        </div>

        {/* SLA & Risk Configuration */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* SLA Threshold */}
          <div
            className="bg-white rounded-xl p-6"
            style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
          >
            <div className="flex items-center gap-2 mb-5">
              <Clock className="w-5 h-5" style={{ color: '#00C4B4' }} />
              <h2 className="text-base font-semibold" style={{ color: '#0A2540' }}>
                SLA Threshold Configuration
              </h2>
            </div>

            <div className="space-y-4">
              {/* Complaint Resolution */}
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 mb-3">Complaint Resolution Time</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Standard', key: 'complaintStandard' as const, suffix: 'hrs' },
                    { label: 'At Risk', key: 'complaintAtRisk' as const, suffix: 'hrs' },
                    { label: 'Breach', key: 'complaintBreach' as const, suffix: 'hrs' },
                  ].map((f) => (
                    <div key={f.key}>
                      <p className="text-xs text-gray-500 mb-1">{f.label}</p>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={slaConfig[f.key]}
                          onChange={(e) => setSlaConfig((prev) => ({ ...prev, [f.key]: Number(e.target.value) }))}
                          className="w-full text-sm border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1"
                        />
                        <span className="text-xs text-gray-500">{f.suffix}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Regulator Response */}
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 mb-3">Regulator Response Time</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Standard Response', key: 'regulatorStandard' as const, suffix: 'days' },
                    { label: 'Urgent Response', key: 'regulatorUrgent' as const, suffix: 'days' },
                  ].map((f) => (
                    <div key={f.key}>
                      <p className="text-xs text-gray-500 mb-1">{f.label}</p>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={slaConfig[f.key]}
                          onChange={(e) => setSlaConfig((prev) => ({ ...prev, [f.key]: Number(e.target.value) }))}
                          className="w-full text-sm border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1"
                        />
                        <span className="text-xs text-gray-500">{f.suffix}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Consent Renewal */}
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 mb-3">Consent Renewal Reminder</p>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Days before expiry</p>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={slaConfig.consentRenewal}
                      onChange={(e) => setSlaConfig((prev) => ({ ...prev, consentRenewal: Number(e.target.value) }))}
                      className="w-24 text-sm border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1"
                    />
                    <span className="text-xs text-gray-500">days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Threshold */}
          <div
            className="bg-white rounded-xl p-6"
            style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
          >
            <div className="flex items-center gap-2 mb-5">
              <AlertTriangle className="w-5 h-5" style={{ color: '#00C4B4' }} />
              <h2 className="text-base font-semibold" style={{ color: '#0A2540' }}>
                Risk Threshold Configuration
              </h2>
            </div>

            <div className="space-y-4">
              {/* Expiry Alert */}
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 mb-3">Consent Expiry Alert Thresholds</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Warning', key: 'expiryWarning' as const },
                    { label: 'Critical', key: 'expiryCritical' as const },
                  ].map((f) => (
                    <div key={f.key}>
                      <p className="text-xs text-gray-500 mb-1">{f.label}</p>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={riskConfig[f.key]}
                          onChange={(e) => setRiskConfig((prev) => ({ ...prev, [f.key]: Number(e.target.value) }))}
                          className="w-full text-sm border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1"
                        />
                        <span className="text-xs text-gray-500">days</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Complaint Clustering */}
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 mb-3">Complaint Clustering Alert</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'High Risk Threshold', key: 'clusterHigh' as const, suffix: 'complaints' },
                    { label: 'Time Period', key: 'clusterPeriod' as const, suffix: 'days' },
                  ].map((f) => (
                    <div key={f.key}>
                      <p className="text-xs text-gray-500 mb-1">{f.label}</p>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={riskConfig[f.key]}
                          onChange={(e) => setRiskConfig((prev) => ({ ...prev, [f.key]: Number(e.target.value) }))}
                          className="w-full text-sm border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1"
                        />
                        <span className="text-xs text-gray-500 whitespace-nowrap">{f.suffix}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Missing Consent */}
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 mb-3">Missing Consent Alert</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Grace Period', key: 'gracePeriod' as const, suffix: 'days' },
                    { label: 'Auto-Suspend After', key: 'autoSuspend' as const, suffix: 'days' },
                  ].map((f) => (
                    <div key={f.key}>
                      <p className="text-xs text-gray-500 mb-1">{f.label}</p>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={riskConfig[f.key]}
                          onChange={(e) => setRiskConfig((prev) => ({ ...prev, [f.key]: Number(e.target.value) }))}
                          className="w-full text-sm border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1"
                        />
                        <span className="text-xs text-gray-500">{f.suffix}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Withdrawal Rate */}
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 mb-3">Withdrawal Rate Alert</p>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Alert threshold per month</p>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={riskConfig.withdrawalRate}
                      step="0.1"
                      onChange={(e) => setRiskConfig((prev) => ({ ...prev, withdrawalRate: Number(e.target.value) }))}
                      className="w-24 text-sm border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1"
                    />
                    <span className="text-xs text-gray-500">% per month</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Organizations Table */}
        <div
          className="bg-white rounded-xl p-6 mb-6"
          style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold" style={{ color: '#0A2540' }}>
              Organizations
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={orgSearch}
                onChange={(e) => setOrgSearch(e.target.value)}
                placeholder="Search organizations..."
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2"
              />
            </div>
          </div>
          <div className="overflow-hidden rounded-xl border border-gray-200">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {['Organization', 'DPO Email', 'Status', 'Users', 'Total Consents', 'Actions'].map((h) => (
                    <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrgs.map((org) => {
                  const sc = orgStatusColors[org.status]
                  return (
                    <tr key={org.name} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium" style={{ color: '#0A2540' }}>{org.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{org.dpoEmail}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 text-xs font-medium rounded-full border"
                          style={{ backgroundColor: sc.bg, color: sc.text, borderColor: sc.border }}>
                          {org.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{org.users}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{org.totalConsents.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <button className="text-xs hover:underline flex items-center gap-1" style={{ color: '#00C4B4' }}>
                          <Edit className="w-3 h-3" />
                          Edit
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Consent Form & Purposes */}
        <div
          className="bg-white rounded-xl p-6"
          style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
        >
          <h2 className="text-base font-semibold mb-6" style={{ color: '#0A2540' }}>
            Consent Form & Purposes
          </h2>

          <div className="space-y-4">
            {purposes.map((purpose) => (
              <div key={purpose.id} className="border border-gray-200 rounded-xl p-5">
                {/* Header Row */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-semibold" style={{ color: '#0A2540' }}>{purpose.title}</h3>
                    <span
                      className="px-2 py-0.5 text-xs font-medium rounded-full border"
                      style={
                        purpose.type === 'MANDATORY'
                          ? { backgroundColor: '#F8FAFC', color: '#334155', borderColor: '#CBD5E1' }
                          : { backgroundColor: '#F0FDFA', color: '#0F766E', borderColor: '#99F6E4' }
                      }
                    >
                      {purpose.type}
                    </span>
                  </div>
                  <ToggleSwitch checked={purpose.enabled} onChange={() => togglePurpose(purpose.id)} />
                </div>

                <p className="text-sm text-gray-600 mb-4">{purpose.description}</p>

                <div className="grid grid-cols-2 gap-4">
                  {/* Data Fields */}
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">Data Fields</p>
                    <div className="space-y-1.5">
                      {purpose.fields.map((field) => (
                        <label key={field.name} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={field.checked}
                            onChange={() => toggleField(purpose.id, field.name)}
                            className="w-4 h-4 rounded border-gray-300"
                          />
                          <span className="text-sm text-gray-700">{field.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Validity Period */}
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">Validity Period</p>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          defaultValue={purpose.validityDays}
                          className="w-20 text-sm border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1"
                        />
                        <span className="text-sm text-gray-600">days ({purpose.validityLabel})</span>
                      </div>
                    </div>

                    {/* Notice Text */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Notice Text Preview</p>
                        <button className="text-xs flex items-center gap-1 hover:underline" style={{ color: '#00C4B4' }}>
                          <Edit className="w-3 h-3" /> Edit
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        defaultValue={purpose.noticeText}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={() => showSuccess('Rules updated successfully')}
              className="px-6 py-3 text-white text-sm font-medium rounded-xl transition-colors"
              style={{ backgroundColor: '#00C4B4' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#00B3A3')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#00C4B4')}
            >
              Update Rules
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
