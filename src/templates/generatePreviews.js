import { generateOTPEmailTemplate, generateOTPTextTemplate } from './otpEmail.template.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Generate preview HTML files
const generatePreviews = () => {
  // Registration OTP Preview
  const registrationHTML = generateOTPEmailTemplate({
    otp: '123456',
    type: 'registration',
    userName: 'Nguyễn Văn A',
    expiryMinutes: 5
  });

  // Password Reset OTP Preview
  const passwordResetHTML = generateOTPEmailTemplate({
    otp: '987654',
    type: 'password-reset',
    userName: 'Trần Thị B',
    expiryMinutes: 5
  });

  // Text versions
  const registrationText = generateOTPTextTemplate({
    otp: '123456',
    type: 'registration',
    userName: 'Nguyễn Văn A',
    expiryMinutes: 5
  });

  const passwordResetText = generateOTPTextTemplate({
    otp: '987654',
    type: 'password-reset',
    userName: 'Trần Thị B',
    expiryMinutes: 5
  });

  // Save to files
  const previewDir = path.join(__dirname, 'previews');
  if (!fs.existsSync(previewDir)) {
    fs.mkdirSync(previewDir);
  }

  fs.writeFileSync(
    path.join(previewDir, 'registration-otp.html'),
    registrationHTML
  );

  fs.writeFileSync(
    path.join(previewDir, 'password-reset-otp.html'),
    passwordResetHTML
  );

  fs.writeFileSync(
    path.join(previewDir, 'registration-otp.txt'),
    registrationText
  );

  fs.writeFileSync(
    path.join(previewDir, 'password-reset-otp.txt'),
    passwordResetText
  );

  console.log('✅ Preview files generated successfully!');
  console.log('📁 Location:', previewDir);
  console.log('\nGenerated files:');
  console.log('  - registration-otp.html');
  console.log('  - password-reset-otp.html');
  console.log('  - registration-otp.txt');
  console.log('  - password-reset-otp.txt');
};

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generatePreviews();
}

export default generatePreviews;
