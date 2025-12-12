/**
 * Generate HTML email template for OTP
 * @param {Object} params - Template parameters
 * @param {string} params.otp - The OTP code
 * @param {string} params.type - Type of OTP (registration, password-reset)
 * @param {string} params.userName - User's name (optional)
 * @param {number} params.expiryMinutes - OTP expiry time in minutes (default: 5)
 * @returns {string} HTML email template
 */
export const generateOTPEmailTemplate = ({ otp, type, userName = 'bạn', expiryMinutes = 5 }) => {
  const titles = {
    'registration': 'Xác thực tài khoản',
    'password-reset': 'Đặt lại mật khẩu'
  };

  const messages = {
    'registration': 'Cảm ơn bạn đã đăng ký tài khoản. Để hoàn tất quá trình đăng ký, vui lòng nhập mã xác thực bên dưới.',
    'password-reset': 'Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu của bạn. Vui lòng sử dụng mã xác thực bên dưới để tiếp tục.'
  };

  const title = titles[type] || 'Xác thực tài khoản';
  const message = messages[type] || 'Vui lòng sử dụng mã xác thực bên dưới.';

  return `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f5f5f5;
            padding: 20px 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .header {
            background-color: #4F46E5;
            padding: 30px 20px;
            text-align: center;
        }
        .header h1 {
            color: #ffffff;
            font-size: 24px;
            font-weight: 600;
            letter-spacing: 0.5px;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 16px;
            color: #1a1a1a;
            margin-bottom: 16px;
            font-weight: 500;
        }
        .message {
            font-size: 14px;
            color: #525252;
            line-height: 1.6;
            margin-bottom: 30px;
        }
        .otp-box {
            background-color: #F9FAFB;
            border: 1px solid #E5E7EB;
            border-radius: 6px;
            padding: 24px;
            text-align: center;
            margin: 24px 0;
        }
        .otp-label {
            font-size: 12px;
            color: #6B7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 12px;
        }
        .otp-code {
            font-size: 32px;
            font-weight: 700;
            color: #4F46E5;
            letter-spacing: 4px;
            font-family: 'Courier New', Courier, monospace;
            margin: 12px 0;
        }
        .expiry {
            font-size: 13px;
            color: #6B7280;
            margin-top: 12px;
        }
        .info-box {
            background-color: #FFFBEB;
            border-left: 3px solid #F59E0B;
            padding: 12px 16px;
            margin: 24px 0;
            border-radius: 4px;
        }
        .info-text {
            font-size: 13px;
            color: #78350F;
            line-height: 1.5;
        }
        .footer {
            background-color: #F9FAFB;
            padding: 24px 30px;
            border-top: 1px solid #E5E7EB;
            text-align: center;
        }
        .footer-text {
            font-size: 12px;
            color: #6B7280;
            line-height: 1.6;
        }
        .footer-link {
            color: #4F46E5;
            text-decoration: none;
        }
        hr {
            border: none;
            border-top: 1px solid #E5E7EB;
            margin: 20px 0;
        }
        @media only screen and (max-width: 600px) {
            .content {
                padding: 30px 20px;
            }
            .otp-code {
                font-size: 28px;
                letter-spacing: 3px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Sài Gòn Đi</h1>
        </div>
        
        <div class="content">
            <p class="greeting">Xin chào ${userName},</p>
            
            <p class="message">${message}</p>
            
            <div class="otp-box">
                <div class="otp-label">Mã xác thực</div>
                <div class="otp-code">${otp}</div>
                <div class="expiry">Có hiệu lực trong ${expiryMinutes} phút</div>
            </div>
            
            <div class="info-box">
                <p class="info-text">
                    Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email. Không chia sẻ mã này với bất kỳ ai.
                </p>
            </div>
            
            <hr>
            
            <p class="message" style="font-size: 13px; margin-bottom: 0;">
                Nếu gặp vấn đề, vui lòng liên hệ với chúng tôi qua email 
                <a href="mailto:support@saigondi.com" style="color: #4F46E5;">support@saigondi.com</a>
            </p>
        </div>
        
        <div class="footer">
            <p class="footer-text">
                © ${new Date().getFullYear()} Sài Gòn Đi. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
  `.trim();
};

/**
 * Generate plain text version of OTP email (fallback)
 */
export const generateOTPTextTemplate = ({ otp, type, userName = 'bạn', expiryMinutes = 5 }) => {
  const titles = {
    'registration': 'XÁC THỰC TÀI KHOẢN',
    'password-reset': 'ĐẶT LẠI MẬT KHẨU'
  };

  const messages = {
    'registration': 'Cảm ơn bạn đã đăng ký tài khoản. Để hoàn tất quá trình đăng ký, vui lòng nhập mã xác thực bên dưới.',
    'password-reset': 'Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu của bạn. Vui lòng sử dụng mã xác thực bên dưới để tiếp tục.'
  };

  return `
SÀI GÒN ĐI
${titles[type] || 'XÁC THỰC TÀI KHOẢN'}

Xin chào ${userName},

${messages[type] || 'Vui lòng sử dụng mã xác thực bên dưới.'}

────────────────────────────────
MÃ XÁC THỰC: ${otp}
────────────────────────────────

Có hiệu lực trong ${expiryMinutes} phút.

Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email. 
Không chia sẻ mã này với bất kỳ ai.

Trân trọng,
Sài Gòn Đi

Support: support@saigondi.com
© ${new Date().getFullYear()} Sài Gòn Đi
  `.trim();
};
