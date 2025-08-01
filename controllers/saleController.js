const saleService = require("../services/saleService")
const logger = require("../utils/logger")
const { validationResult } = require("express-validator")

class SaleController {
  /**
   * Get all sales with pagination and filters
   * @route GET /api/sales
   * @access Private (Admin/Manager)
   */
  async getSales(req, res, next) {
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
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        search: req.query.search,
        status: req.query.status,
        customerName: req.query.customerName,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        sortBy: req.query.sortBy || "saleDate",
        sortOrder: req.query.sortOrder || "desc",
        all: req.query.all === 'true',
      }

      const result = await saleService.getSales(options)

      res.json({
        success: true,
        data: result,
      })
    } catch (error) {
      logger.error("Get sales error:", error)
      next(error)
    }
  }

  /**
   * Get sale by ID
   * @route GET /api/sales/:id
   * @access Private (Admin/Manager)
   */
  async getSaleById(req, res, next) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const sale = await saleService.getSaleById(req.params.id)

      if (!sale) {
        return res.status(404).json({
          success: false,
          message: "Sale not found",
        })
      }

      res.json({
        success: true,
        data: { sale },
      })
    } catch (error) {
      logger.error("Get sale error:", error)
      next(error)
    }
  }

  /**
   * Create new sale
   * @route POST /api/sales
   * @access Private (Admin/Manager)
   */
  async createSale(req, res, next) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const saleData = {
        ...req.body,
        createdBy: req.user.id,
      }

      const sale = await saleService.createSale(saleData)

      logger.info(`Sale created: ${sale.invoiceNumber} by user ${req.user.username}`)

      res.status(201).json({
        success: true,
        message: "Sale created successfully",
        data: { sale },
      })
    } catch (error) {
      logger.error("Create sale error:", error)

      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "Invoice number already exists",
        })
      }

      next(error)
    }
  }

  /**
   * Update sale
   * @route PUT /api/sales/:id
   * @access Private (Admin/Manager)
   */
  async updateSale(req, res, next) {
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

      const sale = await saleService.updateSale(req.params.id, updateData)

      if (!sale) {
        return res.status(404).json({
          success: false,
          message: "Sale not found",
        })
      }

      logger.info(`Sale updated: ${sale.invoiceNumber} by user ${req.user.username}`)

      res.json({
        success: true,
        message: "Sale updated successfully",
        data: { sale },
      })
    } catch (error) {
      logger.error("Update sale error:", error)
      next(error)
    }
  }

  /**
   * Update sale status
   * @route PUT /api/sales/:id/status
   * @access Private (Admin/Manager)
   */
  async updateSaleStatus(req, res, next) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const { status, reason } = req.body
      const updateData = {
        status,
        reason,
        updatedBy: req.user.id,
      }

      const sale = await saleService.updateSale(req.params.id, updateData)

      if (!sale) {
        return res.status(404).json({
          success: false,
          message: "Sale not found",
        })
      }

      logger.info(`Sale status updated: ${sale.invoiceNumber} to ${status} by user ${req.user.username}`)

      res.json({
        success: true,
        message: "Sale status updated successfully",
        data: { sale },
      })
    } catch (error) {
      logger.error("Update sale status error:", error)
      next(error)
    }
  }

  /**
   * Delete sale
   * @route DELETE /api/sales/:id
   * @access Private (Admin)
   */
  async deleteSale(req, res, next) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const sale = await saleService.deleteSale(req.params.id, req.user.id)

      if (!sale) {
        return res.status(404).json({
          success: false,
          message: "Sale not found",
        })
      }

      logger.info(`Sale deleted: ${sale.invoiceNumber} by admin ${req.user.username}`)

      res.json({
        success: true,
        message: "Sale deleted successfully",
      })
    } catch (error) {
      logger.error("Delete sale error:", error)
      next(error)
    }
  }

  /**
   * Search sales
   * @route GET /api/sales/search
   * @access Private (Admin/Manager)
   */
  async searchSales(req, res, next) {
    try {
      const { q: searchTerm, limit = 10 } = req.query

      if (!searchTerm) {
        return res.status(400).json({
          success: false,
          message: "Search term is required",
        })
      }

      const sales = await saleService.searchSales(searchTerm, parseInt(limit))

      res.json({
        success: true,
        data: { sales },
      })
    } catch (error) {
      logger.error("Search sales error:", error)
      next(error)
    }
  }
}

module.exports = new SaleController() 