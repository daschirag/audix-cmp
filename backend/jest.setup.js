import { jest } from '@jest/globals'

jest.mock('ioredis', () => {
  const Redis = require('ioredis-mock')
  return Redis
})

jest.mock('uuid', () => ({
  v4: () => 'test-uuid'
}))

// We will mock prisma in individual tests as needed or globally if possible
// But for ESM, it's often easier to mock the lib/prisma module
