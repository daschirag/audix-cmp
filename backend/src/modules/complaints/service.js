import repository from './repository.js'

const VALID_TRANSITIONS = {
  RECEIVED: ['UNDER_REVIEW'],
  UNDER_REVIEW: ['ESCALATED', 'CLOSED'],
  ESCALATED: ['CLOSED'],
  CLOSED: []
}

const fileComplaint = async (complaintData, actor) => {
  const complaint = await repository.createComplaint(complaintData)
  
  await repository.writeAuditLog({
    actorId: actor.id,
    actorRole: actor.role,
    action: 'complaint.create',
    resource: { collection: 'Complaint', id: complaint.id },
    ip: actor.ip
  })

  return complaint
}

const listComplaints = async (filters) => {
  return await repository.findComplaints(filters)
}

const getComplaintDetails = async (id) => {
  const complaint = await repository.findComplaintById(id)
  if (!complaint) {
    const error = new Error('Complaint not found')
    error.status = 404
    error.code = 'NOT_FOUND'
    throw error
  }
  return complaint
}

const updateStatus = async (id, newStatus, actor) => {
  const complaint = await getComplaintDetails(id)
  const currentStatus = complaint.status

  const allowed = VALID_TRANSITIONS[currentStatus] || []
  if (!allowed.includes(newStatus)) {
    const error = new Error(`Invalid status transition: ${currentStatus} -> ${newStatus}`)
    error.status = 422
    error.code = 'INVALID_TRANSITION'
    throw error
  }

  const updated = await repository.updateComplaint(id, { status: newStatus })

  await repository.writeAuditLog({
    actorId: actor.id,
    actorRole: actor.role,
    action: 'complaint.status_update',
    resource: { collection: 'Complaint', id: updated.id, status: newStatus },
    ip: actor.ip
  })

  return updated
}

const assignComplaint = async (id, assignedTo, actor) => {
  const updated = await repository.updateComplaint(id, { assignedTo })

  await repository.writeAuditLog({
    actorId: actor.id,
    actorRole: actor.role,
    action: 'complaint.assign',
    resource: { collection: 'Complaint', id: updated.id, assignedTo },
    ip: actor.ip
  })

  return updated
}

export default {
  fileComplaint,
  listComplaints,
  getComplaintDetails,
  updateStatus,
  assignComplaint
}
