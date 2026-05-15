import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateProfile, validateProfileField, validateComplaint, validateComplaintField } from '../utils/profileValidation';
import '../styles/dashboard.css';

const API = 'http://localhost:3001'

const PURPOSE_NAMES = {
  'purpose-marketing':  'Marketing Communications',
  'purpose-analytics':  'Analytics & Improvement',
  'purpose-kyc':        'KYC Verification',
  'purpose-thirdparty': 'Third Party Sharing',
}
const purposeName = (id) => PURPOSE_NAMES[id] || id

const Icon = ({ d, size = 20 }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
  </svg>
)

const ICONS = {
  consents:   'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  withdraw:   'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636',
  complaints: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  settings:   'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
  check:      'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  user:       'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  shield:     'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  logout:     'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
  warn:       'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  download:   'M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  refresh:    'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
  chevron:    'M9 5l7 7-7 7',
  send:       'M12 19l9 2-9-18-9 18 9-2zm0 0v-8',
  cross:      'M6 18L18 6M6 6l12 12',
  edit:       'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
  mail:       'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  phone:      'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
  close:      'M6 18L18 6M6 6l12 12',
  trash:      'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
}

const NAV_ITEMS = [
  { key: 'consents',   label: 'My Consents',     icon: ICONS.consents   },
  { key: 'withdraw',   label: 'Withdraw Consent', icon: ICONS.withdraw   },
  { key: 'complaints', label: 'Raise Complaint',  icon: ICONS.complaints },
  { key: 'settings',   label: 'Settings',         icon: ICONS.settings   },
]

const NOTIF_ITEMS = [
  { key: 'consentUpdates', label: 'Consent Update Notifications', sub: 'Receive alerts when consents are modified' },
  { key: 'dataAccess',     label: 'Data Access Alerts',           sub: 'Get notified when your data is accessed by third parties' },
  { key: 'regulatory',     label: 'Regulatory Updates',           sub: 'Stay informed about DPDPA compliance changes' },
]

