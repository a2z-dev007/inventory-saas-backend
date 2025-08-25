const reportService = require("../services/reportService")
const logger = require("../utils/logger")
const { validationResult } = require("express-validator")

class ReportController {
  /**
   * Get dashboard statistics
   * @route GET /api/reports/dashboard
   * @access Private (Admin/Manager)
   */
  async getDashboardStats(req, res, next) {
    try {
      const stats = await reportService.getDashboardStats()

      res.json({
        success: true,
        data: stats,
      })
    } catch (error) {
      logger.error("Get dashboard stats error:", error)
      next(error)
    }
  }

  /**
   * Get inventory report
   * @route GET /api/reports/inventory
   * @access Private (Admin/Manager)
   */
  async getInventoryReport(req, res, next) {
    try {
      const filters = {
        category: req.query.category,
        vendor: req.query.vendor,
        lowStock: req.query.lowStock === "true",
        outOfStock: req.query.outOfStock === "true",
      }

      const report = await reportService.getInventoryReport(filters)

      res.json({
        success: true,
        data: report,
      })
    } catch (error) {
      logger.error("Get inventory report error:", error)
      next(error)
    }
  }

  /**
   * Get sales report
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

      const filters = {
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        customerName: req.query.customerName,
        status: req.query.status,
      }

      const report = await reportService.getSalesReport(filters)

      res.json({
        success: true,
        data: report,
      })
    } catch (error) {
      logger.error("Get sales report error:", error)
      next(error)
    }
  }

  /**
   * Get purchases report
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

      const filters = {
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        vendor: req.query.vendor,
      }

      const report = await reportService.getPurchasesReport(filters)

      // Format the purchases data for Excel export
      const formatDataForExport = (records) => {
        return records.map(record => ({
          'DB': record.ref_num || '',
          'Supplier': record.vendor || '',
          'Purchase Date': record.purchaseDate ? new Date(record.purchaseDate).toLocaleDateString() : '',
          'Items': record.items && record.items.length > 0 ? record.items.map(item => item.productName).join(', ') : 'No items',
          'Subtotal': record.subtotal || 0,
          'Purpose': record.purpose || 'Purchase',
          'Remarks': record.remarks || record.remark || '',
          'Received By': record.receivedBy || ''
        }));
      };

      const formattedPurchases = formatDataForExport(report.purchases);

      res.json({
        success: true,
        data: {
          purchases: formattedPurchases,
          summary: report.summary,
        },
      })
    } catch (error) {
      logger.error("Get purchases report error:", error)
      next(error)
    }
  }

  /**
   * Get products performance report
   * @route GET /api/reports/products
   * @access Private (Admin/Manager)
   */
  async getProductsReport(req, res, next) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const filters = {
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        category: req.query.category,
        limit: parseInt(req.query.limit) || 10,
      }

      const report = await reportService.getProductsReport(filters)

      res.json({
        success: true,
        data: report,
      })
    } catch (error) {
      logger.error("Get products report error:", error)
      next(error)
    }
  }

  /**
   * Get customers report
   * @route GET /api/reports/customers
   * @access Private (Admin/Manager)
   */
  async getCustomersReport(req, res, next) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const filters = {
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        limit: parseInt(req.query.limit) || 10,
      }

      const report = await reportService.getCustomersReport(filters)

      res.json({
        success: true,
        data: report,
      })
    } catch (error) {
      logger.error("Get customers report error:", error)
      next(error)
    }
  }

  /**
   * Get vendors report
   * @route GET /api/reports/vendors
   * @access Private (Admin/Manager)
   */
  async getVendorsReport(req, res, next) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const filters = {
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        limit: parseInt(req.query.limit) || 10,
      }

      const report = await reportService.getVendorsReport(filters)

      res.json({
        success: true,
        data: report,
      })
    } catch (error) {
      logger.error("Get vendors report error:", error)
      next(error)
    }
  }

  /**
   * Get low stock alert report
   * @route GET /api/reports/low-stock
   * @access Private (Admin/Manager)
   */
  async getLowStockReport(req, res, next) {
    try {
      const threshold = parseInt(req.query.threshold) || 10

      const report = await reportService.getLowStockReport(threshold)

      res.json({
        success: true,
        data: report,
      })
    } catch (error) {
      logger.error("Get low stock report error:", error)
      next(error)
    }
  }

  /**
   * Export report to CSV/Excel
   * @route GET /api/reports/export/:type
   * @access Private (Admin/Manager)
   */
  async exportReport(req, res, next) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const { type } = req.params
      const { format = "csv", startDate, endDate } = req.query

      const filters = {
        startDate,
        endDate,
      }

      const result = await reportService.exportReport(type, format, filters)

      if (format === "csv") {
        res.setHeader("Content-Type", "text/csv")
        res.setHeader("Content-Disposition", `attachment; filename="${type}-report.csv"`)
        res.send(result)
      } else {
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
        res.setHeader("Content-Disposition", `attachment; filename="${type}-report.xlsx"`)
        res.send(result)
      }
    } catch (error) {
      logger.error("Export report error:", error)
      next(error)
    }
  }
}


module.exports = new ReportController() 