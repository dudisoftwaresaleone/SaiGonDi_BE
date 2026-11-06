/* eslint-disable no-console */
import dns from 'dns'
dns.setServers(['8.8.8.8', '8.8.4.4'])
dns.setDefaultResultOrder('ipv4first')
import express from 'express'
import cors from 'cors'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import passport from 'passport'
import '~/config/passport.js'
import { connectDB } from '~/config/db.js'
import { env } from '~/config/environment.js'
import { APIs } from '~/routes/index.js'
import { errorHandler } from '~/middlewares/error.middleware.js'

const APP_PORT = env.APP_PORT || 5000
const APP_HOST = env.APP_HOST || '0.0.0.0' // FIX QUAN TRỌNG

const START_SERVER = async () => {
  const app = express()

  // Behind a reverse proxy (hosting platform): trust the first proxy so req.ip
  // and express-rate-limit use the real client IP from X-Forwarded-For
  app.set('trust proxy', 1)

  const allowedOrigins = [
    'https://www.saigondi.io.vn',
    'https://saigondi.io.vn',
    'https://saigondi.vercel.app',
    'https://sai-gon-di-web-nu.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173'
  ]
  if (env.CLIENT_URL) {
    env.CLIENT_URL.split(',').map(s => s.trim()).filter(Boolean).forEach(url => {
      if (!allowedOrigins.includes(url)) allowedOrigins.push(url)
    })
  }

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          return callback(null, true)
        }
        return callback(null, true)
      },
      credentials: true,
    })
  )

  // Nén gzip/br response JSON (giảm mạnh dung lượng danh sách địa điểm/blog)
  app.use(compression())
  app.use(cookieParser())
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use(passport.initialize())

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'OK',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    })
  })

  app.use('/api', APIs)
  app.use(errorHandler)

  app.listen(APP_PORT, APP_HOST, () => {
    console.log(`Server running at http://${APP_HOST}:${APP_PORT}`)
  })

  // Render free ngủ sau ~15 phút không có request -> request đầu tiên mất 30-50 giây (cold start).
  // Tự gọi /api/health qua địa chỉ công khai mỗi 10 phút để giữ server thức (chỉ chạy khi Render cung cấp RENDER_EXTERNAL_URL).
  if (process.env.RENDER_EXTERNAL_URL) {
    const pingUrl = `${process.env.RENDER_EXTERNAL_URL.replace(/\/+$/, '')}/api/health`
    setInterval(() => {
      fetch(pingUrl, { signal: AbortSignal.timeout(10000) }).catch(() => {})
    }, 10 * 60 * 1000).unref()
  }
};

(async () => {
  console.log('Connecting to database...')
  await connectDB()
  console.log('Database connected successfully')

  console.log('Starting server...')
  await START_SERVER()
})()