function Modal({ open, children, onClose }) {
  if (!open) return null
  return (
    <div className="modal-overlay open" onClick={e => e.target === e.currentTarget && onClose()}>
      {children}
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab]       = useState('consents')
  const [consents, setConsents]         = useState([])
  const [complaints, setComplaints]     = useState([])
  const [loading, setLoading]           = useState(true)
  const [selectedIds, setSelectedIds]   = useState([])
  const [selectedConsent, setSelectedConsent] = useState(null)
  const [otpValue, setOtpValue]         = useState('')
  const [otpError, setOtpError]         = useState(false)
  const [confirmOpen, setConfirmOpen]   = useState(false)
  const [otpOpen, setOtpOpen]           = useState(false)
  const [successOpen, setSuccessOpen]   = useState(false)
  const [profileOpen, setProfileOpen]   = useState(false)
  const [profileData, setProfileData]   = useState({ name: '', email: '', phone: '' })
  const [profileEdit, setProfileEdit]   = useState({ name: '', email: '', phone: '' })
  const [profileErr, setProfileErr]     = useState({})
  const [profileTouched, setProfileTouched] = useState({})
  const [isEditing, setIsEditing]       = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)
  const [notifSettings, setNotifSettings] = useState({ consentUpdates: true, dataAccess: true, regulatory: false })
  const [notifSaved, setNotifSaved]     = useState(false)
  const [complaint, setComplaint]       = useState({ category: '', priority: '', subject: '', description: '', email: '' })
  const [complaintErr, setComplaintErr] = useState({})
  const [complaintTouched, setComplaintTouched] = useState({})

  const token = () => sessionStorage.getItem('accessToken')
  const user  = () => { try { return JSON.parse(sessionStorage.getItem('user') || '{}') } catch { return {} } }

  useEffect(() => {
    const u = user()
    const email = u?.email || ''
    const name  = email.split('@')[0] || 'Account Holder'
    setProfileData({ name, email, phone: '' })
    setProfileEdit({ name, email, phone: '' })
    if (email) setComplaint(p => ({ ...p, email }))
    if (!token() || !u?.id) { setLoading(false); return }

    fetch(`${API}/consent/status/${u.id}`, { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => r.json())
      .then(data => { if (data.success && Array.isArray(data.data)) setConsents(data.data.filter(c => c.status === 'ACTIVE')) })
      .catch(() => {})

    fetch(`${API}/complaints`, { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => r.json())
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          const mine = data.data.filter(c => c.dataPrincipalId === u.id)
          setComplaints(mine.map(c => ({
            id: c.id, category: c.category, subject: c.subject,
            description: c.description, timestamp: c.createdAt,
            status: c.status === 'RECEIVED' ? 'Submitted' : c.status === 'CLOSED' ? 'Resolved' : 'In Progress',
          })))
        }
      })
      .catch(() => {})

    // Load saved notif settings
    fetch(`${API}/dashboard/access-control`, { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => r.json())
      .then(data => {
        if (data.success && data.data?.notifSettings) setNotifSettings(data.data.notifSettings)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const displayName = profileData.name || 'Account Holder'
  const lastUpdated = consents.length > 0
    ? new Date(consents[0].createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—'

  async function logout() {
    try { await fetch(`${API}/auth/logout`, { method: 'POST', headers: { Authorization: `Bearer ${token()}` } }) } catch {}
    sessionStorage.removeItem('accessToken'); sessionStorage.removeItem('user'); navigate('/auth')
  }

  function openProfile() {
    setProfileEdit({ ...profileData }); setProfileErr({}); setProfileTouched({})
    setIsEditing(false); setProfileSaved(false); setProfileOpen(true)
  }

  function onProfileChange(e) {
    const { name, value } = e.target
    const cleaned = name === 'phone' ? value.replace(/\D/g, '').slice(0, 10) : value
    setProfileEdit(p => ({ ...p, [name]: cleaned }))
    if (profileTouched[name]) setProfileErr(p => ({ ...p, [name]: validateProfileField(name, cleaned) }))
  }

  function onProfileBlur(e) {
    const { name, value } = e.target
    setProfileTouched(p => ({ ...p, [name]: true }))
    setProfileErr(p => ({ ...p, [name]: validateProfileField(name, value) }))
  }

  function saveProfile() {
    setProfileTouched({ name: true, email: true, phone: true })
    const errors = validateProfile(profileEdit)
    setProfileErr(errors)
    if (Object.keys(errors).length > 0) return
    setProfileData({ ...profileEdit }); setIsEditing(false)
    setProfileSaved(true); setTimeout(() => setProfileSaved(false), 3000)
  }

  function cancelEdit() {
    setProfileEdit({ ...profileData }); setProfileErr({}); setProfileTouched({}); setIsEditing(false)
  }

  function toggleItem(id) {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  function processWithdrawals() {
    if (selectedIds.length === 0) { alert('Please select at least one consent to withdraw.'); return }
    setConfirmOpen(true)
  }

  function confirmWithdraw() {
    setConfirmOpen(false); setOtpValue(''); setOtpError(false); setOtpOpen(true)
  }

  async function verifyOTP() {
    if (otpValue.length < 6) { setOtpError(true); return }
    try {
      await Promise.all(selectedIds.map(id =>
        fetch(`${API}/consent/${id}/withdraw`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } })
      ))
      setConsents(prev => prev.filter(c => !selectedIds.includes(c.id)))
      setSelectedIds([]); setOtpOpen(false); setSuccessOpen(true); setActiveTab('consents')
    } catch { alert('Withdrawal failed.'); setOtpOpen(false) }
  }

  function onComplaintChange(e) {
    const { name, value } = e.target
    setComplaint(p => ({ ...p, [name]: value }))
    if (complaintTouched[name]) setComplaintErr(p => ({ ...p, [name]: validateComplaintField(name, value) }))
  }

  function onComplaintBlur(e) {
    const { name, value } = e.target
    setComplaintTouched(p => ({ ...p, [name]: true }))
    setComplaintErr(p => ({ ...p, [name]: validateComplaintField(name, value) }))
  }

  async function submitComplaint(e) {
    e.preventDefault()
    setComplaintTouched({ category: true, priority: true, subject: true, description: true, email: true })
    const errors = validateComplaint(complaint)
    setComplaintErr(errors)
    if (Object.keys(errors).length > 0) return
    const u = user()
    try {
      const res = await fetch(`${API}/complaints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({
          dataPrincipalId: u?.id, consentId: consents[0]?.id || u?.id,
          subject: complaint.subject, description: complaint.description, category: complaint.category,
        })
      })
      const data = await res.json()
      if (data.success) {
        setComplaints(prev => [{ id: data.data.id, ...complaint, status: 'Submitted', timestamp: new Date().toISOString() }, ...prev])
        alert('Complaint submitted successfully.')
        setComplaint({ category: '', priority: '', subject: '', description: '', email: profileData.email || '' })
        setComplaintErr({}); setComplaintTouched({})
      }
    } catch { alert('Failed to submit complaint.') }
  }

  async function saveNotifSettings(key, value) {
    const updated = { ...notifSettings, [key]: value }
    setNotifSettings(updated)
    try {
      await fetch(`${API}/dashboard/access-control`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ settings: { notifSettings: updated } })
      })
      setNotifSaved(true); setTimeout(() => setNotifSaved(false), 2000)
    } catch {}
  }

  function exportCSV() {
    const rows = [
      ['Consent ID', 'Status', 'Purposes', 'Date Granted'],
      ...consents.map(c => [
        c.id, c.status,
        (c.purposes || []).map(p => purposeName(p.purposeId)).join(' | '),
        new Date(c.createdAt).toLocaleDateString('en-IN')
      ])
    ]
    const csv  = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = `consents-${Date.now()}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  function exportPDF() {
    const rows = consents.map(c =>
      `<tr><td style="font-family:monospace;font-size:11px">${c.id.slice(-12)}</td><td>${c.status}</td><td>${(c.purposes || []).map(p => purposeName(p.purposeId)).join(', ')}</td><td>${new Date(c.createdAt).toLocaleDateString('en-IN')}</td></tr>`
    ).join('')
    const html = `<html><head><title>Consent Export</title><style>body{font-family:Arial,sans-serif;padding:30px;color:#0f172a}h1{color:#3b82f6;margin-bottom:4px}p{color:#666;font-size:13px;margin-bottom:20px}table{width:100%;border-collapse:collapse}th{background:#3b82f6;color:white;padding:10px;text-align:left;font-size:12px}td{padding:8px 10px;border-bottom:1px solid #e2e8f0;font-size:12px}tr:nth-child(even){background:#f8fafc}</style></head><body><h1>Audix CMP — Consent Export</h1><p>Generated: ${new Date().toLocaleString()} | User: ${profileData.email} | Total: ${consents.length}</p><table><thead><tr><th>Consent ID</th><th>Status</th><th>Purposes</th><th>Date Granted</th></tr></thead><tbody>${rows}</tbody></table><br><p style="font-size:11px;color:#94a3b8">Protected under DPDPA 2023 | Audix CMP</p></body></html>`
    const win = window.open('', '_blank')
    if (win) { win.document.write(html); win.document.close(); win.print() }
  }

  return (
    <div className="dashboard-root">
      <header className="dashboard-header">
        <div className="header-inner">
          <div className="header-brand">
            <img src="/audix-logo.png" alt="Audix" className="header-logo-img" onError={e => { e.target.style.display = 'none' }} />
            <div className="header-brand-text">
              <h1>Consent Management Platform</h1>
              <p>Manage your data consents</p>
            </div>
          </div>
          <div className="header-right">
            <div className="header-user-info">
              <div className="user-name">{displayName}</div>
              <div className="consent-date">{consents.length > 0 ? `Last consent: ${lastUpdated}` : 'No consent data'}</div>
            </div>
            <button className="avatar-btn" onClick={openProfile} title="Manage Profile">
              <div className="header-avatar" style={{ width: 40, height: 40, fontSize: 15 }}>
                {displayName.trim().split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
              </div>
            </button>
            <button className="logout-btn" onClick={logout}><Icon d={ICONS.logout} size={14} /> Logout</button>
          </div>
        </div>
      </header>

      <div className="dashboard-body">
        <aside className="sidebar">
          <nav className="sidebar-nav">
            {NAV_ITEMS.map(item => (
              <button key={item.key} className={`nav-item ${activeTab === item.key ? 'active' : ''}`} onClick={() => setActiveTab(item.key)}>
                <Icon d={item.icon} size={18} /><span>{item.label}</span>
              </button>
            ))}
          </nav>
          <div className="sidebar-stats">
            <div className="sidebar-stats-top">
              <Icon d={ICONS.check} size={32} />
              <div>
                <div className="stats-count">{consents.length}</div>
                <div className="stats-label">Active Consents</div>
              </div>
            </div>
            <div className="sidebar-stats-footer">Last updated: {lastUpdated}</div>
          </div>
        </aside>

        <main className="content-area">

          {/* MY CONSENTS */}
          <div className={`tab-panel ${activeTab === 'consents' ? 'active' : ''}`}>
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Your Active Consents</h2>
                <span className="badge badge-green">DPDPA Compliant</span>
              </div>
              {loading ? (
                <p style={{ padding: 24, color: '#666' }}>Loading consents...</p>
              ) : consents.length > 0 ? (
                <div className="consents-list">
                  {consents.map((c, i) => (
                    <div className="consent-item" key={c.id} onClick={() => setSelectedConsent(c)} style={{ cursor: 'pointer' }}>
                      <div className="consent-item-header">
                        <span className="consent-item-title">Consent #{i + 1}</span>
                        <span className="badge badge-blue">{c.purposes?.length || 0} purpose{(c.purposes?.length || 0) !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="consent-tags">
                        {(c.purposes || []).map((p, j) => (
                          <span key={j} className="consent-tag consent-tag-optional">{purposeName(p.purposeId)}</span>
                        ))}
                      </div>
                      <div style={{ fontSize: 12, color: '#888', marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
                        <span>Granted: {new Date(c.createdAt).toLocaleDateString('en-IN')}</span>
                        <span style={{ color: '#3b82f6' }}>View details →</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <Icon d={ICONS.consents} size={48} />
                  <p>No consent data found</p>
                  <a href="/consent-form">Go to consent form →</a>
                </div>
              )}
            </div>
          </div>

          {/* WITHDRAW */}
          <div className={`tab-panel ${activeTab === 'withdraw' ? 'active' : ''}`}>
            <div className="card">
              <div className="withdraw-header">
                <div className="withdraw-icon-box"><Icon d={ICONS.complaints} size={22} /></div>
                <div>
                  <h2>Withdraw Consent</h2>
                  <p>You have the right to withdraw your consent at any time under DPDPA 2023.</p>
                </div>
              </div>
              <div className="withdraw-info-box">
                <Icon d={ICONS.warn} size={18} />
                <p>Withdrawal requests are processed immediately. Data will be deleted within 30 days.</p>
              </div>
              {loading ? (
                <p style={{ padding: 16, color: '#666' }}>Loading...</p>
              ) : consents.length > 0 ? (
                <div className="withdraw-items">
                  {consents.map((c) => (
                    <label key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #F1F5F9', cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <input type="checkbox"
                          style={{ width: 18, height: 18, accentColor: '#4F46E5', cursor: 'pointer' }}
                          checked={selectedIds.includes(c.id)}
                          onChange={() => toggleItem(c.id)} />
                        <div>
                          <div className="withdraw-field-name">Consent ID: {c.id.slice(-8).toUpperCase()}</div>
                          <div className="withdraw-category">{(c.purposes || []).map(p => purposeName(p.purposeId)).join(', ')}</div>
                        </div>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#64748B', background: '#F1F5F9', padding: '3px 10px', borderRadius: 20 }}>Can Withdraw</span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="no-data-text">No active consents to withdraw.</p>
              )}
              <div className="withdraw-actions">
                <button className="btn-danger" onClick={processWithdrawals}><Icon d={ICONS.cross} size={18} /> Confirm Withdrawal</button>
              </div>
            </div>
          </div>

          {/* COMPLAINTS */}
          <div className={`tab-panel ${activeTab === 'complaints' ? 'active' : ''}`}>
            <div className="card">
              <h2 className="card-title" style={{ marginBottom: 24 }}>Raise a Complaint</h2>
              <form className="complaint-form" onSubmit={submitComplaint} noValidate>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Complaint Category <span>*</span></label>
                    <select name="category" className={`form-control ${complaintErr.category ? 'form-control-error' : ''}`}
                      value={complaint.category} onChange={onComplaintChange} onBlur={onComplaintBlur}>
                      <option value="">Select category</option>
                      <option value="unauthorized-data-use">Unauthorized Data Use</option>
                      <option value="data-breach">Data Breach / Security Concern</option>
                      <option value="consent-not-honored">Consent Not Honored</option>
                      <option value="withdrawal-issue">Withdrawal Request Issue</option>
                      <option value="data-accuracy">Data Accuracy Concern</option>
                      <option value="third-party-sharing">Unauthorized Third-Party Sharing</option>
                      <option value="other">Other</option>
                    </select>
                    {complaintErr.category && <span className="form-field-error">⚠ {complaintErr.category}</span>}
                  </div>
                  <div className="form-group">
                    <label>Priority Level <span>*</span></label>
                    <select name="priority" className={`form-control ${complaintErr.priority ? 'form-control-error' : ''}`}
                      value={complaint.priority} onChange={onComplaintChange} onBlur={onComplaintBlur}>
                      <option value="">Select priority</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                    {complaintErr.priority && <span className="form-field-error">⚠ {complaintErr.priority}</span>}
                  </div>
                </div>
                <div className="form-group">
                  <label>Subject <span>*</span></label>
                  <input type="text" name="subject" className={`form-control ${complaintErr.subject ? 'form-control-error' : ''}`}
                    placeholder="Brief description" value={complaint.subject} onChange={onComplaintChange} onBlur={onComplaintBlur} />
                  {complaintErr.subject && <span className="form-field-error">⚠ {complaintErr.subject}</span>}
                </div>
                <div className="form-group">
                  <label>Detailed Description <span>*</span></label>
                  <textarea name="description" className={`form-control ${complaintErr.description ? 'form-control-error' : ''}`}
                    placeholder="Please provide detailed information..." value={complaint.description} onChange={onComplaintChange} onBlur={onComplaintBlur} />
                  {complaintErr.description && <span className="form-field-error">⚠ {complaintErr.description}</span>}
                </div>
                <div className="form-group">
                  <label>Contact Email <span>*</span></label>
                  <input type="email" name="email" className={`form-control ${complaintErr.email ? 'form-control-error' : ''}`}
                    placeholder="your.email@example.com" value={complaint.email} onChange={onComplaintChange} onBlur={onComplaintBlur} />
                  {complaintErr.email && <span className="form-field-error">⚠ {complaintErr.email}</span>}
                </div>
                <div className="complaint-info-box">
                  <Icon d={ICONS.warn} size={18} />
                  <div>
                    <div className="info-title">Response Timeline</div>
                    <div className="info-text">We will acknowledge within 24 hours and resolve within 7 business days as per DPDPA.</div>
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-primary"><Icon d={ICONS.send} size={16} /> Submit Complaint</button>
                  <button type="button" className="btn-reset"
                    onClick={() => { setComplaint({ category: '', priority: '', subject: '', description: '', email: profileData.email || '' }); setComplaintErr({}); setComplaintTouched({}) }}>
                    Reset Form
                  </button>
                </div>
              </form>
              <div className="section-divider">
                <h3 className="section-subtitle">Your Previous Complaints</h3>
                {complaints.length === 0 ? (
                  <p className="no-data-text">No previous complaints.</p>
                ) : complaints.map(c => {
                  const statusClass = { Submitted: 'badge-blue', 'In Progress': 'badge-amber', Resolved: 'badge-green' }[c.status] || 'badge-slate'
                  return (
                    <div className="complaint-card" key={c.id}>
                      <div className="complaint-card-header">
                        <div>
                          <div className="complaint-subject">{c.subject}</div>
                          <div className="complaint-meta">{new Date(c.timestamp).toLocaleString('en-IN')}</div>
                        </div>
                        <span className={`badge ${statusClass}`}>{c.status}</span>
                      </div>
                      <div className="complaint-desc">{c.description?.length > 120 ? c.description.substring(0, 120) + '…' : c.description}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* SETTINGS */}
          <div className={`tab-panel ${activeTab === 'settings' ? 'active' : ''}`}>
            <div className="card">
              <h2 className="card-title" style={{ marginBottom: 24 }}>Account Settings</h2>

              <div className="settings-section">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div className="settings-section-title" style={{ marginBottom: 0 }}>Notification Preferences</div>
                  {notifSaved && <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 600 }}>✅ Saved</span>}
                </div>
                {NOTIF_ITEMS.map((item) => (
                  <div className="toggle-row" key={item.key}>
                    <div className="toggle-info"><p>{item.label}</p><p>{item.sub}</p></div>
                    <label className="switch">
                      <input type="checkbox"
                        checked={notifSettings[item.key]}
                        onChange={e => saveNotifSettings(item.key, e.target.checked)} />
                      <span className="slider" />
                    </label>
                  </div>
                ))}
              </div>

              <div className="settings-section">
                <div className="settings-section-title">Data Portability</div>
                <div className="export-box">
                  <Icon d={ICONS.download} size={22} />
                  <div>
                    <h4>Export Your Data</h4>
                    <p>Download a complete copy of your consent records.</p>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button className="btn-primary" onClick={exportCSV} style={{ fontSize: 13, padding: '10px 18px' }}>
                        📊 Export CSV
                      </button>
                      <button className="btn-primary" onClick={exportPDF} style={{ fontSize: 13, padding: '10px 18px', background: 'linear-gradient(135deg,#ef4444,#dc2626)' }}>
                        📄 Export PDF
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="settings-section">
                <div className="settings-section-title">Account Actions</div>
                <button className="action-btn" onClick={() => navigate('/consent-form')}>
                  <div className="action-btn-left">
                    <div className="action-btn-icon blue"><Icon d={ICONS.refresh} size={16} /></div>
                    <div>
                      <div className="action-btn-title">Review Consent Form</div>
                      <div className="action-btn-sub">Go back to the consent collection page</div>
                    </div>
                  </div>
                  <Icon d={ICONS.chevron} size={18} />
                </button>
              </div>
            </div>
          </div>

        </main>
      </div>

      {/* PROFILE MODAL */}
      <Modal open={profileOpen} onClose={() => { setProfileOpen(false); cancelEdit() }}>
        <div className="modal-box profile-modal-box">
          <div className="profile-modal-header">
            <div className="profile-modal-avatar">
              <div className="header-avatar" style={{ width: 64, height: 64, fontSize: 22, border: '3px solid rgba(255,255,255,0.4)' }}>
                {displayName.trim().split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
              </div>
            </div>
            <div className="profile-modal-title-block">
              <h2 className="profile-modal-title">My Profile</h2>
              <p className="profile-modal-sub">Manage your account details</p>
            </div>
            <button className="profile-close-btn" onClick={() => { setProfileOpen(false); cancelEdit() }}>
              <Icon d={ICONS.close} size={18} />
            </button>
          </div>
          {profileSaved && <div className="profile-success-banner">✅ Profile updated successfully</div>}
          <div className="profile-fields">
            {[
              { key: 'name',  label: 'Full Name',     icon: ICONS.user,  type: 'text',  placeholder: 'Your full name' },
              { key: 'email', label: 'Email Address', icon: ICONS.mail,  type: 'email', placeholder: 'you@example.com' },
              { key: 'phone', label: 'Mobile Number', icon: ICONS.phone, type: 'tel',   placeholder: '9XXXXXXXXX' },
            ].map(field => (
              <div className="profile-field-group" key={field.key}>
                <label className="profile-label"><Icon d={field.icon} size={14} /> {field.label}</label>
                {isEditing ? (
                  <>
                    <input type={field.type} name={field.key}
                      className={`profile-input ${profileErr[field.key] ? 'profile-input-error' : ''}`}
                      value={profileEdit[field.key]} onChange={onProfileChange} onBlur={onProfileBlur}
                      placeholder={field.placeholder} maxLength={field.key === 'phone' ? 10 : undefined} />
                    {profileErr[field.key] && <span className="profile-field-error">⚠ {profileErr[field.key]}</span>}
                  </>
                ) : (
                  <div className="profile-value">{profileData[field.key] || <span className="profile-empty">Not set</span>}</div>
                )}
              </div>
            ))}
            <div className="profile-dpdpa-badge"><Icon d={ICONS.shield} size={14} /> Your data is protected under DPDPA 2023</div>
          </div>
          <div className="profile-actions">
            {isEditing ? (
              <><button className="btn-primary" onClick={saveProfile}><Icon d={ICONS.check} size={16} /> Save Changes</button><button className="btn-reset" onClick={cancelEdit}>Cancel</button></>
            ) : (
              <><button className="btn-primary" onClick={() => setIsEditing(true)}><Icon d={ICONS.edit} size={16} /> Edit Profile</button><button className="btn-cancel" onClick={() => setProfileOpen(false)}>Close</button></>
            )}
          </div>
        </div>
      </Modal>

      {/* CONSENT DETAIL MODAL */}
      <Modal open={!!selectedConsent} onClose={() => setSelectedConsent(null)}>
        <div className="modal-box" style={{ maxWidth: 500 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a' }}>Consent Details</h3>
            <button onClick={() => setSelectedConsent(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
              <Icon d={ICONS.close} size={20} />
            </button>
          </div>
          {selectedConsent && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 16px' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 }}>Consent ID</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', fontFamily: 'monospace', wordBreak: 'break-all' }}>{selectedConsent.id}</div>
              </div>
              <div style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 16px' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 }}>Status</div>
                <span className="badge badge-green">{selectedConsent.status}</span>
              </div>
              <div style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 16px' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8 }}>Purposes Granted</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {(selectedConsent.purposes || []).map((p, i) => (
                    <span key={i} className="consent-tag consent-tag-optional">{purposeName(p.purposeId)}</span>
                  ))}
                </div>
              </div>
              <div style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 16px' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 }}>Date Granted</div>
                <div style={{ fontSize: 13, color: '#0f172a' }}>{new Date(selectedConsent.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
              </div>
              <div style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 16px' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4 }}>Notice Version</div>
                <div style={{ fontSize: 13, color: '#0f172a' }}>{selectedConsent.noticeVersionId || '—'}</div>
              </div>
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 8 }}>
                <Icon d={ICONS.shield} size={16} />
                <div style={{ fontSize: 12, color: '#92400e' }}>Protected under DPDPA 2023. You can withdraw this consent anytime.</div>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button className="btn-reset" onClick={() => setSelectedConsent(null)}>Close</button>
                <button className="btn-danger" style={{ padding: '9px 16px', fontSize: 13 }}
                  onClick={() => { setSelectedConsent(null); setActiveTab('withdraw') }}>
                  Withdraw This Consent
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <div className="modal-box">
          <div className="modal-title">Confirm Withdrawal</div>
          <div className="modal-text">Are you sure you want to withdraw {selectedIds.length} consent{selectedIds.length !== 1 ? 's' : ''}? This action will be processed immediately.</div>
          <div className="modal-actions">
            <button className="btn-cancel" onClick={() => setConfirmOpen(false)}>Cancel</button>
            <button className="btn-confirm" onClick={confirmWithdraw}>Proceed</button>
          </div>
        </div>
      </Modal>

      <Modal open={otpOpen} onClose={() => setOtpOpen(false)}>
        <div className="modal-box">
          <div className="otp-modal-body">
            <div className="modal-title">OTP Verification</div>
            <div className="modal-text">Enter any 6-digit code to confirm withdrawal</div>
            <input type="text" className="otp-input" maxLength={6} placeholder="——————"
              value={otpValue} onChange={e => { setOtpValue(e.target.value.replace(/\D/g, '')); setOtpError(false) }} />
            {otpError && <div className="otp-error show">Please enter a valid 6-digit OTP</div>}
            <button className="btn-verify" onClick={verifyOTP}>Verify & Withdraw</button>
            <button className="btn-link" onClick={() => setOtpOpen(false)}>Cancel</button>
          </div>
        </div>
      </Modal>

      <Modal open={successOpen} onClose={() => setSuccessOpen(false)}>
        <div className="modal-box">
          <div className="success-modal-body">
            <span className="success-icon">✅</span>
            <div className="modal-title">Withdrawal Successful</div>
            <div className="modal-text">Your consent has been withdrawn. Data will be deleted within 30 days.</div>
            <button className="btn-success" onClick={() => setSuccessOpen(false)}>OK</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}