const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:5000/api';
const TEST_TOKEN = 'your-test-token-here'; // Replace with actual token

// Test helper function
async function testAPI(endpoint, method = 'GET', data = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    console.log(`✅ ${method} ${endpoint}:`, response.data.success ? 'SUCCESS' : 'FAILED');
    return response.data;
  } catch (error) {
    console.log(`❌ ${method} ${endpoint}:`, error.response?.data?.message || error.message);
    return null;
  }
}

async function runTests() {
  console.log('🧪 Testing Enhanced Reports API Endpoints...\n');
  
  // Test 1: Get suppliers for reports
  console.log('1. Testing suppliers endpoint...');
  await testAPI('/reports-api/suppliers');
  
  // Test 2: Get customers for reports
  console.log('2. Testing customers endpoint...');
  await testAPI('/reports-api/customers');
  
  // Test 3: Test multi-supplier report (with dummy IDs)
  console.log('3. Testing multi-supplier report...');
  await testAPI('/reports-api/suppliers-multi?supplierIds=dummy1,dummy2&all=true');
  
  // Test 4: Test multi-client report (with dummy IDs)
  console.log('4. Testing multi-client report...');
  await testAPI('/reports-api/clients-multi?clientIds=dummy1,dummy2&all=true');
  
  // Test 5: Test clients for suppliers
  console.log('5. Testing clients for suppliers...');
  await testAPI('/reports-api/clients-for-suppliers?supplierIds=dummy1,dummy2');
  
  // Test 6: Test suppliers for clients
  console.log('6. Testing suppliers for clients...');
  await testAPI('/reports-api/suppliers-for-clients?clientIds=dummy1,dummy2');
  
  console.log('\n✨ Enhanced Reports API tests completed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testAPI, runTests };