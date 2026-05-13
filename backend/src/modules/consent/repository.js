import prisma from '../../../lib/prisma.js'

export async function createConsent(data) {
  return prisma.consentMaster.create({ data })
}

// hash must be pre-computed by the service layer and included in data.hash
// ConsentEvent is immutable — never call update or delete on this model
export async function createConsentEvent(data) {
  return prisma.consentEvent.create({ data })
}

export async function getConsentByPrincipalId(principalId) {
  return prisma.consentMaster.findMany({
    where: { dataPrincipalId: principalId },
    orderBy: { createdAt: 'desc' },
  })
}

// Only the status field is mutated — records are never deleted
export async function withdrawConsent(id) {
  return prisma.consentMaster.update({
    where: { id },
    data: { status: 'WITHDRAWN' },
  })
}

export async function findConsentById(id) {
  return prisma.consentMaster.findUnique({ where: { id } })
}

export async function findConsentWithEvents(id) {
  return prisma.consentMaster.findUnique({
    where: { id },
    include: { events: true },
  })
}

export async function findActivePurposesByIds(ids) {
  return prisma.purposeCatalog.findMany({
    where: { id: { in: ids }, isActive: true },
  })
}

export async function writeAuditLog({ actorId, actorRole, action, resource, ip }) {
  return prisma.auditLog.create({
    data: {
      actorId,
      actorRole,
      action,
      resource: resource ?? null,
      ip: ip ?? 'unknown',
    },
  })
}
