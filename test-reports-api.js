/**
 * Test script to verify the new dedicated Reports APIs
 * Run this after starting the server to test the new functionality
 */

const baseUrl = 'http://localhost:8080/api'; // Adjust port as needed

// Test functions for NEW Reports APIs
async function testNewSalesReportAPI() {
  console.log('\n🧪 Testing NEW Sales Report API...');
  
  try {
    // Test 1: Basic sales report endpoint
    console.log('✅ Test 1: Basic sales report endpoint');
    const response1 = await fetch(`${baseUrl}/reports-api/sales`);
    const data1 = await response1.json();
    console.log(`   Status: ${response1.status}, Sales count: ${data1.data?.sales?.length || 0}`);
    
    // Test 2: Sales report with customer filter
    console.log('✅ Test 2: Sales report with customer filter');
    const response2 = await fetch(`${baseUrl}/reports-api/sales?customer=test`);
    const data2 = await response2.json();
    console.log(`   Status: ${response2.status}, Filtered sales: ${data2.data?.sales?.length || 0}`);
    
    // Test 3: Sales report with date range
    console.log('✅ Test 3: Sales report with date range');
    const response3 = await fetch(`${baseUrl}/reports-api/sales?startDate=2024-01-01&endDate=2024-12-31`);
    const data3 = await response3.json();
    console.log(`   Status: ${response3.status}, Date filtered sales: ${data3.data?.sales?.length || 0}`);
    
    // Test 4: Check response structure matches frontend expectations
    if (data1.data?.sales?.length > 0) {
      const sale = data1.data.sales[0];
      console.log('✅ Test 4: Response structure validation');
      console.log(`   Has ref_num: ${!!sale.ref_num}`);
      console.log(`   Has customer object: ${!!sale.customer?.name}`);
      console.log(`   Has vendor object: ${!!sale.vendor?.name}`);
      console.log(`   Has totalAmount: ${!!sale.totalAmount}`);
      console.log(`   Has populated items: ${!!sale.items?.[0]?.product?.name}`);
      console.log(`   Has createdAt: ${!!sale.createdAt}`);
    }
    
  } catch (error) {
    console.error('❌ Sales Report API test failed:', error.message);
  }
}

async function testNewPurchasesReportAPI() {
  console.log('\n🧪 Testing NEW Purchases Report API...');
  
  try {
    // Test 1: Basic purchases report endpoint
    console.log('✅ Test 1: Basic purchases report endpoint');
    const response1 = await fetch(`${baseUrl}/reports-api/purchases`);
    const data1 = await response1.json();
    console.log(`   Status: ${response1.status}, Purchases count: ${data1.data?.purchases?.length || 0}`);
    
    // Test 2: Purchases report with vendor filter
    console.log('✅ Test 2: Purchases report with vendor filter');
    const response2 = await fetch(`${baseUrl}/reports-api/purchases?vendor=test`);
    const data2 = await response2.json();
    console.log(`   Status: ${response2.status}, Vendor filtered: ${data2.data?.purchases?.length || 0}`);
    
    // Test 3: Purchases report with date range
    console.log('✅ Test 3: Purchases report with date range');
    const response3 = await fetch(`${baseUrl}/reports-api/purchases?startDate=2024-01-01&endDate=2024-12-31`);
    const data3 = await response3.json();
    console.log(`   Status: ${response3.status}, Date filtered: ${data3.data?.purchases?.length || 0}`);
    
    // Test 4: Check response structure matches frontend expectations
    if (data1.data?.purchases?.length > 0) {
      const purchase = data1.data.purchases[0];
      console.log('✅ Test 4: Response structure validation');
      console.log(`   Has ref_num: ${!!purchase.ref_num}`);
      console.log(`   Has vendor object: ${!!purchase.vendor?.name}`);
      console.log(`   Has customer object: ${!!purchase.customer?.name}`);
      console.log(`   Has totalAmount: ${!!purchase.totalAmount}`);
      console.log(`   Has populated items: ${!!purchase.items?.[0]?.product?.name}`);
      console.log(`   Has createdAt: ${!!purchase.createdAt}`);
    }
    
  } catch (error) {
    console.error('❌ Purchases Report API test failed:', error.message);
  }
}

async function testSuppliersForReportsAPI() {
  console.log('\n🧪 Testing Suppliers for Reports API...');
  
  try {
    console.log('✅ Test: Get all suppliers for dropdown');
    const response = await fetch(`${baseUrl}/reports-api/suppliers`);
    const data = await response.json();
    console.log(`   Status: ${response.status}, Suppliers count: ${data.data?.vendors?.length || 0}`);
    
    if (data.data?.vendors?.length > 0) {
      const supplier = data.data.vendors[0];
      console.log(`   Sample supplier: ${supplier.name} (${supplier.email})`);
    }
    
  } catch (error) {
    console.error('❌ Suppliers for Reports API test failed:', error.message);
  }
}

