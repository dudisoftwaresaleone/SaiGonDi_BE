import dotenv from 'dotenv'
dotenv.config({ quiet: true })

export const env = {
  // Database
  MONGODB_URI: process.env.MONGODB_URI,
  DATABASE_NAME: process.env.DATABASE_NAME,

  // App
  APP_HOST: process.env.APP_HOST || '0.0.0.0',
  APP_PORT: process.env.APP_PORT || 5000,
  BUILD_MODE: process.env.BUILD_MODE || 'development',

  // JWT
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,

  // Email
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
  // Tuỳ chọn: gửi mail qua HTTPS API (khuyến nghị trên Render free vì SMTP bị chặn)
  MAIL_FROM: process.env.MAIL_FROM,
  BREVO_API_KEY: process.env.BREVO_API_KEY,
  RESEND_API_KEY: process.env.RESEND_API_KEY,

  // Cloudinary
  CLOUD_NAME: process.env.CLOUD_NAME,
  CLOUD_API_KEY: process.env.CLOUD_API_KEY,
  CLOUD_API_SECRET: process.env.CLOUD_API_SECRET,

  // Google OAuth
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK: process.env.GOOGLE_CALLBACK,

  // Client
  CLIENT_URL: process.env.CLIENT_URL
}
