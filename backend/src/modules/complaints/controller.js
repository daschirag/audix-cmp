import service from './service.js'
import { createComplaintSchema, updateStatusSchema, assignComplaintSchema } from './validation.js'

const fileComplaint = async (req, res) => {
  try {
    const parsed = createComplaintSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parsed.error.errors,
        code: 'VALIDATION_ERROR'
      })
    }

    const actor = { id: req.user.id, role: req.user.role, ip: req.ip || 'unknown' }
    const complaint = await service.fileComplaint(parsed.data, actor)

    return res.status(201).json({
      success: true,
      message: 'Complaint filed successfully',
      data: complaint
    })
  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message,
      code: err.code || 'INTERNAL_ERROR'
    })
  }
}

const listComplaints = async (req, res) => {
  try {
    // Basic filtering can be added here (e.g. by dataPrincipalId for users)
    const filters = {}
    if (req.user.role === 'USER') {
      filters.dataPrincipalId = req.user.id
    }

    const complaints = await service.listComplaints(filters)

    return res.status(200).json({
      success: true,
      data: complaints
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
      code: 'INTERNAL_ERROR'
    })
  }
}

const getComplaintDetails = async (req, res) => {
  try {
    const complaint = await service.getComplaintDetails(req.params.id)
    
    // Check ownership if user is not admin/agent
    if (req.user.role === 'USER' && complaint.dataPrincipalId !== req.user.id) {
       return res.status(403).json({
         success: false,
         message: 'Access denied',
         code: 'ACCESS_DENIED'
       })
    }

    return res.status(200).json({
      success: true,
      data: complaint
    })
  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message,
      code: err.code || 'INTERNAL_ERROR'
    })
  }
}

const updateStatus = async (req, res) => {
  try {
    const parsed = updateStatusSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
        code: 'VALIDATION_ERROR'
      })
    }

    const actor = { id: req.user.id, role: req.user.role, ip: req.ip || 'unknown' }
    const complaint = await service.updateStatus(req.params.id, parsed.data.status, actor)

    return res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      data: complaint
    })
  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message,
      code: err.code || 'INTERNAL_ERROR'
    })
  }
}

const assignComplaint = async (req, res) => {
  try {
    const parsed = assignComplaintSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid assignee',
        code: 'VALIDATION_ERROR'
      })
    }

    const actor = { id: req.user.id, role: req.user.role, ip: req.ip || 'unknown' }
    const complaint = await service.assignComplaint(req.params.id, parsed.data.assignedTo, actor)

    return res.status(200).json({
      success: true,
      message: 'Complaint assigned successfully',
      data: complaint
    })
  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message,
      code: err.code || 'INTERNAL_ERROR'
    })
  }
}

export default {
  fileComplaint,
  listComplaints,
  getComplaintDetails,
  updateStatus,
  assignComplaint
}
