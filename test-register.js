const axios = require('axios');

const API_BASE_URL = 'http://localhost:8080/api';

async function testRegister() {
  try {
    console.log('Testing user registration...');
    
    const registerData = {
      username: 'testuser',
      password: 'TestPass123',
      name: 'Test User',
      email: 'test@example.com',
      role: 'staff'
    };

    const response = await axios.post(`${API_BASE_URL}/auth/register`, registerData);
    
    console.log('✅ Registration successful!');
    console.log('Response:', {
      success: response.data.success,
      message: response.data.message,
      user: response.data.data.user,
      token: response.data.data.token ? 'Token received' : 'No token'
    });
    
    return response.data.data.token;
  } catch (error) {
    console.error('❌ Registration failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    return null;
  }
}

async function testLogin() {
  try {
    console.log('\nTesting user login...');
    
    const loginData = {
      username: 'testuser',
      password: 'TestPass123'
    };

    const response = await axios.post(`${API_BASE_URL}/auth/login`, loginData);
    
    console.log('✅ Login successful!');
    console.log('Response:', {
      success: response.data.success,
      message: response.data.message,
      user: response.data.data.user,
      token: response.data.data.token ? 'Token received' : 'No token'
    });
    
  } catch (error) {
    console.error('❌ Login failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

async function runTests() {
  console.log('🚀 Starting API Tests...\n');
  
  // Test registration
  const token = await testRegister();
  
  // Test login
  await testLogin();
  
  console.log('\n✨ Tests completed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testRegister, testLogin }; 