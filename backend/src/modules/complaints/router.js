import { Router } from 'express'
import controller from './controller.js'
import auth from '../../middleware/auth.js'

const router = Router()

// All complaint routes require authentication
router.use(auth)

router.post('/', controller.fileComplaint)
router.get('/', controller.listComplaints)
router.get('/:id', controller.getComplaintDetails)
router.patch('/:id/status', controller.updateStatus)
router.patch('/:id/assign', controller.assignComplaint)

export default router
