const purchaseService = require("../services/purchaseService")
const logger = require("../utils/logger")
const { validationResult } = require("express-validator")
const { getAttachmentUrl } = require("../utils/constants");
const path = require("path");
const fs = require("fs");

class PurchaseController {
  /**
   * Get all purchases with pagination and filters
   * @route GET /api/purchases
   * @access Private (Admin/Manager)
   */
  async getPurchases(req, res, next) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        search: req.query.search,
        vendor: req.query.vendor,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        sortBy: req.query.sortBy || "purchaseDate",
        sortOrder: req.query.sortOrder || "desc",
      }

      const result = await purchaseService.getPurchases(options)

      const purchaseData = result.purchases.map(po => ({
        ...po,
        invoiceFile: getAttachmentUrl(po.invoiceFile),
      }));
      console.log("Get purchases result:", purchaseData)

      res.json({
        success: true,
        data: {purchases:purchaseData},
      })
    } catch (error) {
      logger.error("Get purchases error:", error)
      next(error)
    }
  }

  /**
   * Get purchase by ID
   * @route GET /api/purchases/:id
   * @access Private (Admin/Manager)
   */
  async getPurchaseById(req, res, next) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const purchase = await purchaseService.getPurchaseById(req.params.id)

      if (!purchase) {
        return res.status(404).json({
          success: false,
          message: "Purchase not found",
        })
      }

      purchase.invoiceFile = getAttachmentUrl(purchase.invoiceFile);

      res.json({
        success: true,
        data: { purchase },
      })
    } catch (error) {
      logger.error("Get purchase error:", error)
      next(error)
    }
  }

  /**
   * Create new purchase
   * @route POST /api/purchases
   * @access Private (Admin/Manager)
   */

async createPurchase(req, res, next) {
  console.log("BODY:", req.body);
  console.log("FILES:", req.file);

  try {
    // Parse items if sent as a string
    if (req.body.items && typeof req.body.items === "string") {
      try {
        req.body.items = JSON.parse(req.body.items);
      } catch (e) {
        // Delete uploaded file if parsing fails
        if (req.file) {
          const filePath = path.join(__dirname, "../..", `/uploads/invoices/${req.file.filename}`);
          fs.unlink(filePath, (err) => {
            if (err) console.error("Error deleting file after JSON parse fail:", err.message);
          });
        }

        return res.status(400).json({
          success: false,
          message: "Invalid items format. Must be a valid JSON array.",
        });
      }
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Delete uploaded file if validation fails
      if (req.file) {
        const filePath = path.join(__dirname, "../..", `/uploads/invoices/${req.file.filename}`);
        fs.unlink(filePath, (err) => {
          if (err) console.error("Error deleting file after validation fail:", err.message);
        });
      }

      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array(),
      });
    }

    let invoiceFilePath = null;

    if (req.file) {
      console.log("Invoice uploaded:", req.file.filename);
      invoiceFilePath = `/uploads/invoices/${req.file.filename}`;
    }

    const purchaseData = {
      ...req.body,
      createdBy: req.user.id,
      invoiceFile: invoiceFilePath,
    };

    const purchase = await purchaseService.createPurchase(purchaseData);

    logger.info(`Purchase created: ${purchase.receiptNumber} by user ${req.user.username}`);

    res.status(201).json({
      success: true,
      message: "Purchase created successfully",
      data: { purchase },
    });
  } catch (error) {
    logger.error("Create purchase error:", error);
  
    // Cleanup uploaded file on error
    if (req.file) {
      const filePath = path.join(__dirname, "../..", `/uploads/invoices/${req.file.filename}`);
      fs.unlink(filePath, (err) => {
        if (err) console.error("Error deleting file after exception:", err.message);
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "something went wrong, duplicate key error",
      });
    }

    next(error);
  }
}

  /**
   * Update purchase
   * @route PUT /api/purchases/:id
   * @access Private (Admin/Manager)
   */
  async updatePurchase(req, res, next) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        if (req.file) {
          const filePath = path.join(__dirname, "../..", `/uploads/invoices/${req.file.filename}`);
          fs.unlink(filePath, (err) => {
            if (err) console.error("Error deleting file after validation fail:", err.message);
          });
        }
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const existingPurchase = await purchaseService.getPurchaseById(req.params.id)

      if (!existingPurchase) {

        if (req.file) {
          const filePath = path.join(__dirname, "../..", `/uploads/invoices/${req.file.filename}`);
          fs.unlink(filePath, (err) => {
            if (err) console.error("Error deleting file after PO not found:", err.message);
          });
        }
        return res.status(404).json({
          success: false,
          message: "Purchase not found",
        })
      }

      let attachmentPath = existingPurchase.invoiceFile;
  
      if (req.file) {
        // Delete old attachment
        if (existingPurchase.invoiceFile) {
          const oldPath = path.join(__dirname, "../..", existingPurchase.invoiceFile);
          fs.unlink(oldPath, (err) => {
            if (err) console.error("Error deleting old attachment:", err.message);
          });
        }
  
        attachmentPath = `/uploads/invoices/${req.file.filename}`;
      }



      // Parse items if sent as a JSON string (for multipart/form-data)
      if (req.body.items && typeof req.body.items === "string") {
        try {
          req.body.items = JSON.parse(req.body.items)
        } catch (e) {
          return res.status(400).json({
            success: false,
            message: "Invalid items format. Must be a valid JSON array.",
          })
        }
      }

      const updateData = {
        ...req.body,
        updatedBy: req.user.id,
        invoiceFile: attachmentPath
      }

      const purchase = await purchaseService.updatePurchase(req.params.id, updateData)
      purchase.invoiceFile = getAttachmentUrl(purchase.invoiceFile);
      
      logger.info(`Purchase updated: ${purchase.receiptNumber} by user ${req.user.username}`)

      res.json({
        success: true,
        message: "Purchase updated successfully",
        data: { purchase },
      })
    } catch (error) {

      // Cleanup new file if error occurs
      if (req.file) {
        const filePath = path.join(__dirname, "../..", `/uploads/invoices/${req.file.filename}`);
        fs.unlink(filePath, (err) => {
          if (err) console.error("Error deleting file after exception:", err.message);
        });
      }
      logger.error("Update purchase error:", error)
      next(error)
    }
  }

  /**
   * Delete purchase
   * @route DELETE /api/purchases/:id
   * @access Private (Admin)
   */
  async deletePurchase(req, res, next) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      console.log('Attempting to delete purchase with ID:', req.params.id);
      const purchase = await purchaseService.deletePurchase(req.params.id, req.user.id)
      console.log('Result of findByIdAndDelete:', purchase);

      if (!purchase) {
        return res.status(404).json({
          success: false,
          message: "Purchase not found",
        })
      }

      logger.info(`Purchase deleted: ${purchase.receiptNumber} by admin ${req.user.username}`)

      res.json({
        success: true,
        message: "Purchase deleted successfully",
      })
    } catch (error) {
      logger.error("Delete purchase error:", error)
      next(error)
    }
  }

  /**
   * Search purchases
   * @route GET /api/purchases/search
   * @access Private (Admin/Manager)
   */
  async searchPurchases(req, res, next) {
    try {
      const { q: searchTerm, limit = 10 } = req.query

      if (!searchTerm) {
        return res.status(400).json({
          success: false,
          message: "Search term is required",
        })
      }

      const purchases = await purchaseService.searchPurchases(searchTerm, parseInt(limit))

      res.json({
        success: true,
        data: { purchases },
      })
    } catch (error) {
      logger.error("Search purchases error:", error)
      next(error)
    }
  }
}

module.exports = new PurchaseController() 