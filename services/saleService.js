const Sale = require("../models/Sale")
const Product = require("../models/Product")

class SaleService {
  /**
   * Get sales with pagination and filters
   * @param {Object} options - Query options
   * @returns {Object} Sales and pagination info
   */
  async getSales(options) {
    const { page = 1, limit = 10, search, status, customerName, startDate, endDate, sortBy = "saleDate", sortOrder = "desc" } = options

    const skip = (page - 1) * limit

    // Build query
    const query = {}

    // Filter by status
    if (status) {
      query.status = status
    }

    // Filter by customer name
    if (customerName) {
      query.customerName = { $regex: customerName, $options: "i" }
    }

    // Date range filter
    if (startDate || endDate) {
      query.saleDate = {}
      if (startDate) {
        query.saleDate.$gte = new Date(startDate)
      }
      if (endDate) {
        query.saleDate.$lte = new Date(endDate)
      }
    }

    // Search functionality
    if (search) {
      query.$or = [
        { invoiceNumber: { $regex: search, $options: "i" } },
        { customerName: { $regex: search, $options: "i" } },
        { "items.productName": { $regex: search, $options: "i" } },
      ]
    }

    // Build sort object
    const sort = {}
    sort[sortBy] = sortOrder === "desc" ? -1 : 1

    // Execute query
    const sales = await Sale.find(query)
      .populate("createdBy", "name username")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean()

    const total = await Sale.countDocuments(query)

    return {
      sales,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  }

  /**
   * Get sale by ID
   * @param {string} saleId
   * @returns {Object} Sale data
   */
  async getSaleById(saleId) {
    return await Sale.findById(saleId)
      .populate("createdBy", "name username")
      .lean()
  }

  /**
   * Create new sale
   * @param {Object} saleData
   * @returns {Object} Created sale
   */
  async createSale(saleData) {
    const { items, discount = 0, ...otherData } = saleData

    // Process items to include product names and calculate totals
    const processedItems = await this.processItems(items)
    const subtotal = processedItems.reduce((sum, item) => sum + item.total, 0)
    const tax = 0 // You can add tax calculation logic here
    const total = subtotal + tax - discount

    const sale = new Sale({
      ...otherData,
      items: processedItems,
      subtotal,
      tax,
      discount,
      total,
    })

    return await sale.save()
  }

  /**
   * Update sale
   * @param {string} saleId
   * @param {Object} updateData
   * @returns {Object} Updated sale
   */
  async updateSale(saleId, updateData) {
    const { items, discount = 0, ...otherData } = updateData

    let processedItems = []
    let subtotal = 0
    let tax = 0
    let total = 0

    // If items are being updated, process them
    if (items) {
      processedItems = await this.processItems(items)
      subtotal = processedItems.reduce((sum, item) => sum + item.total, 0)
      tax = 0 // You can add tax calculation logic here
      total = subtotal + tax - discount
    }

    const updatePayload = {
      ...otherData,
      ...(items && { items: processedItems, subtotal, tax, discount, total }),
    }

    const sale = await Sale.findByIdAndUpdate(saleId, updatePayload, {
      new: true,
      runValidators: true,
    }).populate("createdBy", "name username")

    return sale
  }

  /**
   * Delete sale (soft delete)
   * @param {string} saleId
   * @param {string} deletedBy
   * @returns {Object} Deleted sale
   */
  async deleteSale(saleId, deletedBy) {
    const sale = await Sale.findByIdAndUpdate(
      saleId,
      {
        isDeleted: true,
        deletedBy,
        deletedAt: new Date(),
      },
      { new: true }
    )

    return sale
  }

  /**
   * Search sales
   * @param {string} searchTerm
   * @param {number} limit
   * @returns {Array} Sales
   */
  async searchSales(searchTerm, limit = 10) {
    return await Sale.find({
      $or: [
        { invoiceNumber: { $regex: searchTerm, $options: "i" } },
        { customerName: { $regex: searchTerm, $options: "i" } },
        { "items.productName": { $regex: searchTerm, $options: "i" } },
      ],
    })
      .select("invoiceNumber customerName status saleDate total")
      .sort({ saleDate: -1 })
      .limit(limit)
      .lean()
  }

  /**
   * Process items to include product names and calculate totals
   * @param {Array} items
   * @returns {Array} Processed items
   */
  async processItems(items) {
    const processedItems = []

    for (const item of items) {
      const product = await Product.findById(item.productId).select("name currentStock")
      if (!product) {
        throw new Error(`Product with ID ${item.productId} not found`)
      }

      // Check if enough stock is available
      if (product.currentStock < item.quantity) {
        throw new Error(`Insufficient stock for product ${product.name}. Available: ${product.currentStock}, Requested: ${item.quantity}`)
      }

      const total = item.quantity * item.unitPrice

      processedItems.push({
        productId: item.productId,
        productName: product.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total,
      })

      // Update product stock
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { currentStock: -item.quantity },
      })
    }

    return processedItems
  }

  /**
   * Get sale statistics
   * @returns {Object} Statistics
   */
  async getSaleStats() {
    const stats = await Sale.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalValue: { $sum: "$total" },
        },
      },
    ])

    const totalSales = await Sale.countDocuments()
    const totalValue = await Sale.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$total" },
        },
      },
    ])

    return {
      byStatus: stats,
      totalSales,
      totalValue: totalValue[0]?.total || 0,
    }
  }

  /**
   * Get sales by customer
   * @param {string} customerName
   * @param {Object} options
   * @returns {Object} Sales and pagination
   */
  async getSalesByCustomer(customerName, options = {}) {
    const { page = 1, limit = 10, sortBy = "saleDate", sortOrder = "desc" } = options

    const skip = (page - 1) * limit

    const query = { customerName: { $regex: customerName, $options: "i" } }

    const sort = {}
    sort[sortBy] = sortOrder === "desc" ? -1 : 1

    const sales = await Sale.find(query)
      .populate("createdBy", "name username")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean()

    const total = await Sale.countDocuments(query)

    return {
      sales,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  }

  /**
   * Get daily sales report
   * @param {Date} date
   * @returns {Object} Daily sales data
   */
  async getDailySalesReport(date) {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const sales = await Sale.find({
      saleDate: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    }).lean()

    const totalSales = sales.length
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0)
    const totalItems = sales.reduce((sum, sale) => sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0)

    return {
      date: date.toISOString().split('T')[0],
      totalSales,
      totalRevenue,
      totalItems,
      sales,
    }
  }
}

module.exports = new SaleService() 