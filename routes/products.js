const express = require("express");
const productController = require("../controllers/productController");
const { protect, authorize } = require("../middleware/auth");
const {
  validateProduct,
  validateId,
  validatePagination,
  validateStockUpdate,
  validateBulkUpdate,
} = require("../middleware/validation");

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products with pagination and search
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for product name or category
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
 *         description: Filter products with low stock
 *     responses:
 *       200:
 *         description: List of products
 */
router.get("/", validatePagination, productController.getProducts);

/**
 * @swagger
 * /api/products/categories:
 *   get:
 *     summary: Get product categories
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of categories
 */
// router.get("/categories", productController.getCategories)

/**
 * @swagger
 * /api/products/low-stock:
 *   get:
 *     summary: Get low stock products
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of low stock products
 */
router.get("/low-stock", productController.getLowStockProducts);

/**
 * @swagger
 * /api/products/bulk-update:
 *   patch:
 *     summary: Bulk update products
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productIds
 *               - updateData
 *             properties:
 *               productIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               updateData:
 *                 type: object
 *     responses:
 *       200:
 *         description: Products updated successfully
 */
router.patch(
  "/bulk-update",
  authorize("admin", "manager"),
  validateBulkUpdate,
  productController.bulkUpdateProducts
);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product data
 *       404:
 *         description: Product not found
 */
router.get("/:id", validateId, productController.getProductById);

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create new product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - sku
 *               - purchaseRate
 *               - salesRate
 *               - category
 *               - vendor
 *             properties:
 *               name:
 *                 type: string
 *               sku:
 *                 type: string
 *               purchaseRate:
 *                 type: number
 *               salesRate:
 *                 type: number
 *               currentStock:
 *                 type: number
 *               category:
 *                 type: string
 *               vendor:
 *                 type: string
 *               description:
 *                 type: string
 *               minStockLevel:
 *                 type: number
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Validation error
 */
router.post(
  "/",
  authorize("admin", "manager"),
  validateProduct,
  productController.createProduct
);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               sku:
 *                 type: string
 *               purchaseRate:
 *                 type: number
 *               salesRate:
 *                 type: number
 *               currentStock:
 *                 type: number
 *               category:
 *                 type: string
 *               vendor:
 *                 type: string
 *               description:
 *                 type: string
 *               minStockLevel:
 *                 type: number
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       404:
 *         description: Product not found
 */
router.put(
  "/:id",
  authorize("admin", "manager"),
  validateId,
  productController.updateProduct
);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete product (soft delete)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 */
router.delete(
  "/:id",
  authorize("admin"),
  validateId,
  productController.deleteProduct
);

/**
 * @swagger
 * /api/products/{id}/stock:
 *   patch:
 *     summary: Update product stock
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *               - type
 *             properties:
 *               quantity:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [add, subtract, set]
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Stock updated successfully
 */
router.patch(
  "/:id/stock",
  authorize("admin", "manager"),
  validateId,
  validateStockUpdate,
  productController.updateStock
);

module.exports = router;
