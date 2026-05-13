import { Router } from 'express'
import controller from './controller.js'

const router = Router()

// POST /auth/register
router.post('/register', controller.register)

// POST /auth/login
router.post('/login', controller.login)

// POST /auth/refresh
router.post('/refresh', controller.refresh)

// POST /auth/logout
router.post('/logout', controller.logout)

export default router