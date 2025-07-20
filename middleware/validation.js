const { body, param, query, validationResult } = require("express-validator")

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    })
  }
  next()
}

// User validation rules
const validateUser = [
  body("username")
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores"),

  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),

  body("role").isIn(["admin", "manager", "staff"]).withMessage("Role must be admin, manager, or staff"),

  body("name").trim().isLength({ min: 1, max: 100 }).withMessage("Name is required and cannot exceed 100 characters"),

  body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),

  handleValidationErrors,
]

// User registration validation rules
const validateRegister = [
  body("username")
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("Password must contain at least one uppercase letter, one lowercase letter, and one number"),

  body("name")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Name is required and cannot exceed 100 characters"),

  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),

  body("role")
    .optional()
    .isIn(["admin", "manager", "staff"])
    .withMessage("Role must be admin, manager, or staff"),

  handleValidationErrors,
]

// User update validation rules (password not required)
const validateUserUpdate = [
  body("username")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores"),

  body("role").optional().isIn(["admin", "manager", "staff"]).withMessage("Role must be admin, manager, or staff"),

  body("name").optional().isString().trim().isLength({ min: 1, max: 100 }).withMessage("Name cannot exceed 100 characters"),

  body("email").optional().isEmail().normalizeEmail().withMessage("Please provide a valid email"),

  body("isActive").optional().isBoolean().withMessage("isActive must be a boolean"),

  handleValidationErrors,
]

// Product validation rules
const validateProduct = [
  body("name")
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage("Product name is required and cannot exceed 200 characters"),

  body("sku").trim().isLength({ min: 1, max: 50 }).withMessage("SKU is required and cannot exceed 50 characters"),

  body("purchaseRate").isFloat({ min: 0 }).withMessage("Purchase rate must be a positive number"),

  body("salesRate").isFloat({ min: 0 }).withMessage("Sales rate must be a positive number"),

  body("currentStock").optional().isInt({ min: 0 }).withMessage("Current stock must be a non-negative integer"),

  body("category")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Category is required and cannot exceed 100 characters"),

  body("vendor")
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage("Vendor is required and cannot exceed 200 characters"),

  body("description")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description cannot exceed 1000 characters"),

  body("minStockLevel").optional().isInt({ min: 0 }).withMessage("Minimum stock level must be a non-negative integer"),

  handleValidationErrors,
]

// Login validation rules
const validateLogin = [
  body("username").trim().notEmpty().withMessage("Username is required"),

  body("password").notEmpty().withMessage("Password is required"),

  body("rememberMe").optional().isBoolean().withMessage("Remember me must be a boolean"),

  handleValidationErrors,
]

// Change password validation rules
const validateChangePassword = [
  body("currentPassword").notEmpty().withMessage("Current password is required"),

  body("newPassword").isLength({ min: 6 }).withMessage("New password must be at least 6 characters long"),

  handleValidationErrors,
]

// Stock update validation rules
const validateStockUpdate = [
  body("quantity").isInt({ min: 1 }).withMessage("Quantity must be a positive integer"),

  body("type").isIn(["add", "subtract", "set"]).withMessage("Type must be add, subtract, or set"),

  body("reason").optional().isString().trim().isLength({ max: 500 }).withMessage("Reason cannot exceed 500 characters"),

  handleValidationErrors,
]

// Bulk update validation rules
const validateBulkUpdate = [
  body("productIds").isArray({ min: 1 }).withMessage("Product IDs array is required"),

  body("productIds.*").isMongoId().withMessage("Each product ID must be valid"),

  body("updateData").isObject().withMessage("Update data must be an object"),

  handleValidationErrors,
]

