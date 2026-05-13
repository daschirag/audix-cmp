import request from 'supertest'
import app from '../src/app.js'

describe('Health Checks', () => {
  describe('GET /health', () => {
    it('should return 200 and liveness data', async () => {
      const res = await request(app).get('/health')
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data).toHaveProperty('uptime')
    })
  })

  describe('GET /ready', () => {
    it('should return 200 if database is connected', async () => {
      const res = await request(app).get('/ready')
      expect(res.status).toBe(200)
    })
  })

  describe('404 Handler', () => {
    it('should return 404 for non-existent routes', async () => {
      const res = await request(app).get('/non-existent-route')
      expect(res.status).toBe(404)
      expect(res.body.success).toBe(false)
      expect(res.body.code).toBe('NOT_FOUND')
    })
  })
})
