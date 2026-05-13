// ─── TYPES ───────────────────────────────────────────────────────────────────

export interface Complaint {
  id: string
  customer: string
  purpose: string
  date: string
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed'
  sla: 'On Track' | 'At Risk' | 'Breached' | 'Closed'
  owner: string
}

export interface RegulatorReport {
  id: string
  date: string
  type: string
  regulator: string
  description: string
  status: 'Submitted' | 'Pending' | 'Draft'
}

export interface TimelineItem {
  date: string
  type: string
  description: string
  status: 'completed' | 'pending'
}

export interface AuditLog {
  timestamp: string
  adminUser: string
  action: string
  consentId: string
  ipAddress: string
  details: string
}

export interface Organization {
  name: string
  dpoEmail: string
  status: 'Active' | 'Pending'
  users: number
  totalConsents: number
}

export interface Report {
  id: string
  name: string
  description: string
  category: 'compliance' | 'operational' | 'analytical'
  cmpAdmin: boolean
  regulator: boolean
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'on-demand'
  lastGenerated?: string
  status?: 'available' | 'generating' | 'scheduled'
}

export interface ConsentPurpose {
  id: string
  title: string
  type: 'MANDATORY' | 'OPTIONAL'
  description: string
  fields: { name: string; checked: boolean }[]
  validityDays: number
  validityLabel: string
  noticeText: string
  enabled: boolean
}

// ─── KPI DATA ─────────────────────────────────────────────────────────────────

export const kpiData = {
  totalActiveConsents: { value: 124502, change: '+2.3%', positive: true },
  withdrawnConsents: { value: 3821, change: '-0.5%', positive: false },
  expiredConsents: { value: 1204, change: '', positive: null },
  pendingRenewals: { value: 892, change: '', positive: null },
  openComplaints: { value: 47, breach: 3 },
}

// ─── CHART DATA ───────────────────────────────────────────────────────────────

export const purposeChartData = [
  { purpose: 'Marketing & Communication', count: 42350, percentage: 34 },
  { purpose: 'Financial Profile Analysis', count: 31120, percentage: 25 },
  { purpose: 'Investment Data Processing', count: 24900, percentage: 20 },
  { purpose: 'Nominee Details Management', count: 18675, percentage: 15 },
  { purpose: 'KYC (Legitimate Interest)', count: 7457, percentage: 6 },
]

export const channelDistributionData = [
  { name: 'Mobile App', value: 45, color: '#00C4B4' },
  { name: 'Web', value: 30, color: '#0A2540' },
  { name: 'Email', value: 15, color: '#10B981' },
  { name: 'Branch', value: 7, color: '#6366F1' },
  { name: 'In-App', value: 3, color: '#9CA3AF' },
]

export const complaintKpiData = [
  { label: 'Open Complaints', value: 47 },
  { label: 'Closed Complaints', value: 312 },
  { label: 'SLA Breaches', value: 3 },
  { label: 'Pending Regulator Cases', value: 2 },
]

export const riskAlerts = [
  { text: 'Missing consent for active processing — 3 customers affected', priority: 'HIGH' },
  { text: 'Expired consent still in use — Marketing segment', priority: 'HIGH' },
  { text: 'Unmatched purpose processing detected — KYC module', priority: 'MEDIUM' },
  { text: 'High complaint clusters — Financial Profile purpose', priority: 'MEDIUM' },
]

// ─── COMPLAINTS ───────────────────────────────────────────────────────────────

export const complaintsData: Complaint[] = [
  { id: 'CMP-2024-0847', customer: 'Rahul Sharma', purpose: 'Marketing & Communication', date: '2024-04-07', status: 'Open', sla: 'Breached', owner: 'Priya M.' },
  { id: 'CMP-2024-0846', customer: 'Anjali Desai', purpose: 'Financial Profile Analysis', date: '2024-04-06', status: 'In Progress', sla: 'At Risk', owner: 'Amit K.' },
  { id: 'CMP-2024-0845', customer: 'Vikram Patel', purpose: 'Investment Data Processing', date: '2024-04-05', status: 'Resolved', sla: 'Closed', owner: 'Priya M.' },
  { id: 'CMP-2024-0844', customer: 'Sneha Krishnan', purpose: 'Nominee Details Management', date: '2024-04-05', status: 'Open', sla: 'On Track', owner: 'Unassigned' },
  { id: 'CMP-2024-0843', customer: 'Arjun Mehta', purpose: 'KYC (Legitimate Interest)', date: '2024-04-04', status: 'In Progress', sla: 'On Track', owner: 'Amit K.' },
  { id: 'CMP-2024-0842', customer: 'Priya Nair', purpose: 'Marketing & Communication', date: '2024-04-03', status: 'Resolved', sla: 'Closed', owner: 'Priya M.' },
  { id: 'CMP-2024-0841', customer: 'Rohit Verma', purpose: 'Financial Profile Analysis', date: '2024-04-02', status: 'Open', sla: 'Breached', owner: 'Unassigned' },
  { id: 'CMP-2024-0840', customer: 'Deepika Rao', purpose: 'Investment Data Processing', date: '2024-04-01', status: 'In Progress', sla: 'At Risk', owner: 'Amit K.' },
]

