require('dotenv').config({ path: '../.env' });
const axios = require('axios');

const API_URL = 'https://aitradeos.vercel.app/api';

async function testLogin() {
  console.log('=== LOGIN TEST ===');
  console.log('API URL:', API_URL);
  
  const loginData = {
    email: 'tradeosdev@gmail.com',
    password: 'Huntr123()()',
    deviceId: `test_device_${Date.now()}`,
    deviceType: 'Web Browser',
    platform: 'Windows 11',
    browser: 'Chrome'
  };
  
  console.log('\nLogin data:', {
    email: loginData.email,
    deviceId: loginData.deviceId,
    deviceType: loginData.deviceType
  });
  
  try {
    console.log('\nSending login request...');
    const response = await axios.post(`${API_URL}/auth/login`, loginData);
    
    console.log('\n✓ Login successful!');
    console.log('Response status:', response.status);
    console.log('User:', {
      id: response.data.user.id,
      email: response.data.user.email,
      username: response.data.user.username,
      role: response.data.user.role
    });
    console.log('Token received:', response.data.token ? 'YES' : 'NO');
    
  } catch (error) {
    console.error('\n✗ Login failed!');
    console.error('Status:', error.response?.status);
    console.error('Error:', error.response?.data);
    console.error('Full error:', error.message);
  }
}

testLogin();
