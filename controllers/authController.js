const authService = require("../services/authService")
const userService = require("../services/userService")
const logger = require("../utils/logger")
const { validationResult } = require("express-validator")

class AuthController {
  /**
   * User registration
   * @route POST /api/auth/register
   * @access Public
   */
  async register(req, res, next) {
    try {
      // Check validation errors
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const { username, password, name, email, role } = req.body
      const clientIP = req.ip || req.connection.remoteAddress

      const result = await authService.register({
        username,
        password,
        name,
        email,
        role,
      })

      logger.info(`New user registered: ${username} from IP: ${clientIP}`)

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: result,
      })
    } catch (error) {
      logger.error("Registration error:", error)

      if (error.message === "Username already exists" || error.message === "Email already exists") {
        return res.status(409).json({
          success: false,
          message: error.message,
        })
      }

      next(error)
    }
  }

  /**
   * User login
   * @route POST /api/auth/login
   * @access Public
   */
  async login(req, res, next) {
    try {
      // Check validation errors
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const { username, password, rememberMe } = req.body
      const clientIP = req.ip || req.connection.remoteAddress

      const result = await authService.login(username, password, rememberMe, clientIP)

      logger.info(`User ${username} logged in successfully from IP: ${clientIP}`)

      res.json({
        success: true,
        message: "Login successful",
        data: result,
      })
    } catch (error) {
      logger.error("Login error:", error)

      if (error.message === "Invalid credentials" || error.message === "Account is deactivated") {
        return res.status(401).json({
          success: false,
          message: error.message,
        })
      }

      next(error)
    }
  }

  /**
   * User logout
   * @route POST /api/auth/logout
   * @access Private
   */
  async logout(req, res, next) {
    try {
      await authService.logout(req.user.id)

      logger.info(`User ${req.user.username} logged out`)

      res.json({
        success: true,
        message: "Logout successful",
      })
    } catch (error) {
      logger.error("Logout error:", error)
      next(error)
    }
  }

  /**
   * Get current user
   * @route GET /api/auth/me
   * @access Private
   */
  async getCurrentUser(req, res, next) {
    try {
      const user = await userService.getUserById(req.user.id)

      res.json({
        success: true,
        data: { user },
      })
    } catch (error) {
      logger.error("Get current user error:", error)
      next(error)
    }
  }

  /**
   * Refresh token
   * @route POST /api/auth/refresh
   * @access Private
   */
  async refreshToken(req, res, next) {
    try {
      const newToken = await authService.refreshToken(req.user.id)

      res.json({
        success: true,
        message: "Token refreshed successfully",
        data: { token: newToken },
      })
    } catch (error) {
      logger.error("Refresh token error:", error)
      next(error)
    }
  }

  /**
   * Change password
   * @route PUT /api/auth/change-password
   * @access Private
   */
  async changePassword(req, res, next) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const { currentPassword, newPassword } = req.body

      await authService.changePassword(req.user.id, currentPassword, newPassword)

      logger.info(`Password changed for user ${req.user.username}`)

      res.json({
        success: true,
        message: "Password changed successfully",
      })
    } catch (error) {
      logger.error("Change password error:", error)

      if (error.message === "Current password is incorrect") {
        return res.status(400).json({
          success: false,
          message: error.message,
        })
      }

      next(error)
    }
  }
}

module.exports = new AuthController()
