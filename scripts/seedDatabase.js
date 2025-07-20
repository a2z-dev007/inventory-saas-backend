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
const ProductCategory = require("../models/ProductCategory")
const categorySeed = require("./categorySeed")
const productSeed = require("./productSeed")

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
    { name: "UltraTech Cement Ltd.", contact: "Amit Sharma", email: "contact@ultratech.com", phone: "+91-22-1234-5678", address: "Mumbai, Maharashtra, India" },
    { name: "Tata Steel", contact: "Ravi Kumar", email: "sales@tatasteel.com", phone: "+91-33-9876-5432", address: "Jamshedpur, Jharkhand, India" },
    { name: "Siporex", contact: "Priya Singh", email: "info@siporex.com", phone: "+91-22-2345-6789", address: "Pune, Maharashtra, India" },
    { name: "Pidilite Industries", contact: "Suresh Patel", email: "support@pidilite.com", phone: "+91-22-3456-7890", address: "Mumbai, Maharashtra, India" },
    { name: "Ashirvad Pipes", contact: "Manoj Gupta", email: "enquiry@ashirvad.com", phone: "+91-80-4567-8901", address: "Bangalore, Karnataka, India" },
    { name: "Philips Lighting", contact: "Sunita Rao", email: "lighting@philips.com", phone: "+91-22-5678-9012", address: "Gurgaon, Haryana, India" },
    { name: "Daikin India", contact: "Vikram Mehta", email: "service@daikinindia.com", phone: "+91-11-6789-0123", address: "New Delhi, India" },
    { name: "Asian Paints", contact: "Neha Verma", email: "help@asianpaints.com", phone: "+91-22-7890-1234", address: "Mumbai, Maharashtra, India" },
    { name: "Fenesta", contact: "Arvind Joshi", email: "windows@fenesta.com", phone: "+91-11-8901-2345", address: "Noida, Uttar Pradesh, India" },
    { name: "Kajaria Ceramics", contact: "Deepak Jain", email: "tiles@kajariaceramics.com", phone: "+91-11-9012-3456", address: "Gurgaon, Haryana, India" },
    { name: "Tata Bluescope Steel", contact: "Rohit Sinha", email: "roofing@tatabluescope.com", phone: "+91-20-1234-5678", address: "Pune, Maharashtra, India" },
    { name: "JCB India Ltd.", contact: "Kiran Desai", email: "machinery@jcb.com", phone: "+91-124-5678-9012", address: "Ballabgarh, Haryana, India" },
    { name: "Leica Geosystems", contact: "Sanjay Kapoor", email: "survey@leica.com", phone: "+91-22-2345-6789", address: "Mumbai, Maharashtra, India" },
    { name: "Bosch Power Tools", contact: "Anil Kumar", email: "tools@bosch.com", phone: "+91-80-3456-7890", address: "Bangalore, Karnataka, India" },
    { name: "3M India", contact: "Rita Shah", email: "ppe@3m.com", phone: "+91-80-4567-8901", address: "Bangalore, Karnataka, India" },
    { name: "Alufase", contact: "Nitin Rao", email: "scaffold@alufase.com", phone: "+91-22-5678-9012", address: "Mumbai, Maharashtra, India" },
    { name: "Hilti India", contact: "Vivek Agarwal", email: "fixings@hilti.com", phone: "+91-22-6789-0123", address: "Mumbai, Maharashtra, India" },
    { name: "Greenply", contact: "Shweta Tiwari", email: "plywood@greenply.com", phone: "+91-33-7890-1234", address: "Kolkata, West Bengal, India" },
    { name: "Havells", contact: "Ajay Singh", email: "outdoor@havells.com", phone: "+91-11-8901-2345", address: "Noida, Uttar Pradesh, India" },
    { name: "Local Supplier", contact: "Local Vendor", email: "local@supplier.com", phone: "+91-99-9999-9999", address: "Local Market, India" },
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

    // Seed Categories
    console.log("Seeding product categories...")
    const categories = []
    const categoryNameToId = {}
    for (const catData of categorySeed) {
      try {
        const category = new ProductCategory({
          ...catData,
          createdBy: users[0]._id, // Admin user creates all categories
        })
        await category.save()
        categories.push(category)
        categoryNameToId[category.name] = category._id
      } catch (error) {
        console.error(`Error creating category ${catData.name}:`, error.message)
      }
    }
    console.log(`Created ${categories.length} categories`)

    // Seed Products (new logic)
    console.log("Seeding products...")
    const products = []
    const productMap = {}
    for (const prodData of productSeed(categoryNameToId)) {
      try {
        const product = new Product({
          ...prodData,
          createdBy: users[0]._id, // Admin user creates all products
        })
        await product.save()
        products.push(product)
        productMap[product.name] = product
      } catch (error) {
        console.error(`Error creating product ${prodData.name}:`, error.message)
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
    const purchaseOrdersData = [
      {
        vendor: "UltraTech Cement Ltd.",
        status: "approved",
        orderDate: new Date("2024-03-01"),
        items: [
          { productId: getProductByName("UltraTech OPC 53 Grade Cement")._id, productName: "UltraTech OPC 53 Grade Cement", quantity: 100, unitPrice: 370, total: 37000 },
        ],
        subtotal: 37000, total: 37000, createdBy: users[0]._id,
      },
      {
        vendor: "Tata Steel",
        status: "pending",
        orderDate: new Date("2024-03-02"),
        items: [
          { productId: getProductByName("TMT Steel Bar 12mm")._id, productName: "TMT Steel Bar 12mm", quantity: 200, unitPrice: 700, total: 140000 },
        ],
        subtotal: 140000, total: 140000, createdBy: users[1]._id,
      },
      {
        vendor: "Siporex",
        status: "delivered",
        orderDate: new Date("2024-03-03"),
        items: [
          { productId: getProductByName("AAC Block 600x200x200mm")._id, productName: "AAC Block 600x200x200mm", quantity: 500, unitPrice: 70, total: 35000 },
        ],
        subtotal: 35000, total: 35000, createdBy: users[2]._id,
      },
      {
        vendor: "Pidilite Industries",
        status: "approved",
        orderDate: new Date("2024-03-04"),
        items: [
          { productId: getProductByName("Dr. Fixit LW+ Waterproofing Liquid (1L)")._id, productName: "Dr. Fixit LW+ Waterproofing Liquid (1L)", quantity: 60, unitPrice: 280, total: 16800 },
        ],
        subtotal: 16800, total: 16800, createdBy: users[0]._id,
      },
      {
        vendor: "Ashirvad Pipes",
        status: "draft",
        orderDate: new Date("2024-03-05"),
        items: [
          { productId: getProductByName("CPVC Pipe 1 inch (3m)")._id, productName: "CPVC Pipe 1 inch (3m)", quantity: 120, unitPrice: 220, total: 26400 },
        ],
        subtotal: 26400, total: 26400, createdBy: users[1]._id,
      },
      {
        vendor: "Tata Bluescope Steel",
        status: "approved",
        orderDate: new Date("2024-03-06"),
        items: [
          { productId: getProductByName("Tata Bluescope Steel (Zinc Coated)")._id, productName: "Tata Bluescope Steel (Zinc Coated)", quantity: 50, unitPrice: 1300, total: 65000 },
        ],
        subtotal: 65000, total: 65000, createdBy: users[2]._id,
      },
      {
        vendor: "JCB India Ltd.",
        status: "pending",
        orderDate: new Date("2024-03-07"),
        items: [
          { productId: getProductByName("JCB 3CX Excavator")._id, productName: "JCB 3CX Excavator", quantity: 2, unitPrice: 1600000, total: 3200000 },
        ],
        subtotal: 3200000, total: 3200000, createdBy: users[0]._id,
      },
      {
        vendor: "Leica Geosystems",
        status: "delivered",
        orderDate: new Date("2024-03-08"),
        items: [
          { productId: getProductByName("Leica TS06 Total Station")._id, productName: "Leica TS06 Total Station", quantity: 1, unitPrice: 1300000, total: 1300000 },
        ],
        subtotal: 1300000, total: 1300000, createdBy: users[1]._id,
      },
      {
        vendor: "Bosch Power Tools",
        status: "approved",
        orderDate: new Date("2024-03-09"),
        items: [
          { productId: getProductByName("Bosch GSR 18V-20 Cordless Drill")._id, productName: "Bosch GSR 18V-20 Cordless Drill", quantity: 30, unitPrice: 5000, total: 150000 },
        ],
        subtotal: 150000, total: 150000, createdBy: users[2]._id,
      },
      {
        vendor: "3M India",
        status: "pending",
        orderDate: new Date("2024-03-10"),
        items: [
          { productId: getProductByName("3M 9002 N95 Respiratory Protection Mask")._id, productName: "3M 9002 N95 Respiratory Protection Mask", quantity: 500, unitPrice: 180, total: 90000 },
        ],
        subtotal: 90000, total: 90000, createdBy: users[0]._id,
      },
      {
        vendor: "Alufase",
        status: "approved",
        orderDate: new Date("2024-03-11"),
        items: [
          { productId: getProductByName("Alufase 100x100x25mm Scaffold Sheet")._id, productName: "Alufase 100x100x25mm Scaffold Sheet", quantity: 200, unitPrice: 130, total: 26000 },
        ],
        subtotal: 26000, total: 26000, createdBy: users[1]._id,
      },
      {
        vendor: "Hilti India",
        status: "delivered",
        orderDate: new Date("2024-03-12"),
        items: [
          { productId: getProductByName("Hilti TKI 1000-10000 Nm Torque Wrench")._id, productName: "Hilti TKI 1000-10000 Nm Torque Wrench", quantity: 10, unitPrice: 20000, total: 200000 },
        ],
        subtotal: 200000, total: 200000, createdBy: users[2]._id,
      },
      {
        vendor: "Greenply",
        status: "approved",
        orderDate: new Date("2024-03-13"),
        items: [
          { productId: getProductByName("Greenply 18mm MDF Board")._id, productName: "Greenply 18mm MDF Board", quantity: 100, unitPrice: 135, total: 13500 },
        ],
        subtotal: 13500, total: 13500, createdBy: users[0]._id,
      },
      {
        vendor: "Havells",
        status: "pending",
        orderDate: new Date("2024-03-14"),
        items: [
          { productId: getProductByName("Havells 1000W Ceiling Fan")._id, productName: "Havells 1000W Ceiling Fan", quantity: 40, unitPrice: 1600, total: 64000 },
        ],
        subtotal: 64000, total: 64000, createdBy: users[1]._id,
      },
      {
        vendor: "Local Supplier",
        status: "approved",
        orderDate: new Date("2024-03-15"),
        items: [
          { productId: getProductByName("Local Supplier - Concrete Mix (1m³)")._id, productName: "Local Supplier - Concrete Mix (1m³)", quantity: 10, unitPrice: 3200, total: 32000 },
        ],
        subtotal: 32000, total: 32000, createdBy: users[2]._id,
      },
      {
        vendor: "Local Supplier",
        status: "delivered",
        orderDate: new Date("2024-03-16"),
        items: [
          { productId: getProductByName("Local Supplier - Brick (1000 Nos)")._id, productName: "Local Supplier - Brick (1000 Nos)", quantity: 100, unitPrice: 12, total: 1200 },
        ],
        subtotal: 1200, total: 1200, createdBy: users[0]._id,
      },
      {
        vendor: "UltraTech Cement Ltd.",
        status: "approved",
        orderDate: new Date("2024-03-17"),
        items: [
          { productId: getProductByName("UltraTech OPC 53 Grade Cement")._id, productName: "UltraTech OPC 53 Grade Cement", quantity: 80, unitPrice: 370, total: 29600 },
        ],
        subtotal: 29600, total: 29600, createdBy: users[1]._id,
      },
      {
        vendor: "Tata Steel",
        status: "pending",
        orderDate: new Date("2024-03-18"),
        items: [
          { productId: getProductByName("TMT Steel Bar 12mm")._id, productName: "TMT Steel Bar 12mm", quantity: 150, unitPrice: 700, total: 105000 },
        ],
        subtotal: 105000, total: 105000, createdBy: users[2]._id,
      },
      {
        vendor: "Siporex",
        status: "delivered",
        orderDate: new Date("2024-03-19"),
        items: [
          { productId: getProductByName("AAC Block 600x200x200mm")._id, productName: "AAC Block 600x200x200mm", quantity: 300, unitPrice: 70, total: 21000 },
        ],
        subtotal: 21000, total: 21000, createdBy: users[0]._id,
      },
      {
        vendor: "Pidilite Industries",
        status: "approved",
        orderDate: new Date("2024-03-20"),
        items: [
          { productId: getProductByName("Dr. Fixit LW+ Waterproofing Liquid (1L)")._id, productName: "Dr. Fixit LW+ Waterproofing Liquid (1L)", quantity: 40, unitPrice: 280, total: 11200 },
        ],
        subtotal: 11200, total: 11200, createdBy: users[1]._id,
      },
    ]
    const purchaseOrders = []
    const poRefMap = {}
    for (const poData of purchaseOrdersData) {
      try {
        const po = new PurchaseOrder(poData)
        await po.save()
        purchaseOrders.push(po)
        poRefMap[po.vendor] = { _id: po._id, ref_num: po.ref_num }
      } catch (error) {
        console.error(`Error creating purchase order for vendor ${poData.vendor}:`, error.message)
      }
    }
    console.log(`Created ${purchaseOrders.length} purchase orders`)

    // Create sample Purchases
    console.log("Creating sample purchases...")
    const purchasesData = [
      {
        vendor: "UltraTech Cement Ltd.",
        purchaseDate: new Date("2024-03-02"),
        items: [
          {
            productId: getProductByName("UltraTech OPC 53 Grade Cement")._id,
            productName: "UltraTech OPC 53 Grade Cement",
            quantity: 50,
            unitPrice: 370,
            total: 18500,
          },
        ],
        subtotal: 18500,
        invoiceFile: "invoice-ut-001.pdf",
        createdBy: users[0]._id,
        relatedPO: poRefMap["UltraTech Cement Ltd."]._id,
      },
      {
        vendor: "Tata Steel",
        purchaseDate: new Date("2024-03-03"),
        items: [
          {
            productId: getProductByName("TMT Steel Bar 12mm")._id,
            productName: "TMT Steel Bar 12mm",
            quantity: 200,
            unitPrice: 700,
            total: 140000,
          },
        ],
        subtotal: 140000,
        invoiceFile: "invoice-tata-001.pdf",
        createdBy: users[1]._id,
        relatedPO: poRefMap["Tata Steel"]._id,
      },
      {
        vendor: "Siporex",
        purchaseDate: new Date("2024-03-04"),
        items: [
          {
            productId: getProductByName("AAC Block 600x200x200mm")._id,
            productName: "AAC Block 600x200x200mm",
            quantity: 500,
            unitPrice: 70,
            total: 35000,
          },
        ],
        subtotal: 35000,
        invoiceFile: "invoice-siporex-001.pdf",
        createdBy: users[2]._id,
        relatedPO: poRefMap["Siporex"]._id,
      },
      {
        vendor: "Pidilite Industries",
        purchaseDate: new Date("2024-03-05"),
        items: [
          {
            productId: getProductByName("Dr. Fixit LW+ Waterproofing Liquid (1L)")._id,
            productName: "Dr. Fixit LW+ Waterproofing Liquid (1L)",
            quantity: 60,
            unitPrice: 280,
            total: 16800,
          },
        ],
        subtotal: 16800,
        invoiceFile: "invoice-pidilite-001.pdf",
        createdBy: users[0]._id,
        relatedPO: poRefMap["Pidilite Industries"]._id,
      },
      {
        vendor: "Ashirvad Pipes",
        purchaseDate: new Date("2024-03-06"),
        items: [
          {
            productId: getProductByName("CPVC Pipe 1 inch (3m)")._id,
            productName: "CPVC Pipe 1 inch (3m)",
            quantity: 120,
            unitPrice: 220,
            total: 26400,
          },
        ],
        subtotal: 26400,
        invoiceFile: "invoice-ashirvad-001.pdf",
        createdBy: users[1]._id,
        relatedPO: poRefMap["Ashirvad Pipes"]._id,
      },
      {
        vendor: "Tata Bluescope Steel",
        purchaseDate: new Date("2024-03-07"),
        items: [
          {
            productId: getProductByName("Tata Bluescope Steel (Zinc Coated)")._id,
            productName: "Tata Bluescope Steel (Zinc Coated)",
            quantity: 50,
            unitPrice: 1300,
            total: 65000,
          },
        ],
        subtotal: 65000,
        invoiceFile: "invoice-tatabluescope-001.pdf",
        createdBy: users[2]._id,
        relatedPO: poRefMap["Tata Bluescope Steel"]._id,
      },
      {
        vendor: "JCB India Ltd.",
        purchaseDate: new Date("2024-03-08"),
        items: [
          {
            productId: getProductByName("JCB 3CX Excavator")._id,
            productName: "JCB 3CX Excavator",
            quantity: 2,
            unitPrice: 1600000,
            total: 3200000,
          },
        ],
        subtotal: 3200000,
        invoiceFile: "invoice-jcb-001.pdf",
        createdBy: users[0]._id,
        relatedPO: poRefMap["JCB India Ltd."]._id,
      },
      {
        vendor: "Leica Geosystems",
        purchaseDate: new Date("2024-03-09"),
        items: [
          {
            productId: getProductByName("Leica TS06 Total Station")._id,
            productName: "Leica TS06 Total Station",
            quantity: 1,
            unitPrice: 1300000,
            total: 1300000,
          },
        ],
        subtotal: 1300000,
        invoiceFile: "invoice-leica-001.pdf",
        createdBy: users[1]._id,
        relatedPO: poRefMap["Leica Geosystems"]._id,
      },
      {
        vendor: "Bosch Power Tools",
        purchaseDate: new Date("2024-03-10"),
        items: [
          {
            productId: getProductByName("Bosch GSR 18V-20 Cordless Drill")._id,
            productName: "Bosch GSR 18V-20 Cordless Drill",
            quantity: 30,
            unitPrice: 5000,
            total: 150000,
          },
        ],
        subtotal: 150000,
        invoiceFile: "invoice-bosch-001.pdf",
        createdBy: users[2]._id,
        relatedPO: poRefMap["Bosch Power Tools"]._id,
      },
      {
        vendor: "3M India",
        purchaseDate: new Date("2024-03-11"),
        items: [
          {
            productId: getProductByName("3M 9002 N95 Respiratory Protection Mask")._id,
            productName: "3M 9002 N95 Respiratory Protection Mask",
            quantity: 500,
            unitPrice: 180,
            total: 90000,
          },
        ],
        subtotal: 90000,
        invoiceFile: "invoice-3m-001.pdf",
        createdBy: users[0]._id,
        relatedPO: poRefMap["3M India"]._id,
      },
      {
        vendor: "Alufase",
        purchaseDate: new Date("2024-03-12"),
        items: [
          {
            productId: getProductByName("Alufase 100x100x25mm Scaffold Sheet")._id,
            productName: "Alufase 100x100x25mm Scaffold Sheet",
            quantity: 200,
            unitPrice: 130,
            total: 26000,
          },
        ],
        subtotal: 26000,
        invoiceFile: "invoice-alufase-001.pdf",
        createdBy: users[1]._id,
        relatedPO: poRefMap["Alufase"]._id,
      },
      {
        vendor: "Hilti India",
        purchaseDate: new Date("2024-03-13"),
        items: [
          {
            productId: getProductByName("Hilti TKI 1000-10000 Nm Torque Wrench")._id,
            productName: "Hilti TKI 1000-10000 Nm Torque Wrench",
            quantity: 10,
            unitPrice: 20000,
            total: 200000,
          },
        ],
        subtotal: 200000,
        invoiceFile: "invoice-hilti-001.pdf",
        createdBy: users[2]._id,
        relatedPO: poRefMap["Hilti India"]._id,
      },
      {
        vendor: "Greenply",
        purchaseDate: new Date("2024-03-14"),
        items: [
          {
            productId: getProductByName("Greenply 18mm MDF Board")._id,
            productName: "Greenply 18mm MDF Board",
            quantity: 100,
            unitPrice: 135,
            total: 13500,
          },
        ],
        subtotal: 13500,
        invoiceFile: "invoice-greenply-001.pdf",
        createdBy: users[0]._id,
        relatedPO: poRefMap["Greenply"]._id,
      },
      {
        vendor: "Havells",
        purchaseDate: new Date("2024-03-15"),
        items: [
          {
            productId: getProductByName("Havells 1000W Ceiling Fan")._id,
            productName: "Havells 1000W Ceiling Fan",
            quantity: 40,
            unitPrice: 1600,
            total: 64000,
          },
        ],
        subtotal: 64000,
        invoiceFile: "invoice-havells-001.pdf",
        createdBy: users[1]._id,
        relatedPO: poRefMap["Havells"]._id,
      },
      {
        vendor: "Local Supplier",
        purchaseDate: new Date("2024-03-16"),
        items: [
          {
            productId: getProductByName("Local Supplier - Concrete Mix (1m³)")._id,
            productName: "Local Supplier - Concrete Mix (1m³)",
            quantity: 10,
            unitPrice: 3200,
            total: 32000,
          },
        ],
        subtotal: 32000,
        invoiceFile: "invoice-localsupplier-001.pdf",
        createdBy: users[2]._id,
        relatedPO: poRefMap["Local Supplier"]._id,
      },
      {
        vendor: "Local Supplier",
        purchaseDate: new Date("2024-03-17"),
        items: [
          {
            productId: getProductByName("Local Supplier - Brick (1000 Nos)")._id,
            productName: "Local Supplier - Brick (1000 Nos)",
            quantity: 100,
            unitPrice: 12,
            total: 1200,
          },
        ],
        subtotal: 1200,
        invoiceFile: "invoice-localsupplier-002.pdf",
        createdBy: users[0]._id,
        relatedPO: poRefMap["Local Supplier"]._id,
      },
      {
        vendor: "UltraTech Cement Ltd.",
        purchaseDate: new Date("2024-03-18"),
        items: [
          {
            productId: getProductByName("UltraTech OPC 53 Grade Cement")._id,
            productName: "UltraTech OPC 53 Grade Cement",
            quantity: 80,
            unitPrice: 370,
            total: 29600,
          },
        ],
        subtotal: 29600,
        invoiceFile: "invoice-ultratech-002.pdf",
        createdBy: users[1]._id,
        relatedPO: poRefMap["UltraTech Cement Ltd."]._id,
      },
      {
        vendor: "Tata Steel",
        purchaseDate: new Date("2024-03-19"),
        items: [
          {
            productId: getProductByName("TMT Steel Bar 12mm")._id,
            productName: "TMT Steel Bar 12mm",
            quantity: 150,
            unitPrice: 700,
            total: 105000,
          },
        ],
        subtotal: 105000,
        invoiceFile: "invoice-tatasteel-002.pdf",
        createdBy: users[2]._id,
        relatedPO: poRefMap["Tata Steel"]._id,
      },
      {
        vendor: "Siporex",
        purchaseDate: new Date("2024-03-20"),
        items: [
          {
            productId: getProductByName("AAC Block 600x200x200mm")._id,
            productName: "AAC Block 600x200x200mm",
            quantity: 300,
            unitPrice: 70,
            total: 21000,
          },
        ],
        subtotal: 21000,
        invoiceFile: "invoice-siporex-002.pdf",
        createdBy: users[0]._id,
        relatedPO: poRefMap["Siporex"]._id,
      },
      {
        vendor: "Pidilite Industries",
        purchaseDate: new Date("2024-03-21"),
        items: [
          {
            productId: getProductByName("Dr. Fixit LW+ Waterproofing Liquid (1L)")._id,
            productName: "Dr. Fixit LW+ Waterproofing Liquid (1L)",
            quantity: 40,
            unitPrice: 280,
            total: 11200,
          },
        ],
        subtotal: 11200,
        invoiceFile: "invoice-pidilite-002.pdf",
        createdBy: users[1]._id,
        relatedPO: poRefMap["Pidilite Industries"]._id,
      },
    ]
    for (const purchaseData of purchasesData) {
      try {
        const purchase = new Purchase(purchaseData)
        await purchase.save()
      } catch (error) {
        console.error(`Error creating purchase for vendor ${purchaseData.vendor}:`, error.message)
      }
    }
    console.log(`Created ${purchasesData.length} purchases`)

    // Create sample Sales
    console.log("Creating sample sales...")
    const salesData = [
      {
        invoiceNumber: "INV-2024-001",
        customerName: "Tech Solutions Corp",
        customerEmail: "contact@techsolutions.com",
        saleDate: new Date("2024-03-03"),
        items: [
          {
            productId: getProductByName("UltraTech OPC 53 Grade Cement")._id,
            productName: "UltraTech OPC 53 Grade Cement",
            quantity: 10,
            unitPrice: 400,
            total: 4000,
          },
        ],
        subtotal: 4000,
        total: 4480,
        status: "paid",
        createdBy: users[1]._id,
        notes: `Linked PO Ref: ${poRefMap["UltraTech Cement Ltd."].ref_num}`,
      },
      {
        invoiceNumber: "INV-2024-002",
        customerName: "Business Center Ltd",
        customerEmail: "orders@businesscenter.com",
        saleDate: new Date("2024-03-04"),
        items: [
          {
            productId: getProductByName("TMT Steel Bar 12mm")._id,
            productName: "TMT Steel Bar 12mm",
            quantity: 50,
            unitPrice: 720,
            total: 36000,
          },
        ],
        subtotal: 36000,
        total: 39600,
        status: "pending",
        createdBy: users[2]._id,
        notes: `Linked PO Ref: ${poRefMap["Tata Steel"].ref_num}`,
      },
      {
        invoiceNumber: "INV-2024-003",
        customerName: "Global Tech Ltd",
        customerEmail: "info@globaltech.com",
        saleDate: new Date("2024-03-05"),
        items: [
          {
            productId: getProductByName("AAC Block 600x200x200mm")._id,
            productName: "AAC Block 600x200x200mm",
            quantity: 100,
            unitPrice: 75,
            total: 7500,
          },
        ],
        subtotal: 7500,
        total: 8250,
        status: "paid",
        createdBy: users[0]._id,
        notes: `Linked PO Ref: ${poRefMap["Siporex"].ref_num}`,
      },
      {
        invoiceNumber: "INV-2024-004",
        customerName: "Digital Innovations Pvt Ltd",
        customerEmail: "sales@digitalinnovations.co.in",
        saleDate: new Date("2024-03-06"),
        items: [
          {
            productId: getProductByName("Dr. Fixit LW+ Waterproofing Liquid (1L)")._id,
            productName: "Dr. Fixit LW+ Waterproofing Liquid (1L)",
            quantity: 20,
            unitPrice: 290,
            total: 5800,
          },
        ],
        subtotal: 5800,
        total: 6380,
        status: "pending",
        createdBy: users[1]._id,
        notes: `Linked PO Ref: ${poRefMap["Pidilite Industries"].ref_num}`,
      },
      {
        invoiceNumber: "INV-2024-005",
        customerName: "Smart Solutions India",
        customerEmail: "contact@smartsolutions.co.in",
        saleDate: new Date("2024-03-07"),
        items: [
          {
            productId: getProductByName("CPVC Pipe 1 inch (3m)")._id,
            productName: "CPVC Pipe 1 inch (3m)",
            quantity: 50,
            unitPrice: 230,
            total: 11500,
          },
        ],
        subtotal: 11500,
        total: 12650,
        status: "paid",
        createdBy: users[2]._id,
        notes: `Linked PO Ref: ${poRefMap["Ashirvad Pipes"].ref_num}`,
      },
      {
        invoiceNumber: "INV-2024-006",
        customerName: "Future Technologies",
        customerEmail: "info@futuretech.co.in",
        saleDate: new Date("2024-03-08"),
        items: [
          {
            productId: getProductByName("Tata Bluescope Steel (Zinc Coated)")._id,
            productName: "Tata Bluescope Steel (Zinc Coated)",
            quantity: 10,
            unitPrice: 1350,
            total: 13500,
          },
        ],
        subtotal: 13500,
        total: 14850,
        status: "paid",
        createdBy: users[0]._id,
        notes: `Linked PO Ref: ${poRefMap["Tata Bluescope Steel"].ref_num}`,
      },
      {
        invoiceNumber: "INV-2024-007",
        customerName: "Innovation Hub Pvt Ltd",
        customerEmail: "orders@innovationhub.co.in",
        saleDate: new Date("2024-03-09"),
        items: [
          {
            productId: getProductByName("JCB 3CX Excavator")._id,
            productName: "JCB 3CX Excavator",
            quantity: 1,
            unitPrice: 1600000,
            total: 1600000,
          },
        ],
        subtotal: 1600000,
        total: 1760000,
        status: "paid",
        createdBy: users[1]._id,
        notes: `Linked PO Ref: ${poRefMap["JCB India Ltd."].ref_num}`,
      },
      {
        invoiceNumber: "INV-2024-008",
        customerName: "Tech Pioneers India",
        customerEmail: "sales@techpioneers.co.in",
        saleDate: new Date("2024-03-10"),
        items: [
          {
            productId: getProductByName("Leica TS06 Total Station")._id,
            productName: "Leica TS06 Total Station",
            quantity: 1,
            unitPrice: 1300000,
            total: 1300000,
          },
        ],
        subtotal: 1300000,
        total: 1430000,
        status: "paid",
        createdBy: users[2]._id,
        notes: `Linked PO Ref: ${poRefMap["Leica Geosystems"].ref_num}`,
      },
      {
        invoiceNumber: "INV-2024-009",
        customerName: "Digital Dynamics",
        customerEmail: "contact@digitaldynamics.co.in",
        saleDate: new Date("2024-03-11"),
        items: [
          {
            productId: getProductByName("Bosch GSR 18V-20 Cordless Drill")._id,
            productName: "Bosch GSR 18V-20 Cordless Drill",
            quantity: 15,
            unitPrice: 5200,
            total: 78000,
          },
        ],
        subtotal: 78000,
        total: 85800,
        status: "paid",
        createdBy: users[0]._id,
        notes: `Linked PO Ref: ${poRefMap["Bosch Power Tools"].ref_num}`,
      },
      {
        invoiceNumber: "INV-2024-010",
        customerName: "Smart Systems Ltd",
        customerEmail: "info@smartsystems.co.in",
        saleDate: new Date("2024-03-12"),
        items: [
          {
            productId: getProductByName("3M 9002 N95 Respiratory Protection Mask")._id,
            productName: "3M 9002 N95 Respiratory Protection Mask",
            quantity: 200,
            unitPrice: 190,
            total: 38000,
          },
        ],
        subtotal: 38000,
        total: 41800,
        status: "paid",
        createdBy: users[1]._id,
        notes: `Linked PO Ref: ${poRefMap["3M India"].ref_num}`,
      },
      {
        invoiceNumber: "INV-2024-011",
        customerName: "Tech Vision India",
        customerEmail: "orders@techvision.co.in",
        saleDate: new Date("2024-03-13"),
        items: [
          {
            productId: getProductByName("Alufase 100x100x25mm Scaffold Sheet")._id,
            productName: "Alufase 100x100x25mm Scaffold Sheet",
            quantity: 50,
            unitPrice: 140,
            total: 7000,
          },
        ],
        subtotal: 7000,
        total: 7700,
        status: "paid",
        createdBy: users[2]._id,
        notes: `Linked PO Ref: ${poRefMap["Alufase"].ref_num}`,
      },
      {
        invoiceNumber: "INV-2024-012",
        customerName: "Innovation Labs Pvt Ltd",
        customerEmail: "sales@innovationlabs.co.in",
        saleDate: new Date("2024-03-14"),
        items: [
          {
            productId: getProductByName("Hilti TKI 1000-10000 Nm Torque Wrench")._id,
            productName: "Hilti TKI 1000-10000 Nm Torque Wrench",
            quantity: 5,
            unitPrice: 21000,
            total: 105000,
          },
        ],
        subtotal: 105000,
        total: 115500,
        status: "paid",
        createdBy: users[0]._id,
        notes: `Linked PO Ref: ${poRefMap["Hilti India"].ref_num}`,
      },
      {
        invoiceNumber: "INV-2024-013",
        customerName: "Digital Solutions Corp",
        customerEmail: "contact@digitalsolutions.co.in",
        saleDate: new Date("2024-03-15"),
        items: [
          {
            productId: getProductByName("Greenply 18mm MDF Board")._id,
            productName: "Greenply 18mm MDF Board",
            quantity: 20,
            unitPrice: 145,
            total: 2900,
          },
        ],
        subtotal: 2900,
        total: 3190,
        status: "paid",
        createdBy: users[1]._id,
        notes: `Linked PO Ref: ${poRefMap["Greenply"].ref_num}`,
      },
      {
        invoiceNumber: "INV-2024-014",
        customerName: "Tech Excellence India",
        customerEmail: "info@techexcellence.co.in",
        saleDate: new Date("2024-03-16"),
        items: [
          {
            productId: getProductByName("Havells 1000W Ceiling Fan")._id,
            productName: "Havells 1000W Ceiling Fan",
            quantity: 10,
            unitPrice: 1700,
            total: 17000,
          },
        ],
        subtotal: 17000,
        total: 18700,
        status: "paid",
        createdBy: users[2]._id,
        notes: `Linked PO Ref: ${poRefMap["Havells"].ref_num}`,
      },
      {
        invoiceNumber: "INV-2024-015",
        customerName: "Smart Innovations Ltd",
        customerEmail: "orders@smartinnovations.co.in",
        saleDate: new Date("2024-03-17"),
        items: [
          {
            productId: getProductByName("Local Supplier - Concrete Mix (1m³)")._id,
            productName: "Local Supplier - Concrete Mix (1m³)",
            quantity: 5,
            unitPrice: 3300,
            total: 16500,
          },
        ],
        subtotal: 16500,
        total: 18150,
        status: "paid",
        createdBy: users[0]._id,
        notes: `Linked PO Ref: ${poRefMap["Local Supplier"].ref_num}`,
      },
      {
        invoiceNumber: "INV-2024-016",
        customerName: "Digital Pioneers Pvt Ltd",
        customerEmail: "sales@digitalpioneers.co.in",
        saleDate: new Date("2024-03-18"),
        items: [
          {
            productId: getProductByName("Local Supplier - Brick (1000 Nos)")._id,
            productName: "Local Supplier - Brick (1000 Nos)",
            quantity: 50,
            unitPrice: 13,
            total: 650,
          },
        ],
        subtotal: 650,
        total: 715,
        status: "paid",
        createdBy: users[1]._id,
        notes: `Linked PO Ref: ${poRefMap["Local Supplier"].ref_num}`,
      },
      {
        invoiceNumber: "INV-2024-017",
        customerName: "Tech Solutions Hub",
        customerEmail: "contact@techsolutionshub.co.in",
        saleDate: new Date("2024-03-19"),
        items: [
          {
            productId: getProductByName("UltraTech OPC 53 Grade Cement")._id,
            productName: "UltraTech OPC 53 Grade Cement",
            quantity: 10,
            unitPrice: 380,
            total: 3800,
          },
        ],
        subtotal: 3800,
        total: 4180,
        status: "paid",
        createdBy: users[2]._id,
        notes: `Linked PO Ref: ${poRefMap["UltraTech Cement Ltd."].ref_num}`,
      },
      {
        invoiceNumber: "INV-2024-018",
        customerName: "Innovation Systems India",
        customerEmail: "info@innovationsystems.co.in",
        saleDate: new Date("2024-03-20"),
        items: [
          {
            productId: getProductByName("TMT Steel Bar 12mm")._id,
            productName: "TMT Steel Bar 12mm",
            quantity: 20,
            unitPrice: 710,
            total: 14200,
          },
        ],
        subtotal: 14200,
        total: 15620,
        status: "paid",
        createdBy: users[0]._id,
        notes: `Linked PO Ref: ${poRefMap["Tata Steel"].ref_num}`,
      },
      {
        invoiceNumber: "INV-2024-019",
        customerName: "Digital Excellence Corp",
        customerEmail: "orders@digitalexcellence.co.in",
        saleDate: new Date("2024-03-21"),
        items: [
          {
            productId: getProductByName("AAC Block 600x200x200mm")._id,
            productName: "AAC Block 600x200x200mm",
            quantity: 10,
            unitPrice: 75,
            total: 750,
          },
        ],
        subtotal: 750,
        total: 825,
        status: "paid",
        createdBy: users[1]._id,
        notes: `Linked PO Ref: ${poRefMap["Siporex"].ref_num}`,
      },
      {
        invoiceNumber: "INV-2024-020",
        customerName: "Tech Vision Systems",
        customerEmail: "sales@techvisionsystems.co.in",
        saleDate: new Date("2024-03-22"),
        items: [
          {
            productId: getProductByName("Dr. Fixit LW+ Waterproofing Liquid (1L)")._id,
            productName: "Dr. Fixit LW+ Waterproofing Liquid (1L)",
            quantity: 5,
            unitPrice: 290,
            total: 1450,
          },
        ],
        subtotal: 1450,
        total: 1595,
        status: "paid",
        createdBy: users[2]._id,
        notes: `Linked PO Ref: ${poRefMap["Pidilite Industries"].ref_num}`,
      },
    ]
    for (const saleData of salesData) {
      try {
        const sale = new Sale(saleData)
        await sale.save()
      } catch (error) {
        console.error(`Error creating sale ${saleData.invoiceNumber}:`, error.message)
      }
    }
    console.log(`Created ${salesData.length} sales`)

    // Create sample Stock Movements
    console.log("Creating sample stock movements...");
    const StockMovement = require("../models/StockMovement");
    const stockMovementsData = [
      // Purchases (stock in)
      {
        product: getProductByName("UltraTech OPC 53 Grade Cement")._id,
        movementType: "purchase",
        quantity: 100,
        relatedModel: "Purchase",
        movementDate: new Date("2024-03-02"),
        notes: "Initial stock from purchase",
        createdBy: users[0]._id,
      },
      {
        product: getProductByName("TMT Steel Bar 12mm")._id,
        movementType: "purchase",
        quantity: 200,
        relatedModel: "Purchase",
        movementDate: new Date("2024-03-03"),
        notes: "Stock in from Tata Steel",
        createdBy: users[1]._id,
      },
      // Sales (stock out)
      {
        product: getProductByName("UltraTech OPC 53 Grade Cement")._id,
        movementType: "sale",
        quantity: 10,
        relatedModel: "Sale",
        movementDate: new Date("2024-03-03"),
        notes: "Sold to Tech Solutions Corp",
        createdBy: users[1]._id,
      },
      {
        product: getProductByName("TMT Steel Bar 12mm")._id,
        movementType: "sale",
        quantity: 50,
        relatedModel: "Sale",
        movementDate: new Date("2024-03-04"),
        notes: "Sold to Business Center Ltd",
        createdBy: users[2]._id,
      },
      // Adjustments
      {
        product: getProductByName("AAC Block 600x200x200mm")._id,
        movementType: "adjustment",
        quantity: -5,
        relatedModel: "PurchaseOrder",
        movementDate: new Date("2024-03-05"),
        notes: "Damaged blocks removed from stock",
        createdBy: users[0]._id,
      },
      // ... (add more entries for a total of 20, covering all movement types and products)
    ];
    for (let i = stockMovementsData.length; i < 20; i++) {
      stockMovementsData.push({
        product: getProductByName("UltraTech OPC 53 Grade Cement")._id,
        movementType: i % 2 === 0 ? "purchase" : "sale",
        quantity: 10 + i,
        relatedModel: i % 2 === 0 ? "Purchase" : "Sale",
        movementDate: new Date(2024, 2, 2 + i),
        notes: `Auto-generated stock movement #${i + 1}`,
        createdBy: users[i % users.length]._id,
      });
    }
    await StockMovement.insertMany(stockMovementsData);
    console.log(`Created ${stockMovementsData.length} stock movements`);

    // Create sample Returns
    console.log("Creating sample returns...");
    const Return = require("../models/Return");
    const returnsData = [
      // Purchase returns
      {
        returnType: "purchase",
        product: getProductByName("UltraTech OPC 53 Grade Cement")._id,
        quantity: 5,
        reason: "Damaged bags",
        returnDate: new Date("2024-03-06"),
        processedBy: users[0]._id,
        notes: "Returned to UltraTech Cement Ltd.",
      },
      {
        returnType: "purchase",
        product: getProductByName("TMT Steel Bar 12mm")._id,
        quantity: 10,
        reason: "Rust detected",
        returnDate: new Date("2024-03-07"),
        processedBy: users[1]._id,
        notes: "Returned to Tata Steel",
      },
      // Sales returns
      {
        returnType: "sale",
        product: getProductByName("UltraTech OPC 53 Grade Cement")._id,
        quantity: 2,
        reason: "Customer complaint",
        returnDate: new Date("2024-03-08"),
        processedBy: users[2]._id,
        notes: "Returned by Tech Solutions Corp",
      },
      {
        returnType: "sale",
        product: getProductByName("TMT Steel Bar 12mm")._id,
        quantity: 3,
        reason: "Wrong size delivered",
        returnDate: new Date("2024-03-09"),
        processedBy: users[0]._id,
        notes: "Returned by Business Center Ltd",
      },
      // ... (add more entries for a total of 20, alternating purchase and sale returns)
    ];
    for (let i = returnsData.length; i < 20; i++) {
      returnsData.push({
        returnType: i % 2 === 0 ? "purchase" : "sale",
        product: getProductByName("AAC Block 600x200x200mm")._id,
        quantity: 1 + (i % 5),
        reason: i % 2 === 0 ? "Supplier issue" : "Customer return",
        returnDate: new Date(2024, 2, 10 + i),
        processedBy: users[i % users.length]._id,
        notes: `Auto-generated return #${i + 1}`,
      });
    }
    await Return.insertMany(returnsData);
    console.log(`Created ${returnsData.length} returns`);

    // Create sample Notifications
    console.log("Creating sample notifications...");
    const Notification = require("../models/Notification");
    const notificationsData = [];
    // 10 low stock notifications
    for (let i = 0; i < 10; i++) {
      notificationsData.push({
        type: "low_stock",
        message: `Low stock alert for ${products[i % products.length].name}`,
        user: users[i % users.length]._id,
        relatedDoc: products[i % products.length]._id,
        relatedModel: "Product",
        isRead: false,
      });
    }
    // 10 order status notifications
    for (let i = 0; i < 10; i++) {
      notificationsData.push({
        type: "order_status",
        message: `Order status updated for PO #${i + 1}`,
        user: users[i % users.length]._id,
        isRead: false,
      });
    }
    await Notification.insertMany(notificationsData);
    console.log(`Created ${notificationsData.length} notifications`);

    // Create sample Audit Logs
    console.log("Creating sample audit logs...");
    const AuditLog = require("../models/AuditLog");
    const auditLogsData = [];
    const actions = ["create", "update", "delete", "login", "logout"];
    const targetModels = ["Product", "PurchaseOrder", "Sale", "User", "Vendor"];
    for (let i = 0; i < 10; i++) {
      auditLogsData.push({
        action: actions[i % actions.length],
        user: users[i % users.length]._id,
        targetModel: targetModels[i % targetModels.length],
        targetId: products[i % products.length]._id,
        details: { info: `Auto-generated audit log #${i + 1}` },
        timestamp: new Date(2024, 2, 1 + i),
      });
    }
    await AuditLog.insertMany(auditLogsData);
    console.log(`Created ${auditLogsData.length} audit logs`);

    // Example Report Queries (for reference)
    /*
    // 1. Daily Sales Report (total sales per day)
    Sale.aggregate([
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$saleDate" } }, totalSales: { $sum: "$total" }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ])

    // 2. Monthly Profit Report
    Sale.aggregate([
      { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$saleDate" } }, totalSales: { $sum: "$total" } } }
    ])
    Purchase.aggregate([
      { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$purchaseDate" } }, totalPurchases: { $sum: "$subtotal" } } }
    ])
    // Combine results in your service to calculate profit

    // 3. Category-wise Stock Report
    Product.aggregate([
      { $group: { _id: "$category", totalStock: { $sum: "$currentStock" } } }
    ])

    // 4. Vendor Performance Report
    Purchase.aggregate([
      { $group: { _id: "$vendor", totalPurchased: { $sum: "$subtotal" }, count: { $sum: 1 } } },
      { $sort: { totalPurchased: -1 } }
    ])
    */

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
