import repository from './repository.js'

const fileComplaint = async (complaintData) => {
  return await repository.createComplaint(complaintData)
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

const updateStatus = async (id, status) => {
  return await repository.updateComplaint(id, { status })
}

const assignComplaint = async (id, assignedTo) => {
  return await repository.updateComplaint(id, { assignedTo })
}

export default {
  fileComplaint,
  listComplaints,
  getComplaintDetails,
  updateStatus,
  assignComplaint
}
