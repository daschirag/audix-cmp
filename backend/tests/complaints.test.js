import { jest } from '@jest/globals'

// Mock Prisma BEFORE importing app
const mockUserId = '507f1f77bcf86cd799439011'
const mockCompId = '507f1f77bcf86cd799439012'

jest.mock('../src/lib/prisma.js', () => ({
  __esModule: true,
  default: {
    complaint: {
      create: jest.fn(() => Promise.resolve({ id: '507f1f77bcf86cd799439012', status: 'RECEIVED' })),
      findMany: jest.fn(() => Promise.resolve([{ id: '507f1f77bcf86cd799439012', status: 'RECEIVED' }])),
      findUnique: jest.fn(() => Promise.resolve({ id: '507f1f77bcf86cd799439012', status: 'RECEIVED', dataPrincipalId: '507f1f77bcf86cd799439011' })),
      update: jest.fn(() => Promise.resolve({ id: '507f1f77bcf86cd799439012', status: 'UNDER_REVIEW' }))
    },
    auditLog: {
      create: jest.fn(() => Promise.resolve({ id: 'audit-id' }))
    },
    $connect: jest.fn(() => Promise.resolve())
  }
}))

// Mock auth middleware
jest.mock('../src/middleware/auth.js', () => ({
  __esModule: true,
  default: jest.fn((req, res, next) => {
    if (!req.headers.authorization) {
      return res.status(401).json({ success: false, message: 'No token' })
    }
    // Using DPO_OPS so it passes rbac('complaints:write')
    req.user = { id: '507f1f77bcf86cd799439011', role: 'DPO_OPS' }
    next()
  })
}))

import request from 'supertest'
import app from '../src/app.js'

describe('Complaints Module', () => {
  const mockAccessToken = 'test-token'

  describe('POST /complaints', () => {
    it('should return 401 if not authenticated', async () => {
      const res = await request(app).post('/complaints').send({})
      expect(res.status).toBe(401)
    })

    it('should file a complaint successfully', async () => {
      const payload = {
        dataPrincipalId: '507f1f77bcf86cd799439011',
        subject: 'Privacy Inquiry',
        description: 'How is my data shared?'
      }
      const res = await request(app)
        .post('/complaints')
        .set('Authorization', `Bearer ${mockAccessToken}`)
        .send(payload)
      expect(res.status).toBe(201)
    })
  })

  describe('GET /complaints', () => {
    it('should list complaints', async () => {
      const res = await request(app)
        .get('/complaints')
        .set('Authorization', `Bearer ${mockAccessToken}`)
      expect(res.status).toBe(200)
    })
  })

  describe('GET /complaints/:id', () => {
    it('should fetch details', async () => {
      const res = await request(app)
        .get(`/complaints/${mockCompId}`)
        .set('Authorization', `Bearer ${mockAccessToken}`)
      expect(res.status).toBe(200)
    })
  })

  describe('PATCH /complaints/:id/status', () => {
    it('should update status', async () => {
      const res = await request(app)
        .patch(`/complaints/${mockCompId}/status`)
        .set('Authorization', `Bearer ${mockAccessToken}`)
        .send({ status: 'UNDER_REVIEW' })
      expect(res.status).toBe(200)
    })
  })

  describe('PATCH /complaints/:id/assign', () => {
    it('should assign complaint', async () => {
      const res = await request(app)
        .patch(`/complaints/${mockCompId}/assign`)
        .set('Authorization', `Bearer ${mockAccessToken}`)
        .send({ assignedTo: 'agent-456' }) // Matches API_CONTRACTS.md field name
      expect(res.status).toBe(200)
    })
  })
})
