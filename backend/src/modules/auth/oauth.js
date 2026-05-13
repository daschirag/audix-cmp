import { v4 as uuidv4 } from 'uuid'
import { tokenDB } from '../../lib/redis.js'
import repository from './repository.js'
import service from './service.js'

const REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60

// Returns fake Google OAuth URL — stub, no real Google API needed
const getGoogleAuthUrl = () => {
  const callbackUrl = `http://localhost:3001/auth/oauth/callback?code=demo_code_${uuidv4()}&state=demo_state`
  return callbackUrl
}

// Handles fake Google callback — creates/finds user, returns real JWT
const handleGoogleCallback = async (code, state, ip) => {
  // Fake Google profile — in real OAuth this comes from Google API
  const googleProfile = {
    googleId: `google_stub_${code}`,
    email:    'dpo.demo@audix.com',
    name:     'DPO Demo User',
  }

  // Find existing user or create new one
  let user = await repository.findUserByEmail(googleProfile.email)

  if (!user) {
    const bcrypt = await import('bcrypt')
    const randomPassword = await bcrypt.default.hash(uuidv4(), 12)
    user = await repository.createUser({
      email:        googleProfile.email,
      passwordHash: randomPassword,
      role:         'DPO_OPS',
      isMinor:      false,
      guardianId:   null,
    })
  }

  // Generate real JWT tokens
  const accessToken  = service.generateAccessToken(user)
  const refreshToken = service.generateRefreshToken()

  // Store refresh token in Redis
  await tokenDB.set(
    `refresh:${user.id}`,
    refreshToken,
    'EX',
    REFRESH_TTL_SECONDS
  )

  // Audit log
  await repository.writeAuditLog({
    actorId:   user.id,
    actorRole: user.role,
    action:    'auth.oauth.google',
    resource:  JSON.stringify({ collection: 'User', id: user.id }),
    ip
  })

  return {
    accessToken,
    refreshToken,
    user: { id: user.id, email: user.email, role: user.role }
  }
}

export default { getGoogleAuthUrl, handleGoogleCallback }
