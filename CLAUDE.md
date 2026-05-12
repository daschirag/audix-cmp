# CMP Project — Audix Consent Management Platform

## Project Summary
DPDPA-compliant Consent Management Platform built by Audix intern team.
Sprint deadline: May 14, 2026. Demo to manager: Lalith Popli.
Manager: Lalith Popli | Organisation: Audix

## What Is Built So Far
- backend/prisma/schema.prisma — MongoDB schema via Prisma ORM (FROZEN)
- Prisma Client generated — node_modules/@prisma/client
- That is ALL. Nothing else exists yet.

## Tech Stack — Do Not Change Any of These
- Backend:    Express.js v4 (NOT Fastify — never use Fastify)
- Frontend:   Next.js 14 App Router + Tailwind CSS
- Database:   MongoDB via Prisma ORM
- Auth:       jsonwebtoken npm package (NOT @fastify/jwt)
- Cache:      Redis via ioredis
- Validation: Zod on every POST/PATCH body, server side
- Password:   bcrypt (12 rounds)
- Testing:    Jest + supertest

## Redis DB Layout
- DB0 → sessions
- DB1 → JWT blacklist (logged out tokens by JTI)
- DB2 → refresh tokens

## Folder Structure
cmp/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma        ← FROZEN — never touch this
│   ├── src/
│   │   ├── lib/
│   │   │   ├── prisma.js        ← Prisma singleton — only import from here
│   │   │   └── redis.js         ← Redis clients (sessionDB, blacklistDB, tokenDB)
│   │   ├── middleware/
│   │   │   ├── auth.js          ← JWT verify — attaches req.user
│   │   │   └── rbac.js          ← RBAC — rbac('permission:action')
│   │   ├── modules/
│   │   │   ├── auth/            ← Chirag + Hamsavardhan
│   │   │   ├── consent/         ← Ramya + Sujaa
│   │   │   ├── complaints/      ← Madeshwar + Manoj
│   │   │   └── dashboard/       ← Elakiya (after frontend done)
│   │   └── app.js               ← Express entry point
│   ├── .env                     ← never commit this
│   └── package.json
├── frontend/
│   ├── src/app/
│   │   ├── login/page.jsx       ← Tanusha
│   │   ├── consent/page.jsx     ← Tanusha
│   │   ├── dashboard/page.jsx   ← Elakiya
│   │   └── api/                 ← Next.js proxy routes
│   └── package.json
├── docker-compose.yml           ← Adhavan
├── CLAUDE.md                    ← this file
├── API_CONTRACTS.md             ← read before writing any fetch call
└── .gitignore

## Module Ownership
| Module          | Owner(s)               | Branch           |
|-----------------|------------------------|------------------|
| Auth            | Chirag + Hamsavardhan  | feat/infra       |
| Consent API     | Ramya + Sujaa          | feat/consent-api |
| Complaints API  | Madeshwar + Manoj      | feat/complaints  |
| Dashboard API   | Elakiya (after UI)     | feat/frontend    |
| Consent UI      | Tanusha                | feat/frontend    |
| DPO Dashboard   | Elakiya                | feat/frontend    |
| DevOps + Docker | Adhavan                | feat/infra       |

## Who Builds What
### Chirag (Sprint Lead)
- Express.js server — app.js, CORS, rate limiting, 404 handler
- lib/prisma.js — Prisma singleton
- lib/redis.js — Redis client with 3 DBs
- middleware/auth.js — JWT verify middleware
- middleware/rbac.js — RBAC permission middleware
- POST /auth/register — bcrypt hash + MongoDB write + AuditLog
- POST /auth/login — JWT access token + Redis refresh token
- Next.js 14 frontend scaffold
- docker-compose.yml skeleton
- PUSH to main by May 11 5PM

### Hamsavardhan (on feat/infra branch)
- POST /auth/refresh — validate Redis token, rotate, issue new JWT
- POST /auth/logout — blacklist JTI in Redis DB1
- NotificationService — sendConsentGranted(), sendConsentWithdrawn()

### Ramya (on feat/consent-api branch)
- POST /consent/capture — write ConsentMaster + ConsentEvent + AuditLog
- DELETE /consent/:id/withdraw — update status + AuditLog
- GET /consent/status/:principalId