// Purchase Order validation rules
const validatePurchaseOrder = [
  body("vendor").trim().notEmpty().withMessage("Vendor is required"),

  body("items").isArray({ min: 1 }).withMessage("At least one item is required"),

  body("items.*.productId").isMongoId().withMessage("Valid product ID is required"),

  body("items.*.quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),

  body("items.*.unitPrice").isFloat({ min: 0 }).withMessage("Unit price must be a positive number"),

  body("expectedDeliveryDate").optional().isISO8601().withMessage("Expected delivery date must be a valid date"),

  body("notes").optional().isString().trim().isLength({ max: 1000 }).withMessage("Notes cannot exceed 1000 characters"),

  handleValidationErrors,
]

// Sale validation rules
const validateSale = [
  body("customerName").trim().notEmpty().withMessage("Customer name is required"),

  body("customerEmail").optional().isEmail().normalizeEmail().withMessage("Please provide a valid email"),

  body("customerPhone").optional().trim().isMobilePhone().withMessage("Please provide a valid phone number"),

  body("items").isArray({ min: 1 }).withMessage("At least one item is required"),

  body("items.*.productId").isMongoId().withMessage("Valid product ID is required"),

  body("items.*.quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),

  body("items.*.unitPrice").isFloat({ min: 0 }).withMessage("Unit price must be a positive number"),

  body("discount").optional().isFloat({ min: 0 }).withMessage("Discount must be a positive number"),

  body("paymentMethod")
    .optional()
    .isIn(["cash", "card", "bank_transfer", "check"])
    .withMessage("Invalid payment method"),

  body("notes").optional().isString().trim().isLength({ max: 1000 }).withMessage("Notes cannot exceed 1000 characters"),

  handleValidationErrors,
]

// Purchase validation rules
const validatePurchase = [
  body("vendor").trim().notEmpty().withMessage("Vendor is required"),

  body("items").isArray({ min: 1 }).withMessage("At least one item is required"),

  body("items.*.productId").isMongoId().withMessage("Valid product ID is required"),

  body("items.*.quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),

  body("items.*.unitPrice").isFloat({ min: 0 }).withMessage("Unit price must be a positive number"),

  body("invoiceFile").optional().isString().trim().withMessage("Invoice file must be a string"),

  body("notes").optional().isString().trim().isLength({ max: 1000 }).withMessage("Notes cannot exceed 1000 characters"),

  body("relatedPO").optional().isMongoId().withMessage("Related PO must be a valid ID"),

  handleValidationErrors,
]

// Vendor validation rules
const validateVendor = [
  body("name")
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage("Vendor name is required and cannot exceed 200 characters"),

  body("contact")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Contact person is required and cannot exceed 100 characters"),

  body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),

  body("phone").trim().notEmpty().withMessage("Phone number is required"),

  body("address")
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage("Address is required and cannot exceed 500 characters"),

  body("website").optional().isString().isURL().withMessage("Please provide a valid website URL"),

  body("paymentTerms")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Payment terms cannot exceed 100 characters"),

  body("notes").optional().isString().trim().isLength({ max: 1000 }).withMessage("Notes cannot exceed 1000 characters"),

  handleValidationErrors,
]

// Customer validation rules
const validateCustomer = [
  body("name")
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage("Customer name is required and cannot exceed 200 characters"),

  body("contact")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Contact person is required and cannot exceed 100 characters"),

  body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),

  body("phone").trim().notEmpty().withMessage("Phone number is required"),

  body("address")
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage("Address is required and cannot exceed 500 characters"),

  body("company").optional().isString().trim().isLength({ max: 200 }).withMessage("Company name cannot exceed 200 characters"),

  body("creditLimit").optional().isFloat({ min: 0 }).withMessage("Credit limit must be a positive number"),

  body("notes").optional().isString().trim().isLength({ max: 1000 }).withMessage("Notes cannot exceed 1000 characters"),

  handleValidationErrors,
]

// ID parameter validation
const validateId = [
  param("id").isMongoId().withMessage("Invalid ID format"),

  handleValidationErrors,
]

// Pagination validation
const validatePagination = [
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),

  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),

  query("sortBy").optional().trim().isLength({ min: 1 }).withMessage("Sort by field is required"),

  query("sortOrder").optional().isIn(["asc", "desc"]).withMessage("Sort order must be asc or desc"),

  handleValidationErrors,
]

// Status update validation
const validateStatusUpdate = [
  body("status").notEmpty().withMessage("Status is required"),

  body("reason").optional().isString().trim().isLength({ max: 500 }).withMessage("Reason cannot exceed 500 characters"),

  handleValidationErrors,
]

// Date range validation
const validateDateRange = [
  query("startDate").optional().isISO8601().withMessage("Start date must be a valid date"),

  query("endDate").optional().isISO8601().withMessage("End date must be a valid date"),

  handleValidationErrors,
]

module.exports = {
  validateUser,
  validateRegister,
  validateUserUpdate,
  validateProduct,
  validateLogin,
  validateChangePassword,
  validateStockUpdate,
  validateBulkUpdate,
  validatePurchaseOrder,
  validateSale,
  validatePurchase,
  validateVendor,
  validateCustomer,
  validateId,
  validatePagination,
  validateStatusUpdate,
  validateDateRange,
  handleValidationErrors,
}