// ─── REGULATOR REPORTS ───────────────────────────────────────────────────────

export const regulatorReports: RegulatorReport[] = [
  { id: 'REG-2024-0123', date: '2024-04-05', type: 'Quarterly Compliance', regulator: 'SEBI', description: 'Q1 2024 DPDPA Consent Compliance Report', status: 'Submitted' },
  { id: 'REG-2024-0122', date: '2024-03-28', type: 'Incident Report', regulator: 'RBI', description: 'Data breach incident — 3 affected accounts', status: 'Pending' },
  { id: 'REG-2024-0121', date: '2024-01-15', type: 'Quarterly Compliance', regulator: 'SEBI', description: 'Q4 2023 DPDPA Consent Compliance Report', status: 'Submitted' },
]

export const communicationTimeline: TimelineItem[] = [
  { date: '2024-04-07', type: 'Notice Received', description: 'SEBI compliance verification notice received for Q1 2024', status: 'completed' },
  { date: '2024-04-05', type: 'Response Submitted', description: 'Response submitted with full consent proof pack attached', status: 'completed' },
  { date: '2024-03-28', type: 'Notice Received', description: 'RBI escalation notice for incident report — awaiting closure', status: 'pending' },
  { date: '2024-03-20', type: 'Response Submitted', description: 'Q4 2023 annual report submitted to SEBI', status: 'completed' },
]

// ─── AUDIT LOGS ──────────────────────────────────────────────────────────────

export const auditLogs: AuditLog[] = [
  { timestamp: '2024-04-07 14:32:10', adminUser: 'priya.m@audix.in', action: 'Updated Complaint Status', consentId: 'CMP-2024-0847', ipAddress: '192.168.1.42', details: 'Status changed from Open to In Progress' },
  { timestamp: '2024-04-07 13:15:44', adminUser: 'amit.k@audix.in', action: 'Exported Compliance Report', consentId: 'REG-2024-0123', ipAddress: '192.168.1.38', details: 'Q1 2024 SEBI report exported as PDF' },
  { timestamp: '2024-04-07 12:08:22', adminUser: 'dpo@audix.in', action: 'Assigned Complaint Owner', consentId: 'CMP-2024-0846', ipAddress: '192.168.1.10', details: 'Owner assigned to Amit K.' },
  { timestamp: '2024-04-07 11:45:30', adminUser: 'priya.m@audix.in', action: 'Updated Purpose Rules', consentId: 'ADMIN-CONFIG', ipAddress: '192.168.1.42', details: 'Marketing purpose validity updated to 365 days' },
  { timestamp: '2024-04-07 10:22:15', adminUser: 'amit.k@audix.in', action: 'Uploaded Evidence', consentId: 'CMP-2024-0845', ipAddress: '192.168.1.38', details: 'Resolution evidence PDF uploaded' },
  { timestamp: '2024-04-07 09:58:03', adminUser: 'dpo@audix.in', action: 'Retrieved Consent Proof', consentId: 'CST-9823471', ipAddress: '192.168.1.10', details: 'Full consent chain retrieved for customer' },
  { timestamp: '2024-04-06 17:42:55', adminUser: 'dpo@audix.in', action: 'Created New Admin User', consentId: 'USR-0012', ipAddress: '192.168.1.10', details: 'New DPO user created for Audix Capital Partners' },
  { timestamp: '2024-04-06 16:30:18', adminUser: 'priya.m@audix.in', action: 'Generated Closure Proof', consentId: 'CMP-2024-0842', ipAddress: '192.168.1.42', details: 'Closure proof generated and sent to customer' },
  { timestamp: '2024-04-06 15:12:44', adminUser: 'amit.k@audix.in', action: 'Bulk Status Update', consentId: 'BULK-0024', ipAddress: '192.168.1.38', details: '12 complaints moved to Resolved status' },
  { timestamp: '2024-04-06 14:05:32', adminUser: 'dpo@audix.in', action: 'Submitted Regulator Report', consentId: 'REG-2024-0123', ipAddress: '192.168.1.10', details: 'Q1 2024 report submitted to SEBI portal' },
]

