import { ZodError } from 'zod'
import { captureConsentSchema } from './validation.js'
import * as service from './service.js'

function zodMessage(err) {
  return err.errors.map((e) => `${e.path.join('.') || 'body'}: ${e.message}`).join('; ')
}

export async function capture(req, res) {
  try {
    const body = captureConsentSchema.parse(req.body)
    const actor = { id: req.user.id, role: req.user.role, ip: req.ip || 'unknown' }
    const consent = await service.captureConsent(body, actor)
    return res.status(201).json({ success: true, data: consent, message: 'Consent captured' })
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({ success: false, message: zodMessage(err), code: 'VALIDATION_ERROR' })
    }
    return res.status(err.status || 500).json({
      success: false,
      message: err.message,
      code: err.code || 'SERVER_ERROR',
    })
  }
}

export async function withdraw(req, res) {
  try {
    const { id } = req.params
    const actor = { id: req.user.id, role: req.user.role, ip: req.ip || 'unknown' }
    const consent = await service.withdrawConsent(id, actor)
    return res.status(200).json({ success: true, data: consent, message: 'Consent withdrawn' })
  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message,
      code: err.code || 'SERVER_ERROR',
    })
  }
}

export async function getStatus(req, res) {
  try {
    const { principalId } = req.params
    const requestingUser = { id: req.user.id, role: req.user.role, ip: req.ip || 'unknown' }
    const records = await service.getConsentStatus(principalId, requestingUser)
    return res.status(200).json({ success: true, data: records, message: 'Consent status retrieved' })
  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message,
      code: err.code || 'SERVER_ERROR',
    })
  }
}

export async function getById(req, res) {
  try {
    const { id } = req.params
    const requestingUser = { id: req.user.id, role: req.user.role, ip: req.ip || 'unknown' }
    const consent = await service.getConsentById(id, requestingUser)
    return res.status(200).json({ success: true, data: consent, message: 'Consent record retrieved' })
  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message,
      code: err.code || 'SERVER_ERROR',
    })
  }
}

export async function getProof(req, res) {
  try {
    const { consentId } = req.params
    const requestingUser = { id: req.user.id, role: req.user.role, ip: req.ip || 'unknown' }
    const proof = await service.getConsentProof(consentId, requestingUser)
    return res.status(200).json({ success: true, data: proof, message: 'Consent proof retrieved' })
  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message,
      code: err.code || 'SERVER_ERROR',
    })
  }
}
