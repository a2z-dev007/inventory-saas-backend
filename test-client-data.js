/**
 * Test script to verify client data is now included in purchases API
 */

const baseUrl = 'http://localhost:8080/api';

async function testPurchasesWithClientData() {
  console.log('🧪 Testing Purchases API with Client Data...');
  
  try {
    // Test the purchases API
    console.log('✅ Test: Purchases API with client data');
    const response = await fetch(`${baseUrl}/purchases?page=1&limit=10&all=false`);
    const data = await response.json();
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Purchases count: ${data.data?.purchases?.length || 0}`);
    
    if (data.data?.purchases?.length > 0) {
      const purchase = data.data.purchases[0];
      console.log('\n📋 Sample Purchase Data:');
      console.log(`   ID: ${purchase._id}`);
      console.log(`   Ref Num: ${purchase.ref_num}`);
      console.log(`   Vendor: ${purchase.vendor}`);
      console.log(`   Receipt Number: ${purchase.receiptNumber}`);
      console.log(`   Total: ${purchase.total}`);
      
      // Check if client data is now included
      console.log('\n👤 Client Data:');
      console.log(`   Customer: ${purchase.customer || 'Not found'}`);
      console.log(`   Customer Name: ${purchase.customerName || 'Not found'}`);
      console.log(`   Customer Address: ${purchase.customerAddress || 'Not found'}`);
      
      if (purchase.customer || purchase.customerName) {
        console.log('✅ SUCCESS: Client data is now included in purchases!');
      } else {
        console.log('❌ WARNING: Client data not found. This could mean:');
        console.log('   - No corresponding Purchase Order exists for this ref_num');
        console.log('   - The ref_num doesn\'t match between Purchase and PurchaseOrder');
        console.log('   - The Purchase Order doesn\'t have client data');
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

async function testReportsAPIWithClientData() {
  console.log('\n🧪 Testing Reports API with Client Data...');
  
  try {
    // Test the new reports API
    console.log('✅ Test: Reports API purchases with client data');
    const response = await fetch(`${baseUrl}/reports-api/purchases?all=true`);
    const data = await response.json();
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Purchases count: ${data.data?.purchases?.length || 0}`);
    
    if (data.data?.purchases?.length > 0) {
      const purchase = data.data.purchases[0];
      console.log('\n📋 Sample Reports API Purchase Data:');
      console.log(`   ID: ${purchase._id}`);
      console.log(`   Ref Num: ${purchase.ref_num}`);
      console.log(`   Vendor: ${JSON.stringify(purchase.vendor)}`);
      console.log(`   Customer: ${JSON.stringify(purchase.customer)}`);
      console.log(`   Total Amount: ${purchase.totalAmount}`);
      
      if (purchase.customer?.name && purchase.customer.name !== 'N/A') {
        console.log('✅ SUCCESS: Client data is properly formatted in reports API!');
      } else {
        console.log('❌ WARNING: Client data not properly populated in reports API');
      }
    }
    
  } catch (error) {
    console.error('❌ Reports API test failed:', error.message);
  }
}

async function testPurchaseById() {
  console.log('\n🧪 Testing Individual Purchase with Client Data...');
  
  try {
    // First get a purchase ID
    const listResponse = await fetch(`${baseUrl}/purchases?limit=1`);
    const listData = await listResponse.json();
    
    if (listData.data?.purchases?.length > 0) {
      const purchaseId = listData.data.purchases[0]._id;
      
      // Test individual purchase
      console.log(`✅ Test: Get purchase by ID: ${purchaseId}`);
      const response = await fetch(`${baseUrl}/purchases/${purchaseId}`);
      const data = await response.json();
      
      console.log(`   Status: ${response.status}`);
      
      if (data.data?.purchase) {
        const purchase = data.data.purchase;
        console.log('\n📋 Individual Purchase Data:');
        console.log(`   ID: ${purchase._id}`);
        console.log(`   Ref Num: ${purchase.ref_num}`);
        console.log(`   Vendor: ${purchase.vendor}`);
        
        console.log('\n👤 Client Data:');
        console.log(`   Customer: ${purchase.customer || 'Not found'}`);
        console.log(`   Customer Name: ${purchase.customerName || 'Not found'}`);
        
        if (purchase.customer || purchase.customerName) {
          console.log('✅ SUCCESS: Client data included in individual purchase!');
        } else {
          console.log('❌ WARNING: Client data not found in individual purchase');
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Individual purchase test failed:', error.message);
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Client Data Integration Tests...');
  console.log('Make sure your server is running on port 8080!');
  console.log('Note: You may need authentication headers for these requests to work.\n');
  
  await testPurchasesWithClientData();
  await testReportsAPIWithClientData();
  await testPurchaseById();
  
  console.log('\n✨ Tests completed!');
  console.log('\n📋 What was updated:');
  console.log('1. ✅ Purchase Service - Now populates client data from PurchaseOrder');
  console.log('2. ✅ Reports Service - Enhanced with client data population');
  console.log('3. ✅ Both list and individual purchase endpoints updated');
  console.log('4. ✅ Client data includes: customer, customerName, customerAddress');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };