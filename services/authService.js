const User = require("../models/User")
const { generateToken } = require("../utils/generateToken")
const bcrypt = require("bcryptjs")

class AuthService {
  /**
   * User registration service
   * @param {Object} userData - User registration data
   * @returns {Object} User data and token
   */
  async register(userData) {
    const { username, password, name, email, role = "staff" } = userData

    // Check if username already exists
    const existingUsername = await User.findOne({ username })
    if (existingUsername) {
      throw new Error("Username already exists")
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email })
    if (existingEmail) {
      throw new Error("Email already exists")
    }

    // Create new user
    const user = new User({
      username,
      password,
      name,
      email,
      role,
      isActive: true,
    })

    await user.save()

    // Generate token
    const token = generateToken(user._id, "7d")

    return {
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
      token,
      expiresIn: "7d",
    }
  }

  /**
   * User login service
   * @param {string} username
   * @param {string} password
   * @param {boolean} rememberMe
   * @param {string} clientIP
   * @returns {Object} User data and token
   */
  async login(username, password, rememberMe = false, clientIP = null) {
    // Check if user exists
    const user = await User.findOne({ username }).select("+password")

    if (!user) {
      throw new Error("Invalid credentials")
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error("Account is deactivated")
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password)

    if (!isPasswordValid) {
      throw new Error("Invalid credentials")
    }

    // Update last login and IP
    user.lastLogin = new Date()
    if (clientIP) {
      user.lastLoginIP = clientIP
    }
    await user.save()

    // Generate token with appropriate expiration
    const tokenExpiry = rememberMe ? "30d" : "7d"
    const token = generateToken(user._id, tokenExpiry)

    return {
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        lastLogin: user.lastLogin,
      },
      token,
      expiresIn: tokenExpiry,
    }
  }

  /**
   * User logout service
   * @param {string} userId
   */
  async logout(userId) {
    // Update user's last logout time
    await User.findByIdAndUpdate(userId, {
      lastLogout: new Date(),
    })

    // In a production environment, you might want to:
    // 1. Add token to blacklist
    // 2. Clear refresh tokens
    // 3. Log security events
  }

  /**
   * Refresh token service
   * @param {string} userId
   * @returns {string} New token
   */
  async refreshToken(userId) {
    const user = await User.findById(userId)

    if (!user || !user.isActive) {
      throw new Error("User not found or inactive")
    }

    return generateToken(userId)
  }

  /**
   * Change password service
   * @param {string} userId
   * @param {string} currentPassword
   * @param {string} newPassword
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select("+password")

    if (!user) {
      throw new Error("User not found")
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword)

    if (!isCurrentPasswordValid) {
      throw new Error("Current password is incorrect")
    }

    // Update password
    user.password = newPassword
    await user.save()
  }

  /**
   * Verify user token
   * @param {string} token
   * @returns {Object} User data
   */
  async verifyToken(token) {
    try {
      const jwt = require("jsonwebtoken")
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      const user = await User.findById(decoded.id).select("-password")

      if (!user || !user.isActive) {
        throw new Error("Invalid token")
      }

      return user
    } catch (error) {
      throw new Error("Invalid token")
    }
  }

  /**
   * Generate password reset token
   * @param {string} email
   * @returns {string} Reset token
   */
  async generatePasswordResetToken(email) {
    const user = await User.findOne({ email })

    if (!user) {
      throw new Error("User not found")
    }

    // Generate reset token (in production, store this in database with expiry)
    const resetToken = require("crypto").randomBytes(32).toString("hex")

    // Store reset token with expiry (implement in User model)
    user.passwordResetToken = resetToken
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000 // 10 minutes
    await user.save()

    return resetToken
  }

  /**
   * Reset password using token
   * @param {string} resetToken
   * @param {string} newPassword
   */
  async resetPassword(resetToken, newPassword) {
    const user = await User.findOne({
      passwordResetToken: resetToken,
      passwordResetExpires: { $gt: Date.now() },
    })

    if (!user) {
      throw new Error("Invalid or expired reset token")
    }

    // Update password and clear reset token
    user.password = newPassword
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save()
  }
}

module.exports = new AuthService()
