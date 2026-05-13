\# Auth Module — CLAUDE.md

Created by Chirag S Das | Last updated: May 13, 2026



\## What exists in this module



\### repository.js

\- findUserByEmail(email) → User | null

\- findUserById(id) → User | null

\- createUser(data) → User

\- updateUser(id, data) → User

\- writeAuditLog({ actorId, actorRole, action, resource, ip }) → AuditLog



\### service.js

\- register({ email, password, mobile, role, isMinor, guardianId }, ip) → { id, email, role }

\- login({ email, password }, ip) → { accessToken, refreshToken, user }

\- refresh(refreshToken, ip) → { accessToken, refreshToken }

\- logout(userId) → void

\- generateAccessToken(user) → JWT string (15min expiry) — EXPORTED for reuse

\- generateRefreshToken() → UUID string — EXPORTED for reuse

\- REFRESH\_TTL\_SECONDS = 604800 (7 days) — EXPORTED for reuse



\### controller.js

\- register(req, res) — handles POST /auth/register

\- login(req, res) — handles POST /auth/login

\- refresh(req, res) — handles POST /auth/refresh

\- logout(req, res) — handles POST /auth/logout



\### oauth.js

\- getGoogleAuthUrl() → string (fake Google OAuth URL — STUB)

\- handleGoogleCallback(code, state, ip) → { accessToken, refreshToken, user }

&#x20; Creates DPO\_OPS user with email dpo.demo@audix.com if not exists



\### tokenExchange.js

\- generateOneTimeToken(userId, role) → { token, expiresIn: 60 }

&#x20; Stores in Redis DB2 with key ott:{token}, TTL 60 seconds

\- validateOneTimeToken(token) → { accessToken }

&#x20; Deletes token immediately after use — single use only



\### mfa.js

\- enrollMFA(userId) → { secret, otpauthUrl }

&#x20; Stores TOTP secret in Redis DB0 with key mfa:{userId}

\- verifyMFA(userId, token) → { verified: true }

&#x20; Uses speakeasy library, window=1



\### router.js — All routes

\- POST /auth/register — no auth needed

\- POST /auth/login — rate limited (5 per 15 min per IP)

\- POST /auth/refresh — no auth needed

\- POST /auth/logout — no auth needed

\- GET  /auth/oauth/google — no auth needed

\- GET  /auth/oauth/callback — no auth needed, ?code=\&state=

\- POST /auth/token-exchange/generate — auth required

\- POST /auth/token-exchange/validate — no auth needed

\- POST /auth/mfa/enroll — auth required

\- POST /auth/mfa/verify — auth required



\## Redis key patterns

\- refresh:{userId}    → refresh token string (DB2, TTL 7 days)

\- blacklist:{jti}     → '1' (DB1, TTL 15 min) — blacklisted tokens

\- ott:{token}         → JSON {userId, role} (DB2, TTL 60 sec) — one-time tokens

\- mfa:{userId}        → base32 secret string (DB0, no TTL)



\## What to import from this module

\- generateAccessToken and generateRefreshToken are exported from service.js

\- Use these in oauth.js and anywhere else that needs token generation

\- Never create jwt.sign() directly — always use generateAccessToken(user)



\## DO NOT modify

\- schema.prisma

\- lib/prisma.js

\- lib/redis.js export names (sessionDB, blacklistDB, tokenDB)



\## Import paths from other modules

\- From consent/complaints/dashboard modules:

&#x20; import auth from '../../../middleware/auth.js'

&#x20; import rbac from '../../../middleware/rbac.js'

&#x20; import { tokenDB } from '../../lib/redis.js'

&#x20; import prisma from '../../lib/prisma.js'



\## MongoDB replica set

\- docker-compose.yml now has --replSet rs0 flag on MongoDB

\- DATABASE\_URL must include: ?replicaSet=rs0\&directConnection=true

\- Run after first docker compose up:

&#x20; docker exec cmp-mongodb mongosh --eval "rs.initiate({\_id:'rs0',members:\[{\_id:0,host:'localhost:27017'}]})"

