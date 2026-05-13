import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { z } from 'zod'
import controller from './controller.js'
import oauth from './oauth.js'
import tokenExchange from './tokenExchange.js'
import mfa from './mfa.js'
import auth from '../../middleware/auth.js'

const router = Router()

// ── Rate limiter — 5 login attempts per 15 min per IP ────────────────────────
const loginLimiter = rateLimit({
  windowMs:        15 * 60 * 1000,
  max:             5,
  standardHeaders: true,
  legacyHeaders:   false,
  message: {
    success: false,
    message: 'Too many login attempts. Try again in 15 minutes.',
    code:    'RATE_LIMITED'
  }
})

// ── Existing routes ───────────────────────────────────────────────────────────
router.post('/register', controller.register)
router.post('/login',    loginLimiter, controller.login)
router.post('/refresh',  controller.refresh)
router.post('/logout',   controller.logout)

// ── OAuth2 Google Stub ────────────────────────────────────────────────────────

// GET /auth/oauth/google — returns the OAuth redirect URL
router.get('/oauth/google', (req, res) => {
  try {
    const url = oauth.getGoogleAuthUrl()
    return res.status(200).json({
      success: true,
      message: 'Redirect to this URL for Google login',
      data:    { url }
    })
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
      code:    'OAUTH_ERROR'
    })
  }
})

// GET /auth/oauth/callback — handles Google OAuth callback
router.get('/oauth/callback', async (req, res) => {
  try {
    const { code, state } = req.query

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Authorization code missing',
        code:    'MISSING_CODE'
      })
    }

    const result = await oauth.handleGoogleCallback(code, state, req.ip)

    return res.status(200).json({
      success: true,
      message: 'OAuth login successful',
      data:    result
    })
  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message,
      code:    err.code || 'OAUTH_ERROR'
    })
  }
})

// ── Token Exchange ────────────────────────────────────────────────────────────

// POST /auth/token-exchange/generate — logged in user gets one-time token
router.post('/token-exchange/generate', auth, async (req, res) => {
  try {
    const result = await tokenExchange.generateOneTimeToken(
      req.user.id,
      req.user.role
    )

    return res.status(200).json({
      success: true,
      message: 'One-time token generated',
      data:    result
    })
  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message,
      code:    err.code || 'TOKEN_EXCHANGE_ERROR'
    })
  }
})

// POST /auth/token-exchange/validate — consent page uses this to get real JWT
router.post('/token-exchange/validate', async (req, res) => {
  try {
    const schema = z.object({ token: z.string().min(1) })
    const parsed = schema.safeParse(req.body)

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Token required',
        code:    'VALIDATION_ERROR'
      })
    }

    const result = await tokenExchange.validateOneTimeToken(parsed.data.token)

    return res.status(200).json({
      success: true,
      message: 'Token exchanged successfully',
      data:    result
    })
  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message,
      code:    err.code || 'TOKEN_EXCHANGE_ERROR'
    })
  }
})

// ── MFA TOTP Stub ─────────────────────────────────────────────────────────────

// POST /auth/mfa/enroll — DPO Admin enrolls MFA
router.post('/mfa/enroll', auth, async (req, res) => {
  try {
    const result = await mfa.enrollMFA(req.user.id)

    return res.status(200).json({
      success: true,
      message: 'MFA enrolled. Scan otpauthUrl with Google Authenticator.',
      data:    result
    })
  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message,
      code:    err.code || 'MFA_ERROR'
    })
  }
})

// POST /auth/mfa/verify — verify TOTP token
router.post('/mfa/verify', auth, async (req, res) => {
  try {
    const schema = z.object({ token: z.string().length(6) })
    const parsed = schema.safeParse(req.body)

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Token must be 6 digits',
        code:    'VALIDATION_ERROR'
      })
    }

    const result = await mfa.verifyMFA(req.user.id, parsed.data.token)

    return res.status(200).json({
      success: true,
      message: 'MFA verified',
      data:    result
    })
  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message,
      code:    err.code || 'MFA_ERROR'
    })
  }
})

export default router
