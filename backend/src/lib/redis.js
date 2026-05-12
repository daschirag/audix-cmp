import Redis from 'ioredis'

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  retryStrategy: (times) => {
    if (times > 3) {
      console.error('Redis connection failed after 3 retries')
      return null
    }
    return Math.min(times * 200, 1000)
  }
})

redis.on('connect', () => {
  console.log('✅ Redis connected')
})

redis.on('error', (err) => {
  console.error('❌ Redis error:', err.message)
})

// DB0 = sessions
// DB1 = token blacklist (JTI)
// DB2 = refresh tokens

export const sessionDB   = redis
export const blacklistDB = redis.createConnectedClient ? redis : new Redis({ host: process.env.REDIS_HOST || 'localhost', port: parseInt(process.env.REDIS_PORT) || 6379, db: 1 })
export const tokenDB     = new Redis({ host: process.env.REDIS_HOST || 'localhost', port: parseInt(process.env.REDIS_PORT) || 6379, db: 2 })

export default redis