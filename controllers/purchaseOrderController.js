const purchaseOrderService = require("../services/purchaseOrderService")
const logger = require("../utils/logger")
const { validationResult } = require("express-validator")

class PurchaseOrderController {
  /**
   * Get all purchase orders with pagination and filters
   * @route GET /api/purchase-orders
   * @access Private (Admin/Manager)
   */
  async getPurchaseOrders(req, res, next) {
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
        vendor: req.query.vendor,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        sortBy: req.query.sortBy || "orderDate",
        sortOrder: req.query.sortOrder || "desc",
      }

      const result = await purchaseOrderService.getPurchaseOrders(options)

      res.json({
        success: true,
        data: result,
      })
    } catch (error) {
      logger.error("Get purchase orders error:", error)
      next(error)
    }
  }

  /**
   * Get purchase order by ID
   * @route GET /api/purchase-orders/:id
   * @access Private (Admin/Manager)
   */
  async getPurchaseOrderById(req, res, next) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const purchaseOrder = await purchaseOrderService.getPurchaseOrderByIdOrRefNum(req.params.id)

      if (!purchaseOrder) {
        return res.status(404).json({
          success: false,
          message: "Purchase order not found",
        })
      }

      res.json({
        success: true,
        data: { purchaseOrder },
      })
    } catch (error) {
      logger.error("Get purchase order error:", error)
      next(error)
    }
  }

  /**
   * Create new purchase order
   * @route POST /api/purchase-orders
   * @access Private (Admin/Manager)
   */
  async createPurchaseOrder(req, res, next) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const purchaseOrderData = {
        ...req.body,
        createdBy: req.user.id,
      }

      const purchaseOrder = await purchaseOrderService.createPurchaseOrder(purchaseOrderData)

      logger.info(`Purchase order created: ${purchaseOrder.poNumber} by user ${req.user.username}`)

      res.status(201).json({
        success: true,
        message: "Purchase order created successfully",
        data: { purchaseOrder },
      })
    } catch (error) {
      logger.error("Create purchase order error:", error)

      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "PO Number already exists",
        })
      }

      next(error)
    }
  }

  /**
   * Update purchase order
   * @route PUT /api/purchase-orders/:id
   * @access Private (Admin/Manager)
   */
  async updatePurchaseOrder(req, res, next) {
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

      const purchaseOrder = await purchaseOrderService.updatePurchaseOrderByIdOrRefNum(req.params.id, updateData)

      if (!purchaseOrder) {
        return res.status(404).json({
          success: false,
          message: "Purchase order not found",
        })
      }

      logger.info(`Purchase order updated: ${purchaseOrder.ref_num} by user ${req.user.username}`)

      res.json({
        success: true,
        message: "Purchase order updated successfully",
        data: { purchaseOrder },
      })
    } catch (error) {
      logger.error("Update purchase order error:", error)
      next(error)
    }
  }

  /**
   * Update purchase order status
   * @route PUT /api/purchase-orders/:id/status
   * @access Private (Admin/Manager)
   */
  async updatePurchaseOrderStatus(req, res, next) {
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

      // If status is being approved, set approvedBy and approvedAt
      if (status === "approved") {
        updateData.approvedBy = req.user.id
        updateData.approvedAt = new Date()
      }

      const purchaseOrder = await purchaseOrderService.updatePurchaseOrderByIdOrRefNum(req.params.id, updateData)

      if (!purchaseOrder) {
        return res.status(404).json({
          success: false,
          message: "Purchase order not found",
        })
      }

      logger.info(`Purchase order status updated: ${purchaseOrder.ref_num} to ${status} by user ${req.user.username}`)

      res.json({
        success: true,
        message: "Purchase order status updated successfully",
        data: { purchaseOrder },
      })
    } catch (error) {
      logger.error("Update purchase order status error:", error)
      next(error)
    }
  }

  /**
   * Delete purchase order
   * @route DELETE /api/purchase-orders/:id
   * @access Private (Admin)
   */
  async deletePurchaseOrder(req, res, next) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const purchaseOrder = await purchaseOrderService.deletePurchaseOrderByIdOrRefNum(req.params.id, req.user.id)

      if (!purchaseOrder) {
        return res.status(404).json({
          success: false,
          message: "Purchase order not found",
        })
      }

      logger.info(`Purchase order deleted: ${purchaseOrder.ref_num} by admin ${req.user.username}`)

      res.json({
        success: true,
        message: "Purchase order deleted successfully",
      })
    } catch (error) {
      logger.error("Delete purchase order error:", error)
      next(error)
    }
  }

  /**
   * Search purchase orders
   * @route GET /api/purchase-orders/search
   * @access Private (Admin/Manager)
   */
  async searchPurchaseOrders(req, res, next) {
    try {
      const { q: searchTerm, limit = 10 } = req.query

      if (!searchTerm) {
        return res.status(400).json({
          success: false,
          message: "Search term is required",
        })
      }

      const purchaseOrders = await purchaseOrderService.searchPurchaseOrders(searchTerm, parseInt(limit))

      res.json({
        success: true,
        data: { purchaseOrders },
      })
    } catch (error) {
      logger.error("Search purchase orders error:", error)
      next(error)
    }
  }
}

module.exports = new PurchaseOrderController() 