export const auditStats = [
  { label: 'Total Events Today', value: 247, color: 'navy' },
  { label: 'Active Admin Users', value: 12, color: 'navy' },
  { label: 'Critical Actions', value: 8, color: 'navy' },
  { label: 'Failed Login Attempts', value: 2, color: 'rose' },
]

// ─── ORGANIZATIONS ────────────────────────────────────────────────────────────

export const organizations: Organization[] = [
  { name: 'Audix Wealth Management', dpoEmail: 'priya.m@audix.in', status: 'Active', users: 5, totalConsents: 124502 },
  { name: 'Audix Capital Partners', dpoEmail: 'amit.k@audix.in', status: 'Active', users: 3, totalConsents: 89234 },
  { name: 'Audix Investment Services', dpoEmail: 'rajesh.s@audix.in', status: 'Active', users: 4, totalConsents: 67891 },
  { name: 'Audix Asset Management', dpoEmail: 'sneha.k@audix.in', status: 'Pending', users: 2, totalConsents: 45123 },
]

// ─── REPORTS DATA ─────────────────────────────────────────────────────────────

export const reportsData: Report[] = [
  { id: 'RPT-001', name: 'Quarterly DPDPA Compliance Summary', description: 'Full compliance posture with consent coverage metrics', category: 'compliance', cmpAdmin: true, regulator: true, frequency: 'quarterly', lastGenerated: '2024-04-05', status: 'available' },
  { id: 'RPT-002', name: 'Monthly Consent Activity', description: 'New, renewed, withdrawn and expired consents', category: 'operational', cmpAdmin: true, regulator: true, frequency: 'monthly', lastGenerated: '2024-04-01', status: 'available' },
  { id: 'RPT-003', name: 'Complaints Status & Resolution', description: 'All complaints with SLA and resolution metrics', category: 'operational', cmpAdmin: true, regulator: true, frequency: 'weekly', lastGenerated: '2024-04-07', status: 'available' },
  { id: 'RPT-004', name: 'SLA Breach & Performance', description: 'SLA adherence rates and breach analysis', category: 'operational', cmpAdmin: true, regulator: true, frequency: 'weekly', lastGenerated: '2024-04-07', status: 'available' },
  { id: 'RPT-005', name: 'Consent Proof Audit Trail', description: 'Complete immutable audit trail for consent events', category: 'compliance', cmpAdmin: true, regulator: true, frequency: 'on-demand', lastGenerated: '2024-04-06', status: 'available' },
  { id: 'RPT-006', name: 'Aggregated Statistical Summary', description: 'Anonymised aggregate statistics for regulatory overview', category: 'analytical', cmpAdmin: true, regulator: true, frequency: 'monthly', lastGenerated: '2024-04-01', status: 'available' },
  { id: 'RPT-007', name: 'Regulator Escalation Case Files', description: 'All escalated cases with evidence and resolution', category: 'compliance', cmpAdmin: true, regulator: true, frequency: 'on-demand', lastGenerated: '2024-03-28', status: 'available' },
  { id: 'RPT-008', name: 'Consent Notice Version History', description: 'All versions of consent notices with timestamps', category: 'compliance', cmpAdmin: true, regulator: true, frequency: 'on-demand', lastGenerated: '2024-03-15', status: 'available' },
  { id: 'RPT-009', name: 'Data Breach Incident Reports', description: 'Incident logs, affected records and remediation steps', category: 'compliance', cmpAdmin: true, regulator: true, frequency: 'on-demand', lastGenerated: '2024-03-28', status: 'available' },
  { id: 'RPT-010', name: 'Third-party Data Sharing Audit', description: 'All third-party data sharing events with consent references', category: 'compliance', cmpAdmin: true, regulator: true, frequency: 'quarterly', lastGenerated: '2024-01-15', status: 'available' },
  { id: 'RPT-011', name: 'Customer-Level Detailed Consent Records', description: 'Individual customer consent history (admin only)', category: 'operational', cmpAdmin: true, regulator: false, frequency: 'on-demand', lastGenerated: '2024-04-07', status: 'available' },
  { id: 'RPT-012', name: 'Admin User Activity Logs', description: 'All admin actions with timestamps and IP addresses', category: 'operational', cmpAdmin: true, regulator: false, frequency: 'daily', lastGenerated: '2024-04-07', status: 'available' },
  { id: 'RPT-013', name: 'Customer Complaint Transcripts', description: 'Full transcripts of complaint communications', category: 'operational', cmpAdmin: true, regulator: false, frequency: 'on-demand', lastGenerated: '2024-04-06', status: 'available' },
  { id: 'RPT-014', name: 'Channel-wise Consent Collection', description: 'Breakdown of consent collection by channel', category: 'analytical', cmpAdmin: true, regulator: false, frequency: 'monthly', lastGenerated: '2024-04-01', status: 'available' },
]

