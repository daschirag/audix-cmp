import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateProfile, validateProfileField, validateComplaint, validateComplaintField } from '../utils/profileValidation';
import '../styles/dashboard.css';

/* ── small SVG icon helpers ── */
const Icon = ({ d, size = 20 }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
  </svg>
);

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
  trash:      'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
  chevron:    'M9 5l7 7-7 7',
  send:       'M12 19l9 2-9-18-9 18 9-2zm0 0v-8',
  cross:      'M6 18L18 6M6 6l12 12',
  edit:       'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
  mail:       'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  phone:      'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
  close:      'M6 18L18 6M6 6l12 12',
  save:       'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75',
};

const NAV_ITEMS = [
  { key: 'consents',   label: 'My Consents',      icon: ICONS.consents   },
  { key: 'withdraw',   label: 'Withdraw Consent',  icon: ICONS.withdraw   },
  { key: 'complaints', label: 'Raise Complaint',   icon: ICONS.complaints },
  { key: 'settings',   label: 'Settings',          icon: ICONS.settings   },
];

/* ── Modal helper ── */
function Modal({ open, children, onClose }) {
  if (!open) return null;
  return (
    <div className="modal-overlay open" onClick={e => e.target === e.currentTarget && onClose()}>
      {children}
    </div>
  );
}

