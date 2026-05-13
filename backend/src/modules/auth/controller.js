import service from './service.js'
import { registerSchema, loginSchema } from './validation.js'

export const register = async (req, res) => {
  try {
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
}

export const login = async (req, res) => {
  try {
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
}

export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token required',
        code:    'MISSING_TOKEN'
      })
    }

    const result = await service.refresh(refreshToken, req.ip)

    return res.status(200).json({
      success: true,
      message: 'Token refreshed',
      data:    result
    })
  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message,
      code:    err.code || 'SERVER_ERROR'
    })
  }
}

export const logout = async (req, res) => {
  try {
    // userId should be extracted from auth middleware (req.user)
    const userId = req.user?.id
    const { refreshToken } = req.body

    if (userId) {
      await service.logout(userId, refreshToken)
    }

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
      data:    null
    })
  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message,
      code:    err.code || 'SERVER_ERROR'
    })
  }
}

export default {
  register,
  login,
  refresh,
  logout
}
