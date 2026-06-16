/**
 * Run this to test if your Gmail SMTP is configured correctly:
 *   node test-email.js
 */
require('dotenv').config();
const nodemailer = require('nodemailer');

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_PASS = process.env.GMAIL_APP_PASSWORD;

if (!GMAIL_USER || !GMAIL_PASS || GMAIL_PASS.includes('YOUR_16')) {
  console.log('\n❌ ERROR: GMAIL credentials not set in .env file!');
  console.log('   Set GMAIL_USER and GMAIL_APP_PASSWORD in your .env file');
  console.log('   Get App Password at: https://myaccount.google.com/apppasswords\n');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: GMAIL_USER, pass: GMAIL_PASS },
});

console.log(`\n🔄 Testing SMTP connection for: ${GMAIL_USER}`);

transporter.verify((err, success) => {
  if (err) {
    console.log('\n❌ SMTP connection FAILED!');
    console.log('   Error:', err.message);
    console.log('\n   Common fixes:');
    console.log('   1. Make sure GMAIL_APP_PASSWORD is the 16-char App Password (not your real password)');
    console.log('   2. Ensure 2-Step Verification is ON at myaccount.google.com/security');
    console.log('   3. App Password page: https://myaccount.google.com/apppasswords\n');
    process.exit(1);
  }

  console.log('\n✅ SMTP connection SUCCESS! Sending test email...\n');

  transporter.sendMail({
    from:    `"SmartCampus AI" <${GMAIL_USER}>`,
    to:      GMAIL_USER,   // send to yourself as test
    subject: '✅ SmartCampusAI — Email Test',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f0f4ff;border-radius:16px">
        <div style="text-align:center">
          <span style="font-size:48px">🎓</span>
          <h2 style="color:#1e3a8a">SmartCampus AI</h2>
        </div>
        <div style="background:#fff;border-radius:12px;padding:24px;margin-top:16px">
          <p style="color:#374151">Email configuration is working correctly!</p>
          <p style="color:#374151">OTP password reset emails will be delivered successfully.</p>
          <div style="text-align:center;margin:24px 0">
            <span style="font-size:32px;font-weight:900;color:#2563eb;background:#eff6ff;padding:12px 24px;border-radius:12px;letter-spacing:8px">123456</span>
          </div>
          <p style="color:#6b7280;font-size:13px">This is what OTP emails will look like.</p>
        </div>
      </div>
    `,
  }, (sendErr, info) => {
    if (sendErr) {
      console.log('❌ Send FAILED:', sendErr.message);
    } else {
      console.log('✅ Test email sent successfully!');
      console.log('   Check inbox of:', GMAIL_USER);
      console.log('   Message ID:', info.messageId);
      console.log('\n🚀 Your OTP email system is ready!\n');
    }
  });
});