/* ── Profile Avatar with initials ── */
// DELETE THIS WHOLE FUNCTION:
function Avatar({ name, size = 40 }) {
  const initials = name
    ? name.trim().split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';
  return (
    <div
      className="header-avatar"
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      title={name}
    >
      {initials}
    </div>
  );
}
export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab]         = useState('consents');
  const [consentData, setConsentData]     = useState(null);
  const [complaints, setComplaints]       = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [generatedOTP, setGeneratedOTP]   = useState('');
  const [otpValue, setOtpValue]           = useState('');
  const [otpError, setOtpError]           = useState(false);

  // Modals
  const [confirmOpen, setConfirmOpen]   = useState(false);
  const [otpOpen, setOtpOpen]           = useState(false);
  const [successOpen, setSuccessOpen]   = useState(false);
  const [profileOpen, setProfileOpen]   = useState(false);

  // Profile state
  const [profileData, setProfileData] = useState({ name: '', email: '', phone: '' });
  const [profileEdit, setProfileEdit] = useState({ name: '', email: '', phone: '' });
  const [profileErr, setProfileErr]   = useState({});
  const [profileTouched, setProfileTouched] = useState({});
  const [isEditing, setIsEditing]     = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // Complaint form
  const [complaint, setComplaint]   = useState({ category: '', priority: '', subject: '', description: '', email: '' });
  const [complaintErr, setComplaintErr] = useState({});
  const [complaintTouched, setComplaintTouched] = useState({});

  const profileRef = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem('userConsent');
    if (stored) setConsentData(JSON.parse(stored));

    const storedComplaints = localStorage.getItem('complaints');
    if (storedComplaints) setComplaints(JSON.parse(storedComplaints));

    // Load profile from localStorage
    const name  = localStorage.getItem('userName')  || '';
    const email = localStorage.getItem('userEmail') || '';
    const phone = localStorage.getItem('userPhone') || '';
    setProfileData({ name, email, phone });
    setProfileEdit({ name, email, phone });

    // Pre-fill complaint email
    if (email) setComplaint(p => ({ ...p, email }));
  }, []);

  /* derived */
  const totalConsents = consentData
    ? consentData.consents.reduce((s, c) => s + c.fields.length, 0)
    : 0;

  const consentDate = consentData
    ? new Date(consentData.timestamp).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
      })
    : '—';

  const displayName = profileData.name || 'Account Holder';

  /* logout */
  function logout() {
    localStorage.removeItem('isLoggedIn');
    navigate('/auth');
  }

  /* ── PROFILE ── */
  function openProfile() {
    setProfileEdit({ ...profileData });
    setProfileErr({});
    setProfileTouched({});
    setIsEditing(false);
    setProfileSaved(false);
    setProfileOpen(true);
  }

  function onProfileChange(e) {
    const { name, value } = e.target;
    const cleaned = name === 'phone' ? value.replace(/\D/g, '').slice(0, 10) : value;
    setProfileEdit(p => ({ ...p, [name]: cleaned }));
    if (profileTouched[name]) {
      const error = validateProfileField(name, cleaned);
      setProfileErr(p => ({ ...p, [name]: error }));
    }
  }

  function onProfileBlur(e) {
    const { name, value } = e.target;
    setProfileTouched(p => ({ ...p, [name]: true }));
    const error = validateProfileField(name, value);
    setProfileErr(p => ({ ...p, [name]: error }));
  }

  function saveProfile() {
    setProfileTouched({ name: true, email: true, phone: true });
    const errors = validateProfile(profileEdit);
    setProfileErr(errors);
    if (Object.keys(errors).length > 0) return;

    localStorage.setItem('userName',  profileEdit.name);
    localStorage.setItem('userEmail', profileEdit.email);
    localStorage.setItem('userPhone', profileEdit.phone);
    setProfileData({ ...profileEdit });
    setIsEditing(false);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  }

  function cancelEdit() {
    setProfileEdit({ ...profileData });
    setProfileErr({});
    setProfileTouched({});
    setIsEditing(false);
  }

  /* ── WITHDRAWAL ── */
  function toggleItem(catIdx, fieldIdx) {
    const key = `${catIdx}-${fieldIdx}`;
    setSelectedItems(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  }

  function processWithdrawals() {
    if (selectedItems.length === 0) {
      alert('Please select at least one consent to withdraw.');
      return;
    }
    setConfirmOpen(true);
  }

  function confirmWithdraw() {
    setConfirmOpen(false);
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedOTP(otp);
    console.log('Demo OTP:', otp);
    setOtpValue('');
    setOtpError(false);
    setOtpOpen(true);
  }

  function verifyOTP() {
    if (otpValue.length < 6) { setOtpError(true); return; }
    const updated = JSON.parse(JSON.stringify(consentData));
    selectedItems.forEach(key => {
      const [ci, fi] = key.split('-').map(Number);
      if (updated.consents[ci]) updated.consents[ci].fields[fi] = null;
    });
    updated.consents = updated.consents
      .map(cat => ({ ...cat, fields: cat.fields.filter(Boolean) }))
      .filter(cat => cat.fields.length > 0);
    localStorage.setItem('userConsent', JSON.stringify(updated));
    setConsentData(updated);
    setSelectedItems([]);
    setOtpOpen(false);
    setSuccessOpen(true);
    setActiveTab('consents');
  }

  /* ── COMPLAINT with live validation ── */
  function onComplaintChange(e) {
    const { name, value } = e.target;
    setComplaint(p => ({ ...p, [name]: value }));
    if (complaintTouched[name]) {
      const error = validateComplaintField(name, value);
      setComplaintErr(p => ({ ...p, [name]: error }));
    }
  }

  function onComplaintBlur(e) {
    const { name, value } = e.target;
    setComplaintTouched(p => ({ ...p, [name]: true }));
    const error = validateComplaintField(name, value);
    setComplaintErr(p => ({ ...p, [name]: error }));
  }

  function submitComplaint(e) {
    e.preventDefault();
    setComplaintTouched({ category: true, priority: true, subject: true, description: true, email: true });
    const errors = validateComplaint(complaint);
    setComplaintErr(errors);
    if (Object.keys(errors).length > 0) return;

    const newComplaint = { id: Date.now(), ...complaint, status: 'Submitted', timestamp: new Date().toISOString() };
    const updated = [...complaints, newComplaint];
    setComplaints(updated);
    localStorage.setItem('complaints', JSON.stringify(updated));
    alert('Complaint submitted successfully. You will receive an acknowledgment within 24 hours.');
    setComplaint({ category: '', priority: '', subject: '', description: '', email: profileData.email || '' });
    setComplaintErr({});
    setComplaintTouched({});
  }

  /* ── EXPORT ── */
  function exportData() {
    const blob = new Blob(
      [JSON.stringify({ consentData, complaints, exportDate: new Date().toISOString() }, null, 2)],
      { type: 'application/json' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `consent-export-${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
  }

  function clearAllData() {
    if (!confirm('Delete ALL consent data? This cannot be undone.')) return;
    if (!confirm('Final confirmation: permanently delete all records?')) return;
    localStorage.removeItem('userConsent');
    localStorage.removeItem('complaints');
    alert('All data deleted.');
    navigate('/consent-form');
  }

  /* ── RENDER ── */
  return (
    <div className="dashboard-root">

      {/* ── HEADER ── */}
      <header className="dashboard-header">
        <div className="header-inner">
          <div className="header-brand">
            <img src="/audix-logo.png" alt="Audix" className="header-logo-img"
              onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
            />
            <div className="header-logo-icon" style={{ display: 'none' }}>
              <Icon d={ICONS.shield} size={22} />
            </div>
            <div className="header-brand-text">
              <h1>ConsentHub Dashboard</h1>
              <p>Manage your data consents</p>
            </div>
          </div>

          <div className="header-right">
            <div className="header-user-info">
              <div className="user-name">{displayName}</div>
              <div className="consent-date">
                {consentData ? `Consent given: ${consentDate}` : 'No consent data'}
              </div>
            </div>

            {/* Clickable avatar */}
            <button className="avatar-btn" onClick={openProfile} title="Manage Profile">
  <div className="header-avatar" style={{ width: 40, height: 40, fontSize: 15 }}>
    {displayName
      ? displayName.trim().split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
      : '?'}
  </div>
</button>

            <button className="logout-btn" onClick={logout}>
              <Icon d={ICONS.logout} size={14} />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* ── BODY ── */}
      <div className="dashboard-body">

        {/* SIDEBAR */}
        <aside className="sidebar">
          <nav className="sidebar-nav">
            {NAV_ITEMS.map(item => (
              <button
                key={item.key}
                className={`nav-item ${activeTab === item.key ? 'active' : ''}`}
                onClick={() => setActiveTab(item.key)}
              >
                <Icon d={item.icon} size={18} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="sidebar-stats">
            <div className="sidebar-stats-top">
              <Icon d={ICONS.check} size={32} />
              <div>
                <div className="stats-count">{totalConsents}</div>
                <div className="stats-label">Active Consents</div>
              </div>
            </div>
            <div className="sidebar-stats-footer">Last updated: {consentDate}</div>
          </div>
        </aside>

        {/* CONTENT */}
        <main className="content-area">

          {/* ── MY CONSENTS ── */}
          <div className={`tab-panel ${activeTab === 'consents' ? 'active' : ''}`}>
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Your Active Consents</h2>
                <span className="badge badge-green">DPDPA Compliant</span>
              </div>
              {consentData ? (
                <div className="consents-list">
                  {consentData.consents.map((cat, i) => (
                    <div className="consent-item" key={i}>
                      <div className="consent-item-header">
                        <span className="consent-item-title">{cat.category}</span>
                        <span className="badge badge-blue">{cat.fields.length} field{cat.fields.length !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="consent-tags">
                        {cat.fields.map((f, j) => (
                          <span key={j} className={`consent-tag ${f.mandatory ? 'consent-tag-mandatory' : 'consent-tag-optional'}`}>
                            {f.field}{f.mandatory ? ' (Required)' : ''}
                          </span>
                        ))}
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

          {/* ── WITHDRAW ── */}
          <div className={`tab-panel ${activeTab === 'withdraw' ? 'active' : ''}`}>
            <div className="card">
              <div className="withdraw-header">
                <div className="withdraw-icon-box"><Icon d={ICONS.complaints} size={22} /></div>
                <div>
                  <h2>Withdraw Consent</h2>
                  <p>You have the right to withdraw your consent at any time. Withdrawing mandatory fields may impact service availability.</p>
                </div>
              </div>
              <div className="withdraw-info-box">
                <Icon d={ICONS.warn} size={18} />
                <p>Withdrawal requests are processed immediately. Data will be deleted within 30 days as per DPDPA requirements.</p>
              </div>
              {consentData ? (
                <div className="withdraw-items">
                  {consentData.consents.map((cat, ci) =>
                    cat.fields.map((field, fi) => (
                      <label className="withdraw-row" key={`${ci}-${fi}`}>
                        <div className="withdraw-row-left">
                          <input type="checkbox" className="withdraw-checkbox"
                            disabled={field.mandatory}
                            checked={selectedItems.includes(`${ci}-${fi}`)}
                            onChange={() => !field.mandatory && toggleItem(ci, fi)}
                          />
                          <div>
                            <div className="withdraw-field-name">{field.field}</div>
                            <div className="withdraw-category">{cat.category}</div>
                          </div>
                        </div>
                        {field.mandatory
                          ? <span className="badge badge-red">Cannot Withdraw (Mandatory)</span>
                          : <span className="badge badge-slate">Optional – Can Withdraw</span>
                        }
                      </label>
                    ))
                  )}
                </div>
              ) : (
                <p className="no-data-text">No consent data available.</p>
              )}
              <div className="withdraw-actions">
                <button className="btn-danger" onClick={processWithdrawals}>
                  <Icon d={ICONS.cross} size={18} />
                  Confirm Withdrawal
                </button>
              </div>
            </div>
          </div>

          {/* ── COMPLAINTS ── */}
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
                    placeholder="Brief description of your complaint"
                    value={complaint.subject} onChange={onComplaintChange} onBlur={onComplaintBlur} />
                  {complaintErr.subject && <span className="form-field-error">⚠ {complaintErr.subject}</span>}
                </div>

                <div className="form-group">
                  <label>Detailed Description <span>*</span></label>
                  <textarea name="description" className={`form-control ${complaintErr.description ? 'form-control-error' : ''}`}
                    placeholder="Please provide detailed information about your complaint..."
                    value={complaint.description} onChange={onComplaintChange} onBlur={onComplaintBlur} />
                  {complaintErr.description && <span className="form-field-error">⚠ {complaintErr.description}</span>}
                </div>

                <div className="form-group">
                  <label>Contact Email for Follow-up <span>*</span></label>
                  <input type="email" name="email" className={`form-control ${complaintErr.email ? 'form-control-error' : ''}`}
                    placeholder="your.email@example.com"
                    value={complaint.email} onChange={onComplaintChange} onBlur={onComplaintBlur} />
                  {complaintErr.email && <span className="form-field-error">⚠ {complaintErr.email}</span>}
                </div>

                <div className="complaint-info-box">
                  <Icon d={ICONS.warn} size={18} />
                  <div>
                    <div className="info-title">Response Timeline</div>
                    <div className="info-text">We will acknowledge your complaint within 24 hours and provide a resolution within 7 business days as per DPDPA guidelines.</div>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-primary">
                    <Icon d={ICONS.send} size={16} />
                    Submit Complaint
                  </button>
                  <button type="button" className="btn-reset"
                    onClick={() => { setComplaint({ category: '', priority: '', subject: '', description: '', email: profileData.email || '' }); setComplaintErr({}); setComplaintTouched({}); }}>
                    Reset Form
                  </button>
                </div>
              </form>

              <div className="section-divider">
                <h3 className="section-subtitle">Your Previous Complaints</h3>
                {complaints.length === 0 ? (
                  <p className="no-data-text">No previous complaints.</p>
                ) : (
                  [...complaints].reverse().map(c => {
                    const statusClass = { Submitted: 'badge-blue', 'In Progress': 'badge-amber', Resolved: 'badge-green' }[c.status] || 'badge-slate';
                    return (
                      <div className="complaint-card" key={c.id}>
                        <div className="complaint-card-header">
                          <div>
                            <div className="complaint-subject">{c.subject}</div>
                            <div className="complaint-meta">ID: #{c.id} · {new Date(c.timestamp).toLocaleString('en-IN')}</div>
                          </div>
                          <span className={`badge ${statusClass}`}>{c.status}</span>
                        </div>
                        <div className="complaint-desc">
                          {c.description.length > 120 ? c.description.substring(0, 120) + '…' : c.description}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* ── SETTINGS ── */}
          <div className={`tab-panel ${activeTab === 'settings' ? 'active' : ''}`}>
            <div className="card">
              <h2 className="card-title" style={{ marginBottom: 24 }}>Account Settings</h2>
              <div className="settings-section">
                <div className="settings-section-title">Notification Preferences</div>
                {[
                  { label: 'Consent Update Notifications', sub: 'Receive alerts when consents are modified or accessed', defaultOn: true },
                  { label: 'Data Access Alerts', sub: 'Get notified when your data is accessed by third parties', defaultOn: true },
                  { label: 'Regulatory Updates', sub: 'Stay informed about DPDPA compliance changes', defaultOn: false },
                ].map((item, i) => (
                  <div className="toggle-row" key={i}>
                    <div className="toggle-info">
                      <p>{item.label}</p>
                      <p>{item.sub}</p>
                    </div>
                    <label className="switch">
                      <input type="checkbox" defaultChecked={item.defaultOn} />
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
                    <p>Download a complete copy of all your data and consent records in machine-readable format (JSON).</p>
                    <button className="btn-primary" onClick={exportData}>Download Data Export</button>
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
                <button className="action-btn danger" onClick={clearAllData}>
                  <div className="action-btn-left">
                    <div className="action-btn-icon red"><Icon d={ICONS.trash} size={16} /></div>
                    <div>
                      <div className="action-btn-title">Delete All Consent Data</div>
                      <div className="action-btn-sub">Permanently remove all stored consent records</div>
                    </div>
                  </div>
                  <Icon d={ICONS.chevron} size={18} />
                </button>
              </div>
            </div>
          </div>

        </main>
      </div>

      {/* ══════════ PROFILE MODAL ══════════ */}
      <Modal open={profileOpen} onClose={() => { setProfileOpen(false); cancelEdit(); }}>
        <div className="modal-box profile-modal-box">
          {/* Header */}
          <div className="profile-modal-header">
            <div className="profile-modal-avatar">
  <div className="header-avatar" style={{ width: 64, height: 64, fontSize: 22, border: '3px solid rgba(255,255,255,0.4)' }}>
    {displayName
      ? displayName.trim().split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
      : '?'}
  </div>
</div>
            <div className="profile-modal-title-block">
              <h2 className="profile-modal-title">My Profile</h2>
              <p className="profile-modal-sub">Manage your account details</p>
            </div>
            <button className="profile-close-btn" onClick={() => { setProfileOpen(false); cancelEdit(); }}>
              <Icon d={ICONS.close} size={18} />
            </button>
          </div>

          {profileSaved && (
            <div className="profile-success-banner">
              ✅ Profile updated successfully
            </div>
          )}

          {/* Fields */}
          <div className="profile-fields">

            {/* Name */}
            <div className="profile-field-group">
              <label className="profile-label">
                <Icon d={ICONS.user} size={14} />
                Full Name
              </label>
              {isEditing ? (
                <>
                  <input
                    type="text"
                    name="name"
                    className={`profile-input ${profileErr.name ? 'profile-input-error' : ''}`}
                    value={profileEdit.name}
                    onChange={onProfileChange}
                    onBlur={onProfileBlur}
                    placeholder="Your full name"
                    autoFocus
                  />
                  {profileErr.name && <span className="profile-field-error">⚠ {profileErr.name}</span>}
                </>
              ) : (
                <div className="profile-value">{profileData.name || <span className="profile-empty">Not set</span>}</div>
              )}
            </div>

            {/* Email */}
            <div className="profile-field-group">
              <label className="profile-label">
                <Icon d={ICONS.mail} size={14} />
                Email Address
              </label>
              {isEditing ? (
                <>
                  <input
                    type="email"
                    name="email"
                    className={`profile-input ${profileErr.email ? 'profile-input-error' : ''}`}
                    value={profileEdit.email}
                    onChange={onProfileChange}
                    onBlur={onProfileBlur}
                    placeholder="you@example.com"
                  />
                  {profileErr.email && <span className="profile-field-error">⚠ {profileErr.email}</span>}
                </>
              ) : (
                <div className="profile-value">{profileData.email || <span className="profile-empty">Not set</span>}</div>
              )}
            </div>

            {/* Phone */}
            <div className="profile-field-group">
              <label className="profile-label">
                <Icon d={ICONS.phone} size={14} />
                Mobile Number
              </label>
              {isEditing ? (
                <>
                  <input
                    type="tel"
                    name="phone"
                    className={`profile-input ${profileErr.phone ? 'profile-input-error' : ''}`}
                    value={profileEdit.phone}
                    onChange={onProfileChange}
                    onBlur={onProfileBlur}
                    placeholder="9XXXXXXXXX"
                    maxLength={10}
                    inputMode="numeric"
                  />
                  {profileErr.phone && <span className="profile-field-error">⚠ {profileErr.phone}</span>}
                </>
              ) : (
                <div className="profile-value">{profileData.phone || <span className="profile-empty">Not set</span>}</div>
              )}
            </div>

            {/* DPDPA badge */}
            <div className="profile-dpdpa-badge">
              <Icon d={ICONS.shield} size={14} />
              Your data is protected under DPDPA 2023
            </div>
          </div>

          {/* Actions */}
          <div className="profile-actions">
            {isEditing ? (
              <>
                <button className="btn-primary" onClick={saveProfile}>
                  <Icon d={ICONS.check} size={16} />
                  Save Changes
                </button>
                <button className="btn-reset" onClick={cancelEdit}>Cancel</button>
              </>
            ) : (
              <>
                <button className="btn-primary" onClick={() => setIsEditing(true)}>
                  <Icon d={ICONS.edit} size={16} />
                  Edit Profile
                </button>
                <button className="btn-cancel" onClick={() => setProfileOpen(false)}>Close</button>
              </>
            )}
          </div>
        </div>
      </Modal>

      {/* ── CONFIRM MODAL ── */}
      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <div className="modal-box">
          <div className="modal-title">Confirm Withdrawal</div>
          <div className="modal-text">
            Are you sure you want to withdraw {selectedItems.length} consent{selectedItems.length !== 1 ? 's' : ''}?
            This action will be processed immediately.
          </div>
          <div className="modal-actions">
            <button className="btn-cancel" onClick={() => setConfirmOpen(false)}>Cancel</button>
            <button className="btn-confirm" onClick={confirmWithdraw}>Proceed</button>
          </div>
        </div>
      </Modal>

      {/* ── OTP MODAL ── */}
      <Modal open={otpOpen} onClose={() => setOtpOpen(false)}>
        <div className="modal-box">
          <div className="otp-modal-body">
            <div className="modal-title">OTP Verification</div>
            <div className="modal-text">Enter the OTP sent to your registered mobile number</div>
            <input type="text" className="otp-input" maxLength={6} placeholder="——————"
              value={otpValue}
              onChange={e => { setOtpValue(e.target.value.replace(/\D/g, '')); setOtpError(false); }}
            />
            {otpError && <div className="otp-error show">Please enter a valid 6-digit OTP</div>}
            <button className="btn-verify" onClick={verifyOTP}>Verify OTP</button>
            <button className="btn-link" onClick={() => setOtpOpen(false)}>Cancel</button>
          </div>
        </div>
      </Modal>

      {/* ── SUCCESS MODAL ── */}
      <Modal open={successOpen} onClose={() => setSuccessOpen(false)}>
        <div className="modal-box">
          <div className="success-modal-body">
            <span className="success-icon">✅</span>
            <div className="modal-title">Withdrawal Successful</div>
            <div className="modal-text">Your consent has been successfully withdrawn. Data will be deleted within 30 days.</div>
            <button className="btn-success" onClick={() => setSuccessOpen(false)}>OK</button>
          </div>
        </div>
      </Modal>

    </div>
  );
}