# Currency Update to Indian Rupees (₹)

## Overview
The inventory management system has been updated to use Indian Rupees (₹) instead of US Dollars ($) throughout the application.

## Changes Made

### Backend Updates
1. **Seed Data**: Updated all product prices to realistic Indian Rupee values
2. **Currency Configuration**: Added currency constants for INR
3. **Currency Utility**: Added `formatCurrency()` function for backend formatting
4. **Report Service**: Fixed incorrect references to `product.price` (now uses `product.purchaseRate`)

### Frontend Updates (Already Completed)
1. **Currency Utility**: Added `formatCurrency()` function with rupee symbol
2. **Settings**: Updated currency dropdown to show INR as default
3. **All Pages**: Updated price displays to use ₹ symbol
4. **PDF Generation**: Updated all generated documents to use rupee currency

## New Product Prices (Seed Data)

| Product | Purchase Rate (₹) | Sales Rate (₹) |
|---------|------------------|----------------|
| iPhone 15 Pro | 85,000 | 95,000 |
| Office Chair Premium | 12,000 | 15,000 |
| Monitor LG UltraWide | 25,000 | 32,000 |
| Keyboard Logitech | 3,500 | 4,500 |
| Mouse Logitech | 2,000 | 2,800 |

## How to Update Your Database

### Option 1: Clear and Reseed (Recommended)
1. **Stop the backend server** if it's running
2. **Clear your database** (MongoDB):
   ```bash
   # Connect to MongoDB
   mongosh
   
   # Switch to your database
   use inventory_management
   
   # Clear all collections
   db.users.deleteMany({})
   db.products.deleteMany({})
   db.vendors.deleteMany({})
   db.customers.deleteMany({})
   db.purchaseorders.deleteMany({})
   db.sales.deleteMany({})
   db.purchases.deleteMany({})
   
   # Exit MongoDB
   exit
   ```

3. **Run the seed script**:
   ```bash
   npm run seed
   ```

### Option 2: Manual Update (If you want to keep existing data)
1. **Update product prices** in your database:
   ```javascript
   // Connect to MongoDB and run these commands
   db.products.updateMany({}, {
     $set: {
       "purchaseRate": 85000,  // Update each product individually
       "salesRate": 95000
     }
   })
   ```

2. **Update existing transactions** (if any):
   ```javascript
   // Update sales, purchases, and purchase orders with new prices
   // This is more complex and depends on your existing data
   ```

## Default Login Credentials (After Seeding)
- **Admin**: username=admin, password=admin123
- **Manager**: username=manager, password=manager123  
- **Staff**: username=staff, password=staff123

## Currency Formatting
- **Symbol**: ₹ (Indian Rupee)
- **Format**: ₹1,00,000.00 (Indian number system)
- **Locale**: en-IN
- **Decimal Places**: 2

## Verification
After seeding, verify that:
1. All product prices show in rupees (₹)
2. Dashboard metrics display rupee amounts
3. Sales, purchases, and purchase orders use rupee currency
4. PDF exports show rupee symbols
5. Settings page shows INR as default currency

## Notes
- The backend stores all prices as numbers (no currency symbols)
- Currency formatting is handled by the frontend
- All calculations remain the same, only the display format has changed
- Tax calculations use 12% rate (as per Indian GST) 