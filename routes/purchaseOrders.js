const express = require("express");
const createFileUploader = require("../utils/createFileUploader");

const router = express.Router();
const purchaseOrderController = require("../controllers/purchaseOrderController");
const { protect, authorize } = require("../middleware/auth");
const {
  validatePurchaseOrder,
  validateId,
  validatePagination,
  validateStatusUpdate,
  validateDateRange,
} = require("../middleware/validation");

// Apply authentication to all routes
router.use(protect);

/**
 * @swagger
 * components:
 *   schemas:
 *     PurchaseOrder:
 *       type: object
 *       required:
 *         - vendor
 *         - items
 *       properties:
 *         vendor:
 *           type: string
 *           description: Vendor name
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
 *         expectedDeliveryDate:
 *           type: string
 *           format: date
 *           description: Expected delivery date
 *         notes:
 *           type: string
 *           description: Additional notes
 */

/**
 * @swagger
 * /api/purchase-orders:
 *   get:
 *     summary: Get all purchase orders with pagination
 *     tags: [Purchase Orders]
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
 *         name: vendor
 *         schema:
 *           type: string
 *         description: Filter by vendor
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
 *         description: List of purchase orders
 *       401:
 *         description: Unauthorized
 */

router.get('/recycle-bin', purchaseOrderController.getDeletedPurchaseOrders);
router.get(
  "/",
  authorize("admin", "manager"),
  validatePagination,
  validateDateRange,
  purchaseOrderController.getPurchaseOrders
);

/**
 * @swagger
 * /api/purchase-orders/{id}:
 *   get:
 *     summary: Get purchase order by ID or ref_num
 *     tags: [Purchase Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Purchase order ID or ref_num
 *     responses:
 *       200:
 *         description: Purchase order details
 *       404:
 *         description: Purchase order not found
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/:id",
  authorize("admin", "manager"),
  validateId,
  purchaseOrderController.getPurchaseOrderById
);

/**
 * @swagger
 * /api/purchase-orders:
 *   post:
 *     summary: Create new purchase order
 *     tags: [Purchase Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PurchaseOrder'
 *     responses:
 *       201:
 *         description: Purchase order created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */

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


const uploadImage = createFileUploader({
  folder: "uploads/purchase-orders", // custom folder if needed
  fieldName: "attachment", // match your frontend FormData
  maxSize: 10 * 1024 * 1024, // 10MB
});
router.post(
  "/",
  authorize("admin", "manager"),
  uploadImage,               // 1. multer handles form-data
  parseItemsMiddleware,      // 2. convert string to array
  validatePurchaseOrder,     // 3. validate now that items is real array
  purchaseOrderController.createPurchaseOrder
);

/**
 * @swagger
 * /api/purchase-orders/{id}:
 *   put:
 *     summary: Update purchase order by ID or ref_num
 *     tags: [Purchase Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Purchase order ID or ref_num
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PurchaseOrder'
 *     responses:
 *       200:
 *         description: Purchase order updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Purchase order not found
 *       401:
 *         description: Unauthorized
 */
router.put(
  "/:id",
  authorize("admin", "manager"),
  uploadImage,               // 1. multer handles form-data
  parseItemsMiddleware,      // 2. convert string to array
  validatePurchaseOrder,     // 3. validate now that items is real array
  purchaseOrderController.updatePurchaseOrder
);

/**
 * @swagger
 * /api/purchase-orders/{id}/status:
 *   put:
 *     summary: Update purchase order status
 *     tags: [Purchase Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Purchase order ID
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
 *                 enum: [draft, pending, approved, delivered, cancelled]
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Purchase order not found
 *       401:
 *         description: Unauthorized
 */
router.put(
  "/:id/status",
  authorize("admin", "manager"),
  validateId,
  validateStatusUpdate,
  purchaseOrderController.updatePurchaseOrderStatus
);

/**
 * @swagger
 * /api/purchase-orders/{id}:
 *   delete:
 *     summary: Delete purchase order by ID or ref_num
 *     tags: [Purchase Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Purchase order ID or ref_num
 *     responses:
 *       200:
 *         description: Purchase order deleted successfully
 *       404:
 *         description: Purchase order not found
 *       401:
 *         description: Unauthorized
 */
router.delete(
  "/:id",
  authorize("admin"),
  validateId,
  purchaseOrderController.deletePurchaseOrder
);

// restore 
router.put(
  "/:id/restore",
  authorize("admin"),
  validateId,
  purchaseOrderController.restorePurchaseOrder
);




/**
 * @swagger
 * /api/purchase-orders/search:
 *   get:
 *     summary: Search purchase orders
 *     tags: [Purchase Orders]
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
router.get(
  "/search",
  authorize("admin", "manager"),
  purchaseOrderController.searchPurchaseOrders
);

module.exports = router;
