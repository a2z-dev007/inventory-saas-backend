const Product = require("../models/Product")
const Sale = require("../models/Sale")
const Purchase = require("../models/Purchase")
const Customer = require("../models/Customer")
const Vendor = require("../models/Vendor")

class ReportService {
  /**
   * Get dashboard statistics
   * @returns {Object} Dashboard stats
   */
  async getDashboardStats() {
    const [
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      totalSales,
      totalRevenue,
      totalPurchases,
      totalSpent,
      totalCustomers,
      totalVendors,
    ] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ currentStock: { $lte: 10 } }),
      Product.countDocuments({ currentStock: 0 }),
      Sale.countDocuments(),
      Sale.aggregate([{ $group: { _id: null, total: { $sum: "$total" } } }]),
      Purchase.countDocuments(),
      Purchase.aggregate([{ $group: { _id: null, total: { $sum: "$total" } } }]),
      Customer.countDocuments(),
      Vendor.countDocuments(),
    ])

    // Get recent sales
    const recentSales = await Sale.find()
      .sort({ saleDate: -1 })
      .limit(5)
      .select("invoiceNumber customerName total saleDate")
      .lean()

    // Get top selling products
    const topProducts = await Sale.aggregate([
      {
        $unwind: "$items",
      },
      {
        $group: {
          _id: "$items.productId",
          productName: { $first: "$items.productName" },
          totalSold: { $sum: "$items.quantity" },
          totalRevenue: { $sum: "$items.total" },
        },
      },
      {
        $sort: { totalSold: -1 },
      },
      {
        $limit: 5,
      },
    ])

    return {
      overview: {
        totalProducts,
        lowStockProducts,
        outOfStockProducts,
        totalSales,
        totalRevenue: totalRevenue[0]?.total || 0,
        totalPurchases,
        totalSpent: totalSpent[0]?.total || 0,
        totalCustomers,
        totalVendors,
      },
      recentSales,
      topProducts,
    }
  }

  /**
   * Get inventory report
   * @param {Object} filters
   * @returns {Object} Inventory report
   */
  async getInventoryReport(filters) {
    const { category, vendor, lowStock, outOfStock } = filters

    let query = {}

    if (category) {
      query.category = category
    }

    if (vendor) {
      query.vendor = vendor
    }

    if (lowStock) {
      query.currentStock = { $lte: 10 }
    }

    if (outOfStock) {
      query.currentStock = 0
    }

    const products = await Product.find(query)
      .populate("vendor", "name")
      .sort({ currentStock: 1 })
      .lean()

    const totalValue = products.reduce((sum, product) => sum + (product.currentStock * product.purchaseRate), 0)

    return {
      products,
      summary: {
        totalProducts: products.length,
        totalValue,
        lowStockCount: products.filter(p => p.currentStock <= 10).length,
        outOfStockCount: products.filter(p => p.currentStock === 0).length,
      },
    }
  }

  /**
   * Get sales report
   * @param {Object} filters
   * @returns {Object} Sales report
   */
  async getSalesReport(filters) {
    const { startDate, endDate, customerName, status } = filters

    let query = {}

    if (startDate || endDate) {
      query.saleDate = {}
      if (startDate) {
        query.saleDate.$gte = new Date(startDate)
      }
      if (endDate) {
        query.saleDate.$lte = new Date(endDate)
      }
    }

    if (customerName) {
      query.customerName = { $regex: customerName, $options: "i" }
    }

    if (status) {
      query.status = status
    }

    const sales = await Sale.find(query)
      .populate("createdBy", "name username")
      .sort({ saleDate: -1 })
      .lean()

    const totalSales = sales.length
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0)
    const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0

    // Sales by status
    const salesByStatus = await Sale.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          revenue: { $sum: "$total" },
        },
      },
    ])

    return {
      sales,
      summary: {
        totalSales,
        totalRevenue,
        averageOrderValue,
        salesByStatus,
      },
    }
  }

  /**
   * Get purchases report
   * @param {Object} filters
   * @returns {Object} Purchases report
   */
  async getPurchasesReport(filters) {
    const { startDate, endDate, vendor } = filters

    let query = {}

    if (startDate || endDate) {
      query.purchaseDate = {}
      if (startDate) {
        query.purchaseDate.$gte = new Date(startDate)
      }
      if (endDate) {
        query.purchaseDate.$lte = new Date(endDate)
      }
    }

    if (vendor) {
      query.vendor = { $regex: vendor, $options: "i" }
    }

    const purchases = await Purchase.find(query)
      .populate("createdBy", "name username")
      .sort({ purchaseDate: -1 })
      .lean()

    const totalPurchases = purchases.length
    const totalSpent = purchases.reduce((sum, purchase) => sum + purchase.total, 0)
    const averagePurchaseValue = totalPurchases > 0 ? totalSpent / totalPurchases : 0

    // Purchases by vendor
    const purchasesByVendor = await Purchase.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$vendor",
          count: { $sum: 1 },
          totalSpent: { $sum: "$total" },
        },
      },
      {
        $sort: { totalSpent: -1 },
      },
    ])

    return {
      purchases,
      summary: {
        totalPurchases,
        totalSpent,
        averagePurchaseValue,
        purchasesByVendor,
      },
    }
  }

  /**
   * Get products performance report
   * @param {Object} filters
   * @returns {Object} Products report
   */
  async getProductsReport(filters) {
    const { startDate, endDate, category, limit } = filters

    let saleQuery = {}

    if (startDate || endDate) {
      saleQuery.saleDate = {}
      if (startDate) {
        saleQuery.saleDate.$gte = new Date(startDate)
      }
      if (endDate) {
        saleQuery.saleDate.$lte = new Date(endDate)
      }
    }

    let productQuery = {}
    if (category) {
      productQuery.category = category
    }

    const topProducts = await Sale.aggregate([
      { $match: saleQuery },
      {
        $unwind: "$items",
      },
      {
        $group: {
          _id: "$items.productId",
          productName: { $first: "$items.productName" },
          totalSold: { $sum: "$items.quantity" },
          totalRevenue: { $sum: "$items.total" },
          averagePrice: { $avg: "$items.unitPrice" },
        },
      },
      {
        $sort: { totalSold: -1 },
      },
      {
        $limit: limit,
      },
    ])

    // Get product details
    const productIds = topProducts.map(p => p._id)
    const products = await Product.find({ _id: { $in: productIds } })
      .select("name category currentStock purchaseRate salesRate")
      .lean()

    const productMap = products.reduce((map, product) => {
      map[product._id.toString()] = product
      return map
    }, {})

    const enrichedProducts = topProducts.map(product => ({
      ...product,
      category: productMap[product._id]?.category,
      currentStock: productMap[product._id]?.currentStock,
      purchaseRate: productMap[product._id]?.purchaseRate,
      salesRate: productMap[product._id]?.salesRate,
    }))

    return {
      topProducts: enrichedProducts,
      summary: {
        totalProducts: enrichedProducts.length,
        totalSold: enrichedProducts.reduce((sum, p) => sum + p.totalSold, 0),
        totalRevenue: enrichedProducts.reduce((sum, p) => sum + p.totalRevenue, 0),
      },
    }
  }

  /**
   * Get customers report
   * @param {Object} filters
   * @returns {Object} Customers report
   */
  async getCustomersReport(filters) {
    const { startDate, endDate, limit } = filters

    let saleQuery = {}

    if (startDate || endDate) {
      saleQuery.saleDate = {}
      if (startDate) {
        saleQuery.saleDate.$gte = new Date(startDate)
      }
      if (endDate) {
        saleQuery.saleDate.$lte = new Date(endDate)
      }
    }

    const topCustomers = await Sale.aggregate([
      { $match: saleQuery },
      {
        $group: {
          _id: "$customerName",
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: "$total" },
          averageOrderValue: { $avg: "$total" },
          lastPurchase: { $max: "$saleDate" },
        },
      },
      {
        $sort: { totalSpent: -1 },
      },
      {
        $limit: limit,
      },
    ])

    return {
      topCustomers,
      summary: {
        totalCustomers: topCustomers.length,
        totalOrders: topCustomers.reduce((sum, c) => sum + c.totalOrders, 0),
        totalRevenue: topCustomers.reduce((sum, c) => sum + c.totalSpent, 0),
      },
    }
  }

  /**
   * Get vendors report
   * @param {Object} filters
   * @returns {Object} Vendors report
   */
  async getVendorsReport(filters) {
    const { startDate, endDate, limit } = filters

    let purchaseQuery = {}

    if (startDate || endDate) {
      purchaseQuery.purchaseDate = {}
      if (startDate) {
        purchaseQuery.purchaseDate.$gte = new Date(startDate)
      }
      if (endDate) {
        purchaseQuery.purchaseDate.$lte = new Date(endDate)
      }
    }

    const topVendors = await Purchase.aggregate([
      { $match: purchaseQuery },
      {
        $group: {
          _id: "$vendor",
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: "$total" },
          averageOrderValue: { $avg: "$total" },
          lastPurchase: { $max: "$purchaseDate" },
        },
      },
      {
        $sort: { totalSpent: -1 },
      },
      {
        $limit: limit,
      },
    ])

    return {
      topVendors,
      summary: {
        totalVendors: topVendors.length,
        totalOrders: topVendors.reduce((sum, v) => sum + v.totalOrders, 0),
        totalSpent: topVendors.reduce((sum, v) => sum + v.totalSpent, 0),
      },
    }
  }

  /**
   * Get low stock alert report
   * @param {number} threshold
   * @returns {Object} Low stock report
   */
  async getLowStockReport(threshold) {
    const lowStockProducts = await Product.find({
      currentStock: { $lte: threshold },
    })
      .populate("vendor", "name")
      .sort({ currentStock: 1 })
      .lean()

    const outOfStockProducts = lowStockProducts.filter(p => p.currentStock === 0)
    const criticalStockProducts = lowStockProducts.filter(p => p.currentStock > 0 && p.currentStock <= 5)

    return {
      products: lowStockProducts,
      summary: {
        totalLowStock: lowStockProducts.length,
        outOfStock: outOfStockProducts.length,
        criticalStock: criticalStockProducts.length,
        threshold,
      },
    }
  }

  /**
   * Export report to CSV/Excel
   * @param {string} type
   * @param {string} format
   * @param {Object} filters
   * @returns {string|Buffer} Exported data
   */
  async exportReport(type, format, filters) {
    let data = []

    switch (type) {
      case "inventory":
        data = await this.getInventoryReport(filters)
        break
      case "sales":
        data = await this.getSalesReport(filters)
        break
      case "purchases":
        data = await this.getPurchasesReport(filters)
        break
      case "products":
        data = await this.getProductsReport(filters)
        break
      case "customers":
        data = await this.getCustomersReport(filters)
        break
      case "vendors":
        data = await this.getVendorsReport(filters)
        break
      default:
        throw new Error("Invalid report type")
    }

    if (format === "csv") {
      return this.convertToCSV(data)
    } else {
      return this.convertToExcel(data)
    }
  }

  /**
   * Convert data to CSV format
   * @param {Object} data
   * @returns {string} CSV string
   */
  convertToCSV(data) {
    // Simple CSV conversion - you might want to use a library like 'csv-writer'
    const headers = Object.keys(data.products?.[0] || data.sales?.[0] || data.purchases?.[0] || {})
    const csvHeaders = headers.join(",")
    const csvRows = (data.products || data.sales || data.purchases || []).map(row => 
      headers.map(header => `"${row[header] || ""}"`).join(",")
    ).join("\n")
    
    return `${csvHeaders}\n${csvRows}`
  }

  /**
   * Convert data to Excel format
   * @param {Object} data
   * @returns {Buffer} Excel buffer
   */
  convertToExcel(data) {
    // Simple Excel conversion - you might want to use a library like 'exceljs'
    // For now, return CSV as Excel (you can enhance this later)
    const csv = this.convertToCSV(data)
    return Buffer.from(csv, "utf8")
  }
}

module.exports = new ReportService() 