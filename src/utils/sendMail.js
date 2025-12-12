import { nodemailerTransporter } from '~/config/nodemailer.js'
import { env } from '~/config/environment.js'

/**
 * Send email with HTML and text support
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} text - Plain text version (fallback)
 * @param {string} html - HTML version (optional)
 * @returns {Promise} Email sending promise
 */
const sendMail = (to, subject, text, html = null) => {
  try {
    const mailOptions = {
      from: `"Sài Gòn Đi" <${env.EMAIL_USER}>`,
      to,
      subject,
      text,
      ...(html && { html }) // Only add html if provided
    }
    return nodemailerTransporter.sendMail(mailOptions)
  } catch (error) {
    throw new Error('Failed to send email')
  }
}

export default sendMail