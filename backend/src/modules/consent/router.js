import { Router } from 'express'
import auth from '../../middleware/auth.js'
import rbac from '../../middleware/rbac.js'
import { capture, withdraw, getStatus, getById, getProof } from './controller.js'

const router = Router()

router.post('/capture',              auth, rbac('consent:write'), capture)
router.delete('/:id/withdraw',       auth, rbac('consent:write'), withdraw)

// Specific-prefix GET routes must come before the catch-all /:id
router.get('/status/:principalId',   auth, rbac('consent:read'),  getStatus)
router.get('/proof/:consentId',      auth, rbac('consent:read'),  getProof)

// Catch-all — must be last among GET routes to avoid swallowing /status and /proof
router.get('/:id',                   auth, rbac('consent:read'),  getById)

export default router
