require('dotenv').config({ path: '../.env' });
const axios = require('axios');

const API_URL = 'https://aitradeos.vercel.app/api';

async function testRegister() {
  console.log('=== REGISTER TEST ===');
  
  const registerData = {
    email: 'testuser@test.com',
    password: 'TestPass123',
    username: 'testuser123',
    firstName: 'Test',
    lastName: 'User',
    deviceId: `device_${Date.now()}`
  };
  
  try {
    console.log('\nRegistering new user...');
    const response = await axios.post(`${API_URL}/auth/register`, registerData);
    
    console.log('\n✓ Registration successful!');
    console.log('User:', response.data.user.email);
    console.log('Token received:', response.data.token ? 'YES' : 'NO');
    
    // Now test login
    console.log('\n=== LOGIN TEST ===');
    const loginData = {
      email: registerData.email,
      password: registerData.password,
      deviceId: `device_${Date.now()}`,
      deviceType: 'Web Browser',
      platform: 'Windows 11',
      browser: 'Chrome'
    };
    
    const loginResponse = await axios.post(`${API_URL}/auth/login`, loginData);
    console.log('✓ Login successful!');
    console.log('User:', loginResponse.data.user.email);
    
  } catch (error) {
    console.error('\n✗ Failed!');
    console.error('Status:', error.response?.status);
    console.error('Error:', error.response?.data);
  }
}

testRegister();
