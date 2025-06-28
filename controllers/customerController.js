const customerService = require("../services/customerService")
const logger = require("../utils/logger")
const { validationResult } = require("express-validator")

class CustomerController {
  /**
   * Get all customers with pagination and filters
   * @route GET /api/customers
   * @access Private (Admin/Manager)
   */
  async getCustomers(req, res, next) {
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
        sortBy: req.query.sortBy || "name",
        sortOrder: req.query.sortOrder || "asc",
      }

      const result = await customerService.getCustomers(options)

      res.json({
        success: true,
        data: result,
      })
    } catch (error) {
      logger.error("Get customers error:", error)
      next(error)
    }
  }

  /**
   * Get customer by ID
   * @route GET /api/customers/:id
   * @access Private (Admin/Manager)
   */
  async getCustomerById(req, res, next) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const customer = await customerService.getCustomerById(req.params.id)

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: "Customer not found",
        })
      }

      res.json({
        success: true,
        data: { customer },
      })
    } catch (error) {
      logger.error("Get customer error:", error)
      next(error)
    }
  }

  /**
   * Create new customer
   * @route POST /api/customers
   * @access Private (Admin/Manager)
   */
  async createCustomer(req, res, next) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const customerData = {
        ...req.body,
        createdBy: req.user.id,
      }

      const customer = await customerService.createCustomer(customerData)

      logger.info(`Customer created: ${customer.name} by user ${req.user.username}`)

      res.status(201).json({
        success: true,
        message: "Customer created successfully",
        data: { customer },
      })
    } catch (error) {
      logger.error("Create customer error:", error)

      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        })
      }

      next(error)
    }
  }

  /**
   * Update customer
   * @route PUT /api/customers/:id
   * @access Private (Admin/Manager)
   */
  async updateCustomer(req, res, next) {
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

      const customer = await customerService.updateCustomer(req.params.id, updateData)

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: "Customer not found",
        })
      }

      logger.info(`Customer updated: ${customer.name} by user ${req.user.username}`)

      res.json({
        success: true,
        message: "Customer updated successfully",
        data: { customer },
      })
    } catch (error) {
      logger.error("Update customer error:", error)
      next(error)
    }
  }

  /**
   * Delete customer
   * @route DELETE /api/customers/:id
   * @access Private (Admin)
   */
  async deleteCustomer(req, res, next) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const customer = await customerService.deleteCustomer(req.params.id, req.user.id)

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: "Customer not found",
        })
      }

      logger.info(`Customer deleted: ${customer.name} by admin ${req.user.username}`)

      res.json({
        success: true,
        message: "Customer deleted successfully",
      })
    } catch (error) {
      logger.error("Delete customer error:", error)
      next(error)
    }
  }

  /**
   * Search customers
   * @route GET /api/customers/search
   * @access Private (Admin/Manager)
   */
  async searchCustomers(req, res, next) {
    try {
      const { q: searchTerm, limit = 10 } = req.query

      if (!searchTerm) {
        return res.status(400).json({
          success: false,
          message: "Search term is required",
        })
      }

      const customers = await customerService.searchCustomers(searchTerm, parseInt(limit))

      res.json({
        success: true,
        data: { customers },
      })
    } catch (error) {
      logger.error("Search customers error:", error)
      next(error)
    }
  }

  /**
   * Get customer sales history
   * @route GET /api/customers/:id/sales
   * @access Private (Admin/Manager)
   */
  async getCustomerSales(req, res, next) {
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
      }

      const result = await customerService.getCustomerSales(req.params.id, options)

      if (!result) {
        return res.status(404).json({
          success: false,
          message: "Customer not found",
        })
      }

      res.json({
        success: true,
        data: result,
      })
    } catch (error) {
      logger.error("Get customer sales error:", error)
      next(error)
    }
  }
}

module.exports = new CustomerController() 