require('dotenv').config({ path: '../.env' });
const axios = require('axios');

const API_URL = 'https://aitradeos.vercel.app/api';

async function testRegister() {
  console.log('=== REGISTER TEST ===');
  
  const registerData = {
    email: 'tradeosdev@gmail.com',
    password: 'Huntr123()()',
    username: 'huntrdev',
    firstName: 'Huntr',
    lastName: 'Dev',
    deviceId: `device_${Date.now()}`
  };
  
  try {
    console.log('\nRegistering user:', registerData.email);
    const response = await axios.post(`${API_URL}/auth/register`, registerData);
    
    console.log('\n✓ Registration successful!');
    console.log('User:', response.data.user.email);
    console.log('Token received:', response.data.token ? 'YES' : 'NO');
    
  } catch (error) {
    console.error('\n✗ Registration failed!');
    console.error('Status:', error.response?.status);
    console.error('Error:', error.response?.data);
    console.error('Message:', error.response?.data?.error);
  }
}

testRegister();
