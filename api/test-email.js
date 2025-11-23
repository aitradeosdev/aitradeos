require('dotenv').config({ path: '../.env' });
const { sendNewDeviceLoginEmail } = require('./services/emailService');

async function testEmail() {
  console.log('=== EMAIL TEST STARTING ===');
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***SET***' : 'NOT SET');
  
  const testDeviceInfo = {
    name: 'Chrome on Windows',
    type: 'desktop',
    platform: 'Windows 11',
    browser: 'Chrome 120'
  };
  
  try {
    console.log('\nSending test email...');
    await sendNewDeviceLoginEmail(
      'noreply.huntrai@gmail.com', // Send to yourself
      'TestUser',
      testDeviceInfo
    );
    console.log('✓ Email sent successfully!');
  } catch (error) {
    console.error('✗ Email failed:', error.message);
    console.error('Full error:', error);
  }
}

testEmail();
