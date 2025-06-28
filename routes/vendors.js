const express = require("express")
const Vendor = require("../models/Vendor")
const { protect, authorize } = require("../middleware/auth")
const { validateVendor, validateId, validatePagination } = require("../middleware/validation")
const logger = require("../utils/logger")

const router = express.Router()

// Apply authentication to all routes
router.use(protect)

/**
 * @swagger
 * /api/vendors:
 *   get:
 *     summary: Get all vendors with pagination
 *     tags: [Vendors]
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
 *         description: Search by vendor name or contact
 *     responses:
 *       200:
 *         description: List of vendors
 */
router.get("/", validatePagination, async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    // Build query
    const query = { isActive: true }

    // Search functionality
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: "i" } },
        { contact: { $regex: req.query.search, $options: "i" } },
        { email: { $regex: req.query.search, $options: "i" } },
      ]
    }

    const vendors = await Vendor.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit)

    const total = await Vendor.countDocuments(query)

    res.json({
      success: true,
      data: {
        vendors,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    logger.error("Get vendors error:", error)
    res.status(500).json({
      success: false,
      message: "Server error while fetching vendors",
    })
  }
})

/**
 * @swagger
 * /api/vendors/{id}:
 *   get:
 *     summary: Get vendor by ID
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Vendor ID
 *     responses:
 *       200:
 *         description: Vendor data
 *       404:
 *         description: Vendor not found
 */
router.get("/:id", validateId, async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id)

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      })
    }

    res.json({
      success: true,
      data: { vendor },
    })
  } catch (error) {
    logger.error("Get vendor error:", error)
    res.status(500).json({
      success: false,
      message: "Server error while fetching vendor",
    })
  }
})

/**
 * @swagger
 * /api/vendors:
 *   post:
 *     summary: Create new vendor
 *     tags: [Vendors]
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
 *               - contact
 *               - email
 *               - phone
 *               - address
 *             properties:
 *               name:
 *                 type: string
 *               contact:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               website:
 *                 type: string
 *               taxId:
 *                 type: string
 *               paymentTerms:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Vendor created successfully
 *       400:
 *         description: Validation error
 */
router.post("/", authorize("admin", "manager"), validateVendor, async (req, res) => {
  try {
    const vendor = new Vendor(req.body)
    await vendor.save()

    logger.info(`Vendor created: ${vendor.name} by user ${req.user.username}`)

    res.status(201).json({
      success: true,
      message: "Vendor created successfully",
      data: { vendor },
    })
  } catch (error) {
    logger.error("Create vendor error:", error)
    res.status(500).json({
      success: false,
      message: "Server error while creating vendor",
    })
  }
})

/**
 * @swagger
 * /api/vendors/{id}:
 *   put:
 *     summary: Update vendor
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Vendor ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               contact:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               website:
 *                 type: string
 *               taxId:
 *                 type: string
 *               paymentTerms:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Vendor updated successfully
 *       404:
 *         description: Vendor not found
 */
router.put("/:id", authorize("admin", "manager"), validateId, async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      })
    }

    logger.info(`Vendor updated: ${vendor.name} by user ${req.user.username}`)

    res.json({
      success: true,
      message: "Vendor updated successfully",
      data: { vendor },
    })
  } catch (error) {
    logger.error("Update vendor error:", error)
    res.status(500).json({
      success: false,
      message: "Server error while updating vendor",
    })
  }
})

/**
 * @swagger
 * /api/vendors/{id}:
 *   delete:
 *     summary: Delete vendor (soft delete)
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Vendor ID
 *     responses:
 *       200:
 *         description: Vendor deleted successfully
 *       404:
 *         description: Vendor not found
 */
router.delete("/:id", authorize("admin"), validateId, async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true })

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      })
    }

    logger.info(`Vendor deleted: ${vendor.name} by user ${req.user.username}`)

    res.json({
      success: true,
      message: "Vendor deleted successfully",
    })
  } catch (error) {
    logger.error("Delete vendor error:", error)
    res.status(500).json({
      success: false,
      message: "Server error while deleting vendor",
    })
  }
})

module.exports = router
