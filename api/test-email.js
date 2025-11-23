require('dotenv').config({ path: '../.env' });
const { sendNewDeviceLoginEmail } = require('./services/emailService');

async function testEmail() {
  console.log('=== NEW DEVICE EMAIL TEST ===');
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***SET***' : 'NOT SET');
  console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
  
  const testDeviceInfo = {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    ipAddress: '192.168.1.100',
    deviceType: 'Web Browser',
    platform: 'Windows 11',
    browser: 'Chrome',
    timestamp: new Date().toLocaleString('en-US', { 
      timeZone: 'UTC',
      dateStyle: 'full',
      timeStyle: 'long'
    })
  };
  
  console.log('\nDevice Info:', testDeviceInfo);
  
  try {
    console.log('\nSending test email...');
    await sendNewDeviceLoginEmail(
      'noreply.huntrai@gmail.com',
      'TestUser',
      testDeviceInfo
    );
    console.log('\n✓ Email sent successfully!');
    console.log('Check your inbox: noreply.huntrai@gmail.com');
  } catch (error) {
    console.error('\n✗ Email failed:', error.message);
    console.error('Full error:', error);
  }
}

testEmail();
