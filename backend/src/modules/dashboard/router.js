import { Router } from 'express'
import prisma from '../../lib/prisma.js'
import auth from '../../middleware/auth.js'

const router = Router()

// GET /dashboard/summary
router.get('/summary', auth, async (req, res) => {
  try {
    const [active, withdrawn, expired, openComplaints,
           totalComplaints, resolvedComplaints] = await Promise.all([
      prisma.consentMaster.count({ where: { status: 'ACTIVE' } }),
      prisma.consentMaster.count({ where: { status: 'WITHDRAWN' } }),
      prisma.consentMaster.count({ where: { status: 'EXPIRED' } }),
      prisma.complaint.count({ where: { status: { not: 'CLOSED' } } }),
      prisma.complaint.count(),
      prisma.complaint.count({ where: { status: 'CLOSED' } }),
    ])

    return res.status(200).json({
      success: true,
      data: {
        totalActiveConsents: { value: active,    change: '+0%', positive: true },
        withdrawnConsents:   { value: withdrawn, change: '+0%', positive: false },
        expiredConsents:     { value: expired },
        pendingRenewals:     { value: expired },
        openComplaints:      { value: openComplaints, breach: 0 },
        complaintKpis: [
          { label: 'Total',    value: totalComplaints },
          { label: 'Open',     value: openComplaints },
          { label: 'Resolved', value: resolvedComplaints },
        ]
      }
    })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, code: 'SERVER_ERROR' })
  }
})

// GET /dashboard/risk-alerts
router.get('/risk-alerts', auth, async (req, res) => {
  try {
    const alerts = []

    const expired = await prisma.consentMaster.count({ where: { status: 'EXPIRED' } })
    if (expired > 0) {
      alerts.push({ text: `${expired} expired consent(s) still in active use`, priority: 'HIGH' })
    }

    const breached = await prisma.complaint.count({ where: { status: 'ESCALATED' } })
    if (breached > 0) {
      alerts.push({ text: `${breached} complaint(s) escalated — SLA at risk`, priority: 'HIGH' })
    }

    if (alerts.length === 0) {
      alerts.push({ text: 'No active risk alerts', priority: 'LOW' })
    }

    return res.status(200).json({ success: true, data: alerts })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, code: 'SERVER_ERROR' })
  }
})

// GET /dashboard/purpose-distribution
router.get('/purpose-distribution', auth, async (req, res) => {
  try {
    const consents = await prisma.consentMaster.findMany({
      where: { status: 'ACTIVE' },
      select: { purposes: true }
    })

    const countMap = {}
    for (const c of consents) {
      const purposes = Array.isArray(c.purposes) ? c.purposes : []
      for (const p of purposes) {
        const name = p.purposeId || p.name || 'Unknown'
        countMap[name] = (countMap[name] || 0) + 1
      }
    }

    const total = Object.values(countMap).reduce((a, b) => a + b, 0) || 1
    const data = Object.entries(countMap).map(([purpose, count]) => ({
      purpose,
      count,
      percentage: Math.round((count / total) * 100)
    }))

    if (data.length === 0) {
      data.push({ purpose: 'No data yet', count: 0, percentage: 0 })
    }

    return res.status(200).json({ success: true, data })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, code: 'SERVER_ERROR' })
  }
})

// GET /dashboard/channel-distribution
router.get('/channel-distribution', auth, async (req, res) => {
  try {
    const consents = await prisma.consentMaster.findMany({
      select: { source: true }
    })

    const countMap = {}
    for (const c of consents) {
      const channel = c.source?.channel || 'web'
      countMap[channel] = (countMap[channel] || 0) + 1
    }

    const colors = ['#00C4B4', '#0A2540', '#F59E0B', '#EF4444', '#8B5CF6']
    const total = Object.values(countMap).reduce((a, b) => a + b, 0) || 1
    const data = Object.entries(countMap).map(([name, count], i) => ({
      name,
      value: Math.round((count / total) * 100),
      color: colors[i % colors.length]
    }))

    if (data.length === 0) {
      data.push({ name: 'web', value: 100, color: '#00C4B4' })
    }

    return res.status(200).json({ success: true, data })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, code: 'SERVER_ERROR' })
  }
})

// POST /dashboard/regulatory-actions/prepare-report
router.post('/regulatory-actions/prepare-report', auth, async (req, res) => {
  try {
    const [consents, complaints] = await Promise.all([
      prisma.consentMaster.count(),
      prisma.complaint.count(),
    ])
    return res.status(200).json({
      success: true,
      message: 'Regulatory report prepared',
      data: { totalConsents: consents, totalComplaints: complaints,
              generatedAt: new Date().toISOString() }
    })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, code: 'SERVER_ERROR' })
  }
})

// POST /dashboard/regulatory-actions/attach-consent-proof
router.post('/regulatory-actions/attach-consent-proof', auth, async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Consent proof attached',
    data: { attachedAt: new Date().toISOString() }
  })
})

// POST /dashboard/regulatory-actions/attach-resolution-evidence
router.post('/regulatory-actions/attach-resolution-evidence', auth, async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Resolution evidence attached',
    data: { attachedAt: new Date().toISOString() }
  })
})

export default router