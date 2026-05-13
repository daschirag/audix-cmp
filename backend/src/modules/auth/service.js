import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import { tokenDB } from '../../../lib/redis.js'
import repository from './repository.js'

// ── Helpers ──────────────────────────────────────────────────────────────────

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      userId:      user.id,
      role:        user.role,
      permissions: [],
      jti:         uuidv4()   // unique token ID — used for blacklisting on logout
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  )
}

const generateRefreshToken = () => uuidv4()

const REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60  // 7 days

// ── Service methods ───────────────────────────────────────────────────────────

const register = async ({ email, password, mobile, role, isMinor, guardianId }, ip) => {
  // 1. Check duplicate email
  const existing = await repository.findUserByEmail(email)
  if (existing) {
    const err = new Error('Email already registered')
    err.code  = 'EMAIL_EXISTS'
    err.status = 409
    throw err
  }

  // 2. Hash password
  const passwordHash = await bcrypt.hash(
    password,
    parseInt(process.env.BCRYPT_ROUNDS) || 12
  )

  // 3. Create user
  const user = await repository.createUser({
    email,
    mobile,
    passwordHash,
    role: role || 'USER',
    isMinor:    isMinor    || false,
    guardianId: guardianId || null,
  })

  // 4. Audit log
  await repository.writeAuditLog({
    actorId:   user.id,
    actorRole: user.role,
    action:    'auth.register',
    resource:  JSON.stringify({ collection: 'User', id: user.id }),
    ip
  })

  return { id: user.id, email: user.email, role: user.role }
}

const login = async ({ email, password }, ip) => {
  // 1. Find user
  const user = await repository.findUserByEmail(email)
  if (!user) {
    const err = new Error('Invalid email or password')
    err.code   = 'INVALID_CREDENTIALS'
    err.status = 401
    throw err
  }

  // 2. Check password
  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    const err = new Error('Invalid email or password')
    err.code   = 'INVALID_CREDENTIALS'
    err.status = 401
    throw err
  }

  // 3. Generate tokens
  const accessToken  = generateAccessToken(user)
  const refreshToken = generateRefreshToken()

  // 4. Store refresh token in Redis DB2 with TTL
  await tokenDB.set(
    `refresh:${user.id}`,
    refreshToken,
    'EX',
    REFRESH_TTL_SECONDS
  )

  // 5. Audit log
  await repository.writeAuditLog({
    actorId:   user.id,
    actorRole: user.role,
    action:    'auth.login',
    resource:  JSON.stringify({ collection: 'User', id: user.id }),
    ip
  })

  return {
    accessToken,
    refreshToken,
    user: { id: user.id, email: user.email, role: user.role }
  }
}

const refresh = async (refreshToken, ip) => {
  const keys = await tokenDB.keys('refresh:*')
  let userId = null
  
  for (const key of keys) {
    const stored = await tokenDB.get(key)
    if (stored === refreshToken) {
      userId = key.split(':')[1]
      break
    }
  }

  if (!userId) {
    const err = new Error('Invalid refresh token')
    err.code   = 'INVALID_REFRESH_TOKEN'
    err.status = 401
    throw err
  }

  const user = await repository.findUserById(userId)
  if (!user) {
    const err = new Error('User not found')
    err.status = 404
    throw err
  }

  const newAccessToken  = generateAccessToken(user)
  const newRefreshToken = generateRefreshToken()

  await tokenDB.set(`refresh:${user.id}`, newRefreshToken, 'EX', REFRESH_TTL_SECONDS)

  return { accessToken: newAccessToken, refreshToken: newRefreshToken }
}

const logout = async (userId) => {
  await tokenDB.del(`refresh:${userId}`)
}

export default { 
  register, 
  login, 
  refresh, 
  logout, 
  generateAccessToken, 
  generateRefreshToken, 
  REFRESH_TTL_SECONDS 
}