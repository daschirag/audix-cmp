import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import prisma from './lib/prisma.js'
import authRouter from './modules/auth/router.js'

// ── Stub imports (others fill these in on their branches) ─────────────────────
import consentRouter    from './modules/consent/router.js'
// import complaintsRouter from './modules/complaints/router.js'
// import dashboardRouter  from './modules/dashboard/router.js'

const app  = express()
const PORT = process.env.PORT || 3001

// ── Global middleware ─────────────────────────────────────────────────────────

app.use(cors({
  origin:      process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Rate limiter — 100 requests per 15 min per IP
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      100,
  message: {
    success: false,
    message: 'Too many requests, please try again later',
    code:    'RATE_LIMITED'
  }
}))

// ── Routes ────────────────────────────────────────────────────────────────────

app.use('/auth', authRouter)
app.use('/consent', consentRouter)

// Uncomment as each member pushes their module
// app.use('/complaints', complaintsRouter)
// app.use('/dashboard',  dashboardRouter)

// ── Health checks ─────────────────────────────────────────────────────────────

// Liveness — always 200, just confirms server is running
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    data: {
      uptime:      process.uptime(),
      environment: process.env.NODE_ENV,
      timestamp:   new Date().toISOString()
    }
  })
})

// Readiness — checks DB connection before confirming ready
app.get('/ready', async (req, res) => {
  try {
    await prisma.$connect()
    res.status(200).json({
      success: true,
      message: 'Server is ready',
      data: {
        database: 'connected',
        timestamp: new Date().toISOString()
      }
    })
  } catch (err) {
    res.status(503).json({
      success: false,
      message: 'Database not ready',
      code:    'DB_NOT_READY'
    })
  }
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
    code:    'NOT_FOUND'
  })
})

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    code:    'SERVER_ERROR'
  })
})

// ── Start server ──────────────────────────────────────────────────────────────

const start = async () => {
  try {
    await prisma.$connect()
    console.log('✅ MongoDB connected')

    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`)
      console.log(`   Health: http://localhost:${PORT}/health`)
      console.log(`   Ready:  http://localhost:${PORT}/ready`)
    })
  } catch (err) {
    console.error('❌ Failed to start server:', err)
    process.exit(1)
  }
}

if (process.env.NODE_ENV !== 'test') {
  start()
}

export default app