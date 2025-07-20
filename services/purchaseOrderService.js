const PurchaseOrder = require("../models/PurchaseOrder")
const Product = require("../models/Product")

class PurchaseOrderService {
  /**
   * Get purchase orders with pagination and filters
   * @param {Object} options - Query options
   * @returns {Object} Purchase orders and pagination info
   */
  async getPurchaseOrders(options) {
    const { page = 1, limit = 10, search, status, vendor, startDate, endDate, sortBy = "orderDate", sortOrder = "desc" } = options

    const skip = (page - 1) * limit

    // Build query
    const query = {}

    // Filter by status
    if (status) {
      query.status = status
    }

    // Filter by vendor
    if (vendor) {
      query.vendor = { $regex: vendor, $options: "i" }
    }

    // Date range filter
    if (startDate || endDate) {
      query.orderDate = {}
      if (startDate) {
        query.orderDate.$gte = new Date(startDate)
      }
      if (endDate) {
        query.orderDate.$lte = new Date(endDate)
      }
    }

    // Search functionality
    if (search) {
      query.$or = [
        { poNumber: { $regex: search, $options: "i" } },
        { vendor: { $regex: search, $options: "i" } },
        { "items.productName": { $regex: search, $options: "i" } },
      ]
    }

    // Build sort object
    const sort = {}
    sort[sortBy] = sortOrder === "desc" ? -1 : 1

    // Execute query
    const purchaseOrders = await PurchaseOrder.find(query)
      .populate("createdBy", "name username")
      .populate("approvedBy", "name username")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean()

    const total = await PurchaseOrder.countDocuments(query)

    return {
      purchaseOrders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  }

  /**
   * Get purchase order by ID
   * @param {string} purchaseOrderId
   * @returns {Object} Purchase order data
   */
  async getPurchaseOrderById(purchaseOrderId) {
    return await PurchaseOrder.findById(purchaseOrderId)
      .populate("createdBy", "name username")
      .populate("approvedBy", "name username")
      .lean()
  }

  /**
   * Create new purchase order
   * @param {Object} purchaseOrderData
   * @returns {Object} Created purchase order
   */
  async createPurchaseOrder(purchaseOrderData) {
    const { items, ...otherData } = purchaseOrderData

    // Process items to include product names and calculate totals
    const processedItems = await this.processItems(items)
    const subtotal = processedItems.reduce((sum, item) => sum + item.total, 0)
    const total = subtotal

    const purchaseOrder = new PurchaseOrder({
      ...otherData,
      items: processedItems,
      subtotal,
      total,
    })

    return await purchaseOrder.save()
  }

  /**
   * Update purchase order
   * @param {string} purchaseOrderId
   * @param {Object} updateData
   * @returns {Object} Updated purchase order
   */
  async updatePurchaseOrder(purchaseOrderId, updateData) {
    const { items, ...otherData } = updateData

    let processedItems = []
    let subtotal = 0
    let total = 0

    // If items are being updated, process them
    if (items) {
      processedItems = await this.processItems(items)
      subtotal = processedItems.reduce((sum, item) => sum + item.total, 0)
      total = subtotal
    }

    const updatePayload = {
      ...otherData,
      ...(items && { items: processedItems, subtotal, total }),
    }

    const purchaseOrder = await PurchaseOrder.findByIdAndUpdate(purchaseOrderId, updatePayload, {
      new: true,
      runValidators: true,
    }).populate("createdBy", "name username").populate("approvedBy", "name username")

    return purchaseOrder
  }

  /**
   * Delete purchase order (hard delete)
   * @param {string} purchaseOrderId
   * @param {string} deletedBy
   * @returns {Object} Deleted purchase order
   */
  async deletePurchaseOrder(purchaseOrderId, deletedBy) {
    const purchaseOrder = await PurchaseOrder.findByIdAndDelete(purchaseOrderId);
    return purchaseOrder;
  }

  /**
   * Search purchase orders
   * @param {string} searchTerm
   * @param {number} limit
   * @returns {Array} Purchase orders
   */
  async searchPurchaseOrders(searchTerm, limit = 10) {
    return await PurchaseOrder.find({
      $or: [
        { poNumber: { $regex: searchTerm, $options: "i" } },
        { vendor: { $regex: searchTerm, $options: "i" } },
        { "items.productName": { $regex: searchTerm, $options: "i" } },
      ],
    })
      .select("poNumber vendor status orderDate total")
      .sort({ orderDate: -1 })
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
      const product = await Product.findById(item.productId).select("name")
      if (!product) {
        throw new Error(`Product with ID ${item.productId} not found`)
      }

      const total = item.quantity * item.unitPrice

      processedItems.push({
        productId: item.productId,
        productName: product.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total,
      })
    }

    return processedItems
  }

  /**
   * Get purchase order statistics
   * @returns {Object} Statistics
   */
  async getPurchaseOrderStats() {
    const stats = await PurchaseOrder.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalValue: { $sum: "$total" },
        },
      },
    ])

    const totalOrders = await PurchaseOrder.countDocuments()
    const totalValue = await PurchaseOrder.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$total" },
        },
      },
    ])

    return {
      byStatus: stats,
      totalOrders,
      totalValue: totalValue[0]?.total || 0,
    }
  }

  /**
   * Get purchase orders by vendor
   * @param {string} vendor
   * @param {Object} options
   * @returns {Object} Purchase orders and pagination
   */
  async getPurchaseOrdersByVendor(vendor, options = {}) {
    const { page = 1, limit = 10, sortBy = "orderDate", sortOrder = "desc" } = options

    const skip = (page - 1) * limit

    const query = { vendor: { $regex: vendor, $options: "i" } }

    const sort = {}
    sort[sortBy] = sortOrder === "desc" ? -1 : 1

    const purchaseOrders = await PurchaseOrder.find(query)
      .populate("createdBy", "name username")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean()

    const total = await PurchaseOrder.countDocuments(query)

    return {
      purchaseOrders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  }
}

module.exports = new PurchaseOrderService() 