const PurchaseOrder = require("../models/PurchaseOrder")
const Product = require("../models/Product")
const { getAttachmentUrl } = require("../utils/constants")

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
        { ref_num: { $regex: search, $options: "i" } },
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

   // At the end of getPurchaseOrders function
const updatedPurchaseOrders = purchaseOrders.map((po) => ({
  ...po,
  attachment: po.attachment ? getAttachmentUrl(po.attachment) : null,
}));

return {
  purchaseOrders: updatedPurchaseOrders,
  pagination: {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  },
};
  }

  /**
   * Get purchase order by ID
   * @param {string} purchaseOrderId
   * @returns {Object} Purchase order data
   */
  async getPurchaseOrderByIdOrRefNum(identifier) {
    // Try to find by MongoDB ObjectId or by ref_num
    let purchaseOrder = null
    if (/^[0-9a-fA-F]{24}$/.test(identifier)) {
      purchaseOrder = await PurchaseOrder.findById(identifier)
        .populate("createdBy", "name username")
        .populate("approvedBy", "name username")
        .lean()
    }
    if (!purchaseOrder) {
      purchaseOrder = await PurchaseOrder.findOne({ ref_num: identifier })
        .populate("createdBy", "name username")
        .populate("approvedBy", "name username")
        .lean()
    }
    return purchaseOrder
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
  async updatePurchaseOrderByIdOrRefNum(identifier, updateData) {
    // If items are being updated, process them
    if (updateData.items) {
      const processedItems = await this.processItems(updateData.items);
      updateData.items = processedItems;
      updateData.subtotal = processedItems.reduce((sum, item) => sum + item.total, 0);
      updateData.total = updateData.subtotal;
    }
    // Try to update by MongoDB ObjectId or by ref_num
    let purchaseOrder = null
    if (/^[0-9a-fA-F]{24}$/.test(identifier)) {
      purchaseOrder = await PurchaseOrder.findByIdAndUpdate(identifier, updateData, {
        new: true,
        runValidators: true,
      }).populate("createdBy", "name username").populate("approvedBy", "name username")
    }
    if (!purchaseOrder) {
      purchaseOrder = await PurchaseOrder.findOneAndUpdate({ ref_num: identifier }, updateData, {
        new: true,
        runValidators: true,
      }).populate("createdBy", "name username").populate("approvedBy", "name username")
    }
    return purchaseOrder
  }

  /**
   * Delete purchase order (hard delete)
   * @param {string} purchaseOrderId
   * @param {string} deletedBy
   * @returns {Object} Deleted purchase order
   */
  async deletePurchaseOrderByIdOrRefNum(identifier, deletedBy) {
    // First find the purchase order to get attachment info
    let purchaseOrder = null
    if (/^[0-9a-fA-F]{24}$/.test(identifier)) {
      purchaseOrder = await PurchaseOrder.findById(identifier)
    }
    if (!purchaseOrder) {
      purchaseOrder = await PurchaseOrder.findOne({ ref_num: identifier })
    }
    
    // If purchase order has an attachment, delete the files
    if (purchaseOrder && purchaseOrder.attachment) {
      const fs = require('fs');
      const path = require('path');
      
      // Delete from public directory
      const publicPath = path.join(__dirname, "../../public", purchaseOrder.attachment);
      fs.unlink(publicPath, (err) => {
        if (err) console.error("Error deleting attachment from public:", err.message);
      });
      
      // Delete from uploads directory
      const uploadsPath = path.join(__dirname, "../..", purchaseOrder.attachment);
      fs.unlink(uploadsPath, (err) => {
        if (err) console.error("Error deleting attachment from uploads:", err.message);
      });
    }
    
    // Now delete the purchase order
    if (/^[0-9a-fA-F]{24}$/.test(identifier)) {
      purchaseOrder = await PurchaseOrder.findByIdAndDelete(identifier)
    }
    if (!purchaseOrder) {
      purchaseOrder = await PurchaseOrder.findOneAndDelete({ ref_num: identifier })
    }
    return purchaseOrder
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
        { ref_num: { $regex: searchTerm, $options: "i" } },
        { poNumber: { $regex: searchTerm, $options: "i" } },
        { vendor: { $regex: searchTerm, $options: "i" } },
        { "items.productName": { $regex: searchTerm, $options: "i" } },
      ],
    })
      .select("ref_num poNumber vendor status orderDate total")
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