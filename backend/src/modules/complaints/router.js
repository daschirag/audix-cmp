import { Router } from 'express'
import controller from './controller.js'
import auth from '../../middleware/auth.js'
import rbac from '../../middleware/rbac.js'

const router = Router()

// All complaint routes require authentication
router.use(auth)

router.post('/', controller.fileComplaint)
router.get('/', rbac('complaints:read'), controller.listComplaints)
router.get('/:id', rbac('complaints:read'), controller.getComplaintDetails)
router.patch('/:id/status', rbac('complaints:write'), controller.updateStatus)
router.patch('/:id/assign', rbac('complaints:write'), controller.assignComplaint)

export default router
