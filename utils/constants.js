// User roles
const USER_ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  STAFF: "staff",
}

// Currency configuration
const CURRENCY_CONFIG = {
  SYMBOL: "₹",
  CODE: "INR",
  NAME: "Indian Rupee",
  LOCALE: "en-IN",
  DECIMAL_PLACES: 2,
}

// Currency formatting utility
const formatCurrency = (amount) => {
  if (typeof amount !== 'number') return CURRENCY_CONFIG.SYMBOL + '0.00';
  
  return CURRENCY_CONFIG.SYMBOL + amount.toLocaleString(CURRENCY_CONFIG.LOCALE, {
    minimumFractionDigits: CURRENCY_CONFIG.DECIMAL_PLACES,
    maximumFractionDigits: CURRENCY_CONFIG.DECIMAL_PLACES
  });
}

// Purchase order statuses
const PO_STATUSES = {
  DRAFT: "draft",
  PENDING: "pending",
  APPROVED: "approved",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
}

// Sale statuses
const SALE_STATUSES = {
  PENDING: "pending",
  PAID: "paid",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
}

// Payment methods
const PAYMENT_METHODS = {
  CASH: "cash",
  CARD: "card",
  BANK_TRANSFER: "bank_transfer",
  CHECK: "check",
}

// Stock update types
const STOCK_UPDATE_TYPES = {
  ADD: "add",
  SUBTRACT: "subtract",
  SET: "set",
}

// Sort orders
const SORT_ORDERS = {
  ASC: "asc",
  DESC: "desc",
}

// Default pagination
const DEFAULT_PAGINATION = {
  PAGE: 1,
  LIMIT: 10,
  MAX_LIMIT: 100,
}

// File upload limits
const FILE_LIMITS = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ["image/jpeg", "image/png", "application/pdf"],
}

// Cache TTL (Time To Live) in seconds
const CACHE_TTL = {
  SHORT: 300, // 5 minutes
  MEDIUM: 1800, // 30 minutes
  LONG: 3600, // 1 hour
}

// Error messages
const ERROR_MESSAGES = {
  VALIDATION_FAILED: "Validation failed",
  UNAUTHORIZED: "Unauthorized access",
  FORBIDDEN: "Access forbidden",
  NOT_FOUND: "Resource not found",
  CONFLICT: "Resource already exists",
  INTERNAL_ERROR: "Internal server error",
  INVALID_CREDENTIALS: "Invalid credentials",
  ACCOUNT_DEACTIVATED: "Account is deactivated",
  TOKEN_EXPIRED: "Token has expired",
  INVALID_TOKEN: "Invalid token",
}

// Success messages
const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: "Login successful",
  LOGOUT_SUCCESS: "Logout successful",
  CREATED: "Resource created successfully",
  UPDATED: "Resource updated successfully",
  DELETED: "Resource deleted successfully",
  PASSWORD_CHANGED: "Password changed successfully",
  TOKEN_REFRESHED: "Token refreshed successfully",
}

// Database collection names
const COLLECTIONS = {
  USERS: "users",
  PRODUCTS: "products",
  PURCHASE_ORDERS: "purchaseorders",
  SALES: "sales",
  PURCHASES: "purchases",
  VENDORS: "vendors",
  CUSTOMERS: "customers",
  STOCK_MOVEMENTS: "stockmovements",
}

// Email templates
const EMAIL_TEMPLATES = {
  WELCOME: "welcome",
  PASSWORD_RESET: "password_reset",
  ORDER_CONFIRMATION: "order_confirmation",
  LOW_STOCK_ALERT: "low_stock_alert",
}

// Report types
const REPORT_TYPES = {
  SALES: "sales",
  PURCHASES: "purchases",
  INVENTORY: "inventory",
  PROFIT_LOSS: "profit_loss",
  STOCK_MOVEMENT: "stock_movement",
}

function getAttachmentUrl(relativePath) {
  if (!relativePath) return null;

  // If already a full URL, return as-is
  if (relativePath.startsWith("http://") || relativePath.startsWith("https://")) {
    return relativePath;
  }

  // Use the API_URL from environment or default to localhost
  const baseApiUrl = process.env.API_URL || "http://localhost:8080/api";
  // Remove /api from the end to get the base URL
  const baseStaticUrl = baseApiUrl.replace(/\/api$/, "");

  // Ensure relativePath starts with a slash
  const normalizedPath = relativePath.startsWith("/") ? relativePath : `/${relativePath}`;
  
  // For debugging
  console.log(`Generating attachment URL: Base=${baseStaticUrl}, Path=${normalizedPath}`);
  
  return `${baseStaticUrl}${normalizedPath}`;
}

// Date formats
const DATE_FORMATS = {
  ISO: "YYYY-MM-DDTHH:mm:ss.SSSZ",
  DATE_ONLY: "YYYY-MM-DD",
  DISPLAY: "DD/MM/YYYY",
  DISPLAY_WITH_TIME: "DD/MM/YYYY HH:mm",
}

module.exports = {
  USER_ROLES,
  CURRENCY_CONFIG,
  formatCurrency,
  PO_STATUSES,
  SALE_STATUSES,
  PAYMENT_METHODS,
  STOCK_UPDATE_TYPES,
  SORT_ORDERS,
  DEFAULT_PAGINATION,
  FILE_LIMITS,
  CACHE_TTL,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  COLLECTIONS,
  EMAIL_TEMPLATES,
  REPORT_TYPES,
  DATE_FORMATS,
  getAttachmentUrl,
}


