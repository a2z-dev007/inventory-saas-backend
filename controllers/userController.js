const userService = require("../services/userService")
const logger = require("../utils/logger")
const { validationResult } = require("express-validator")

class UserController {
  /**
   * Get all users with pagination and search
   * @route GET /api/users
   * @access Private (Admin/Manager)
   */
  async getUsers(req, res, next) {
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
        role: req.query.role,
        sortBy: req.query.sortBy || "createdAt",
        sortOrder: req.query.sortOrder || "desc",
      }

      const result = await userService.getUsers(options)

      res.json({
        success: true,
        data: result,
      })
    } catch (error) {
      logger.error("Get users error:", error)
      next(error)
    }
  }

  /**
   * Get user by ID
   * @route GET /api/users/:id
   * @access Private (Admin/Manager)
   */
  async getUserById(req, res, next) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const user = await userService.getUserById(req.params.id)

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        })
      }

      res.json({
        success: true,
        data: { user },
      })
    } catch (error) {
      logger.error("Get user error:", error)
      next(error)
    }
  }

  /**
   * Create new user
   * @route POST /api/users
   * @access Private (Admin)
   */
  async createUser(req, res, next) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const userData = {
        ...req.body,
        createdBy: req.user.id,
      }

      const user = await userService.createUser(userData)

      logger.info(`User created: ${user.username} by admin ${req.user.username}`)

      res.status(201).json({
        success: true,
        message: "User created successfully",
        data: { user },
      })
    } catch (error) {
      logger.error("Create user error:", error)

      if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0]
        return res.status(400).json({
          success: false,
          message: `${field} already exists`,
        })
      }

      next(error)
    }
  }

  /**
   * Update user
   * @route PUT /api/users/:id
   * @access Private (Admin)
   */
  async updateUser(req, res, next) {
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

      const user = await userService.updateUser(req.params.id, updateData)

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        })
      }

      logger.info(`User updated: ${user.username} by admin ${req.user.username}`)

      res.json({
        success: true,
        message: "User updated successfully",
        data: { user },
      })
    } catch (error) {
      logger.error("Update user error:", error)
      next(error)
    }
  }

  /**
   * Delete user (soft delete)
   * @route DELETE /api/users/:id
   * @access Private (Admin)
   */
  async deleteUser(req, res, next) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      // Prevent self-deletion
      if (req.params.id === req.user.id.toString()) {
        return res.status(400).json({
          success: false,
          message: "Cannot delete your own account",
        })
      }

      const user = await userService.deleteUser(req.params.id, req.user.id)

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        })
      }

      logger.info(`User deleted: ${user.username} by admin ${req.user.username}`)

      res.json({
        success: true,
        message: "User deleted successfully",
      })
    } catch (error) {
      logger.error("Delete user error:", error)
      next(error)
    }
  }

  /**
   * Get user statistics
   * @route GET /api/users/stats
   * @access Private (Admin/Manager)
   */
  async getUserStats(req, res, next) {
    try {
      const stats = await userService.getUserStats()

      res.json({
        success: true,
        data: { stats },
      })
    } catch (error) {
      logger.error("Get user stats error:", error)
      next(error)
    }
  }

  /**
   * Toggle user status
   * @route PATCH /api/users/:id/toggle-status
   * @access Private (Admin)
   */
  async toggleUserStatus(req, res, next) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const user = await userService.toggleUserStatus(req.params.id, req.user.id)

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        })
      }

      logger.info(`User status toggled: ${user.username} by admin ${req.user.username}`)

      res.json({
        success: true,
        message: `User ${user.isActive ? "activated" : "deactivated"} successfully`,
        data: { user },
      })
    } catch (error) {
      logger.error("Toggle user status error:", error)
      next(error)
    }
  }
}

module.exports = new UserController()
