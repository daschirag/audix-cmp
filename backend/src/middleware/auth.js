import jwt from 'jsonwebtoken'
import { blacklistDB } from '../lib/redis.js'

const auth = async (req, res, next) => {
  try {
    // 1. Get token from header
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
        code: 'NO_TOKEN'
      })
    }

    const token = authHeader.split(' ')[1]

    // 2. Verify token
    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
      const message = err.name === 'TokenExpiredError'
        ? 'Token expired'
        : 'Invalid token'
      return res.status(401).json({
        success: false,
        message,
        code: 'INVALID_TOKEN'
      })
    }

    // 3. Check if token is blacklisted (logged out)
    const isBlacklisted = await blacklistDB.get(`blacklist:${decoded.jti}`)
    if (isBlacklisted) {
      return res.status(401).json({
        success: false,
        message: 'Token has been revoked',
        code: 'TOKEN_REVOKED'
      })
    }

    // 4. Attach user to request
    req.user = {
      id:          decoded.userId,
      role:        decoded.role,
      permissions: decoded.permissions || [],
      jti:         decoded.jti
    }

    next()
  } catch (err) {
    console.error('Auth middleware error:', err)
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      code: 'AUTH_ERROR'
    })
  }
}

export default auth