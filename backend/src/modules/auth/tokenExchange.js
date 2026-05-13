import { v4 as uuidv4 } from 'uuid'
import { tokenDB } from '../../lib/redis.js'
import repository from './repository.js'
import service from './service.js'

const OTT_TTL_SECONDS = 60 // one-time token expires in 60 seconds

// Generate a one-time token for hosted HTML consent pages
const generateOneTimeToken = async (userId, role) => {
  const token = uuidv4()

  await tokenDB.set(
    `ott:${token}`,
    JSON.stringify({ userId, role }),
    'EX',
    OTT_TTL_SECONDS
  )

  return { token, expiresIn: OTT_TTL_SECONDS }
}

// Validate and consume one-time token — single use only
const validateOneTimeToken = async (token) => {
  const stored = await tokenDB.get(`ott:${token}`)

  if (!stored) {
    const err = new Error('Invalid or expired one-time token')
    err.code   = 'INVALID_OTT'
    err.status = 401
    throw err
  }

  // Delete immediately — one-time use
  await tokenDB.del(`ott:${token}`)

  const { userId } = JSON.parse(stored)

  const user = await repository.findUserById(userId)
  if (!user) {
    const err = new Error('User not found')
    err.code   = 'USER_NOT_FOUND'
    err.status = 404
    throw err
  }

  // Issue a full JWT access token
  const accessToken = service.generateAccessToken(user)

  return { accessToken }
}

export default { generateOneTimeToken, validateOneTimeToken }
