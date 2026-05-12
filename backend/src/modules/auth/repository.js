import prisma from '../../../lib/prisma.js'

const findUserByEmail = async (email) => {
  return await prisma.user.findUnique({
    where: { email }
  })
}

const findUserById = async (id) => {
  return await prisma.user.findUnique({
    where: { id }
  })
}

const createUser = async (data) => {
  return await prisma.user.create({
    data: {
      email:        data.email,
      mobile:       data.mobile || null,
      passwordHash: data.passwordHash,
      role:         data.role || 'USER',
      isMinor:      data.isMinor || false,
      guardianId:   data.guardianId || null,
    }
  })
}

const updateUser = async (id, data) => {
  return await prisma.user.update({
    where: { id },
    data
  })
}

const writeAuditLog = async ({ actorId, actorRole, action, resource, ip }) => {
  return await prisma.auditLog.create({
    data: {
      actorId,
      actorRole,
      action,
      resource,
      ip: ip || 'unknown',
      timestamp: new Date()
    }
  })
}

export default {
  findUserByEmail,
  findUserById,
  createUser,
  updateUser,
  writeAuditLog
}