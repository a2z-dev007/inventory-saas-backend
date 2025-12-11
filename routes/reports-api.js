const express = require("express")
const reportsController = require("../controllers/reportsController")
const { protect, authorize } = require("../middleware/auth")
const { validatePagination } = require("../middleware/validation")

const router = express.Router()

// Apply authentication to all routes
router.use(protect)

/**
 * @swagger
 * /api/reports/sales:
 *   get:
 *     summary: Get sales data for client reports
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *       - in: query
 *         name: customer
 *         schema:
 *           type: string
 *         description: Filter by customer name
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date filter
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date filter
 *       - in: query
 *         name: all
 *         schema:
 *           type: boolean
 *         description: Get all records without pagination
 *     responses:
 *       200:
 *         description: Sales report data
 */
router.get("/sales", validatePagination, reportsController.getSalesReport)

/**
 * @swagger
 * /api/reports/purchases:
 *   get:
 *     summary: Get purchases data for supplier reports
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *       - in: query
 *         name: vendor
 *         schema:
 *           type: string
 *         description: Filter by vendor name
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date filter
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date filter
 *       - in: query
 *         name: all
 *         schema:
 *           type: boolean
 *         description: Get all records without pagination
 *     responses:
 *       200:
 *         description: Purchases report data
 */
router.get("/purchases", validatePagination, reportsController.getPurchasesReport)

/**
 * @swagger
 * /api/reports/suppliers:
 *   get:
 *     summary: Get all suppliers for dropdown
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all suppliers
 */
router.get("/suppliers", reportsController.getSuppliersForReports)

/**
 * @swagger
 * /api/reports/customers:
 *   get:
 *     summary: Get all customers for dropdown
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all customers
 */
router.get("/customers", reportsController.getCustomersForReports)

/**
 * @swagger
 * /api/reports/client/{customerName}:
 *   get:
 *     summary: Get client-specific sales report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerName
 *         required: true
 *         schema:
 *           type: string
 *         description: Customer name
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date filter
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date filter
 *       - in: query
 *         name: all
 *         schema:
 *           type: boolean
 *         description: Get all records without pagination
 *     responses:
 *       200:
 *         description: Client sales report
 */
router.get("/client/:customerName", validatePagination, reportsController.getClientReport)

/**
 * @swagger
 * /api/reports/supplier/{vendorName}:
 *   get:
 *     summary: Get supplier-specific purchases report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: vendorName
 *         required: true
 *         schema:
 *           type: string
 *         description: Vendor name
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date filter
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date filter
 *       - in: query
 *         name: all
 *         schema:
 *           type: boolean
 *         description: Get all records without pagination
 *     responses:
 *       200:
 *         description: Supplier purchases report
 */
router.get("/supplier/:vendorName", validatePagination, reportsController.getSupplierReport)

module.exports = router