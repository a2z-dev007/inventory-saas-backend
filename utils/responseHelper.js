/**
 * Success response helper
 * @param {Object} res - Express response object
 * @param {string} message - Success message
 * @param {Object} data - Response data
 * @param {number} statusCode - HTTP status code
 */
const successResponse = (res, message = "Success", data = null, statusCode = 200) => {
  const response = {
    success: true,
    message,
  }

  if (data !== null) {
    response.data = data
  }

  return res.status(statusCode).json(response)
}

/**
 * Error response helper
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {Array} errors - Validation errors
 */
const errorResponse = (res, message = "Error", statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message,
  }

  if (errors) {
    response.errors = errors
  }

  return res.status(statusCode).json(response)
}

/**
 * Pagination response helper
 * @param {Object} res - Express response object
 * @param {Array} data - Data array
 * @param {Object} pagination - Pagination info
 * @param {string} message - Success message
 */
const paginationResponse = (res, data, pagination, message = "Data retrieved successfully") => {
  return res.json({
    success: true,
    message,
    data,
    pagination,
  })
}

/**
 * Created response helper
 * @param {Object} res - Express response object
 * @param {string} message - Success message
 * @param {Object} data - Created data
 */
const createdResponse = (res, message = "Created successfully", data = null) => {
  return successResponse(res, message, data, 201)
}

/**
 * No content response helper
 * @param {Object} res - Express response object
 */
const noContentResponse = (res) => {
  return res.status(204).send()
}

/**
 * Not found response helper
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
const notFoundResponse = (res, message = "Resource not found") => {
  return errorResponse(res, message, 404)
}

/**
 * Unauthorized response helper
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
const unauthorizedResponse = (res, message = "Unauthorized") => {
  return errorResponse(res, message, 401)
}

/**
 * Forbidden response helper
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
const forbiddenResponse = (res, message = "Forbidden") => {
  return errorResponse(res, message, 403)
}

/**
 * Validation error response helper
 * @param {Object} res - Express response object
 * @param {Array} errors - Validation errors
 * @param {string} message - Error message
 */
const validationErrorResponse = (res, errors, message = "Validation failed") => {
  return errorResponse(res, message, 400, errors)
}

/**
 * Conflict response helper
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
const conflictResponse = (res, message = "Conflict") => {
  return errorResponse(res, message, 409)
}

/**
 * Too many requests response helper
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
const tooManyRequestsResponse = (res, message = "Too many requests") => {
  return errorResponse(res, message, 429)
}

module.exports = {
  successResponse,
  errorResponse,
  paginationResponse,
  createdResponse,
  noContentResponse,
  notFoundResponse,
  unauthorizedResponse,
  forbiddenResponse,
  validationErrorResponse,
  conflictResponse,
  tooManyRequestsResponse,
}
