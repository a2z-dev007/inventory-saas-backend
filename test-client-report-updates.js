/**
 * Test script to verify the updated client report functionality
 */

const baseUrl = 'http://localhost:8080/api';

async function testClientReportAPI() {
  console.log('🧪 Testing Updated Client Report API...');
  
  try {
    // Test the client report API (should now use purchases data)
    console.log('✅ Test: Client report with purchases data');
    const response = await fetch(`${baseUrl}/reports-api/client/Test Client?startDate=2024-01-01&endDate=2024-12-31&all=true`);
    const data = await response.json();
    
    console.log(`   Status: ${response.status}`);
    
    if (data.success && data.data) {
      console.log(`   Client: ${data.data.client}`);
      console.log(`   Purchases count: ${data.data.purchases?.length || 0}`);
      
      // Check if it's using purchases data (not sales)
      if (data.data.purchases && data.data.purchases.length > 0) {
        const purchase = data.data.purchases[0];
        console.log('\n📋 Sample Purchase Data:');
        console.log(`   ID: ${purchase._id}`);
        console.log(`   Ref Num: ${purchase.ref_num}`);
        console.log(`   Vendor: ${JSON.stringify(purchase.vendor)}`);
        console.log(`   Customer: ${JSON.stringify(purchase.customer)}`);
        console.log(`   Receipt Number: ${purchase.receiptNumber}`);
        console.log(`   Total Amount: ${purchase.totalAmount}`);
        
        // Check if summary is removed
        if (data.data.summary) {
          console.log('❌ WARNING: Summary data still present (should be removed)');
        } else {
          console.log('✅ SUCCESS: Summary data removed as requested');
        }
        
        // Check if it's purchases data (has receiptNumber, vendor, etc.)
        if (purchase.receiptNumber && purchase.vendor) {
          console.log('✅ SUCCESS: Client report now uses purchases data!');
        } else {
          console.log('❌ WARNING: Data structure doesn\'t look like purchases');
        }
      } else {
        console.log('ℹ️  No purchases found for this client');
      }
    } else {
      console.log('❌ API call failed or returned no data');
    }
    
  } catch (error) {
    console.error('❌ Client Report API test failed:', error.message);
  }
}

async function testSupplierReportAPI() {
  console.log('\n🧪 Testing Updated Supplier Report API...');
  
  try {
    // Test the supplier report API (should have summary removed)
    console.log('✅ Test: Supplier report without summary');
    const response = await fetch(`${baseUrl}/reports-api/supplier/Test Supplier?startDate=2024-01-01&endDate=2024-12-31&all=true`);
    const data = await response.json();
    
    console.log(`   Status: ${response.status}`);
    
    if (data.success && data.data) {
      console.log(`   Supplier: ${data.data.supplier}`);
      console.log(`   Purchases count: ${data.data.purchases?.length || 0}`);
      
      // Check if summary is removed
      if (data.data.summary) {
        console.log('❌ WARNING: Summary data still present (should be removed)');
      } else {
        console.log('✅ SUCCESS: Summary data removed from supplier report');
      }
      
      if (data.data.purchases && data.data.purchases.length > 0) {
        const purchase = data.data.purchases[0];
        console.log('\n📋 Sample Supplier Purchase Data:');
        console.log(`   Vendor: ${JSON.stringify(purchase.vendor)}`);
        console.log(`   Customer: ${JSON.stringify(purchase.customer)}`);
        console.log(`   Total Amount: ${purchase.totalAmount}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Supplier Report API test failed:', error.message);
  }
}

async function testPurchasesReportAPI() {
  console.log('\n🧪 Testing General Purchases Report API...');
  
  try {
    // Test the general purchases report API
    console.log('✅ Test: General purchases report');
    const response = await fetch(`${baseUrl}/reports-api/purchases?all=true`);
    const data = await response.json();
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Purchases count: ${data.data?.purchases?.length || 0}`);
    
    if (data.data?.purchases?.length > 0) {
      const purchase = data.data.purchases[0];
      console.log('\n📋 Sample General Purchase Data:');
      console.log(`   Vendor: ${JSON.stringify(purchase.vendor)}`);
      console.log(`   Customer: ${JSON.stringify(purchase.customer)}`);
      console.log(`   Has client data: ${!!purchase.customer?.name && purchase.customer.name !== 'N/A'}`);
    }
    
  } catch (error) {
    console.error('❌ General Purchases Report API test failed:', error.message);
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Updated Client Report Tests...');
  console.log('Make sure your server is running on port 8080!');
  console.log('Note: You may need authentication headers for these requests to work.\n');
  
  await testClientReportAPI();
  await testSupplierReportAPI();
  await testPurchasesReportAPI();
  
  console.log('\n✨ Tests completed!');
  console.log('\n📋 Changes Made:');
  console.log('1. ✅ Sales Report - Commented out from dropdown');
  console.log('2. ✅ Client Report - Now uses purchases data instead of sales');
  console.log('3. ✅ Summary Removed - Both supplier and client reports no longer have summary');
  console.log('4. ✅ Client Filtering - Client reports filter purchases by client name from PO data');
  console.log('5. ✅ Consistent Structure - All reports now use purchases data structure');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };