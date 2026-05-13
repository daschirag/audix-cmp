import { createHash } from 'crypto'
import * as repo from './repository.js'

function buildEventHash(payload) {
  return createHash('sha256').update(JSON.stringify(payload)).digest('hex')
}

function resolveActorType(role) {
  if (role === 'USER') return 'USER'
  if (role === 'SYSTEM') return 'SYSTEM'
  return 'ADMIN'
}

// actor = { id, role, ip }  — extracted from req.user + req.ip by the controller
export async function captureConsent(
  { dataPrincipalId, purposes, language, noticeVersionId, source, expiresAt },
  actor
) {
  // 1. Validate every purpose ID is active in PurposeCatalog
  const purposeIds = purposes.map((p) => p.purposeId)
  const validPurposes = await repo.findActivePurposesByIds(purposeIds)
  if (validPurposes.length !== purposeIds.length) {
    const err = new Error('One or more purpose IDs are invalid or inactive')
    err.code = 'INVALID_PURPOSE'
    err.status = 422
    throw err
  }

  // 2. Persist ConsentMaster
  const consent = await repo.createConsent({
    dataPrincipalId,
    purposes,
    status: 'ACTIVE',
    language,
    noticeVersionId,
    source,
    ...(expiresAt && { expiresAt: new Date(expiresAt) }),
  })

  // 3. Build and persist GRANTED event — hash computed here, never in repository
  const timestamp = new Date()
  const hash = buildEventHash({
    consentId: consent.id,
    dataPrincipalId,
    eventType: 'GRANTED',
    purposes,
    noticeVersionId,
    timestamp: timestamp.toISOString(),
  })

  await repo.createConsentEvent({
    consentId: consent.id,
    dataPrincipalId,
    eventType: 'GRANTED',
    purposes,
    noticeVersionId,
    actorType: resolveActorType(actor.role),
    actorId: actor.id,
    hash,
    timestamp,
  })

  // 4. AuditLog — mandatory on every mutation
  await repo.writeAuditLog({
    actorId: actor.id,
    actorRole: actor.role,
    action: 'consent.capture',
    resource: { collection: 'ConsentMaster', id: consent.id },
    ip: actor.ip,
  })

  return consent
}

export async function withdrawConsent(consentId, actor) {
  // 1. Verify record exists
  const existing = await repo.findConsentById(consentId)
  if (!existing) {
    const err = new Error('Consent record not found')
    err.code = 'CONSENT_NOT_FOUND'
    err.status = 404
    throw err
  }

  // 2. Guard: only ACTIVE consents can be withdrawn
  if (existing.status !== 'ACTIVE') {
    const err = new Error('Consent is not active and cannot be withdrawn')
    err.code = 'CONSENT_NOT_ACTIVE'
    err.status = 409
    throw err
  }

  // 3. Update status — repository touches only the status field
  const updated = await repo.withdrawConsent(consentId)

  // 4. Build and persist WITHDRAWN event
  const timestamp = new Date()
  const hash = buildEventHash({
    consentId,
    dataPrincipalId: existing.dataPrincipalId,
    eventType: 'WITHDRAWN',
    purposes: existing.purposes,
    noticeVersionId: existing.noticeVersionId,
    timestamp: timestamp.toISOString(),
  })

  await repo.createConsentEvent({
    consentId,
    dataPrincipalId: existing.dataPrincipalId,
    eventType: 'WITHDRAWN',
    purposes: existing.purposes,
    noticeVersionId: existing.noticeVersionId,
    actorType: resolveActorType(actor.role),
    actorId: actor.id,
    hash,
    timestamp,
  })

  // 5. AuditLog — mandatory on every mutation
  await repo.writeAuditLog({
    actorId: actor.id,
    actorRole: actor.role,
    action: 'consent.withdraw',
    resource: { collection: 'ConsentMaster', id: consentId },
    ip: actor.ip,
  })

  return updated
}

export async function getConsentStatus(principalId) {
  return repo.getConsentByPrincipalId(principalId)
}

export async function getConsentById(consentId, requestingUser) {
  const consent = await repo.findConsentWithEvents(consentId)
  if (!consent) {
    const err = new Error('Consent record not found')
    err.code = 'CONSENT_NOT_FOUND'
    err.status = 404
    throw err
  }

  await repo.writeAuditLog({
    actorId: requestingUser.id,
    actorRole: requestingUser.role,
    action: 'consent.view',
    resource: { collection: 'ConsentMaster', id: consent.id },
    ip: requestingUser.ip,
  })

  return consent
}

export async function getConsentProof(consentId, requestingUser) {
  const consentWithEvents = await repo.findConsentWithEvents(consentId)
  if (!consentWithEvents) {
    const err = new Error('Consent record not found')
    err.code = 'CONSENT_NOT_FOUND'
    err.status = 404
    throw err
  }

  const noticeVersion = await repo.findNoticeVersionById(consentWithEvents.noticeVersionId)

  await repo.writeAuditLog({
    actorId: requestingUser.id,
    actorRole: requestingUser.role,
    action: 'consent.proof.view',
    resource: { collection: 'ConsentMaster', id: consentWithEvents.id },
    ip: requestingUser.ip,
  })

  const { events, ...consent } = consentWithEvents
  return { consent, events, noticeVersion }
}
