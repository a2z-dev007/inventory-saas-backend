const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
require("dotenv").config()

// Import models
const User = require("../models/User")
const Product = require("../models/Product")
const Vendor = require("../models/Vendor")
const Customer = require("../models/Customer")
const PurchaseOrder = require("../models/PurchaseOrder")
const Sale = require("../models/Sale")
const Purchase = require("../models/Purchase")

// Sample data based on provided JSON
const sampleData = {
  users: [
    {
      username: "admin",
      password: "admin123",
      role: "admin",
      name: "System Administrator",
      email: "admin@inventory.com",
    },
    {
      username: "manager",
      password: "manager123",
      role: "manager",
      name: "John Manager",
      email: "manager@inventory.com",
    },
    {
      username: "staff",
      password: "staff123",
      role: "staff",
      name: "Jane Staff",
      email: "staff@inventory.com",
    },
  ],

  vendors: [
    {
      name: "Dell Technologies India",
      contact: "Rajesh Kumar",
      email: "procurement@dell.co.in",
      phone: "+91-80-4924-6000",
      address: "Dell India Pvt Ltd, Embassy Tech Village, Outer Ring Road, Bangalore, Karnataka 560103",
    },
    {
      name: "Apple India Pvt Ltd",
      contact: "Priya Sharma",
      email: "business@apple.co.in",
      phone: "+91-22-6656-1000",
      address: "Apple India Pvt Ltd, Maker Chambers IV, Nariman Point, Mumbai, Maharashtra 400021",
    },
    {
      name: "HP India Sales Pvt Ltd",
      contact: "Amit Patel",
      email: "sales@hp.co.in",
      phone: "+91-22-6656-2000",
      address: "HP India Sales Pvt Ltd, HP House, 24-26, MG Road, Bangalore, Karnataka 560001",
    },
    {
      name: "Lenovo India Pvt Ltd",
      contact: "Suresh Reddy",
      email: "orders@lenovo.co.in",
      phone: "+91-80-4924-7000",
      address: "Lenovo India Pvt Ltd, Embassy Tech Village, Outer Ring Road, Bangalore, Karnataka 560103",
    },
    {
      name: "Samsung India Electronics",
      contact: "Kavita Singh",
      email: "b2b@samsung.co.in",
      phone: "+91-11-2341-5000",
      address: "Samsung India Electronics Ltd, Samsung House, 6th Floor, Plot No. B-1, Sector 5, Noida, UP 201301",
    },
    {
      name: "LG Electronics India",
      contact: "Manoj Gupta",
      email: "corporate@lg.co.in",
      phone: "+91-11-2341-6000",
      address: "LG Electronics India Pvt Ltd, Plot No. 51, Udyog Vihar, Greater Noida, UP 201306",
    },
    {
      name: "Logitech India Pvt Ltd",
      contact: "Rahul Verma",
      email: "sales@logitech.co.in",
      phone: "+91-22-6656-3000",
      address: "Logitech India Pvt Ltd, 3rd Floor, Maker Chambers IV, Nariman Point, Mumbai, Maharashtra 400021",
    },
    {
      name: "Microsoft India Pvt Ltd",
      contact: "Anjali Desai",
      email: "enterprise@microsoft.co.in",
      phone: "+91-22-6656-4000",
      address: "Microsoft India Pvt Ltd, Cybercity, DLF Phase 2, Sector 24, Gurugram, Haryana 122002",
    },
    {
      name: "Cisco Systems India Pvt Ltd",
      contact: "Vikram Malhotra",
      email: "procurement@cisco.co.in",
      phone: "+91-80-4924-8000",
      address: "Cisco Systems India Pvt Ltd, Embassy Tech Village, Outer Ring Road, Bangalore, Karnataka 560103",
    },
    {
      name: "Intel India Pvt Ltd",
      contact: "Neha Kapoor",
      email: "business@intel.co.in",
      phone: "+91-80-4924-9000",
      address: "Intel India Pvt Ltd, Embassy Tech Village, Outer Ring Road, Bangalore, Karnataka 560103",
    },
    {
      name: "ASUS India Pvt Ltd",
      contact: "Arun Kumar",
      email: "sales@asus.co.in",
      phone: "+91-22-6656-5000",
      address: "ASUS India Pvt Ltd, Maker Chambers IV, Nariman Point, Mumbai, Maharashtra 400021",
    },
    {
      name: "Acer India Pvt Ltd",
      contact: "Deepak Sharma",
      email: "orders@acer.co.in",
      phone: "+91-22-6656-6000",
      address: "Acer India Pvt Ltd, Maker Chambers IV, Nariman Point, Mumbai, Maharashtra 400021",
    },
    {
      name: "Canon India Pvt Ltd",
      contact: "Meera Iyer",
      email: "b2b@canon.co.in",
      phone: "+91-11-2341-7000",
      address: "Canon India Pvt Ltd, Plot No. 51, Udyog Vihar, Greater Noida, UP 201306",
    },
    {
      name: "Epson India Pvt Ltd",
      contact: "Sandeep Joshi",
      email: "corporate@epson.co.in",
      phone: "+91-11-2341-8000",
      address: "Epson India Pvt Ltd, Plot No. 52, Udyog Vihar, Greater Noida, UP 201306",
    },
    {
      name: "Brother International India",
      contact: "Ritu Agarwal",
      email: "sales@brother.co.in",
      phone: "+91-22-6656-7000",
      address: "Brother International India Pvt Ltd, Maker Chambers IV, Nariman Point, Mumbai, Maharashtra 400021",
    },
    {
      name: "Seagate Technology India",
      contact: "Prakash Rao",
      email: "enterprise@seagate.co.in",
      phone: "+91-80-4924-1000",
      address: "Seagate Technology India Pvt Ltd, Embassy Tech Village, Outer Ring Road, Bangalore, Karnataka 560103",
    },
    {
      name: "Western Digital India",
      contact: "Lakshmi Devi",
      email: "business@wdc.co.in",
      phone: "+91-80-4924-1100",
      address: "Western Digital India Pvt Ltd, Embassy Tech Village, Outer Ring Road, Bangalore, Karnataka 560103",
    },
    {
      name: "Kingston Technology India",
      contact: "Rajiv Mehta",
      email: "sales@kingston.co.in",
      phone: "+91-22-6656-8000",
      address: "Kingston Technology India Pvt Ltd, Maker Chambers IV, Nariman Point, Mumbai, Maharashtra 400021",
    },
    {
      name: "Corsair India Pvt Ltd",
      contact: "Anita Reddy",
      email: "orders@corsair.co.in",
      phone: "+91-22-6656-9000",
      address: "Corsair India Pvt Ltd, Maker Chambers IV, Nariman Point, Mumbai, Maharashtra 400021",
    },
    {
      name: "Razer India Pvt Ltd",
      contact: "Karan Malhotra",
      email: "enterprise@razer.co.in",
      phone: "+91-11-2341-9000",
      address: "Razer India Pvt Ltd, Plot No. 53, Udyog Vihar, Greater Noida, UP 201306",
    },
  ],

  customers: [
    {
      name: "Tech Solutions Corp",
      contact: "Alice Johnson",
      email: "contact@techsolutions.com",
      phone: "+91-80-4924-2000",
      address: "789 Tech Street, Electronic City, Bangalore, Karnataka 560100",
    },
    {
      name: "Business Center Ltd",
      contact: "Bob Wilson",
      email: "orders@businesscenter.com",
      phone: "+91-22-6656-2100",
      address: "321 Business Blvd, Bandra Kurla Complex, Mumbai, Maharashtra 400051",
    },
    {
      name: "Global Tech Ltd",
      contact: "George Global",
      email: "info@globaltech.com",
      phone: "+91-11-2341-2200",
      address: "123 Global St, Cyber City, Gurugram, Haryana 122002",
    },
    {
      name: "Digital Innovations Pvt Ltd",
      contact: "Priya Patel",
      email: "sales@digitalinnovations.co.in",
      phone: "+91-80-4924-2300",
      address: "456 Innovation Road, Whitefield, Bangalore, Karnataka 560066",
    },
    {
      name: "Smart Solutions India",
      contact: "Rajesh Kumar",
      email: "contact@smartsolutions.co.in",
      phone: "+91-22-6656-2400",
      address: "789 Smart Avenue, Andheri East, Mumbai, Maharashtra 400069",
    },
    {
      name: "Future Technologies",
      contact: "Meera Singh",
      email: "info@futuretech.co.in",
      phone: "+91-11-2341-2500",
      address: "321 Future Street, Sector 62, Noida, UP 201301",
    },
    {
      name: "Innovation Hub Pvt Ltd",
      contact: "Amit Sharma",
      email: "orders@innovationhub.co.in",
      phone: "+91-80-4924-2600",
      address: "654 Hub Road, Koramangala, Bangalore, Karnataka 560034",
    },
    {
      name: "Tech Pioneers India",
      contact: "Neha Gupta",
      email: "sales@techpioneers.co.in",
      phone: "+91-22-6656-2700",
      address: "987 Pioneer Lane, Powai, Mumbai, Maharashtra 400076",
    },
    {
      name: "Digital Dynamics",
      contact: "Vikram Malhotra",
      email: "contact@digitaldynamics.co.in",
      phone: "+91-11-2341-2800",
      address: "456 Dynamics Street, Sector 135, Noida, UP 201304",
    },
    {
      name: "Smart Systems Ltd",
      contact: "Kavita Reddy",
      email: "info@smartsystems.co.in",
      phone: "+91-80-4924-2900",
      address: "789 Systems Road, Indiranagar, Bangalore, Karnataka 560038",
    },
    {
      name: "Tech Vision India",
      contact: "Arun Kumar",
      email: "orders@techvision.co.in",
      phone: "+91-22-6656-3000",
      address: "321 Vision Street, Vashi, Navi Mumbai, Maharashtra 400703",
    },
    {
      name: "Innovation Labs Pvt Ltd",
      contact: "Deepak Joshi",
      email: "sales@innovationlabs.co.in",
      phone: "+91-11-2341-3100",
      address: "654 Labs Road, Sector 142, Noida, UP 201305",
    },
    {
      name: "Digital Solutions Corp",
      contact: "Ritu Agarwal",
      email: "contact@digitalsolutions.co.in",
      phone: "+91-80-4924-3200",
      address: "987 Solutions Avenue, HSR Layout, Bangalore, Karnataka 560102",
    },
    {
      name: "Tech Excellence India",
      contact: "Sandeep Rao",
      email: "info@techexcellence.co.in",
      phone: "+91-22-6656-3300",
      address: "456 Excellence Road, Thane West, Mumbai, Maharashtra 400601",
    },
    {
      name: "Smart Innovations Ltd",
      contact: "Lakshmi Devi",
      email: "orders@smartinnovations.co.in",
      phone: "+91-11-2341-3400",
      address: "789 Innovations Street, Sector 150, Noida, UP 201306",
    },
    {
      name: "Digital Pioneers Pvt Ltd",
      contact: "Rajiv Mehta",
      email: "sales@digitalpioneers.co.in",
      phone: "+91-80-4924-3500",
      address: "321 Pioneers Road, JP Nagar, Bangalore, Karnataka 560078",
    },
    {
      name: "Tech Solutions Hub",
      contact: "Anita Reddy",
      email: "contact@techsolutionshub.co.in",
      phone: "+91-22-6656-3600",
      address: "654 Hub Street, Andheri West, Mumbai, Maharashtra 400058",
    },
    {
      name: "Innovation Systems India",
      contact: "Karan Malhotra",
      email: "info@innovationsystems.co.in",
      phone: "+91-11-2341-3700",
      address: "987 Systems Road, Sector 168, Noida, UP 201307",
    },
    {
      name: "Digital Excellence Corp",
      contact: "Prakash Kumar",
      email: "orders@digitalexcellence.co.in",
      phone: "+91-80-4924-3800",
      address: "456 Excellence Avenue, Banashankari, Bangalore, Karnataka 560070",
    },
    {
      name: "Tech Vision Systems",
      contact: "Meera Iyer",
      email: "sales@techvisionsystems.co.in",
      phone: "+91-22-6656-3900",
      address: "789 Vision Road, Mulund West, Mumbai, Maharashtra 400080",
    },
  ],

  products: [
    {
      name: "iPhone 15 Pro",
      sku: "APPLE-IP15P-001",
      purchaseRate: 85000,
      salesRate: 95000,
      currentStock: 8,
      category: "Electronics",
      vendor: "Apple India Pvt Ltd",
    },
    {
      name: "Office Chair Premium",
      sku: "FURN-CHAIR-001",
      purchaseRate: 12000,
      salesRate: 15000,
      currentStock: 50,
      category: "Furniture",
      vendor: "Dell Technologies India",
    },
    {
      name: "Monitor LG UltraWide",
      sku: "LG-UW-001",
      purchaseRate: 25000,
      salesRate: 32000,
      currentStock: 40,
      category: "Electronics",
      vendor: "LG Electronics India",
    },
    {
      name: "Keyboard Logitech",
      sku: "LOGI-KB-001",
      purchaseRate: 3500,
      salesRate: 4500,
      currentStock: 100,
      category: "Electronics",
      vendor: "Logitech India Pvt Ltd",
    },
    {
      name: "Mouse Logitech",
      sku: "LOGI-MS-001",
      purchaseRate: 2000,
      salesRate: 2800,
      currentStock: 120,
      category: "Electronics",
      vendor: "Logitech India Pvt Ltd",
    },
    {
      name: "Dell Latitude 5520",
      sku: "DELL-LAT-001",
      purchaseRate: 65000,
      salesRate: 75000,
      currentStock: 15,
      category: "Electronics",
      vendor: "Dell Technologies India",
    },
    {
      name: "HP EliteBook 840",
      sku: "HP-ELITE-001",
      purchaseRate: 70000,
      salesRate: 82000,
      currentStock: 12,
      category: "Electronics",
      vendor: "HP India Sales Pvt Ltd",
    },
    {
      name: "Lenovo ThinkPad X1",
      sku: "LEN-THINK-001",
      purchaseRate: 95000,
      salesRate: 110000,
      currentStock: 10,
      category: "Electronics",
      vendor: "Lenovo India Pvt Ltd",
    },
    {
      name: "Samsung Galaxy Tab S9",
      sku: "SAMS-TAB-001",
      purchaseRate: 45000,
      salesRate: 55000,
      currentStock: 25,
      category: "Electronics",
      vendor: "Samsung India Electronics",
    },
    {
      name: "iPad Pro 12.9",
      sku: "APPLE-IPAD-001",
      purchaseRate: 75000,
      salesRate: 85000,
      currentStock: 18,
      category: "Electronics",
      vendor: "Apple India Pvt Ltd",
    },
    {
      name: "Canon EOS R6",
      sku: "CANON-EOS-001",
      purchaseRate: 180000,
      salesRate: 220000,
      currentStock: 5,
      category: "Electronics",
      vendor: "Canon India Pvt Ltd",
    },
    {
      name: "Epson EcoTank L3210",
      sku: "EPSON-ECO-001",
      purchaseRate: 8000,
      salesRate: 12000,
      currentStock: 30,
      category: "Electronics",
      vendor: "Epson India Pvt Ltd",
    },
    {
      name: "Brother HL-L2350DW",
      sku: "BROTHER-HL-001",
      purchaseRate: 12000,
      salesRate: 16000,
      currentStock: 35,
      category: "Electronics",
      vendor: "Brother International India",
    },
    {
      name: "Seagate Barracuda 2TB",
      sku: "SEAGATE-2TB-001",
      purchaseRate: 4500,
      salesRate: 6000,
      currentStock: 80,
      category: "Electronics",
      vendor: "Seagate Technology India",
    },
    {
      name: "Western Digital Blue 1TB",
      sku: "WD-BLUE-1TB-001",
      purchaseRate: 3500,
      salesRate: 4800,
      currentStock: 90,
      category: "Electronics",
      vendor: "Western Digital India",
    },
    {
      name: "Kingston Fury 16GB RAM",
      sku: "KINGSTON-16GB-001",
      purchaseRate: 3500,
      salesRate: 4800,
      currentStock: 150,
      category: "Electronics",
      vendor: "Kingston Technology India",
    },
    {
      name: "Corsair Vengeance 32GB RAM",
      sku: "CORSAIR-32GB-001",
      purchaseRate: 7000,
      salesRate: 9500,
      currentStock: 75,
      category: "Electronics",
      vendor: "Corsair India Pvt Ltd",
    },
    {
      name: "Razer BlackWidow Keyboard",
      sku: "RAZER-BW-001",
      purchaseRate: 8000,
      salesRate: 11000,
      currentStock: 40,
      category: "Electronics",
      vendor: "Razer India Pvt Ltd",
    },
    {
      name: "Microsoft Surface Pro 9",
      sku: "MS-SURFACE-001",
      purchaseRate: 95000,
      salesRate: 115000,
      currentStock: 8,
      category: "Electronics",
      vendor: "Microsoft India Pvt Ltd",
    },
    {
      name: "Cisco Catalyst 2960 Switch",
      sku: "CISCO-CAT-001",
      purchaseRate: 25000,
      salesRate: 35000,
      currentStock: 20,
      category: "Electronics",
      vendor: "Cisco Systems India Pvt Ltd",
    },
    {
      name: "Intel Core i7-12700K",
      sku: "INTEL-I7-001",
      purchaseRate: 28000,
      salesRate: 38000,
      currentStock: 45,
      category: "Electronics",
      vendor: "Intel India Pvt Ltd",
    },
    {
      name: "ASUS ROG Strix G15",
      sku: "ASUS-ROG-001",
      purchaseRate: 85000,
      salesRate: 105000,
      currentStock: 12,
      category: "Electronics",
      vendor: "ASUS India Pvt Ltd",
    },
    {
      name: "Acer Predator Helios 300",
      sku: "ACER-PRED-001",
      purchaseRate: 75000,
      salesRate: 95000,
      currentStock: 15,
      category: "Electronics",
      vendor: "Acer India Pvt Ltd",
    },
    {
      name: "Standing Desk Adjustable",
      sku: "FURN-DESK-001",
      purchaseRate: 18000,
      salesRate: 25000,
      currentStock: 25,
      category: "Furniture",
      vendor: "Dell Technologies India",
    },
    {
      name: "Ergonomic Office Chair",
      sku: "FURN-ERG-001",
      purchaseRate: 15000,
      salesRate: 20000,
      currentStock: 30,
      category: "Furniture",
      vendor: "HP India Sales Pvt Ltd",
    },
    {
      name: "Conference Table 8-Seater",
      sku: "FURN-CONF-001",
      purchaseRate: 35000,
      salesRate: 45000,
      currentStock: 8,
      category: "Furniture",
      vendor: "Lenovo India Pvt Ltd",
    },
    {
      name: "Filing Cabinet 4-Drawer",
      sku: "FURN-FILE-001",
      purchaseRate: 8000,
      salesRate: 12000,
      currentStock: 40,
      category: "Furniture",
      vendor: "Samsung India Electronics",
    },
    {
      name: "Whiteboard 4x6 Feet",
      sku: "FURN-WB-001",
      purchaseRate: 3000,
      salesRate: 4500,
      currentStock: 60,
      category: "Furniture",
      vendor: "LG Electronics India",
    },
  ],
}

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/inventory_management")
    console.log("Connected to MongoDB")

    // Clear existing data
    await User.deleteMany({})
    await Vendor.deleteMany({})
    await Customer.deleteMany({})
    await Product.deleteMany({})
    await PurchaseOrder.deleteMany({})
    await Sale.deleteMany({})
    await Purchase.deleteMany({})
    console.log("Cleared existing data")

    // Seed Users
    console.log("Seeding users...")
    const users = []
    for (const userData of sampleData.users) {
      try {
        const user = new User(userData) // Initial users don't have createdBy
        await user.save()
        users.push(user)
      } catch (error) {
        console.error(`Error creating user ${userData.username}:`, error.message)
      }
    }
    console.log(`Created ${users.length} users`)

    if (users.length === 0) {
      throw new Error("No users were created. Cannot proceed with seeding.")
    }

    // Seed Vendors
    console.log("Seeding vendors...")
    const vendors = []
    for (const vendorData of sampleData.vendors) {
      try {
        const vendor = new Vendor(vendorData)
        await vendor.save()
        vendors.push(vendor)
      } catch (error) {
        console.error(`Error creating vendor ${vendorData.name}:`, error.message)
      }
    }
    console.log(`Created ${vendors.length} vendors`)

    // Seed Customers
    console.log("Seeding customers...")
    const customers = []
    for (const customerData of sampleData.customers) {
      try {
        const customer = new Customer({
          ...customerData,
          createdBy: users[0]._id, // Admin user creates all customers
        })
        await customer.save()
        customers.push(customer)
      } catch (error) {
        console.error(`Error creating customer ${customerData.name}:`, error.message)
      }
    }
    console.log(`Created ${customers.length} customers`)

    // Seed Products
    console.log("Seeding products...")
    const products = []
    const productMap = {} // Map to store products by name for easy lookup
    
    for (const productData of sampleData.products) {
      try {
        const product = new Product({
          ...productData,
          createdBy: users[0]._id, // Admin user creates all products
        })
        await product.save()
        products.push(product)
        productMap[product.name] = product // Store by name for lookup
      } catch (error) {
        console.error(`Error creating product ${productData.name}:`, error.message)
      }
    }
    console.log(`Created ${products.length} products`)

    if (products.length === 0) {
      throw new Error("No products were created. Cannot proceed with creating orders and sales.")
    }

    // Helper function to get product by name safely
    const getProductByName = (name) => {
      const product = productMap[name]
      if (!product) {
        throw new Error(`Product "${name}" not found in created products`)
      }
      return product
    }

    // Create sample Purchase Orders
    console.log("Creating sample purchase orders...")
    const purchaseOrders = [
      {
        poNumber: "PO-2024-001",
        vendor: "Apple India Pvt Ltd",
        status: "approved",
        orderDate: new Date("2024-02-18"),
        items: [
          {
            productId: getProductByName("iPhone 15 Pro")._id,
            productName: "iPhone 15 Pro",
            quantity: 20,
            unitPrice: 85000,
            total: 1700000,
          },
        ],
        subtotal: 1700000,
        tax: 204000,
        total: 1904000,
        createdBy: users[0]._id,
      },
      {
        poNumber: "PO-2024-002",
        vendor: "Dell Technologies India",
        status: "pending",
        orderDate: new Date("2024-02-20"),
        items: [
          {
            productId: getProductByName("Dell Latitude 5520")._id,
            productName: "Dell Latitude 5520",
            quantity: 15,
            unitPrice: 65000,
            total: 975000,
          },
          {
            productId: getProductByName("Standing Desk Adjustable")._id,
            productName: "Standing Desk Adjustable",
            quantity: 10,
            unitPrice: 18000,
            total: 180000,
          },
        ],
        subtotal: 1155000,
        tax: 138600,
        total: 1293600,
        createdBy: users[1]._id,
      },
      {
        poNumber: "PO-2024-003",
        vendor: "HP India Sales Pvt Ltd",
        status: "delivered",
        orderDate: new Date("2024-02-15"),
        items: [
          {
            productId: getProductByName("HP EliteBook 840")._id,
            productName: "HP EliteBook 840",
            quantity: 12,
            unitPrice: 70000,
            total: 840000,
          },
          {
            productId: getProductByName("Ergonomic Office Chair")._id,
            productName: "Ergonomic Office Chair",
            quantity: 20,
            unitPrice: 15000,
            total: 300000,
          },
        ],
        subtotal: 1140000,
        tax: 136800,
        total: 1276800,
        createdBy: users[0]._id,
      },
      {
        poNumber: "PO-2024-004",
        vendor: "Lenovo India Pvt Ltd",
        status: "approved",
        orderDate: new Date("2024-02-22"),
        items: [
          {
            productId: getProductByName("Lenovo ThinkPad X1")._id,
            productName: "Lenovo ThinkPad X1",
            quantity: 8,
            unitPrice: 95000,
            total: 760000,
          },
          {
            productId: getProductByName("Conference Table 8-Seater")._id,
            productName: "Conference Table 8-Seater",
            quantity: 3,
            unitPrice: 35000,
            total: 105000,
          },
        ],
        subtotal: 865000,
        tax: 103800,
        total: 968800,
        createdBy: users[1]._id,
      },
      {
        poNumber: "PO-2024-005",
        vendor: "Samsung India Electronics",
        status: "draft",
        orderDate: new Date("2024-02-25"),
        items: [
          {
            productId: getProductByName("Samsung Galaxy Tab S9")._id,
            productName: "Samsung Galaxy Tab S9",
            quantity: 25,
            unitPrice: 45000,
            total: 1125000,
          },
          {
            productId: getProductByName("Filing Cabinet 4-Drawer")._id,
            productName: "Filing Cabinet 4-Drawer",
            quantity: 15,
            unitPrice: 8000,
            total: 120000,
          },
        ],
        subtotal: 1245000,
        tax: 149400,
        total: 1394400,
        createdBy: users[2]._id,
      },
    ]

    for (const poData of purchaseOrders) {
      try {
        const po = new PurchaseOrder(poData)
        await po.save()
      } catch (error) {
        console.error(`Error creating purchase order ${poData.poNumber}:`, error.message)
      }
    }
    console.log(`Created ${purchaseOrders.length} purchase orders`)

    // Create sample Sales
    console.log("Creating sample sales...")
    const sales = [
      {
        invoiceNumber: "INV-2024-001",
        customerName: "Tech Solutions Corp",
        customerEmail: "contact@techsolutions.com",
        saleDate: new Date("2024-02-22"),
        items: [
          {
            productId: getProductByName("iPhone 15 Pro")._id,
            productName: "iPhone 15 Pro",
            quantity: 3,
            unitPrice: 95000,
            total: 285000,
          },
        ],
        subtotal: 285000,
        tax: 34200,
        total: 319200,
        status: "paid",
        createdBy: users[1]._id,
      },
      {
        invoiceNumber: "INV-2024-002",
        customerName: "Business Center Ltd",
        customerEmail: "orders@businesscenter.com",
        saleDate: new Date("2024-02-23"),
        items: [
          {
            productId: getProductByName("Dell Latitude 5520")._id,
            productName: "Dell Latitude 5520",
            quantity: 5,
            unitPrice: 75000,
            total: 375000,
          },
          {
            productId: getProductByName("Standing Desk Adjustable")._id,
            productName: "Standing Desk Adjustable",
            quantity: 8,
            unitPrice: 25000,
            total: 200000,
          },
        ],
        subtotal: 575000,
        tax: 69000,
        total: 644000,
        status: "paid",
        createdBy: users[0]._id,
      },
      {
        invoiceNumber: "INV-2024-003",
        customerName: "Global Tech Ltd",
        customerEmail: "info@globaltech.com",
        saleDate: new Date("2024-02-24"),
        items: [
          {
            productId: getProductByName("HP EliteBook 840")._id,
            productName: "HP EliteBook 840",
            quantity: 4,
            unitPrice: 82000,
            total: 328000,
          },
          {
            productId: getProductByName("Ergonomic Office Chair")._id,
            productName: "Ergonomic Office Chair",
            quantity: 12,
            unitPrice: 20000,
            total: 240000,
          },
        ],
        subtotal: 568000,
        tax: 68160,
        total: 636160,
        status: "pending",
        createdBy: users[1]._id,
      },
      {
        invoiceNumber: "INV-2024-004",
        customerName: "Digital Innovations Pvt Ltd",
        customerEmail: "sales@digitalinnovations.co.in",
        saleDate: new Date("2024-02-25"),
        items: [
          {
            productId: getProductByName("Lenovo ThinkPad X1")._id,
            productName: "Lenovo ThinkPad X1",
            quantity: 6,
            unitPrice: 110000,
            total: 660000,
          },
          {
            productId: getProductByName("Conference Table 8-Seater")._id,
            productName: "Conference Table 8-Seater",
            quantity: 2,
            unitPrice: 45000,
            total: 90000,
          },
        ],
        subtotal: 750000,
        tax: 90000,
        total: 840000,
        status: "paid",
        createdBy: users[0]._id,
      },
      {
        invoiceNumber: "INV-2024-005",
        customerName: "Smart Solutions India",
        customerEmail: "contact@smartsolutions.co.in",
        saleDate: new Date("2024-02-26"),
        items: [
          {
            productId: getProductByName("Samsung Galaxy Tab S9")._id,
            productName: "Samsung Galaxy Tab S9",
            quantity: 10,
            unitPrice: 55000,
            total: 550000,
          },
          {
            productId: getProductByName("Filing Cabinet 4-Drawer")._id,
            productName: "Filing Cabinet 4-Drawer",
            quantity: 8,
            unitPrice: 12000,
            total: 96000,
          },
        ],
        subtotal: 646000,
        tax: 77520,
        total: 723520,
        status: "paid",
        createdBy: users[2]._id,
      },
      {
        invoiceNumber: "INV-2024-006",
        customerName: "Future Technologies",
        customerEmail: "info@futuretech.co.in",
        saleDate: new Date("2024-02-27"),
        items: [
          {
            productId: getProductByName("iPad Pro 12.9")._id,
            productName: "iPad Pro 12.9",
            quantity: 8,
            unitPrice: 85000,
            total: 680000,
          },
          {
            productId: getProductByName("Whiteboard 4x6 Feet")._id,
            productName: "Whiteboard 4x6 Feet",
            quantity: 15,
            unitPrice: 4500,
            total: 67500,
          },
        ],
        subtotal: 747500,
        tax: 89700,
        total: 837200,
        status: "paid",
        createdBy: users[1]._id,
      },
      {
        invoiceNumber: "INV-2024-007",
        customerName: "Innovation Hub Pvt Ltd",
        customerEmail: "orders@innovationhub.co.in",
        saleDate: new Date("2024-02-28"),
        items: [
          {
            productId: getProductByName("Canon EOS R6")._id,
            productName: "Canon EOS R6",
            quantity: 2,
            unitPrice: 220000,
            total: 440000,
          },
          {
            productId: getProductByName("Epson EcoTank L3210")._id,
            productName: "Epson EcoTank L3210",
            quantity: 5,
            unitPrice: 12000,
            total: 60000,
          },
        ],
        subtotal: 500000,
        tax: 60000,
        total: 560000,
        status: "pending",
        createdBy: users[0]._id,
      },
      {
        invoiceNumber: "INV-2024-008",
        customerName: "Tech Pioneers India",
        customerEmail: "sales@techpioneers.co.in",
        saleDate: new Date("2024-03-01"),
        items: [
          {
            productId: getProductByName("Brother HL-L2350DW")._id,
            productName: "Brother HL-L2350DW",
            quantity: 6,
            unitPrice: 16000,
            total: 96000,
          },
          {
            productId: getProductByName("Seagate Barracuda 2TB")._id,
            productName: "Seagate Barracuda 2TB",
            quantity: 20,
            unitPrice: 6000,
            total: 120000,
          },
        ],
        subtotal: 216000,
        tax: 25920,
        total: 241920,
        status: "paid",
        createdBy: users[1]._id,
      },
    ]

    for (const saleData of sales) {
      try {
        const sale = new Sale(saleData)
        await sale.save()
      } catch (error) {
        console.error(`Error creating sale ${saleData.invoiceNumber}:`, error.message)
      }
    }
    console.log(`Created ${sales.length} sales`)

    // Create sample Purchases
    console.log("Creating sample purchases...")
    const purchases = [
      {
        receiptNumber: "REC-2024-001",
        vendor: "Apple India Pvt Ltd",
        purchaseDate: new Date("2024-02-21"),
        items: [
          {
            productId: getProductByName("iPhone 15 Pro")._id,
            productName: "iPhone 15 Pro",
            quantity: 8,
            unitPrice: 85000,
            total: 680000,
          },
        ],
        subtotal: 680000,
        tax: 81600,
        total: 761600,
        invoiceFile: "invoice-apple-002.pdf",
        createdBy: users[0]._id,
      },
      {
        receiptNumber: "REC-2024-002",
        vendor: "Dell Technologies India",
        purchaseDate: new Date("2024-02-22"),
        items: [
          {
            productId: getProductByName("Dell Latitude 5520")._id,
            productName: "Dell Latitude 5520",
            quantity: 10,
            unitPrice: 65000,
            total: 650000,
          },
          {
            productId: getProductByName("Standing Desk Adjustable")._id,
            productName: "Standing Desk Adjustable",
            quantity: 15,
            unitPrice: 18000,
            total: 270000,
          },
        ],
        subtotal: 920000,
        tax: 110400,
        total: 1030400,
        invoiceFile: "invoice-dell-003.pdf",
        createdBy: users[1]._id,
      },
      {
        receiptNumber: "REC-2024-003",
        vendor: "HP India Sales Pvt Ltd",
        purchaseDate: new Date("2024-02-23"),
        items: [
          {
            productId: getProductByName("HP EliteBook 840")._id,
            productName: "HP EliteBook 840",
            quantity: 8,
            unitPrice: 70000,
            total: 560000,
          },
          {
            productId: getProductByName("Ergonomic Office Chair")._id,
            productName: "Ergonomic Office Chair",
            quantity: 25,
            unitPrice: 15000,
            total: 375000,
          },
        ],
        subtotal: 935000,
        tax: 112200,
        total: 1047200,
        invoiceFile: "invoice-hp-004.pdf",
        createdBy: users[0]._id,
      },
      {
        receiptNumber: "REC-2024-004",
        vendor: "Lenovo India Pvt Ltd",
        purchaseDate: new Date("2024-02-24"),
        items: [
          {
            productId: getProductByName("Lenovo ThinkPad X1")._id,
            productName: "Lenovo ThinkPad X1",
            quantity: 6,
            unitPrice: 95000,
            total: 570000,
          },
          {
            productId: getProductByName("Conference Table 8-Seater")._id,
            productName: "Conference Table 8-Seater",
            quantity: 4,
            unitPrice: 35000,
            total: 140000,
          },
        ],
        subtotal: 710000,
        tax: 85200,
        total: 795200,
        invoiceFile: "invoice-lenovo-005.pdf",
        createdBy: users[1]._id,
      },
      {
        receiptNumber: "REC-2024-005",
        vendor: "Samsung India Electronics",
        purchaseDate: new Date("2024-02-25"),
        items: [
          {
            productId: getProductByName("Samsung Galaxy Tab S9")._id,
            productName: "Samsung Galaxy Tab S9",
            quantity: 20,
            unitPrice: 45000,
            total: 900000,
          },
          {
            productId: getProductByName("Filing Cabinet 4-Drawer")._id,
            productName: "Filing Cabinet 4-Drawer",
            quantity: 20,
            unitPrice: 8000,
            total: 160000,
          },
        ],
        subtotal: 1060000,
        tax: 127200,
        total: 1187200,
        invoiceFile: "invoice-samsung-006.pdf",
        createdBy: users[2]._id,
      },
      {
        receiptNumber: "REC-2024-006",
        vendor: "Logitech India Pvt Ltd",
        purchaseDate: new Date("2024-02-26"),
        items: [
          {
            productId: getProductByName("Keyboard Logitech")._id,
            productName: "Keyboard Logitech",
            quantity: 50,
            unitPrice: 3500,
            total: 175000,
          },
          {
            productId: getProductByName("Mouse Logitech")._id,
            productName: "Mouse Logitech",
            quantity: 60,
            unitPrice: 2000,
            total: 120000,
          },
        ],
        subtotal: 295000,
        tax: 35400,
        total: 330400,
        invoiceFile: "invoice-logitech-007.pdf",
        createdBy: users[0]._id,
      },
      {
        receiptNumber: "REC-2024-007",
        vendor: "Canon India Pvt Ltd",
        purchaseDate: new Date("2024-02-27"),
        items: [
          {
            productId: getProductByName("Canon EOS R6")._id,
            productName: "Canon EOS R6",
            quantity: 3,
            unitPrice: 180000,
            total: 540000,
          },
        ],
        subtotal: 540000,
        tax: 64800,
        total: 604800,
        invoiceFile: "invoice-canon-008.pdf",
        createdBy: users[1]._id,
      },
      {
        receiptNumber: "REC-2024-008",
        vendor: "Epson India Pvt Ltd",
        purchaseDate: new Date("2024-02-28"),
        items: [
          {
            productId: getProductByName("Epson EcoTank L3210")._id,
            productName: "Epson EcoTank L3210",
            quantity: 25,
            unitPrice: 8000,
            total: 200000,
          },
        ],
        subtotal: 200000,
        tax: 24000,
        total: 224000,
        invoiceFile: "invoice-epson-009.pdf",
        createdBy: users[2]._id,
      },
    ]

    for (const purchaseData of purchases) {
      try {
        const purchase = new Purchase(purchaseData)
        await purchase.save()
      } catch (error) {
        console.error(`Error creating purchase ${purchaseData.receiptNumber}:`, error.message)
      }
    }
    console.log(`Created ${purchases.length} purchases`)

    console.log("Database seeding completed successfully!")
    console.log("\nDefault login credentials:")
    console.log("Admin: username=admin, password=admin123")
    console.log("Manager: username=manager, password=manager123")
    console.log("Staff: username=staff, password=staff123")
  } catch (error) {
    console.error("Error seeding database:", error)
  } finally {
    await mongoose.connection.close()
    console.log("Database connection closed")
  }
}

// Run the seeder
if (require.main === module) {
  seedDatabase()
}

module.exports = seedDatabase
