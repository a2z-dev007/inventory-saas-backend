const jwt = require("jsonwebtoken")

/**
 * Generate JWT token
 * @param {string} id - User ID
 * @param {string} expiresIn - Token expiration time
 * @returns {string} JWT token
 */
const generateToken = (id, expiresIn = null) => {
  const payload = { id }

  const options = {
    expiresIn: expiresIn || process.env.JWT_EXPIRE || "7d",
  }

  return jwt.sign(payload, process.env.JWT_SECRET, options)
}

/**
 * Generate refresh token
 * @param {string} id - User ID
 * @returns {string} Refresh token
 */
const generateRefreshToken = (id) => {
  const payload = { id, type: "refresh" }

  const options = {
    expiresIn: "30d", // Refresh tokens last longer
  }

  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, options)
}

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {Object} Decoded token payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET)
}

/**
 * Verify refresh token
 * @param {string} token - Refresh token
 * @returns {Object} Decoded token payload
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET)
}

/**
 * Decode token without verification
 * @param {string} token - JWT token
 * @returns {Object} Decoded token payload
 */
const decodeToken = (token) => {
  return jwt.decode(token)
}

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
  decodeToken,
}
