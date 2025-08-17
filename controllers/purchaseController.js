const purchaseService = require("../services/purchaseService")
const logger = require("../utils/logger")
const { validationResult } = require("express-validator")
const { getAttachmentUrl } = require("../utils/constants");
const path = require("path");
const fs = require("fs");
const Purchase = require("../models/Purchase");
const {moveFileToRecycleBin} = require("../utils/fileMover")
const { moveFileFromRecycleBin } = require("../utils/fileMover");
const PurchaseOrder = require("../models/PurchaseOrder");
const Counter = require("../models/Counter");
const moment = require("moment")
// Generate Receipt Number (no siteType here)
async function generateReceiptNumber() {
  const dateStr = moment().format("YYMMDD"); // e.g. 250817
  const counterName = `R-${dateStr}`;

  const counter = await Counter.findOneAndUpdate(
    { name: counterName, date: dateStr },
    { $inc: { seq: 1 }, $set: { date: dateStr } },
    { new: true, upsert: true }
  );

  const seq = String(counter.seq).padStart(2, "0"); // 2 digit sequence
  return `R-${dateStr}-${seq}`;
}

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
        all: req.query.all === 'true',
      }

      const result = await purchaseService.getPurchases(options)

      const purchaseData = result.purchases.map(po => ({
        ...po,
        invoiceFile: getAttachmentUrl(po.invoiceFile),
      }));
      console.log("Get purchases result:", purchaseData)
      const filteredPurchase = purchaseData.filter((po) => po.isDeleted === false);
    
      res.json({
        success: true,
        data: {
          ...result,
          purchases:filteredPurchase,
        },
      });
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
      remarks: req.body.remarks || "",
    };

      //  // Step 1: Create purchase
       let purchase = await purchaseService.createPurchase(purchaseData);

      //  // Step 2: Generate receipt number only after purchase success
      //  const receiptNumber = await generateReceiptNumber();
      //  purchase.receiptNumber = receiptNumber;
      //  await purchase.save();
   
     
 // Update the corresponding PurchaseOrder
 if (purchase.ref_num) {
  const receiptNumber = await generateReceiptNumber();

  // Update PurchaseOrder and Purchase together
  await Promise.all([
    PurchaseOrder.updateOne(
      { ref_num: purchase.ref_num },
      { $set: { isPurchasedCreated: true } }
    ),
    Purchase.updateOne(
      { _id: purchase._id },
      { $set: { receiptNumber } }
    )
  ]);

  // Keep it in memory for response/logs
  purchase.receiptNumber = receiptNumber;
}
        // if (purchase.ref_num) {
        //   await PurchaseOrder.updateOne(
        //     { ref_num: purchase.ref_num },
        //     { $set: { isPurchasedCreated: true } }
        //   );
        // }
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
        message: "Purchased Already Created. Please Check (Recycle Bin or Cancelled or Purchase Return section.",
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
        invoiceFile: attachmentPath,
        remarks: req.body.remarks || "",
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
  async deletePurchaseFinal(req, res, next) {
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
      const purchase = await purchaseService.deletePurchaseFinal(req.params.id, req.user.id)
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

   //Soft deleted purchases
  // async deletePurchase(req, res, next) {
  //   try {
  //     const errors = validationResult(req);
  //     if (!errors.isEmpty()) {
  //       return res.status(400).json({
  //         success: false,
  //         message: "Validation failed",
  //         errors: errors.array(),
  //       });
  //     }
  
  //     const purchase = await purchaseService.deletePurchase(req.params.id, req.user.id);
  
  //     if (!purchase) {
  //       return res.status(404).json({
  //         success: false,
  //         message: "Purchase not found",
  //       });
  //     }
  
  //     // Move invoice file if it exists
  //     if (purchase.invoiceFile) {
  //       const filePath = path.join(__dirname, "..", purchase.invoiceFile);
  
  //       if (fs.existsSync(filePath)) {
  //         try {
  //           const newRelativePath = moveFileToRecycleBin(filePath, "invoices");
  //           // Optional: update DB path if needed (commented below)
  //           // await Purchase.findByIdAndUpdate(purchase._id, { invoiceFile: newRelativePath });
  //           // ✅ Update DB with new invoiceFile path
  //           await Purchase.findByIdAndUpdate(purchase._id, {
  //             invoiceFile: newRelativePath,
  //           });
  //           logger.info(`Moved invoice file to recycle bin: ${newRelativePath}`);
  //         } catch (moveErr) {
  //           logger.error("Failed to move invoice file to recycle bin:", moveErr);
  //         }
  //       }
  //     }
  
  //     logger.info(`Purchase soft-deleted: ${purchase.receiptNumber} by ${req.user.username}`);
  
  //     res.json({
  //       success: true,
  //       message: "Purchase moved to recycle bin (soft deleted)",
  //     });
  //   } catch (error) {
  //     logger.error("Delete purchase error:", error);
  //     next(error);
  //   }
  // }
  async deletePurchase(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }
  
      const purchase = await Purchase.findById(req.params.id);
      if (!purchase) {
        return res.status(404).json({ success: false, message: "Purchase not found" });
      }
  
      // Move invoice file to recycle bin if exists
      if (purchase.invoiceFile) {
        let filePath = purchase.invoiceFile; // could be URL or relative path
        const fileName = path.basename(filePath);
  
        // Convert full URL to relative path if needed
        if (filePath.startsWith("http")) {
          filePath = new URL(filePath).pathname; // /uploads/invoices/file.pdf
        }
  
        const currentFilePath = path.join(process.cwd(), filePath);
        const recycleBinDir = path.join(process.cwd(), "uploads", "recycle-bin", "invoices");
  
        // Create recycle bin directory if missing
        if (!fs.existsSync(recycleBinDir)) {
          fs.mkdirSync(recycleBinDir, { recursive: true });
        }
  
        // Move the file
        if (fs.existsSync(currentFilePath)) {
          const newFilePath = path.join(recycleBinDir, fileName);
          fs.renameSync(currentFilePath, newFilePath);
          purchase.invoiceFile = `/uploads/recycle-bin/invoices/${fileName}`;
        }
      }
  
      // Soft delete
      purchase.isDeleted = true;
      purchase.deletedBy = req.user.id;
      purchase.deletedAt = new Date();
      await purchase.save();
  
      logger.info(`Purchase soft-deleted: ${purchase.receiptNumber} by ${req.user.username}`);
  
      res.json({
        success: true,
        message: "Purchase moved to recycle bin (soft deleted)",
      });
    } catch (error) {
      logger.error("Delete purchase error:", error);
      next(error);
    }
  }
  
  

  // Restore deleted purchase
  async restorePurchase(req, res, next) {
    try {
      const purchase = await Purchase.findById(req.params.id);
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      if (!purchase || !purchase.isDeleted) {
        return res.status(404).json({
          success: false,
          message: "Purchase not found in recycle bin",
        });
      }
  
      // Restore invoice file if it exists
      if (purchase.invoiceFile) {
        // const oldPath = path.join(__dirname, "..", purchase.invoiceFile);
        const recycleBinPath = purchase.invoiceFile.replace(baseUrl + "/", ""); // Make relative path
        purchase.invoiceFile = moveFileFromRecycleBin(recycleBinPath, "invoices", baseUrl);
      }
        
  
      // Un-delete
      purchase.isDeleted = false;
      purchase.deletedBy = undefined;
      purchase.deletedAt = undefined;
  
      await purchase.save();
  
      logger.info(`Purchase restored: ${purchase.receiptNumber} by ${req.user.username}`);
  
      res.json({
        success: true,
        message: "Purchase successfully restored from recycle bin",
      });
    } catch (error) {
      logger.error("Restore purchase error:", error);
      next(error);
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
  async getDeletedPurchases(req, res, next) {
    try {
      const {
        page = 1,
        limit = 10,
        search = "",
        startDate,
        endDate,
      } = req.query;
  
      const skip = (page - 1) * limit;
      const query = { isDeleted: true };
  
      if (search) {
        query.$or = [
          { ref_num: { $regex: search, $options: "i" } },
          { remarks: { $regex: search, $options: "i" } },
        ];
      }
  
      if (startDate && endDate) {
        query.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        };
      }
  
      const [total, purchases] = await Promise.all([
        Purchase.countDocuments(query),
        Purchase.find(query)
          .skip(skip)
          .limit(Number(limit))
          .sort({ createdAt: -1 })
          .populate("createdBy", "username name"),
      ]);
  
      res.json({
        success: true,
        data: {
          purchases,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
  

  
}

module.exports = new PurchaseController() 