import { jest } from '@jest/globals'

jest.mock('ioredis', () => {
  const Redis = require('ioredis-mock')
  return Redis
})

jest.mock('uuid', () => ({
  v4: () => 'test-uuid'
}))

// auth/mfa.js requires speakeasy which is not installed — mock the module directly
jest.mock('./src/modules/auth/mfa.js', () => ({
  __esModule: true,
  enrollMFA: async () => ({ secret: 'MOCK_SECRET', otpauthUrl: 'otpauth://mock' }),
  verifyMFA: async () => ({ verified: true }),
}))

// Auth middleware mock — accepts any Bearer token, rejects missing/malformed headers
jest.mock('./src/middleware/auth', () => ({
  __esModule: true,
  default: (req, res, next) => {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided', code: 'NO_TOKEN' })
    }
    req.user = { id: 'test-user-id', role: 'DPO_ADMIN', permissions: [] }
    return next()
  }
}))

// Prisma mock — returns minimal valid shapes; tests only assert on status codes
jest.mock('./src/lib/prisma.js', () => ({
  __esModule: true,
  default: {
    consentMaster: {
      create:     async () => ({ id: 'mock-consent-id', status: 'ACTIVE', dataPrincipalId: 'user-123', purposes: [], noticeVersionId: 'notice-v1', language: 'en', source: {}, createdAt: new Date(), updatedAt: new Date() }),
      findUnique: async () => ({ id: 'consent-123', status: 'ACTIVE', dataPrincipalId: 'user-123', purposes: [], noticeVersionId: 'notice-v1', language: 'en', events: [] }),
      findMany:   async () => ([]),
      update:     async () => ({ id: 'consent-123', status: 'WITHDRAWN' }),
    },
    consentEvent: {
      create: async () => ({ id: 'event-123' }),
    },
    purposeCatalog: {
      findMany: async () => ([{ id: 'marketing-id', isActive: true }]),
    },
    auditLog: {
      create: async () => ({ id: 'audit-123' }),
    },
    user: {
      create:     async () => ({ id: 'user-123', email: 'test@example.com', role: 'USER', createdAt: new Date() }),
      findUnique: async () => ({ id: 'user-123', email: 'test@example.com', passwordHash: '$2b$12$mockHashForTesting', role: 'USER' }),
      findMany:   async () => ([]),
      update:     async () => ({ id: 'user-123' }),
    },
    complaint: {
      create:     async () => ({ id: 'complaint-123', status: 'RECEIVED' }),
      findUnique: async () => ({ id: 'complaint-123', status: 'RECEIVED', dataPrincipalId: 'user-123' }),
      findMany:   async () => ([]),
      update:     async () => ({ id: 'complaint-123', status: 'UNDER_REVIEW' }),
    },
    $connect:    async () => {},
    $disconnect: async () => {},
  }
}))
