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
      name: "Dell Inc.",
      contact: "John Dell",
      email: "orders@dell.com",
      phone: "+1-555-0123",
      address: "123 Dell Street, Austin, TX",
    },
    {
      name: "Apple Inc.",
      contact: "Sarah Apple",
      email: "business@apple.com",
      phone: "+1-555-0124",
      address: "1 Apple Park Way, Cupertino, CA",
    },
    {
      name: "Office Solutions Ltd.",
      contact: "Mike Office",
      email: "sales@officesolutions.com",
      phone: "+1-555-0125",
      address: "456 Business Ave, New York, NY",
    },
    {
      name: "LG Electronics",
      contact: "Linda Green",
      email: "contact@lge.com",
      phone: "+1-555-0126",
      address: "789 LG Road, Dallas, TX",
    },
    {
      name: "Logitech",
      contact: "Peter Mouse",
      email: "info@logitech.com",
      phone: "+1-555-0127",
      address: "101 Logitech Ave, Newark, CA",
    },
  ],

  customers: [
    {
      name: "Tech Solutions Corp",
      contact: "Alice Johnson",
      email: "contact@techsolutions.com",
      phone: "+1-555-0201",
      address: "789 Tech Street, San Francisco, CA",
    },
    {
      name: "Business Center Ltd",
      contact: "Bob Wilson",
      email: "orders@businesscenter.com",
      phone: "+1-555-0202",
      address: "321 Business Blvd, Chicago, IL",
    },
    {
      name: "Global Tech Ltd",
      contact: "George Global",
      email: "info@globaltech.com",
      phone: "+1-555-0203",
      address: "123 Global St, Houston, TX",
    },
  ],

  products: [
    {
      name: "iPhone 15 Pro",
      sku: "APPLE-IP15P-001",
      purchaseRate: 999,
      salesRate: 1199,
      currentStock: 8,
      category: "Electronics",
      vendor: "Apple Inc.",
    },
    {
      name: "Office Chair Premium",
      sku: "FURN-CHAIR-001",
      purchaseRate: 150,
      salesRate: 220,
      currentStock: 50,
      category: "Furniture",
      vendor: "Office Solutions Ltd.",
    },
    {
      name: "Monitor LG UltraWide",
      sku: "LG-UW-001",
      purchaseRate: 300,
      salesRate: 400,
      currentStock: 40,
      category: "Electronics",
      vendor: "LG Electronics",
    },
    {
      name: "Keyboard Logitech",
      sku: "LOGI-KB-001",
      purchaseRate: 50,
      salesRate: 80,
      currentStock: 100,
      category: "Electronics",
      vendor: "Logitech",
    },
    {
      name: "Mouse Logitech",
      sku: "LOGI-MS-001",
      purchaseRate: 30,
      salesRate: 50,
      currentStock: 120,
      category: "Electronics",
      vendor: "Logitech",
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
      const user = new User(userData)
      await user.save()
      users.push(user)
    }
    console.log(`Created ${users.length} users`)

    // Seed Vendors
    console.log("Seeding vendors...")
    const vendors = []
    for (const vendorData of sampleData.vendors) {
      const vendor = new Vendor(vendorData)
      await vendor.save()
      vendors.push(vendor)
    }
    console.log(`Created ${vendors.length} vendors`)

    // Seed Customers
    console.log("Seeding customers...")
    const customers = []
    for (const customerData of sampleData.customers) {
      const customer = new Customer(customerData)
      await customer.save()
      customers.push(customer)
    }
    console.log(`Created ${customers.length} customers`)

    // Seed Products
    console.log("Seeding products...")
    const products = []
    for (const productData of sampleData.products) {
      const product = new Product(productData)
      await product.save()
      products.push(product)
    }
    console.log(`Created ${products.length} products`)

    // Create sample Purchase Order
    console.log("Creating sample purchase order...")
    const samplePO = new PurchaseOrder({
      vendor: "Apple Inc.",
      status: "approved",
      orderDate: new Date("2024-02-18"),
      items: [
        {
          productId: products[0]._id,
          productName: products[0].name,
          quantity: 20,
          unitPrice: 999,
          total: 19980,
        },
      ],
      subtotal: 19980,
      tax: 2397.6,
      total: 22377.6,
      createdBy: users[0]._id,
    })
    await samplePO.save()
    console.log("Created sample purchase order")

    // Create sample Sale
    console.log("Creating sample sale...")
    const sampleSale = new Sale({
      customerName: "Tech Solutions Corp",
      customerEmail: "contact@techsolutions.com",
      saleDate: new Date("2024-02-22"),
      items: [
        {
          productId: products[0]._id,
          productName: products[0].name,
          quantity: 3,
          unitPrice: 1199,
          total: 3597,
        },
      ],
      subtotal: 3597,
      tax: 431.64,
      total: 4028.64,
      status: "paid",
      createdBy: users[1]._id,
    })
    await sampleSale.save()
    console.log("Created sample sale")

    // Create sample Purchase
    console.log("Creating sample purchase...")
    const samplePurchase = new Purchase({
      vendor: "Apple Inc.",
      purchaseDate: new Date("2024-02-21"),
      items: [
        {
          productId: products[0]._id,
          productName: products[0].name,
          quantity: 8,
          unitPrice: 999,
          total: 7992,
        },
      ],
      subtotal: 7992,
      tax: 959.04,
      total: 8951.04,
      invoiceFile: "invoice-apple-002.pdf",
      createdBy: users[0]._id,
    })
    await samplePurchase.save()
    console.log("Created sample purchase")

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
