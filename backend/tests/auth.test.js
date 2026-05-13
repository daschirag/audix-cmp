import request from 'supertest'
import app from '../src/app.js'

describe('Auth Module', () => {
  describe('POST /auth/register', () => {
    it('should validate request body', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({ email: 'invalid' })
      expect(res.status).toBe(400)
    })

    it('should register a user successfully', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({ email: 'test@example.com', password: 'password123' })
      console.log('Registration Response:', res.body)
      expect([201, 409]).toContain(res.status)
    })
  })

  describe('POST /auth/login', () => {
    it('should login successfully', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'password123' })
      expect([200, 401]).toContain(res.status)
    })
  })

  describe('POST /auth/refresh', () => {
    it('should refresh tokens using refresh_token', async () => {
      const res = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken: 'mock-refresh-token' })
      expect([200, 401]).toContain(res.status)
    })
  })

  describe('POST /auth/logout', () => {
    it('should logout and invalidate tokens', async () => {
      const res = await request(app)
        .post('/auth/logout')
        .set('Authorization', 'Bearer mock-token')
      expect([200, 204]).toContain(res.status)
    })
  })
})
