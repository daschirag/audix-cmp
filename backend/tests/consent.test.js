import request from 'supertest'
import app from '../src/app.js'

describe('Consent Module', () => {
  const mockAccessToken = 'test-token'

  describe('POST /consent/capture', () => {
    it('should return 401 if token is missing', async () => {
      const res = await request(app).post('/consent/capture').send({})
      expect(res.status).toBe(401)
    })

    it('should successfully capture consent', async () => {
      const payload = {
        dataPrincipalId: 'user-123',
        purposes: [{ purposeId: 'marketing-id', granted: true }],
        noticeVersionId: 'notice-v1',
        language: 'en',
        source: 'web'
      }
      const res = await request(app)
        .post('/consent/capture')
        .set('Authorization', `Bearer ${mockAccessToken}`)
        .send(payload)
      expect(res.status).toBe(201)
    })
  })

  describe('GET /consent/:id', () => {
    it('should fetch full record', async () => {
      const res = await request(app)
        .get('/consent/consent-123')
        .set('Authorization', `Bearer ${mockAccessToken}`)
      expect(res.status).toBe(200)
    })
  })

  describe('GET /consent/status/:principalId', () => {
    it('should check status for a principal', async () => {
      const res = await request(app)
        .get('/consent/status/user-123')
        .set('Authorization', `Bearer ${mockAccessToken}`)
      expect(res.status).toBe(200)
    })
  })

  describe('DELETE /consent/:id/withdraw', () => {
    it('should withdraw consent using DELETE', async () => {
      const res = await request(app)
        .delete('/consent/consent-123/withdraw')
        .set('Authorization', `Bearer ${mockAccessToken}`)
      expect(res.status).toBe(200)
    })
  })

  describe('GET /consent/proof/:consentId', () => {
    it('should generate audit proof', async () => {
      const res = await request(app)
        .get('/consent/proof/consent-123')
        .set('Authorization', `Bearer ${mockAccessToken}`)
      expect(res.status).toBe(200)
    })
  })
})
