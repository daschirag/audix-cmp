import Redis from 'ioredis'

const createClient = (db = 0) => new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  db,
  retryStrategy: (times) => {
    if (times > 3) {
      console.error('Redis connection failed after 3 retries')
      return null
    }
    return Math.min(times * 200, 1000)
  }
})

// DB0 = sessions
export const sessionDB   = createClient(0)

// DB1 = JWT blacklist
export const blacklistDB = createClient(1)

// DB2 = refresh tokens + one-time tokens
export const tokenDB     = createClient(2)

const redis = sessionDB

redis.on('connect', () => {
  console.log('✅ Redis connected')
})

redis.on('error', (err) => {
  console.error('❌ Redis error:', err.message)
})

export default redis