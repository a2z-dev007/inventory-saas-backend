const express = require("express")
const router = express.Router()
const reportController = require("../controllers/reportController")
const { protect, authorize } = require("../middleware/auth")
const {
  validateId,
  validatePagination,
  validateDateRange,
} = require("../middleware/validation")

// Apply authentication to all routes
router.use(protect)

/**
 * @swagger
 * components:
 *   schemas:
 *     ReportFilters:
 *       type: object
 *       properties:
 *         startDate:
 *           type: string
 *           format: date
 *           description: Start date for report
 *         endDate:
 *           type: string
 *           format: date
 *           description: End date for report
 *         category:
 *           type: string
 *           description: Product category filter
 *         vendor:
 *           type: string
 *           description: Vendor filter
 *         status:
 *           type: string
 *           description: Status filter
 */

/**
 * @swagger
 * /api/reports/dashboard:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *       401:
 *         description: Unauthorized
 */
router.get("/dashboard", authorize("admin", "manager"), reportController.getDashboardStats)

/**
 * @swagger
 * /api/reports/inventory:
 *   get:
 *     summary: Get inventory report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: vendor
 *         schema:
 *           type: string
 *         description: Filter by vendor
 *       - in: query
 *         name: lowStock
 *         schema:
 *           type: boolean
 *         description: Show only low stock items
 *       - in: query
 *         name: outOfStock
 *         schema:
 *           type: boolean
 *         description: Show only out of stock items
 *     responses:
 *       200:
 *         description: Inventory report
 *       401:
 *         description: Unauthorized
 */
router.get("/inventory", authorize("admin", "manager"), reportController.getInventoryReport)

/**
 * @swagger
 * /api/reports/sales:
 *   get:
 *     summary: Get sales report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date
 *       - in: query
 *         name: customerName
 *         schema:
 *           type: string
 *         description: Filter by customer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Sales report
 *       401:
 *         description: Unauthorized
 */
router.get("/sales", authorize("admin", "manager"), validateDateRange, reportController.getSalesReport)

/**
 * @swagger
 * /api/reports/purchases:
 *   get:
 *     summary: Get purchases report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date
 *       - in: query
 *         name: vendor
 *         schema:
 *           type: string
 *         description: Filter by vendor
 *     responses:
 *       200:
 *         description: Purchases report
 *       401:
 *         description: Unauthorized
 */
router.get("/purchases", authorize("admin", "manager"), validateDateRange, reportController.getPurchasesReport)

/**
 * @swagger
 * /api/reports/products:
 *   get:
 *     summary: Get products performance report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of top products
 *     responses:
 *       200:
 *         description: Products performance report
 *       401:
 *         description: Unauthorized
 */
router.get("/products", authorize("admin", "manager"), validateDateRange, reportController.getProductsReport)

/**
 * @swagger
 * /api/reports/customers:
 *   get:
 *     summary: Get customers report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of top customers
 *     responses:
 *       200:
 *         description: Customers report
 *       401:
 *         description: Unauthorized
 */
router.get("/customers", authorize("admin", "manager"), validateDateRange, reportController.getCustomersReport)

/**
 * @swagger
 * /api/reports/vendors:
 *   get:
 *     summary: Get vendors report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of top vendors
 *     responses:
 *       200:
 *         description: Vendors report
 *       401:
 *         description: Unauthorized
 */
router.get("/vendors", authorize("admin", "manager"), validateDateRange, reportController.getVendorsReport)

/**
 * @swagger
 * /api/reports/low-stock:
 *   get:
 *     summary: Get low stock alert report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: threshold
 *         schema:
 *           type: integer
 *         description: Stock threshold for alert
 *     responses:
 *       200:
 *         description: Low stock alert report
 *       401:
 *         description: Unauthorized
 */
router.get("/low-stock", authorize("admin", "manager"), reportController.getLowStockReport)

/**
 * @swagger
 * /api/reports/export/{type}:
 *   get:
 *     summary: Export report to CSV/Excel
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [inventory, sales, purchases, products, customers, vendors]
 *         description: Report type
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [csv, excel]
 *         description: Export format
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date
 *     responses:
 *       200:
 *         description: Report exported successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/export/:type", authorize("admin", "manager"), validateDateRange, reportController.exportReport)

module.exports = router 