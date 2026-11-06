import nodemailer from 'nodemailer'
import { env } from '~/config/environment.js'

// Timeout ngắn để không treo request khi SMTP bị chặn (vd. Render free chặn cổng 25/465/587):
// mặc định nodemailer chờ tới 2 phút (kết nối) và 10 phút (socket).
export const nodemailerTransporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Use TLS
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS
  },
  connectionTimeout: 8000,
  greetingTimeout: 8000,
  socketTimeout: 12000,
  dnsTimeout: 5000
})
