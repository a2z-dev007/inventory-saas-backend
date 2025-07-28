const express = require("express")
const router = express.Router()
const purchaseController = require("../controllers/purchaseController")
const { protect, authorize } = require("../middleware/auth")
const {
  validatePurchase,
  validateId,
  validatePagination,
  validateStatusUpdate,
  validateDateRange,
} = require("../middleware/validation")
const multer = require("multer")
const path = require("path")
// const createUploadMiddleware = require("../utils/uploadFile");
const createImageUploader = require("../utils/imageUploader");
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

// Multer storage config
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, path.join(__dirname, "../uploads"))
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
//     cb(null, uniqueSuffix + "-" + file.originalname)
//   },
// })

// const upload = multer({
//   storage: storage,
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
//   fileFilter: function (req, file, cb) {
//     const allowedTypes = ["image/jpeg", "image/png", "application/pdf"]
//     if (allowedTypes.includes(file.mimetype)) {
//       cb(null, true)
//     } else {
//       cb(new Error("Invalid file type. Only JPEG, PNG, and PDF are allowed."))
//     }
//   },
// })
// const uploadInvoice = createUploadMiddleware("invoices", "invoiceFile");
const uploadInvoice = createImageUploader({
  folder: "uploads/invoices", // custom folder if needed
  fieldName: "invoiceFile", // match your frontend FormData
});
/**
 * @swagger
 * components:
 *   schemas:
 *     Purchase:
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
 *         invoiceFile:
 *           type: string
 *           description: Invoice file path
 *         notes:
 *           type: string
 *           description: Additional notes
 *         relatedPO:
 *           type: string
 *           description: Related purchase order ID
 */

/**
 * @swagger
 * /api/purchases:
 *   get:
 *     summary: Get all purchases with pagination
 *     tags: [Purchases]
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
 *         description: List of purchases
 *       401:
 *         description: Unauthorized
 */
router.get("/", authorize("admin", "manager"), validatePagination, validateDateRange, purchaseController.getPurchases)

/**
 * @swagger
 * /api/purchases/{id}:
 *   get:
 *     summary: Get purchase by ID
 *     tags: [Purchases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Purchase ID
 *     responses:
 *       200:
 *         description: Purchase details
 *       404:
 *         description: Purchase not found
 *       401:
 *         description: Unauthorized
 */
router.get("/:id", authorize("admin", "manager"), validateId, purchaseController.getPurchaseById)

/**
 * @swagger
 * /api/purchases:
 *   post:
 *     summary: Create new purchase
 *     tags: [Purchases]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Purchase'
 *     responses:
 *       201:
 *         description: Purchase created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post("/", 
  authorize("admin", "manager"),
  uploadInvoice,
  parseItemsMiddleware,
  validatePurchase, 
  purchaseController.createPurchase
);

/**
 * @swagger
 * /api/purchases/{id}:
 *   put:
 *     summary: Update purchase
 *     tags: [Purchases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Purchase ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Purchase'
 *     responses:
 *       200:
 *         description: Purchase updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Purchase not found
 *       401:
 *         description: Unauthorized
 */
router.put("/:id", authorize("admin", "manager"), uploadInvoice, validateId, validatePurchase, purchaseController.updatePurchase)

/**
 * @swagger
 * /api/purchases/{id}:
 *   delete:
 *     summary: Delete purchase
 *     tags: [Purchases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Purchase ID
 *     responses:
 *       200:
 *         description: Purchase deleted successfully
 *       404:
 *         description: Purchase not found
 *       401:
 *         description: Unauthorized
 */
router.delete("/:id", authorize("admin"), validateId, purchaseController.deletePurchase)

/**
 * @swagger
 * /api/purchases/search:
 *   get:
 *     summary: Search purchases
 *     tags: [Purchases]
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
router.get("/search", authorize("admin", "manager"), purchaseController.searchPurchases)

module.exports = router 