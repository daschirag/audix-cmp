import { Router } from 'express'
import { z } from 'zod'
import service from './service.js'

const router = Router()

// ── Validation schemas ────────────────────────────────────────────────────────

const registerSchema = z.object({
  email:      z.string().email('Invalid email'),
  password:   z.string().min(8, 'Password must be at least 8 characters'),
  mobile:     z.string().optional(),
  role:       z.enum(['USER', 'DPO_ADMIN', 'DPO_OPS', 'AUDITOR']).optional(),
  isMinor:    z.boolean().optional(),
  guardianId: z.string().optional()
})

const loginSchema = z.object({
  email:    z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required')
})

// ── Routes ────────────────────────────────────────────────────────────────────

// POST /auth/register
router.post('/register', async (req, res) => {
  try {
    // Validate body
    const parsed = registerSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        code:    'VALIDATION_ERROR',
        errors:  parsed.error.flatten().fieldErrors
      })
    }

    const result = await service.register(parsed.data, req.ip)

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data:    result
    })
  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message,
      code:    err.code || 'SERVER_ERROR'
    })
  }
})

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    // Validate body
    const parsed = loginSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        code:    'VALIDATION_ERROR',
        errors:  parsed.error.flatten().fieldErrors
      })
    }

    const result = await service.login(parsed.data, req.ip)

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data:    result
    })
  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message,
      code:    err.code || 'SERVER_ERROR'
    })
  }
})

// POST /auth/refresh  → Hamsavardhan implements this
router.post('/refresh', async (req, res) => {
  return res.status(501).json({
    success: false,
    message: 'Not implemented yet — Hamsavardhan',
    code:    'NOT_IMPLEMENTED'
  })
})

// POST /auth/logout  → Hamsavardhan implements this
router.post('/logout', async (req, res) => {
  return res.status(501).json({
    success: false,
    message: 'Not implemented yet — Hamsavardhan',
    code:    'NOT_IMPLEMENTED'
  })
})

export default router