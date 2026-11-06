import { nodemailerTransporter } from '~/config/nodemailer.js'
import { env } from '~/config/environment.js'

// Tổng thời gian tối đa cho 1 lần gửi mail. Quá hạn thì ném lỗi để API trả lời được
// (thay vì để người dùng nhìn nút quay vô hạn).
const SEND_TIMEOUT_MS = 12000

const withTimeout = (promise, ms) => {
  let timer
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Send mail timed out after ${ms}ms`)), ms)
  })
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer))
}

const fromName = 'Sài Gòn Đi'
const fromAddress = () => env.MAIL_FROM || env.EMAIL_USER

// Nhà cung cấp gửi mail qua HTTPS (không dùng cổng SMTP, chạy được trên Render free).
// Bật bằng biến môi trường BREVO_API_KEY hoặc RESEND_API_KEY; nếu không có thì dùng SMTP Gmail.
const sendViaBrevo = async ({ to, subject, text, html }) => {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': env.BREVO_API_KEY, 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({
      sender: { name: fromName, email: fromAddress() },
      to: [{ email: to }],
      subject,
      textContent: text,
      ...(html && { htmlContent: html })
    }),
    signal: AbortSignal.timeout(SEND_TIMEOUT_MS)
  })
  if (!res.ok) throw new Error(`Brevo responded ${res.status}: ${(await res.text()).slice(0, 200)}`)
}

const sendViaResend = async ({ to, subject, text, html }) => {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      from: `${fromName} <${fromAddress()}>`,
      to: [to],
      subject,
      text,
      ...(html && { html })
    }),
    signal: AbortSignal.timeout(SEND_TIMEOUT_MS)
  })
  if (!res.ok) throw new Error(`Resend responded ${res.status}: ${(await res.text()).slice(0, 200)}`)
}

/**
 * Send email with HTML and text support
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} text - Plain text version (fallback)
 * @param {string} html - HTML version (optional)
 * @returns {Promise} Resolves when sent, rejects on failure or after SEND_TIMEOUT_MS
 */
const sendMail = (to, subject, text, html = null) => {
  const mail = { to, subject, text, html }
  if (env.BREVO_API_KEY) return withTimeout(sendViaBrevo(mail), SEND_TIMEOUT_MS + 1000)
  if (env.RESEND_API_KEY) return withTimeout(sendViaResend(mail), SEND_TIMEOUT_MS + 1000)

  return withTimeout(
    nodemailerTransporter.sendMail({
      from: `"${fromName}" <${env.EMAIL_USER}>`,
      to,
      subject,
      text,
      ...(html && { html })
    }),
    SEND_TIMEOUT_MS
  )
}

export default sendMail
