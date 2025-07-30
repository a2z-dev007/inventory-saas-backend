const express = require("express")
const router = express.Router()
const saleController = require("../controllers/saleController")
const { protect, authorize } = require("../middleware/auth")
const {
  validateSale,
  validateId,
  validatePagination,
  validateStatusUpdate,
  validateDateRange,
} = require("../middleware/validation")

// Apply authentication to all routes
router.use(protect)
const parseItemsMiddleware = (req, res, next) => {
  if (typeof req.body.items === "string") {
    try {
      req.body.items = JSON.parse(req.body.items);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: "Invalid JSON format for items",
      });
    }
  }
  next();
};

/**
 * @swagger
 * components:
 *   schemas:
 *     Sale:
 *       type: object
 *       required:
 *         - customerName
 *         - items
 *       properties:
 *         customerName:
 *           type: string
 *           description: Customer name
 *         customerEmail:
 *           type: string
 *           format: email
 *           description: Customer email
 *         customerPhone:
 *           type: string
 *           description: Customer phone number
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *                 description: Product ID
 *               quantity:
 *                 type: number
 *                 description: Quantity
 *               unitPrice:
 *                 type: number
 *                 description: Unit price
 *         discount:
 *           type: number
 *           description: Discount amount
 *         paymentMethod:
 *           type: string
 *           enum: [cash, card, bank_transfer, check]
 *           description: Payment method
 *         notes:
 *           type: string
 *           description: Additional notes
 */

/**
 * @swagger
 * /api/sales:
 *   get:
 *     summary: Get all sales with pagination
 *     tags: [Sales]
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
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
 *       - in: query
 *         name: customerName
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
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order
 *     responses:
 *       200:
 *         description: List of sales
 *       401:
 *         description: Unauthorized
 */
router.get("/", authorize("admin", "manager"), validatePagination, validateDateRange, saleController.getSales)

/**
 * @swagger
 * /api/sales/{id}:
 *   get:
 *     summary: Get sale by ID
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Sale ID
 *     responses:
 *       200:
 *         description: Sale details
 *       404:
 *         description: Sale not found
 *       401:
 *         description: Unauthorized
 */
router.get("/:id", authorize("admin", "manager"), validateId, saleController.getSaleById)

/**
 * @swagger
 * /api/sales:
 *   post:
 *     summary: Create new sale
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Sale'
 *     responses:
 *       201:
 *         description: Sale created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post("/", authorize("admin", "manager"),  parseItemsMiddleware, validateSale, saleController.createSale)

/**
 * @swagger
 * /api/sales/{id}:
 *   put:
 *     summary: Update sale
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Sale ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Sale'
 *     responses:
 *       200:
 *         description: Sale updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Sale not found
 *       401:
 *         description: Unauthorized
 */
router.put("/:id", authorize("admin", "manager"),  parseItemsMiddleware, validateId, validateSale, saleController.updateSale)

/**
 * @swagger
 * /api/sales/{id}/status:
 *   put:
 *     summary: Update sale status
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Sale ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, paid, cancelled, refunded]
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Sale not found
 *       401:
 *         description: Unauthorized
 */
router.put("/:id/status", authorize("admin", "manager"), validateId, validateStatusUpdate, saleController.updateSaleStatus)

/**
 * @swagger
 * /api/sales/{id}:
 *   delete:
 *     summary: Delete sale
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Sale ID
 *     responses:
 *       200:
 *         description: Sale deleted successfully
 *       404:
 *         description: Sale not found
 *       401:
 *         description: Unauthorized
 */
router.delete("/:id", authorize("admin"), validateId, saleController.deleteSale)

/**
 * @swagger
 * /api/sales/search:
 *   get:
 *     summary: Search sales
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search term
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of results
 *     responses:
 *       200:
 *         description: Search results
 *       401:
 *         description: Unauthorized
 */
router.get("/search", authorize("admin", "manager"), saleController.searchSales)

module.exports = router 