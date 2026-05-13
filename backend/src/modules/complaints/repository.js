import prisma from '../../lib/prisma.js'

const createComplaint = async (data) => {
  return await prisma.complaint.create({
    data: {
      dataPrincipalId: data.dataPrincipalId,
      consentId: data.consentId || null,
      subject: data.subject,
      description: data.description,
      category: data.category || null,
      evidence: data.evidence || null,
      status: 'RECEIVED'
    }
  })
}

const findComplaints = async (filters = {}) => {
  return await prisma.complaint.findMany({
    where: filters,
    orderBy: { createdAt: 'desc' }
  })
}

const findComplaintById = async (id) => {
  return await prisma.complaint.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          mobile: true
        }
      }
    }
  })
}

const updateComplaint = async (id, data) => {
  return await prisma.complaint.update({
    where: { id },
    data
  })
}

export default {
  createComplaint,
  findComplaints,
  findComplaintById,
  updateComplaint
}
