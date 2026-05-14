import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  TrendingUp, TrendingDown, AlertTriangle, Settings,
  FileText, Upload, CheckCircle, Search, RefreshCw, AlertCircle, Loader2,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import Header from '../components/Header'

// ─── TYPES ────────────────────────────────────────────────────────────────────

/** GET /dashboard/summary → KPI numbers, complaint mini-cards */
interface SummaryData {
  totalActiveConsents: { value: number; change: string; positive: boolean }
  withdrawnConsents:   { value: number; change: string; positive: boolean }
  expiredConsents:     { value: number }
  pendingRenewals:     { value: number }
  openComplaints:      { value: number; breach: number }
  complaintKpis:       { label: string; value: number }[]
}

/** GET /dashboard/risk-alerts → risk alert cards */
interface RiskAlert {
  text:     string
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
}

// Status for each individual regulatory action button
type ActionStatus = 'idle' | 'loading' | 'success' | 'error'

// Static definition of the 3 regulatory actions (labels / icons / endpoints are known)
const REGULATORY_ACTIONS = [
  {
    id:       'prepareReport'           as const,
    label:    'Prepare Regulator Response Packs',
    icon:     <FileText className="w-4 h-4" />,
    endpoint: '/dashboard/regulatory-actions/prepare-report',
    primary:  true,
  },
  {
    id:       'attachConsentProof'      as const,
    label:    'Attach Consent Proof',
    icon:     <Upload className="w-4 h-4" />,
    endpoint: '/dashboard/regulatory-actions/attach-consent-proof',
    primary:  false,
  },
  {
    id:       'attachResolutionEvidence' as const,
    label:    'Attach Resolution Evidence',
    icon:     <CheckCircle className="w-4 h-4" />,
    endpoint: '/dashboard/regulatory-actions/attach-resolution-evidence',
    primary:  false,
  },
] as const

type RegulatoryActionId = typeof REGULATORY_ACTIONS[number]['id']

/** GET /dashboard/purpose-distribution → horizontal bar chart + table */
interface PurposeItem {
  purpose:    string
  count:      number
  percentage: number
}

/** GET /dashboard/channel-distribution → donut chart */
interface ChannelItem {
  name:  string
  value: number   // percentage 0-100
  color: string   // hex color, e.g. "#00C4B4"
}

/**
 * GET /consent?searchType=<mobile|email|customerId|consentId>&query=<value>
 * Used for the Consent Proof Retrieval search panel.
 * The endpoint is called on user-initiated search, not on mount.
 */
interface ConsentProofResult {
  id:    string
  label: string   // display text for the result card
  type:  'fullChain' | 'noticeVersion' | 'withdrawalHistory' | 'eventHistory'
}

// ─── API CONFIG ───────────────────────────────────────────────────────────────

const BASE_URL = 'http://localhost:3001'

// searchType values sent to /consent
const searchTypeMap: Record<string, string> = {
  Mobile:        'mobile',
  Email:         'email',
  'Customer ID': 'customerId',
  'Consent ID':  'consentId',
}

// ─── SKELETON HELPERS ─────────────────────────────────────────────────────────

function SkeletonBox({ className = '', style = {} }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`animate-pulse rounded-lg bg-gray-200 ${className}`} style={style} />
}

function KpiCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-5" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
      <SkeletonBox className="h-3 w-28 mb-3" />
      <SkeletonBox className="h-8 w-24 mb-2" />
      <SkeletonBox className="h-3 w-16" />
    </div>
  )
}

function ChartSkeleton() {
  return (
    <div className="animate-pulse space-y-3 pt-2" style={{ height: 220 }}>
      {[80, 65, 50, 40, 30].map((w, i) => (
        <div key={i} className="flex items-center gap-3">
          <SkeletonBox className="h-3 flex-shrink-0" style={{ width: 180 }} />
          <SkeletonBox className="h-5 rounded-full" style={{ width: `${w}%` }} />
        </div>
      ))}
    </div>
  )
}

function DonutSkeleton() {
  return (
    <div className="flex flex-col items-center gap-4 animate-pulse">
      <div className="rounded-full border-[20px] border-gray-200" style={{ width: 160, height: 160 }} />
      <div className="w-full space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <SkeletonBox className="w-2.5 h-2.5 rounded-full flex-shrink-0" />
            <SkeletonBox className="h-3 flex-1" />
            <SkeletonBox className="h-3 w-8" />
          </div>
        ))}
      </div>
    </div>
  )
}

function ConsentResultSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonBox key={i} className="h-10 rounded-lg" />
      ))}
    </div>
  )
}

// ─── ERROR BANNER ─────────────────────────────────────────────────────────────

function ErrorBanner({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-xl p-4 mb-4 border border-rose-200 bg-rose-50">
      <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-medium text-rose-800">Failed to load data</p>
        <p className="text-xs text-rose-600 mt-0.5">{message}</p>
      </div>
      <button
        onClick={onRetry}
        className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-100 transition-colors"
      >
        <RefreshCw className="w-3 h-3" />
        Retry
      </button>
    </div>
  )
}

// ─── STATIC FALLBACK CARDS (shown before any search is made) ──────────────────

const DEFAULT_PROOF_CARDS = [
  'Full Consent Chain',
  'Notice Version',
  'Withdrawal History',
  'Event History',
]

// ─── SEARCH TABS ──────────────────────────────────────────────────────────────

const SEARCH_TABS = ['Mobile', 'Email', 'Customer ID', 'Consent ID']
const PLACEHOLDER_MAP: Record<string, string> = {
  Mobile:        'Search by mobile number...',
  Email:         'Search by email address...',
  'Customer ID': 'Search by customer ID...',
  'Consent ID':  'Search by consent ID...',
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function DashboardScreen() {
  const navigate = useNavigate()

  // ── Auth token — swap localStorage for your own auth mechanism if needed
  const [accessToken] = useState<string | null>(() => sessionStorage.getItem('accessToken'))

  // ── UI state
  const [activeSearchTab, setActiveSearchTab] = useState('Mobile')
  const [searchQuery, setSearchQuery]         = useState('')

  // ── 1. /dashboard/summary  (KPIs, complaint cards, risk alerts)
  const [summary, setSummary]               = useState<SummaryData | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [summaryError, setSummaryError]     = useState<string | null>(null)

  // ── 2. /dashboard/purpose-distribution  (bar chart)
  const [purposeData, setPurposeData]           = useState<PurposeItem[]>([])
  const [purposeLoading, setPurposeLoading]     = useState(true)
  const [purposeError, setPurposeError]         = useState<string | null>(null)

  // ── 3. /dashboard/channel-distribution  (donut chart)
  const [channelData, setChannelData]           = useState<ChannelItem[]>([])
  const [channelLoading, setChannelLoading]     = useState(true)
  const [channelError, setChannelError]         = useState<string | null>(null)

  // ── 4. /dashboard/risk-alerts  (separate from summary)
  const [riskAlerts, setRiskAlerts]             = useState<RiskAlert[]>([])
  const [riskAlertsLoading, setRiskAlertsLoading] = useState(true)
  const [riskAlertsError, setRiskAlertsError]   = useState<string | null>(null)

  // ── 5. Regulatory Response Console — per-button action status (user-triggered)
  const [actionStatuses, setActionStatuses] = useState<Record<RegulatoryActionId, ActionStatus>>({
    prepareReport:            'idle',
    attachConsentProof:       'idle',
    attachResolutionEvidence: 'idle',
  })
  // Stores error message per action id
  const [actionErrors, setActionErrors] = useState<Partial<Record<RegulatoryActionId, string>>>({})

  // ── 6. /consent  (consent proof retrieval — user-triggered search)
  const [consentResults, setConsentResults]     = useState<ConsentProofResult[] | null>(null)
  const [consentLoading, setConsentLoading]     = useState(false)
  const [consentError, setConsentError]         = useState<string | null>(null)

  // ── Auth headers helper ────────────────────────────────────────────────────
  const authHeaders = (): HeadersInit => ({
    'Content-Type': 'application/json',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  })

  // ── Fetch helpers ──────────────────────────────────────────────────────────

  /** 1. GET /dashboard/summary */
  const fetchSummary = async () => {
    setSummaryLoading(true)
    setSummaryError(null)
    try {
      const res = await fetch(`${BASE_URL}/dashboard/summary`, { headers: authHeaders() })
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
      setSummary((await res.json()).data)
    } catch (err) {
      setSummaryError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setSummaryLoading(false)
    }
  }

  /** 2. GET /dashboard/purpose-distribution */
  const fetchPurposeDistribution = async () => {
    setPurposeLoading(true)
    setPurposeError(null)
    try {
      const res = await fetch(`${BASE_URL}/dashboard/purpose-distribution`, { headers: authHeaders() })
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
      setPurposeData((await res.json()).data)
    } catch (err) {
      setPurposeError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setPurposeLoading(false)
    }
  }

  /** 3. GET /dashboard/channel-distribution */
  const fetchChannelDistribution = async () => {
    setChannelLoading(true)
    setChannelError(null)
    try {
      const res = await fetch(`${BASE_URL}/dashboard/channel-distribution`, { headers: authHeaders() })
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
      setChannelData((await res.json()).data)
    } catch (err) {
      setChannelError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setChannelLoading(false)
    }
  }

  /** 4. GET /dashboard/risk-alerts */
  const fetchRiskAlerts = async () => {
    setRiskAlertsLoading(true)
    setRiskAlertsError(null)
    try {
      const res = await fetch(`${BASE_URL}/dashboard/risk-alerts`, { headers: authHeaders() })
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
      setRiskAlerts((await res.json()).data)
    } catch (err) {
      setRiskAlertsError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setRiskAlertsLoading(false)
    }
  }

  /**
   * 5. POST /dashboard/regulatory-actions/<actionId>
   * Each button triggers its own fetch and tracks status independently.
   * Auto-resets to 'idle' after 4 s on success.
   */
  const triggerRegulatoryAction = async (actionId: RegulatoryActionId, endpoint: string) => {
    // Prevent double-firing while already loading
    if (actionStatuses[actionId] === 'loading') return

    setActionStatuses((prev) => ({ ...prev, [actionId]: 'loading' }))
    setActionErrors((prev) => { const next = { ...prev }; delete next[actionId]; return next })
    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method:  'POST',
        headers: authHeaders(),
      })
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
      setActionStatuses((prev) => ({ ...prev, [actionId]: 'success' }))
      // Auto-reset to idle after 4 s so the button is reusable
      setTimeout(() => setActionStatuses((prev) => ({ ...prev, [actionId]: 'idle' })), 4000)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setActionStatuses((prev) => ({ ...prev, [actionId]: 'error' }))
      setActionErrors((prev) => ({ ...prev, [actionId]: msg }))
    }
  }

  /**
   * 6. GET /consent?searchType=<type>&query=<value>
   * Called only when the user submits the search — NOT on mount.
   */
  const fetchConsentProof = async () => {
    const trimmed = searchQuery.trim()
    if (!trimmed) return

    setConsentLoading(true)
    setConsentError(null)
    setConsentResults(null)
    try {
      const params = new URLSearchParams({
        searchType: searchTypeMap[activeSearchTab],
        query:      trimmed,
      })
      const res = await fetch(`${BASE_URL}/consent?${params}`, { headers: authHeaders() })
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
      setConsentResults(await res.json())
    } catch (err) {
      setConsentError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setConsentLoading(false)
    }
  }

  // ── On mount: fire the four dashboard fetches in parallel ─────────────────
  useEffect(() => {
    fetchSummary()
    fetchPurposeDistribution()
    fetchChannelDistribution()
    fetchRiskAlerts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Re-fetch consent results when the search tab changes (clear stale data) ─
  useEffect(() => {
    setConsentResults(null)
    setConsentError(null)
    setSearchQuery('')
  }, [activeSearchTab])

  // ─── RENDER ────────────────────────────────────────────────────────────────

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', backgroundColor: '#F8F9FA', minHeight: '100vh' }}>
      <Header />

      <main className="overflow-auto p-8" style={{ paddingTop: 72 + 32, minHeight: '100vh' }}>

        {/* ── Top Bar ── */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold" style={{ color: '#0A2540' }}>
            DPO Governance Dashboard
          </h1>
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border-2 text-sm font-medium transition-all"
            style={{ borderColor: '#00C4B4', color: '#00C4B4' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#00C4B4'; e.currentTarget.style.color = '#ffffff' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.color = '#00C4B4' }}
          >
            <Settings className="w-4 h-4" />
            Admin Settings
          </button>
        </div>

        {/* ── Global Error Banners (one per failing endpoint) ── */}
        {summaryError    && <ErrorBanner message={`/dashboard/summary — ${summaryError}`}               onRetry={fetchSummary} />}
        {purposeError    && <ErrorBanner message={`/dashboard/purpose-distribution — ${purposeError}`}  onRetry={fetchPurposeDistribution} />}
        {channelError    && <ErrorBanner message={`/dashboard/channel-distribution — ${channelError}`}  onRetry={fetchChannelDistribution} />}
        {riskAlertsError && <ErrorBanner message={`/dashboard/risk-alerts — ${riskAlertsError}`}        onRetry={fetchRiskAlerts} />}

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          {summaryLoading
            ? Array.from({ length: 5 }).map((_, i) => <KpiCardSkeleton key={i} />)
            : summary && (
              <>
                {/* Total Active Consents */}
                <div className="bg-white rounded-xl p-5" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
                  <p className="text-xs text-gray-500 mb-2">Total Active Consents</p>
                  <p className="text-2xl font-semibold" style={{ color: '#0A2540' }}>
                    {summary.totalActiveConsents.value.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    {summary.totalActiveConsents.positive
                      ? <TrendingUp className="w-3 h-3 text-emerald-600" />
                      : <TrendingDown className="w-3 h-3 text-gray-400" />}
                    <span className={`text-xs ${summary.totalActiveConsents.positive ? 'text-emerald-600' : 'text-gray-400'}`}>
                      {summary.totalActiveConsents.change}
                    </span>
                  </div>
                </div>

                {/* Withdrawn Consents */}
                <div className="bg-white rounded-xl p-5" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
                  <p className="text-xs text-gray-500 mb-2">Withdrawn Consents</p>
                  <p className="text-2xl font-semibold" style={{ color: '#0A2540' }}>
                    {summary.withdrawnConsents.value.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingDown className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-400">{summary.withdrawnConsents.change}</span>
                  </div>
                </div>

                {/* Expired Consents */}
                <div className="bg-white rounded-xl p-5" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
                  <p className="text-xs text-gray-500 mb-2">Expired Consents</p>
                  <p className="text-2xl font-semibold" style={{ color: '#0A2540' }}>
                    {summary.expiredConsents.value.toLocaleString()}
                  </p>
                </div>

                {/* Pending Renewals */}
                <div className="bg-white rounded-xl p-5" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
                  <p className="text-xs text-gray-500 mb-2">Pending Renewals</p>
                  <p className="text-2xl font-semibold" style={{ color: '#0A2540' }}>
                    {summary.pendingRenewals.value.toLocaleString()}
                  </p>
                </div>

                {/* Open Complaints */}
                <div className="bg-white rounded-xl p-5" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
                  <p className="text-xs text-gray-500 mb-2">Open Complaints</p>
                  <p className="text-2xl font-semibold" style={{ color: '#0A2540' }}>
                    {summary.openComplaints.value}
                  </p>
                  <span className="text-xs" style={{ color: '#E11D48' }}>
                    {summary.openComplaints.breach} SLA breaches
                  </span>
                </div>
              </>
            )}
        </div>

        {/* ── Charts Row ── */}
        <div className="grid grid-cols-3 gap-6 mb-6">

          {/* Purpose-wise Distribution — driven by /dashboard/purpose-distribution */}
          <div className="col-span-2 bg-white rounded-xl p-6" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
            <h2 className="text-base font-semibold mb-4" style={{ color: '#0A2540' }}>
              Purpose-wise Consent Distribution
            </h2>
            {purposeLoading ? (
              <ChartSkeleton />
            ) : purposeData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={purposeData}
                    layout="vertical"
                    margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis dataKey="purpose" type="category" width={210} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v: number) => v.toLocaleString()} />
                    <Bar dataKey="count" fill="#00C4B4" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {purposeData.map((d) => (
                    <div key={d.purpose} className="flex justify-between text-sm">
                      <span className="text-gray-600">{d.purpose}</span>
                      <span className="font-medium" style={{ color: '#0A2540' }}>
                        {d.count.toLocaleString()} ({d.percentage}%)
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : !purposeError ? (
              <p className="text-sm text-gray-400 text-center py-12">No data available</p>
            ) : null}
          </div>

          {/* Channel Distribution — driven by /dashboard/channel-distribution */}
          <div className="bg-white rounded-xl p-6" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
            <h2 className="text-base font-semibold mb-4" style={{ color: '#0A2540' }}>
              Channel Distribution
            </h2>
            {channelLoading ? (
              <DonutSkeleton />
            ) : channelData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={channelData}
                      cx="50%" cy="50%"
                      innerRadius={60} outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {channelData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => `${v}%`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-3 space-y-2">
                  {channelData.map((d) => (
                    <div key={d.name} className="flex items-center gap-2 text-sm">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                      <span className="text-gray-600 flex-1">{d.name}</span>
                      <span className="font-medium" style={{ color: '#0A2540' }}>{d.value}%</span>
                    </div>
                  ))}
                </div>
              </>
            ) : !channelError ? (
              <p className="text-sm text-gray-400 text-center py-12">No data available</p>
            ) : null}
          </div>
        </div>

        {/* ── Complaint Management + Risk Alerts ── */}
        <div className="grid grid-cols-3 gap-6 mb-6">

          {/* Complaint Management — data from /dashboard/summary */}
          <div className="col-span-2 bg-white rounded-xl p-6" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
            <h2 className="text-base font-semibold mb-4" style={{ color: '#0A2540' }}>
              Complaint Management
            </h2>
            <div className="grid grid-cols-4 gap-3 mb-5">
              {summaryLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="border border-gray-200 rounded-lg p-3 text-center animate-pulse">
                      <SkeletonBox className="h-6 w-10 mx-auto mb-1" />
                      <SkeletonBox className="h-3 w-20 mx-auto" />
                    </div>
                  ))
                : summary?.complaintKpis.map((kpi) => (
                    <div key={kpi.label} className="border border-gray-200 rounded-lg p-3 text-center">
                      <p className="text-xl font-semibold" style={{ color: '#0A2540' }}>{kpi.value}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{kpi.label}</p>
                    </div>
                  ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Assign Owner',           icon: <FileText className="w-4 h-4" /> },
                { label: 'Update Status',          icon: <CheckCircle className="w-4 h-4" /> },
                { label: 'Add Remarks',            icon: <FileText className="w-4 h-4" /> },
                { label: 'Upload Evidence',        icon: <Upload className="w-4 h-4" /> },
                { label: 'Generate Closure Proof', icon: <CheckCircle className="w-4 h-4" /> },
              ].map((btn) => (
                <button
                  key={btn.label}
                  onClick={() => navigate('/complaints')}
                  className="flex items-center gap-2 px-3 py-2 text-white text-sm rounded-lg transition-colors"
                  style={{ backgroundColor: '#00C4B4' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#00B3A3')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#00C4B4')}
                >
                  {btn.icon}
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Risk Alerts — data from /dashboard/risk-alerts */}
          <div className="bg-white rounded-xl p-6" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
            <h2 className="text-base font-semibold mb-4" style={{ color: '#0A2540' }}>
              Risk Alerts
            </h2>
            {riskAlertsLoading ? (
              <div className="space-y-3 animate-pulse">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="rounded-lg p-3 border border-orange-100 bg-orange-50">
                    <SkeletonBox className="h-3 w-full mb-2 bg-orange-200" />
                    <SkeletonBox className="h-3 w-2/3 bg-orange-200" />
                  </div>
                ))}
              </div>
            ) : riskAlerts.length > 0 ? (
              <div className="space-y-3">
                {riskAlerts.map((alert, i) => (
                  <div
                    key={i}
                    className="rounded-lg p-3 border"
                    style={{
                      backgroundColor: alert.priority === 'HIGH' ? '#FFF7ED' : '#FFFBEB',
                      borderColor:     alert.priority === 'HIGH' ? '#FDBA74' : '#FCD34D',
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <AlertTriangle
                        className="w-4 h-4 flex-shrink-0 mt-0.5"
                        style={{ color: alert.priority === 'HIGH' ? '#E11D48' : '#D97706' }}
                      />
                      <div className="flex-1">
                        <p className="text-sm text-gray-700">{alert.text}</p>
                        <button className="text-xs mt-1 hover:underline" style={{ color: '#00C4B4' }}>
                          Review →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : !riskAlertsError ? (
              <p className="text-sm text-gray-400 text-center py-8">No active risk alerts</p>
            ) : null}
          </div>
        </div>

        {/* ── Consent Proof Retrieval + Regulatory Response ── */}
        <div className="grid grid-cols-3 gap-6">

          {/*
            Consent Proof Retrieval
            Calls GET /consent?searchType=<type>&query=<value> on user search.
            Shows static action cards by default; replaces them with API results after search.
          */}
          <div className="col-span-2 bg-white rounded-xl p-6" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
            <h2 className="text-base font-semibold mb-4" style={{ color: '#0A2540' }}>
              Consent Proof Retrieval
            </h2>

            {/* Search type tabs */}
            <div className="flex gap-2 mb-4">
              {SEARCH_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveSearchTab(tab)}
                  className="px-3 py-2 text-sm rounded-lg transition-colors"
                  style={{
                    backgroundColor: activeSearchTab === tab ? '#00C4B4' : '#F3F4F6',
                    color:           activeSearchTab === tab ? '#ffffff'  : '#374151',
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Search input — pressing Enter or clicking the icon triggers fetchConsentProof */}
            <div className="relative mb-4">
              <button
                onClick={fetchConsentProof}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchConsentProof()}
                placeholder={PLACEHOLDER_MAP[activeSearchTab]}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2"
              />
            </div>

            {/* Consent search error */}
            {consentError && (
              <div className="flex items-center gap-2 text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 mb-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{consentError}</span>
                <button onClick={fetchConsentProof} className="ml-auto underline hover:no-underline">Retry</button>
              </div>
            )}

            {/* Result area */}
            {consentLoading ? (
              <ConsentResultSkeleton />
            ) : consentResults !== null ? (
              /* Show API results after a search */
              consentResults.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {consentResults.map((result) => (
                    <button
                      key={result.id}
                      className="text-left bg-gray-50 rounded-lg p-3 text-sm font-medium hover:bg-gray-100 transition-colors"
                      style={{ color: '#0A2540' }}
                    >
                      {result.label}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-6">
                  No consent records found for this {activeSearchTab.toLowerCase()}.
                </p>
              )
            ) : (
              /* Default state before any search — static action cards */
              <div className="grid grid-cols-2 gap-3">
                {DEFAULT_PROOF_CARDS.map((card) => (
                  <button
                    key={card}
                    className="text-left bg-gray-50 rounded-lg p-3 text-sm font-medium hover:bg-gray-100 transition-colors"
                    style={{ color: '#0A2540' }}
                  >
                    {card}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Regulatory Response Console — each button triggers its own POST and shows inline status */}
          <div className="bg-white rounded-xl p-6" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
            <h2 className="text-base font-semibold mb-4" style={{ color: '#0A2540' }}>
              Regulatory Response Console
            </h2>
            <div className="space-y-3">
              {REGULATORY_ACTIONS.map((action) => {
                const status = actionStatuses[action.id]
                const errMsg = actionErrors[action.id]
                const isLoading = status === 'loading'
                const isSuccess = status === 'success'
                const isError   = status === 'error'

                return (
                  <div key={action.id}>
                    <button
                      disabled={isLoading}
                      onClick={() => triggerRegulatoryAction(action.id, action.endpoint)}
                      className={`w-full flex items-center gap-2 px-4 py-3 text-sm rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                        action.primary ? 'text-white' : 'border-2'
                      }`}
                      style={
                        action.primary
                          ? {
                              backgroundColor: isSuccess ? '#059669' : isError ? '#E11D48' : '#00C4B4',
                            }
                          : {
                              borderColor:     isSuccess ? '#059669' : isError ? '#E11D48' : '#00C4B4',
                              color:           isSuccess ? '#059669' : isError ? '#E11D48' : '#00C4B4',
                              backgroundColor: '#ffffff',
                            }
                      }
                      onMouseEnter={(e) => {
                        if (isLoading) return
                        if (action.primary) {
                          e.currentTarget.style.backgroundColor = isSuccess ? '#047857' : isError ? '#BE123C' : '#00B3A3'
                        } else {
                          const c = isSuccess ? '#059669' : isError ? '#E11D48' : '#00C4B4'
                          e.currentTarget.style.backgroundColor = c
                          e.currentTarget.style.color = '#ffffff'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (action.primary) {
                          e.currentTarget.style.backgroundColor = isSuccess ? '#059669' : isError ? '#E11D48' : '#00C4B4'
                        } else {
                          e.currentTarget.style.backgroundColor = '#ffffff'
                          e.currentTarget.style.color = isSuccess ? '#059669' : isError ? '#E11D48' : '#00C4B4'
                        }
                      }}
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                      ) : isSuccess ? (
                        <CheckCircle className="w-4 h-4 flex-shrink-0" />
                      ) : isError ? (
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      ) : (
                        <span className="flex-shrink-0">{action.icon}</span>
                      )}

                      <span className="flex-1 text-left">
                        {isLoading ? 'Processing…'
                          : isSuccess ? 'Done — report ready'
                          : isError   ? 'Failed — click to retry'
                          : action.label}
                      </span>
                    </button>

                    {/* Inline error detail shown below the button */}
                    {isError && errMsg && (
                      <p className="text-xs text-rose-500 mt-1 pl-1">{errMsg}</p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