// ─── CONSENT PURPOSES ────────────────────────────────────────────────────────

export const consentPurposes: ConsentPurpose[] = [
  {
    id: 'CP-001',
    title: 'Marketing & Communication',
    type: 'OPTIONAL',
    description: 'Use your contact details to send personalized investment offers, newsletters, and promotional communications via email, SMS, and push notifications.',
    fields: [
      { name: 'Email Address', checked: true },
      { name: 'Mobile Number', checked: true },
      { name: 'Full Name', checked: true },
      { name: 'Date of Birth', checked: false },
      { name: 'City / Location', checked: false },
    ],
    validityDays: 365,
    validityLabel: '1 year',
    noticeText: 'We would like to send you personalized investment insights and product offers. You may withdraw this consent at any time via the Audix app or by contacting your DPO.',
    enabled: true,
  },
  {
    id: 'CP-002',
    title: 'Financial Profile Analysis',
    type: 'MANDATORY',
    description: 'Process your financial data to assess investment suitability, generate risk profiles, and comply with SEBI KYC norms for investment advisory services.',
    fields: [
      { name: 'PAN Number', checked: true },
      { name: 'Income Details', checked: true },
      { name: 'Investment History', checked: true },
      { name: 'Risk Profile Score', checked: true },
      { name: 'Net Worth', checked: false },
    ],
    validityDays: 730,
    validityLabel: '2 years',
    noticeText: 'Processing your financial data is required for regulatory compliance and investment advisory. This data will not be shared with third parties without your explicit consent.',
    enabled: true,
  },
  {
    id: 'CP-003',
    title: 'Investment Data Processing',
    type: 'OPTIONAL',
    description: 'Access and process your portfolio, transaction history, and banking details to provide consolidated investment reports and automated portfolio rebalancing.',
    fields: [
      { name: 'Portfolio Holdings', checked: true },
      { name: 'Transaction History', checked: true },
      { name: 'Bank Account Details', checked: true },
      { name: 'Demat Account Number', checked: true },
      { name: 'Dividend Details', checked: false },
    ],
    validityDays: 1095,
    validityLabel: '3 years',
    noticeText: 'Your investment data helps us provide better portfolio management. You can revoke access at any time; however, some features may become unavailable.',
    enabled: true,
  },
  {
    id: 'CP-004',
    title: 'Nominee Details Management',
    type: 'MANDATORY',
    description: 'Collect and store nominee information as required under SEBI regulations for mutual fund and demat account operations.',
    fields: [
      { name: 'Nominee Full Name', checked: true },
      { name: 'Relationship', checked: true },
      { name: 'Contact Number', checked: true },
      { name: 'Aadhaar Number', checked: true },
      { name: 'Date of Birth', checked: false },
      { name: 'Address', checked: false },
    ],
    validityDays: 1825,
    validityLabel: '5 years',
    noticeText: 'Nominee details are mandatory for regulatory compliance. This data is stored securely and accessed only in the event of a claim.',
    enabled: true,
  },
  {
    id: 'CP-005',
    title: 'KYC (Legitimate Interest)',
    type: 'MANDATORY',
    description: 'Collect and verify identity documents as required under PMLA, SEBI, and DPDPA regulations. This processing is based on legitimate interest and legal obligation.',
    fields: [
      { name: 'Aadhaar Number', checked: true },
      { name: 'PAN Card', checked: true },
      { name: 'Address Proof', checked: true },
      { name: 'Photograph', checked: true },
      { name: 'Bank Statement', checked: true },
      { name: 'Signature', checked: true },
      { name: 'Video KYC Recording', checked: false },
    ],
    validityDays: 1825,
    validityLabel: '5 years',
    noticeText: 'KYC verification is required by law. Your documents will be stored securely and used solely for identity verification purposes as mandated by SEBI and RBI regulations.',
    enabled: true,
  },
]