### Sujaa (on feat/consent-api branch, shared with Ramya)
- GET /consent/:id — full record with events populated
- GET /consent/proof/:consentId — record + all events + notice version

### Madeshwar (on feat/complaints branch)
- POST /complaints — create with RECEIVED status + AuditLog
- GET /complaints/:id
- GET /complaints — list with ?status= filter
- PATCH /complaints/:id/status — state machine validation
- PATCH /complaints/:id/assign

### Manoj (on feat/complaints branch, shared with Madeshwar)
- Jest unit tests for consent + complaint state machines
- supertest integration tests for all endpoints

### Tanusha (on feat/frontend branch)
- /login page — login form, calls POST /auth/login, stores JWT
- /consent page — consent capture form, purpose checkboxes, receipt screen

### Elakiya (on feat/frontend branch, shared with Tanusha)
- /dashboard page — stat cards, consent list table
- After dashboard done: GET /dashboard/summary Express endpoint

### Adhavan (on feat/infra branch)
- docker-compose.yml — MongoDB + Redis + backend + frontend
- GET /health and GET /ready endpoints in app.js

## Mandatory Rules — No Exceptions
1. NEVER modify backend/prisma/schema.prisma
2. NEVER hardcode secrets, passwords, or API keys in any file
3. NEVER push directly to main — always use your feature branch
4. Every POST/PATCH/DELETE must write to AuditLog
5. All API responses must follow exactly:
   { success: boolean, data: any, message: string }
6. Every module must have router.js + service.js + repository.js
7. Never import Prisma directly — always use lib/prisma.js
8. Commit after each endpoint — not at end of day
9. Open Claude Code inside YOUR module folder, not the repo root

## AuditLog — Write This on Every Mutation
await prisma.auditLog.create({
  data: {
    actorId:   req.user.id,
    actorRole: req.user.role,
    action:    'module.action',
    resource:  JSON.stringify({ collection: 'ModelName', id: record.id }),
    ip:        req.ip || 'unknown',
    timestamp: new Date()
  }
})

## Standard Error Pattern
const err = new Error('Human readable message')
err.code   = 'SCREAMING_SNAKE_CASE'
err.status = 400
throw err

## Standard Response Pattern
// Success
res.status(200).json({ success: true, data: result, message: 'Done' })

// Error
res.status(err.status || 500).json({
  success: false,
  message: err.message,
  code:    err.code || 'SERVER_ERROR'
})

## Auth + RBAC Usage
import auth from '../../../middleware/auth.js'
import rbac from '../../../middleware/rbac.js'

// Any logged in user
router.get('/route', auth, handler)

// Specific permission required
router.post('/route', auth, rbac('consent:write'), handler)

## Available Permissions
consent:read, consent:write, consent:delete
complaints:read, complaints:write
dashboard:read
users:read, users:write
audit:read

## Roles and Their Permissions
- DPO_ADMIN → all permissions
- DPO_OPS   → consent + complaints + dashboard
- AUDITOR   → read only (no writes)
- USER      → consent:read + consent:write only

## Prisma Models Available (from schema.prisma)
- User                    → auth module
- ConsentMaster           → consent module
- ConsentEvent            → consent module (append-only, never delete)
- Complaint               → complaints module
- AuditLog                → ALL modules (write on every mutation)
- Notification            → Hamsavardhan
- PurposeCatalog          → consent module (validate before capture)
- NoticeVersion           → consent module
- RegulatorCommunication  → out of scope for this sprint

## How to Start Your Claude Code Session
1. cd into YOUR module folder only — not the repo root
2. Set API key: $env:ANTHROPIC_API_KEY = "your-key"
3. Run: claude
4. First message: paste opening prompt from sprint PDF page 7
5. Work only in your module — never touch other modules
6. When done: [DONE] name — feature — ready for review → message Chirag on WhatsApp

## Reporting
- Done with task     → [DONE] name — endpoint — ready for review
- Blocked            → [BLOCKED] name — issue — need help with X
- End of day         → [EOD] name — Done: X, Remaining: Y
- All messages go to → Chirag S Das (Sprint Lead)