const reportsService = require("../services/reportsService")
const logger = require("../utils/logger")
const { validationResult } = require("express-validator")

class ReportsController {
  /**
   * Get sales data for client reports
   * @route GET /api/reports/sales
   * @access Private (Admin/Manager)
   */
  async getSalesReport(req, res, next) {
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
        customer: req.query.customer, // Customer filtering for reports
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        sortBy: req.query.sortBy || "saleDate",
        sortOrder: req.query.sortOrder || "desc",
        all: req.query.all === 'true',
      }

      const result = await reportsService.getSalesReport(options)

      res.json({
        success: true,
        data: result,
      })
    } catch (error) {
      logger.error("Get sales report error:", error)
      next(error)
    }
  }

  /**
   * Get purchases data for supplier reports
   * @route GET /api/reports/purchases
   * @access Private (Admin/Manager)
   */
  async getPurchasesReport(req, res, next) {
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
        vendor: req.query.vendor, // Vendor filtering for reports
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        sortBy: req.query.sortBy || "purchaseDate",
        sortOrder: req.query.sortOrder || "desc",
        all: req.query.all === 'true',
      }

      const result = await reportsService.getPurchasesReport(options)

      res.json({
        success: true,
        data: result,
      })
    } catch (error) {
      logger.error("Get purchases report error:", error)
      next(error)
    }
  }

  /**
   * Get all suppliers for dropdown
   * @route GET /api/reports/suppliers
   * @access Private (Admin/Manager)
   */
  async getSuppliersForReports(req, res, next) {
    try {
      const suppliers = await reportsService.getAllSuppliers()

      res.json({
        success: true,
        data: { vendors: suppliers },
      })
    } catch (error) {
      logger.error("Get suppliers for reports error:", error)
      next(error)
    }
  }

  /**
   * Get all customers for dropdown
   * @route GET /api/reports/customers
   * @access Private (Admin/Manager)
   */
  async getCustomersForReports(req, res, next) {
    try {
      const customers = await reportsService.getAllCustomers()

      res.json({
        success: true,
        data: { customers },
      })
    } catch (error) {
      logger.error("Get customers for reports error:", error)
      next(error)
    }
  }

  /**
   * Get client-specific sales report
   * @route GET /api/reports/client/:customerName
   * @access Private (Admin/Manager)
   */
  async getClientReport(req, res, next) {
    try {
      const { customerName } = req.params
      const options = {
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        all: req.query.all === 'true',
      }

      const result = await reportsService.getClientReport(customerName, options)

      res.json({
        success: true,
        data: result,
      })
    } catch (error) {
      logger.error("Get client report error:", error)
      next(error)
    }
  }

  /**
   * Get supplier-specific purchases report
   * @route GET /api/reports/supplier/:vendorName
   * @access Private (Admin/Manager)
   */
  async getSupplierReport(req, res, next) {
    try {
      const { vendorName } = req.params
      const options = {
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        all: req.query.all === 'true',
      }

      const result = await reportsService.getSupplierReport(vendorName, options)

      res.json({
        success: true,
        data: result,
      })
    } catch (error) {
      logger.error("Get supplier report error:", error)
      next(error)
    }
  }
}

module.exports = new ReportsController()