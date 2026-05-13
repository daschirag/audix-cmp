import request from 'supertest'
import app from '../src/app.js'

describe('Dashboard Module', () => {
  const mockAccessToken = 'test-token'

  describe('GET /dashboard/summary', () => {
    it('should return 401 if not authenticated', async () => {
      const res = await request(app).get('/dashboard/summary')
      expect(res.status).toBe(401)
    })

    it('should return dashboard summary stats', async () => {
      const res = await request(app)
        .get('/dashboard/summary')
        .set('Authorization', `Bearer ${mockAccessToken}`)
      
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data).toHaveProperty('active')
      expect(res.body.data).toHaveProperty('withdrawn')
      expect(res.body.data).toHaveProperty('expired')
      expect(res.body.data).toHaveProperty('openComplaints')
    })
  })

  describe('GET /dashboard/consents', () => {
    it('should fetch paginated consent list for the dashboard table', async () => {
      const res = await request(app)
        .get('/dashboard/consents?page=1&limit=10')
        .set('Authorization', `Bearer ${mockAccessToken}`)
      
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(Array.isArray(res.body.data.items)).toBe(true)
    })
  })
})
