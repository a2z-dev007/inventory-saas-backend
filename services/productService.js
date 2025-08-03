const Product = require("../models/Product")

class ProductService {
  /**
   * Get products with pagination and search
   * @param {Object} options - Query options
   * @returns {Object} Products and pagination info
   */
  async getProducts(options) {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      vendor,
      lowStock = false,
      sortBy = "createdAt",
      sortOrder = "desc",
      all = false,
    } = options

    const skip = all ? 0 : (page - 1) * limit

    // Build query
    const query = { isActive: true }

    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
      ]
    }

    // Filter by category
    if (category) {
      query.category = { $regex: category, $options: "i" }
    }

    // Filter by vendor
    if (vendor) {
      query.vendor = { $regex: vendor, $options: "i" }
    }

    // Filter low stock products
    if (lowStock) {
      query.$expr = { $lte: ["$currentStock", "$minStockLevel"] }
    }

    // Build sort object
    const sort = {}
    sort[sortBy] = sortOrder === "desc" ? -1 : 1

    // Execute query
    const products = await Product.find(query).sort(sort).skip(skip).limit(all ? undefined : limit).lean()

    // Remove search, filter, and formatting for salesRate, currentStock, and category
    // Remove population of category
    const formattedProducts = products.map((product) => ({ ...product }))
    const total = await Product.countDocuments(query)

    return {
      products:formattedProducts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  }

  /**
   * Get product by ID
   * @param {string} productId
   * @returns {Object} Product data
   */
  async getProductById(productId) {
    return await Product.findById(productId).lean()
  }

  /**
   * Create new product
   * @param {Object} productData
   * @returns {Object} Created product
   */
  async createProduct(productData) {
    const product = new Product(productData)
    await product.save()
    return product.toJSON()
  }

  /**
   * Update product
   * @param {string} productId
   * @param {Object} updateData
   * @returns {Object} Updated product
   */
  async updateProduct(productId, updateData) {
    const product = await Product.findByIdAndUpdate(productId, updateData, { new: true, runValidators: true })

    return product
  }

  /**
   * Delete product (soft delete)
   * @param {string} productId
   * @param {string} deletedBy
   * @returns {Object} Deleted product
   */
  async deleteProduct(productId, deletedBy) {
    const product = await Product.findByIdAndUpdate(
      productId,
      {
        isActive: false,
        deletedBy,
        deletedAt: new Date(),
      },
      { new: true },
    )

    return product
  }

  /**
   * Update product stock
   * @param {string} productId
   * @param {Object} stockData
   * @returns {Object} Updated product
   */
  async updateStock(productId, stockData) {
    const { quantity, type, reason, updatedBy } = stockData

    const product = await Product.findById(productId)

    if (!product) {
      return null
    }

    let newStock
    switch (type) {
      case "add":
        newStock = product.currentStock + quantity
        break
      case "subtract":
        newStock = Math.max(0, product.currentStock - quantity)
        break
      case "set":
        newStock = quantity
        break
      default:
        throw new Error("Invalid stock update type")
    }

    product.currentStock = newStock
    product.updatedBy = updatedBy

    // Log stock movement (you can create a separate StockMovement model)
    await this.logStockMovement({
      productId,
      type,
      quantity,
      previousStock: product.currentStock,
      newStock,
      reason,
      updatedBy,
    })

    await product.save()
    return product
  }

  /**
   * Get product categories
   * @returns {Array} Categories
   */
  async getCategories() {
    return await Product.find();
  }

  /**
   * Get product vendors
   * @returns {Array} Vendors
   */
  async getVendors() {
    return await Product.distinct("vendor", { isActive: true })
  }

  /**
   * Get low stock products
   * @returns {Array} Products
   */
  async getLowStockProducts() {
    return await Product.find({
      isActive: true,
      $expr: { $lte: ["$currentStock", "$minStockLevel"] },
    })
      .sort({ currentStock: 1 })
      .lean()
  }

  /**
   * Bulk update products
   * @param {Array} productIds
   * @param {Object} updateData
   * @returns {Object} Update result
   */
  async bulkUpdateProducts(productIds, updateData) {
    return await Product.updateMany({ _id: { $in: productIds } }, updateData)
  }

  /**
   * Search products
   * @param {string} searchTerm
   * @param {number} limit
   * @returns {Array} Products
   */
  async searchProducts(searchTerm, limit = 10) {
    return await Product.find({
      isActive: true,
      $or: [
        { name: { $regex: searchTerm, $options: "i" } },
        { sku: { $regex: searchTerm, $options: "i" } },
      ],
    })
      .select("name sku currentStock salesRate")
      .limit(limit)
      .lean()
  }

  /**
   * Get product statistics
   * @returns {Object} Product statistics
   */
  async getProductStats() {
    const stats = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalValue: { $sum: { $multiply: ["$currentStock", "$purchaseRate"] } },
          lowStockCount: {
            $sum: {
              $cond: [{ $lte: ["$currentStock", "$minStockLevel"] }, 1, 0],
            },
          },
          outOfStockCount: {
            $sum: {
              $cond: [{ $eq: ["$currentStock", 0] }, 1, 0],
            },
          },
        },
      },
    ])

    const categoryStats = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          totalValue: { $sum: { $multiply: ["$currentStock", "$purchaseRate"] } },
        },
      },
      { $sort: { count: -1 } },
    ])

    return {
      overview: stats[0] || {
        totalProducts: 0,
        totalValue: 0,
        lowStockCount: 0,
        outOfStockCount: 0,
      },
      categoryDistribution: categoryStats,
    }
  }

  /**
   * Log stock movement (implement StockMovement model if needed)
   * @param {Object} movementData
   */
  async logStockMovement(movementData) {
    // This is a placeholder for stock movement logging
    // You can implement a separate StockMovement model for audit trail
    console.log("Stock movement logged:", movementData)
  }

  /**
   * Update multiple product stocks (for purchase/sale operations)
   * @param {Array} stockUpdates
   * @returns {Array} Updated products
   */
  async updateMultipleStocks(stockUpdates) {
    const results = []

    for (const update of stockUpdates) {
      const { productId, quantity, type, reason, updatedBy } = update
      const product = await this.updateStock(productId, {
        quantity,
        type,
        reason,
        updatedBy,
      })
      results.push(product)
    }

    return results
  }
}

module.exports = new ProductService()
