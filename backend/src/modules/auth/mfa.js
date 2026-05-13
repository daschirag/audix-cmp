import speakeasy from 'speakeasy'
import { sessionDB } from '../../lib/redis.js'

const enrollMFA = async (userId) => {
  const secret = speakeasy.generateSecret({
    name:   `Audix CMP (${userId})`,
    length: 20
  })

  await sessionDB.set(`mfa:${userId}`, secret.base32)

  return {
    secret:     secret.base32,
    otpauthUrl: secret.otpauth_url
  }
}

const verifyMFA = async (userId, token) => {
  const secret = await sessionDB.get(`mfa:${userId}`)

  if (!secret) {
    const err = new Error('MFA not enrolled for this user')
    err.code   = 'MFA_NOT_ENROLLED'
    err.status = 400
    throw err
  }

  const valid = speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window:   1
  })

  if (!valid) {
    const err = new Error('Invalid MFA token')
    err.code   = 'INVALID_MFA_TOKEN'
    err.status = 401
    throw err
  }

  return { verified: true }
}

export default { enrollMFA, verifyMFA }
