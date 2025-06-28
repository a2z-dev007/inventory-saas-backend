const productService = require("../services/productService")
const logger = require("../utils/logger")
const { validationResult } = require("express-validator")

class ProductController {
  /**
   * Get all products with pagination and search
   * @route GET /api/products
   * @access Private
   */
  async getProducts(req, res, next) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const options = {
        page: Number.parseInt(req.query.page) || 1,
        limit: Number.parseInt(req.query.limit) || 10,
        search: req.query.search,
        category: req.query.category,
        vendor: req.query.vendor,
        lowStock: req.query.lowStock === "true",
        sortBy: req.query.sortBy || "createdAt",
        sortOrder: req.query.sortOrder || "desc",
      }

      const result = await productService.getProducts(options)

      res.json({
        success: true,
        data: result,
      })
    } catch (error) {
      logger.error("Get products error:", error)
      next(error)
    }
  }

  /**
   * Get product by ID
   * @route GET /api/products/:id
   * @access Private
   */
  async getProductById(req, res, next) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const product = await productService.getProductById(req.params.id)

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        })
      }

      res.json({
        success: true,
        data: { product },
      })
    } catch (error) {
      logger.error("Get product error:", error)
      next(error)
    }
  }

  /**
   * Create new product
   * @route POST /api/products
   * @access Private (Admin/Manager)
   */
  async createProduct(req, res, next) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const productData = {
        ...req.body,
        createdBy: req.user.id,
      }

      const product = await productService.createProduct(productData)

      logger.info(`Product created: ${product.name} by user ${req.user.username}`)

      res.status(201).json({
        success: true,
        message: "Product created successfully",
        data: { product },
      })
    } catch (error) {
      logger.error("Create product error:", error)

      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "SKU already exists",
        })
      }

      next(error)
    }
  }

  /**
   * Update product
   * @route PUT /api/products/:id
   * @access Private (Admin/Manager)
   */
  async updateProduct(req, res, next) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const updateData = {
        ...req.body,
        updatedBy: req.user.id,
      }

      const product = await productService.updateProduct(req.params.id, updateData)

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        })
      }

      logger.info(`Product updated: ${product.name} by user ${req.user.username}`)

      res.json({
        success: true,
        message: "Product updated successfully",
        data: { product },
      })
    } catch (error) {
      logger.error("Update product error:", error)
      next(error)
    }
  }

  /**
   * Delete product (soft delete)
   * @route DELETE /api/products/:id
   * @access Private (Admin)
   */
  async deleteProduct(req, res, next) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const product = await productService.deleteProduct(req.params.id, req.user.id)

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        })
      }

      logger.info(`Product deleted: ${product.name} by user ${req.user.username}`)

      res.json({
        success: true,
        message: "Product deleted successfully",
      })
    } catch (error) {
      logger.error("Delete product error:", error)
      next(error)
    }
  }

  /**
   * Update product stock
   * @route PATCH /api/products/:id/stock
   * @access Private (Admin/Manager)
   */
  async updateStock(req, res, next) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const { quantity, type, reason } = req.body

      const product = await productService.updateStock(req.params.id, {
        quantity,
        type,
        reason,
        updatedBy: req.user.id,
      })

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        })
      }

      logger.info(
        `Stock updated for ${product.name}: ${type} ${quantity} by user ${req.user.username}. Reason: ${reason || "Not specified"}`,
      )

      res.json({
        success: true,
        message: "Stock updated successfully",
        data: { product },
      })
    } catch (error) {
      logger.error("Update stock error:", error)

      if (error.message === "Invalid stock update type") {
        return res.status(400).json({
          success: false,
          message: error.message,
        })
      }

      next(error)
    }
  }

  /**
   * Get product categories
   * @route GET /api/products/categories
   * @access Private
   */
  async getCategories(req, res, next) {
    try {
      const categories = await productService.getCategories()

      res.json({
        success: true,
        data: { categories },
      })
    } catch (error) {
      logger.error("Get categories error:", error)
      next(error)
    }
  }

  /**
   * Get low stock products
   * @route GET /api/products/low-stock
   * @access Private
   */
  async getLowStockProducts(req, res, next) {
    try {
      const products = await productService.getLowStockProducts()

      res.json({
        success: true,
        data: { products },
      })
    } catch (error) {
      logger.error("Get low stock products error:", error)
      next(error)
    }
  }

  /**
   * Bulk update products
   * @route PATCH /api/products/bulk-update
   * @access Private (Admin/Manager)
   */
  async bulkUpdateProducts(req, res, next) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const { productIds, updateData } = req.body

      const result = await productService.bulkUpdateProducts(productIds, {
        ...updateData,
        updatedBy: req.user.id,
      })

      logger.info(`Bulk update performed on ${result.modifiedCount} products by user ${req.user.username}`)

      res.json({
        success: true,
        message: `${result.modifiedCount} products updated successfully`,
        data: { result },
      })
    } catch (error) {
      logger.error("Bulk update products error:", error)
      next(error)
    }
  }
}

module.exports = new ProductController()
