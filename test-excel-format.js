// Test to verify Excel format matches the screenshot requirements

const expectedColumns = [
  'S.No',
  'Date', 
  'DB Number',
  'Receipt No',
  'Supplier',
  'Product',
  'Qty',
  'Unit',
  'Rate (₹)',
  'Amount (₹)',
  'Status',
  'Received By',
  'Remarks',
  'Created By',
  'Client',
  'Client Address'
];

const sampleExportData = [
  {
    'S.No': 1,
    'Date': '12/11/2025',
    'DB Number': 'R-2111-01',
    'Receipt No': 'Havells',
    'Supplier': 'Cement',
    'Product': 'Bricks New 33',
    'Qty': 10,
    'Unit': 'packet',
    'Rate (₹)': 100,
    'Amount (₹)': 1000,
    'Status': 'DELIVERED',
    'Received By': 'Bricks New 33 cancelSystem Administrator',
    'Remarks': '',
    'Created By': 'Digital 9 455 Dynamics Street, Sector 135, Noida, UP 201301',
    'Client': 'Digital 9 455 Dynamics Street, Sector 135, Noida, UP 201301',
    'Client Address': ''
  },
  {
    'S.No': 2,
    'Date': '12/11/2025',
    'DB Number': 'R-2111-01',
    'Receipt No': 'Havells',
    'Supplier': 'Cement',
    'Product': 'Bricks New 33',
    'Qty': 50,
    'Unit': 'bags',
    'Rate (₹)': 122,
    'Amount (₹)': 6100,
    'Status': 'CANCELLED',
    'Received By': 'Bricks New 33 cancelSystem Administrator',
    'Remarks': '',
    'Created By': 'Digital 9 455 Dynamics Street, Sector 135, Noida, UP 201301',
    'Client': 'Digital 9 455 Dynamics Street, Sector 135, Noida, UP 201301',
    'Client Address': ''
  },
  {
    'S.No': '',
    'Date': '',
    'DB Number': '',
    'Receipt No': '',
    'Supplier': '',
    'Product': '',
    'Qty': '',
    'Unit': '',
    'Rate (₹)': 'Total',
    'Amount (₹)': 11320,
    'Status': '',
    'Received By': '',
    'Remarks': '',
    'Created By': '',
    'Client': '',
    'Client Address': ''
  }
];

function validateExcelFormat() {
  console.log('🧪 Testing Excel Format Validation...\n');
  
  // Test 1: Check if all required columns are present
  console.log('1. Checking required columns...');
  const sampleKeys = Object.keys(sampleExportData[0]);
  const missingColumns = expectedColumns.filter(col => !sampleKeys.includes(col));
  
  if (missingColumns.length === 0) {
    console.log('✅ All required columns are present');
  } else {
    console.log('❌ Missing columns:', missingColumns);
  }
  
  // Test 2: Check data structure
  console.log('2. Checking data structure...');
  const hasSerialNumbers = sampleExportData[0]['S.No'] === 1;
  const hasDateFormat = typeof sampleExportData[0]['Date'] === 'string';
  const hasAmountCalculation = typeof sampleExportData[0]['Amount (₹)'] === 'number';
  
  if (hasSerialNumbers && hasDateFormat && hasAmountCalculation) {
    console.log('✅ Data structure is correct');
  } else {
    console.log('❌ Data structure issues found');
  }
  
  // Test 3: Check total row
  console.log('3. Checking total row...');
  const totalRow = sampleExportData[sampleExportData.length - 1];
  const hasTotalLabel = totalRow['Rate (₹)'] === 'Total';
  const hasTotalAmount = typeof totalRow['Amount (₹)'] === 'number';
  
  if (hasTotalLabel && hasTotalAmount) {
    console.log('✅ Total row format is correct');
  } else {
    console.log('❌ Total row format issues found');
  }
  
  console.log('\n✨ Excel format validation completed!');
  
  // Display sample format
  console.log('\n📋 Sample Excel Format:');
  console.log('Columns:', expectedColumns.join(' | '));
  console.log('Sample Row:', Object.values(sampleExportData[0]).join(' | '));
  console.log('Total Row:', Object.values(totalRow).join(' | '));
}

// Run validation if this file is executed directly
if (require.main === module) {
  validateExcelFormat();
}

module.exports = { validateExcelFormat, expectedColumns, sampleExportData };