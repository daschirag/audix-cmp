import { useState, useEffect } from 'react'
import { Search, Filter, Download, X, Upload, MoreHorizontal } from 'lucide-react'
import Header from '../components/Header'
import SuccessMessage from '../components/SuccessMessage'

const BASE_URL = 'http://localhost:3001'

const statusColors: Record<string, { bg: string; text: string; border: string }> = {
  Open:         { bg: '#F8FAFC', text: '#334155', border: '#CBD5E1' },
  'In Progress':{ bg: '#FFFBEB', text: '#92400E', border: '#FCD34D' },
  Resolved:     { bg: '#ECFDF5', text: '#065F46', border: '#A7F3D0' },
  Closed:       { bg: '#F9FAFB', text: '#374151', border: '#E5E7EB' },
}

const slaColors: Record<string, { bg: string; text: string; border: string }> = {
  Breached:   { bg: '#FFF1F2', text: '#9F1239', border: '#FECDD3' },
  'At Risk':  { bg: '#FFF7ED', text: '#9A3412', border: '#FDBA74' },
  'On Track': { bg: '#F0FDFA', text: '#0F766E', border: '#99F6E4' },
  Closed:     { bg: '#F9FAFB', text: '#4B5563', border: '#E5E7EB' },
}

interface Complaint {
  id:       string
  customer: string
  purpose:  string
  date:     string
  status:   string
  sla:      string
  owner:    string
}

function mapStatus(s: string): string {
  const m: Record<string, string> = {
    RECEIVED:     'Open',
    UNDER_REVIEW: 'In Progress',
    ESCALATED:    'In Progress',
    CLOSED:       'Closed',
  }
  return m[s] || 'Open'
}

const owners = ['Priya M.', 'Amit K.', 'Rajesh S.', 'Sneha K.', 'Unassigned']
const statusOptions = ['Open', 'In Progress', 'Resolved', 'Closed']
type ModalType = 'assign' | 'status' | 'remarks' | 'evidence' | null

export default function ComplaintsScreen() {
  const [complaints, setComplaints]     = useState<Complaint[]>([])
  const [loading, setLoading]           = useState(true)
  const [selected, setSelected]         = useState<Set<string>>(new Set())
  const [search, setSearch]             = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterPurpose, setFilterPurpose] = useState('')
  const [filterOwner, setFilterOwner]   = useState('')
  const [activeModal, setActiveModal]   = useState<ModalType>(null)
  const [selectedOwner, setSelectedOwner]   = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [remarks, setRemarks]           = useState('')
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [successMsg, setSuccessMsg]     = useState('')

  // ── Fetch real complaints from backend ──────────────────────────────────
  useEffect(() => {
    const token = sessionStorage.getItem('accessToken')
    fetch(`${BASE_URL}/complaints`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          const mapped = data.data.map((c: any) => ({
            id:       c.id,
            customer: c.user?.email || c.dataPrincipalId?.slice(-6).toUpperCase() || 'Unknown',
            purpose:  c.category || 'General',
            date:     new Date(c.createdAt).toISOString().split('T')[0],
            status:   mapStatus(c.status),
            sla:      c.status === 'ESCALATED' ? 'At Risk' : 'On Track',
            owner:    c.assignedTo || 'Unassigned',
          }))
          setComplaints(mapped)
        }
      })
      .catch(() => setComplaints([]))
      .finally(() => setLoading(false))
  }, [])

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  const toggleSelect = (id: string) => {
    const next = new Set(selected)
    next.has(id) ? next.delete(id) : next.add(id)
    setSelected(next)
  }

  const toggleAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(filtered.map((c) => c.id)))
    }
  }

  const filtered = complaints.filter((c) => {
    const matchSearch =
      !search ||
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.customer.toLowerCase().includes(search.toLowerCase())
    const matchStatus  = !filterStatus  || c.status  === filterStatus
    const matchPurpose = !filterPurpose || c.purpose === filterPurpose
    const matchOwner   = !filterOwner   || c.owner   === filterOwner
    return matchSearch && matchStatus && matchPurpose && matchOwner
  })

  const handleAssign = async () => {
    if (!selectedOwner) return
    const token = sessionStorage.getItem('accessToken')
    for (const id of selected) {
      await fetch(`${BASE_URL}/complaints/${id}/assign`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ assignedTo: selectedOwner })
      })
    }
    setComplaints(prev =>
      prev.map(c => selected.has(c.id) ? { ...c, owner: selectedOwner } : c)
    )
    setSelected(new Set())
    setActiveModal(null)
    setSelectedOwner('')
    showSuccess(`Owner assigned to ${selected.size} complaint(s)`)
  }

  const handleStatusUpdate = async () => {
    if (!selectedStatus) return
    const token = sessionStorage.getItem('accessToken')
    const backendStatus: Record<string, string> = {
      'Open':        'RECEIVED',
      'In Progress': 'UNDER_REVIEW',
      'Resolved':    'CLOSED',
      'Closed':      'CLOSED',
    }
    for (const id of selected) {
      await fetch(`${BASE_URL}/complaints/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ status: backendStatus[selectedStatus] || 'RECEIVED' })
      })
    }
    setComplaints(prev =>
      prev.map(c => selected.has(c.id) ? { ...c, status: selectedStatus } : c)
    )
    setSelected(new Set())
    setActiveModal(null)
    setSelectedStatus('')
    showSuccess(`Status updated for ${selected.size} complaint(s)`)
  }

  const handleRemarks = () => {
    if (!remarks.trim()) return
    setSelected(new Set())
    setActiveModal(null)
    setRemarks('')
    showSuccess('Remarks added successfully')
  }

  const handleUpload = () => {
    setUploadSuccess(true)
    setTimeout(() => {
      setUploadSuccess(false)
      setActiveModal(null)
      setSelected(new Set())
      showSuccess('Evidence uploaded successfully')
    }, 2000)
  }

  const handleGenerateClosure = () => {
    setSelected(new Set())
    showSuccess(`Closure proof generated for ${selected.size} complaint(s)`)
  }

  const purposes = [...new Set(complaints.map((c) => c.purpose))]

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', backgroundColor: '#F8F9FA', minHeight: '100vh' }}>
      <Header />
      <main className="p-8 overflow-auto" style={{ paddingTop: 72 + 32 }}>
        {successMsg && (
          <SuccessMessage message={successMsg} onClose={() => setSuccessMsg('')} />
        )}

        {/* Filter Bar */}
        <div className="bg-white rounded-xl p-5 mb-4" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text" value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search complaints..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2"
              />
            </div>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none bg-white">
              <option value="">All Statuses</option>
              {statusOptions.map((s) => <option key={s}>{s}</option>)}
            </select>
            <select value={filterPurpose} onChange={(e) => setFilterPurpose(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none bg-white">
              <option value="">All Purposes</option>
              {purposes.map((p) => <option key={p}>{p}</option>)}
            </select>
            <select value={filterOwner} onChange={(e) => setFilterOwner(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none bg-white">
              <option value="">All Owners</option>
              {owners.map((o) => <option key={o}>{o}</option>)}
            </select>
            <button className="flex items-center gap-2 px-4 py-2.5 text-white text-sm rounded-xl"
              style={{ backgroundColor: '#00C4B4' }}>
              <Filter className="w-4 h-4" /> More Filters
            </button>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <input type="checkbox"
              checked={selected.size === filtered.length && filtered.length > 0}
              onChange={toggleAll} className="w-4 h-4 rounded border-gray-300" />
            {selected.size > 0 && (
              <span className="text-sm text-gray-600">({selected.size} selected)</span>
            )}
            <div className="flex gap-2">
              {[
                { label: 'Assign Owner',          action: () => setActiveModal('assign') },
                { label: 'Update Status',          action: () => setActiveModal('status') },
                { label: 'Add Remarks',            action: () => setActiveModal('remarks') },
                { label: 'Upload Evidence',        action: () => setActiveModal('evidence') },
                { label: 'Generate Closure Proof', action: handleGenerateClosure },
              ].map((btn) => (
                <button key={btn.label} disabled={selected.size === 0} onClick={btn.action}
                  className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-xl hover:bg-gray-50">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl overflow-hidden mb-6" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 w-10"></th>
                {['ID','Customer','Purpose','Date','Status','SLA','Owner','Actions'].map(h => (
                  <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-sm text-gray-500">
                    Loading complaints...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-sm text-gray-500">
                    No complaints found
                  </td>
                </tr>
              ) : filtered.map((complaint) => {
                const sc   = statusColors[complaint.status]   || statusColors['Open']
                const slac = slaColors[complaint.sla]         || slaColors['On Track']
                return (
                  <tr key={complaint.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <input type="checkbox" checked={selected.has(complaint.id)}
                        onChange={() => toggleSelect(complaint.id)}
                        className="w-4 h-4 rounded border-gray-300" />
                    </td>
                    <td className="px-6 py-4 text-sm font-medium" style={{ color: '#0A2540' }}>
                      {complaint.id.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{complaint.customer}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{complaint.purpose}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{complaint.date}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full border"
                        style={{ backgroundColor: sc.bg, color: sc.text, borderColor: sc.border }}>
                        {complaint.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full border"
                        style={{ backgroundColor: slac.bg, color: slac.text, borderColor: slac.border }}>
                        {complaint.sla}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{complaint.owner}</td>
                    <td className="px-6 py-4">
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Quick Action Cards */}
        <div className="grid grid-cols-5 gap-4">
          {[
            { title: 'Assign Owner',          desc: 'Assign selected complaints to a team member', action: () => setActiveModal('assign') },
            { title: 'Update Status',          desc: 'Change status for selected complaints',       action: () => setActiveModal('status') },
            { title: 'Add Remarks',            desc: 'Add internal notes to selected complaints',   action: () => setActiveModal('remarks') },
            { title: 'Upload Evidence',        desc: 'Attach supporting documents',                 action: () => setActiveModal('evidence') },
            { title: 'Generate Closure Proof', desc: 'Generate proof for resolved complaints',      action: handleGenerateClosure },
          ].map((card) => (
            <button key={card.title} onClick={card.action} disabled={selected.size === 0}
              className="bg-white rounded-xl p-4 text-left hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
              <p className="text-sm font-medium mb-1" style={{ color: '#0A2540' }}>{card.title}</p>
              <p className="text-xs text-gray-500">{card.desc}</p>
            </button>
          ))}
        </div>
      </main>

      {/* MODALS */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold" style={{ color: '#0A2540' }}>
                {activeModal === 'assign'   && 'Assign Owner'}
                {activeModal === 'status'   && 'Update Status'}
                {activeModal === 'remarks'  && 'Add Remarks'}
                {activeModal === 'evidence' && 'Upload Evidence'}
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">Action for {selected.size} complaint(s)</p>

            {activeModal === 'assign' && (
              <>
                <select value={selectedOwner} onChange={(e) => setSelectedOwner(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 mb-4">
                  <option value="">Choose an owner...</option>
                  {owners.map((o) => <option key={o}>{o}</option>)}
                </select>
                <div className="flex gap-3 justify-end">
                  <button onClick={() => setActiveModal(null)} className="px-4 py-2 border border-gray-300 rounded-xl text-sm">Cancel</button>
                  <button onClick={handleAssign} disabled={!selectedOwner}
                    className="px-4 py-2 text-white text-sm rounded-xl disabled:opacity-50"
                    style={{ backgroundColor: '#00C4B4' }}>Assign</button>
                </div>
              </>
            )}

            {activeModal === 'status' && (
              <>
                <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 mb-4">
                  <option value="">Choose a status...</option>
                  {statusOptions.map((s) => <option key={s}>{s}</option>)}
                </select>
                <div className="flex gap-3 justify-end">
                  <button onClick={() => setActiveModal(null)} className="px-4 py-2 border border-gray-300 rounded-xl text-sm">Cancel</button>
                  <button onClick={handleStatusUpdate} disabled={!selectedStatus}
                    className="px-4 py-2 text-white text-sm rounded-xl disabled:opacity-50"
                    style={{ backgroundColor: '#00C4B4' }}>Update</button>
                </div>
              </>
            )}

            {activeModal === 'remarks' && (
              <>
                <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)}
                  rows={4} placeholder="Enter internal notes or remarks..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 resize-none mb-4" />
                <div className="flex gap-3 justify-end">
                  <button onClick={() => setActiveModal(null)} className="px-4 py-2 border border-gray-300 rounded-xl text-sm">Cancel</button>
                  <button onClick={handleRemarks} disabled={!remarks.trim()}
                    className="px-4 py-2 text-white text-sm rounded-xl disabled:opacity-50"
                    style={{ backgroundColor: '#00C4B4' }}>Save</button>
                </div>
              </>
            )}

            {activeModal === 'evidence' && (
              <>
                {!uploadSuccess ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-[#00C4B4] transition-colors mb-4"
                    onClick={handleUpload}>
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-1">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500">PDF, DOC, JPG, PNG (Max 10MB)</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                      <span className="text-emerald-700 text-lg">✓</span>
                    </div>
                    <p className="text-sm font-medium text-emerald-900">Evidence uploaded successfully!</p>
                  </div>
                )}
                <div className="flex gap-3 justify-end">
                  <button onClick={() => setActiveModal(null)} className="px-4 py-2 border border-gray-300 rounded-xl text-sm">Cancel</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