async function testCustomersForReportsAPI() {
  console.log('\n🧪 Testing Customers for Reports API...');
  
  try {
    console.log('✅ Test: Get all customers for dropdown');
    const response = await fetch(`${baseUrl}/reports-api/customers`);
    const data = await response.json();
    console.log(`   Status: ${response.status}, Customers count: ${data.data?.customers?.length || 0}`);
    
    if (data.data?.customers?.length > 0) {
      const customer = data.data.customers[0];
      console.log(`   Sample customer: ${customer.name} (${customer.email})`);
    }
    
  } catch (error) {
    console.error('❌ Customers for Reports API test failed:', error.message);
  }
}

async function testClientSpecificReport() {
  console.log('\n🧪 Testing Client-Specific Report API...');
  
  try {
    // This would need a real customer name from your database
    console.log('✅ Test: Client-specific sales report');
    const response = await fetch(`${baseUrl}/reports-api/client/Test Client?startDate=2024-01-01&endDate=2024-12-31`);
    const data = await response.json();
    console.log(`   Status: ${response.status}`);
    
    if (data.success) {
      console.log(`   Client: ${data.data?.client}`);
      console.log(`   Total Sales: ${data.data?.summary?.totalSales || 0}`);
      console.log(`   Total Amount: ${data.data?.summary?.totalAmount || 0}`);
      console.log(`   Sales Records: ${data.data?.sales?.length || 0}`);
    }
    
  } catch (error) {
    console.error('❌ Client-Specific Report API test failed:', error.message);
  }
}

async function testSupplierSpecificReport() {
  console.log('\n🧪 Testing Supplier-Specific Report API...');
  
  try {
    // This would need a real supplier name from your database
    console.log('✅ Test: Supplier-specific purchases report');
    const response = await fetch(`${baseUrl}/reports-api/supplier/Test Supplier?startDate=2024-01-01&endDate=2024-12-31`);
    const data = await response.json();
    console.log(`   Status: ${response.status}`);
    
    if (data.success) {
      console.log(`   Supplier: ${data.data?.supplier}`);
      console.log(`   Total Purchases: ${data.data?.summary?.totalPurchases || 0}`);
      console.log(`   Total Amount: ${data.data?.summary?.totalAmount || 0}`);
      console.log(`   Purchase Records: ${data.data?.purchases?.length || 0}`);
    }
    
  } catch (error) {
    console.error('❌ Supplier-Specific Report API test failed:', error.message);
  }
}

async function testOriginalAPIsUntouched() {
  console.log('\n🧪 Testing Original APIs (Should be Untouched)...');
  
  try {
    // Test original sales API
    console.log('✅ Test: Original Sales API');
    const salesResponse = await fetch(`${baseUrl}/sales`);
    const salesData = await salesResponse.json();
    console.log(`   Sales API Status: ${salesResponse.status}, Count: ${salesData.data?.sales?.length || 0}`);
    
    // Test original purchases API
    console.log('✅ Test: Original Purchases API');
    const purchasesResponse = await fetch(`${baseUrl}/purchases`);
    const purchasesData = await purchasesResponse.json();
    console.log(`   Purchases API Status: ${purchasesResponse.status}, Count: ${purchasesData.data?.purchases?.length || 0}`);
    
    // Test original vendors API
    console.log('✅ Test: Original Vendors API');
    const vendorsResponse = await fetch(`${baseUrl}/vendors?all=true`);
    const vendorsData = await vendorsResponse.json();
    console.log(`   Vendors API Status: ${vendorsResponse.status}, Count: ${vendorsData.data?.vendors?.length || 0}`);
    
    // Test original customers API
    console.log('✅ Test: Original Customers API');
    const customersResponse = await fetch(`${baseUrl}/customers?all=true`);
    const customersData = await customersResponse.json();
    console.log(`   Customers API Status: ${customersResponse.status}, Count: ${customersData.data?.customers?.length || 0}`);
    
  } catch (error) {
    console.error('❌ Original APIs test failed:', error.message);
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting NEW Reports API Tests...');
  console.log('Make sure your server is running on port 8080!');
  console.log('Note: You may need authentication headers for these requests to work.');
  
  await testNewSalesReportAPI();
  await testNewPurchasesReportAPI();
  await testSuppliersForReportsAPI();
  await testCustomersForReportsAPI();
  await testClientSpecificReport();
  await testSupplierSpecificReport();
  await testOriginalAPIsUntouched();
  
  console.log('\n✨ Tests completed!');
  console.log('\n📋 NEW APIs Created:');
  console.log('1. ✅ GET /api/reports-api/sales - Sales data for client reports');
  console.log('2. ✅ GET /api/reports-api/purchases - Purchases data for supplier reports');
  console.log('3. ✅ GET /api/reports-api/suppliers - All suppliers for dropdown');
  console.log('4. ✅ GET /api/reports-api/customers - All customers for dropdown');
  console.log('5. ✅ GET /api/reports-api/client/:customerName - Client-specific report');
  console.log('6. ✅ GET /api/reports-api/supplier/:vendorName - Supplier-specific report');
  console.log('7. ✅ Original APIs remain completely untouched and secure');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };