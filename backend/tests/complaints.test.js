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
        dataPrincipalId: 'user-123',
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
        .get('/complaints/comp-123')
        .set('Authorization', `Bearer ${mockAccessToken}`)
      expect(res.status).toBe(200)
    })
  })

  describe('PATCH /complaints/:id/status', () => {
    it('should update status', async () => {
      const res = await request(app)
        .patch('/complaints/comp-123/status')
        .set('Authorization', `Bearer ${mockAccessToken}`)
        .send({ status: 'UNDER_REVIEW' })
      expect(res.status).toBe(200)
    })
  })

  describe('PATCH /complaints/:id/assign', () => {
    it('should assign complaint', async () => {
      const res = await request(app)
        .patch('/complaints/comp-123/assign')
        .set('Authorization', `Bearer ${mockAccessToken}`)
        .send({ assignedTo: 'agent-456' }) // Matches API_CONTRACTS.md field name
      expect(res.status).toBe(200)
    })
  })
})
