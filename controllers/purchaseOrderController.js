const purchaseOrderService = require("../services/purchaseOrderService");
const logger = require("../utils/logger");
const { validationResult } = require("express-validator");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require("fs");
// const { getAttachmentUrl } = require("../utils/constants");
const { getAttachmentUrl } = require("../utils/constants");
const { moveFileFromRecycleBin } = require("../utils/fileMover");
const PurchaseOrder = require("../models/PurchaseOrder");
const Counter = require("../models/Counter");
const moment = require("moment")
async function  generatePONumber(siteType) {
  const prefix = siteType.charAt(0).toUpperCase(); // S or U
  const dateStr = moment().format("YYMMDD"); // e.g. 250817

  const counterName = `${prefix}-${dateStr}`;

  // find counter for this prefix+date, increment
  const counter = await Counter.findOneAndUpdate(
    { name: counterName, date: dateStr },
    { $inc: { seq: 1 }, $set: { date: dateStr } },
    { new: true, upsert: true }
  );

  const seq = String(counter.seq).padStart(2, "0");

  return `${prefix}-${dateStr}-${seq}`;
}
class PurchaseOrderController {
  /**
   * Get all purchase orders with pagination and filters
   * @route GET /api/purchase-orders
   * @access Private (Admin/Manager)
   */

  async getPurchaseOrders(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        search: req.query.search,
        status: req.query.status,
        vendor: req.query.vendor,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        sortBy: req.query.sortBy || "orderDate",
        sortOrder: req.query.sortOrder || "desc",
        all: req.query.all === "true",
      };

      const result = await purchaseOrderService.getPurchaseOrders(options);

      const updatedOrders = result.purchaseOrders.map((po) => ({
        ...po,
        attachment: getAttachmentUrl(po.attachment),
        isPurchasedCreated: po.isPurchasedCreated // keep the flag
      }));

      res.json({
        success: true,
        data: {
          ...result,
          purchaseOrders: updatedOrders,
        },
      });
    } catch (error) {
      logger.error("Get purchase orders error:", error);
      next(error);
    }
  }

  /**
   * Get purchase order by ID
   * @route GET /api/purchase-orders/:id
   * @access Private (Admin/Manager)
   */
  async getPurchaseOrderById(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const purchaseOrder =
        await purchaseOrderService.getPurchaseOrderByIdOrRefNum(req.params.id);

      if (!purchaseOrder) {
        return res.status(404).json({
          success: false,
          message: "Purchase order not found",
        });
      }

      purchaseOrder.attachment = getAttachmentUrl(purchaseOrder.attachment);

      res.json({
        success: true,
        data: { purchaseOrder },
      });
    } catch (error) {
      logger.error("Get purchase order error:", error);
      next(error);
    }
  }

  /**
   * Create new purchase order
   * @route POST /api/purchase-orders
   * @access Private (Admin/Manager)
   */

  // async createPurchaseOrder(req, res, next) {
  //   try {
  //     // Parse items if sent as string
  //     if (req.body.items && typeof req.body.items === "string") {
  //       req.body.items = JSON.parse(req.body.items);
  //     }

  //     const errors = validationResult(req);
  //     if (!errors.isEmpty()) {
  //       // Delete uploaded file if validation fails
  //       if (req.file) {
  //         const filePath = path.join(
  //           __dirname,
  //           "../..",
  //           `/uploads/purchase-orders/${req.file.filename}`
  //         );
  //         fs.unlink(filePath, (err) => {
  //           if (err)
  //             console.error(
  //               "Error deleting file after validation fail:",
  //               err.message
  //             );
  //         });
  //       }

  //       return res.status(400).json({
  //         success: false,
  //         message: errors.array()[0].msg,
  //         errors: errors.array(),
  //       });
  //     }

  //     let attachmentPath = null;

  //     if (req.file) {
  //       console.log("File uploaded:", req.file.filename);
  //       attachmentPath = `/uploads/purchase-orders/${req.file.filename}`;
  //     }

     
 
  //    const poNumber = await generatePONumber(req.body.siteType);
 

  //     const purchaseOrderData = {
  //       ...req.body,
  //       createdBy: req.user.id,
  //       attachment: attachmentPath,
  //       remarks: req.body.remarks || null,
  //       poNumber,
  //     };

  //     const purchaseOrder = await purchaseOrderService.createPurchaseOrder(
  //       purchaseOrderData
  //     );

  //     purchaseOrder.attachment = getAttachmentUrl(purchaseOrder.attachment);

  //     res.status(201).json({
  //       success: true,
  //       message: "Purchase order created successfully",
  //       data: { purchaseOrder },
  //     });
  //   } catch (error) {
  //     logger.error("Create purchase order error:", error);

  //     // Cleanup uploaded file on error
  //     if (req.file) {
  //       const filePath = path.join(
  //         __dirname,
  //         "../..",
  //         `/uploads/purchase-orders/${req.file.filename}`
  //       );
  //       fs.unlink(filePath, (err) => {
  //         if (err)
  //           console.error("Error deleting file after exception:", err.message);
  //       });
  //     }

  //     next(error);
  //   }
  // }

  async createPurchaseOrder(req, res, next) {
    try {
      // Parse items if sent as string
      if (req.body.items && typeof req.body.items === "string") {
        req.body.items = JSON.parse(req.body.items);
      }
  
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // Delete uploaded file if validation fails
        if (req.file) {
          const filePath = path.join(
            __dirname,
            "../..",
            `/uploads/purchase-orders/${req.file.filename}`
          );
          fs.unlink(filePath, (err) => {
            if (err)
              console.error("Error deleting file after validation fail:", err.message);
          });
        }
  
        return res.status(400).json({
          success: false,
          message: errors.array()[0].msg,
          errors: errors.array(),
        });
      }
  
      let attachmentPath = null;
      if (req.file) {
        console.log("File uploaded:", req.file.filename);
        attachmentPath = `/uploads/purchase-orders/${req.file.filename}`;
      }
  
      // Step 1: Create order without PO number
      const purchaseOrderData = {
        ...req.body,
        createdBy: req.user.id,
        attachment: attachmentPath,
        remarks: req.body.remarks || null,
        customerAddress:req.body.customerAddress
      };
  
      let purchaseOrder = await purchaseOrderService.createPurchaseOrder(
        purchaseOrderData
      );
  
      // Step 2: Generate PO number only after successful creation
      const poNumber = await generatePONumber(req.body.siteType);
  
      // Step 3: Update the PO with generated number
      purchaseOrder.poNumber = poNumber;
      await purchaseOrder.save();
  
      purchaseOrder.attachment = getAttachmentUrl(purchaseOrder.attachment);
  
      res.status(201).json({
        success: true,
        message: "Purchase order created successfully",
        data: { purchaseOrder },
      });
    } catch (error) {
      logger.error("Create purchase order error:", error);
  
      // Cleanup uploaded file on error
      if (req.file) {
        const filePath = path.join(
          __dirname,
          "../..",
          `/uploads/purchase-orders/${req.file.filename}`
        );
        fs.unlink(filePath, (err) => {
          if (err)
            console.error("Error deleting file after exception:", err.message);
        });
      }
  
      next(error);
    }
  }
  

  /**
   * Update purchase order
   * @route PUT /api/purchase-orders/:id
   * @access Private (Admin/Manager)
   */

  async updatePurchaseOrder(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // Delete uploaded file if validation fails
        if (req.file) {
          const filePath = path.join(
            __dirname,
            "../..",
            `/uploads/purchase-orders/${req.file.filename}`
          );
          fs.unlink(filePath, (err) => {
            if (err)
              console.error(
                "Error deleting file after validation fail:",
                err.message
              );
          });
        }

        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const existingPO =
        await purchaseOrderService.getPurchaseOrderByIdOrRefNum(req.params.id);
      if (!existingPO) {
        // Delete uploaded file if PO not found
        if (req.file) {
          const filePath = path.join(
            __dirname,
            "../..",
            `/uploads/purchase-orders/${req.file.filename}`
          );
          fs.unlink(filePath, (err) => {
            if (err)
              console.error(
                "Error deleting file after PO not found:",
                err.message
              );
          });
        }

        return res.status(404).json({
          success: false,
          message: "Purchase order not found",
        });
      }

      let attachmentPath = existingPO.attachment;

      if (req.file) {
        // Delete old attachment
        if (existingPO.attachment) {
          const oldPath = path.join(__dirname, "../..", existingPO.attachment);
          fs.unlink(oldPath, (err) => {
            if (err)
              console.error("Error deleting old attachment:", err.message);
          });
        }

        attachmentPath = `/uploads/purchase-orders/${req.file.filename}`;
      }

      const updateData = {
        ...req.body,
        updatedBy: req.user.id,
        attachment: attachmentPath,
        remarks: req.body.remarks || null,
      };

      if (updateData.items && typeof updateData.items === "string") {
        updateData.items = JSON.parse(updateData.items);
      }

      const purchaseOrder =
        await purchaseOrderService.updatePurchaseOrderByIdOrRefNum(
          req.params.id,
          updateData
        );

      purchaseOrder.attachment = getAttachmentUrl(purchaseOrder.attachment);

      res.json({
        success: true,
        message: "Purchase order updated successfully",
        data: { purchaseOrder },
      });
    } catch (error) {
      logger.error("Update purchase order error:", error);

      // Cleanup new file if error occurs
      if (req.file) {
        const filePath = path.join(
          __dirname,
          "../..",
          `/uploads/purchase-orders/${req.file.filename}`
        );
        fs.unlink(filePath, (err) => {
          if (err)
            console.error("Error deleting file after exception:", err.message);
        });
      }

      next(error);
    }
  }

  /**
   * Update purchase order status
   * @route PUT /api/purchase-orders/:id/status
   * @access Private (Admin/Manager)
   */
  async updatePurchaseOrderStatus(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { status, reason } = req.body;
      const updateData = {
        status,
        reason,
        updatedBy: req.user.id,
      };

      if (status === "approved") {
        updateData.approvedBy = req.user.id;
        updateData.approvedAt = new Date();
      }

      const purchaseOrder =
        await purchaseOrderService.updatePurchaseOrderByIdOrRefNum(
          req.params.id,
          updateData
        );

      purchaseOrder.attachment = getAttachmentUrl(purchaseOrder.attachment);

      res.json({
        success: true,
        message: "Purchase order status updated successfully",
        data: { purchaseOrder },
      });
    } catch (error) {
      logger.error("Update purchase order status error:", error);
      next(error);
    }
  }

  /**
   * Delete purchase order
   * @route DELETE /api/purchase-orders/:id
   * @access Private (Admin)
   */
  async finalDeletePurchaseOrder(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const purchaseOrder =
        await purchaseOrderService.deletePurchaseOrderFinal(
          req.params.id,
          req.user.id
        );

      if (!purchaseOrder) {
        return res.status(404).json({
          success: false,
          message: "Purchase order not found",
        });
      }

      logger.info(
        `Purchase order deleted: ${purchaseOrder.ref_num} by admin ${req.user.username}`
      );

      res.json({
        success: true,
        message: "Purchase order deleted successfully",
      });
    } catch (error) {
      logger.error("Delete purchase order error:", error);
      next(error);
    }
  }

  // Soft delete purchase order
  async deletePurchaseOrder(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const purchaseOrder =
        await purchaseOrderService.deletePurchaseOrderByIdOrRefNum(
          req.params.id,
          req.user.id
        );

      if (!purchaseOrder) {
        return res.status(404).json({
          success: false,
          message: "Purchase order not found",
        });
      }

      logger.info(
        `Purchase order soft-deleted: ${purchaseOrder.ref_num} by admin ${req.user.username}`
      );

      res.json({
        success: true,
        message: "Purchase order moved to recycle bin (soft deleted)",
      });
    } catch (error) {
      logger.error("Delete purchase order error:", error);
      next(error);
    }
  }

  async getDeletedPurchaseOrders(req, res, next) {
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

      const [total, purchaseOrders] = await Promise.all([
        PurchaseOrder.countDocuments(query),
        PurchaseOrder.find(query)
          .skip(skip)
          .limit(Number(limit))
          .sort({ createdAt: -1 }) // latest first
          .populate("createdBy", "username name"),
      ]);

      res.json({
        success: true,
        data: {
          purchaseOrders,
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

  async restorePurchaseOrder(req, res, next) {
    try {
      const { id } = req.params;
      const baseUrl = `${req.protocol}://${req.get("host")}`;

      const purchaseOrder = await PurchaseOrder.findOne({
        _id: id,
        isDeleted: true,
      });
      if (!purchaseOrder) {
        return res
          .status(404)
          .json({
            success: false,
            message: "Purchase order not found in recycle bin",
          });
      }

      // Restore attachment if exists
      if (purchaseOrder.attachment) {
        const recycleBinPath = purchaseOrder.attachment.replace(
          baseUrl + "/",
          ""
        ); // Make relative path
        purchaseOrder.attachment = moveFileFromRecycleBin(
          recycleBinPath,
          "purchase-orders",
          baseUrl
        );
      }

      purchaseOrder.isDeleted = false;
      await purchaseOrder.save();

      res.json({
        success: true,
        message: "Purchase order restored successfully",
        data: purchaseOrder,
      });
    } catch (error) {
      console.error("Error restoring purchase order:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to restore purchase order" });
    }
  }

  /**
   * Search purchase orders
   * @route GET /api/purchase-orders/search
   * @access Private (Admin/Manager)
   */
  async searchPurchaseOrders(req, res, next) {
    try {
      const { q: searchTerm, limit = 10 } = req.query;

      if (!searchTerm) {
        return res.status(400).json({
          success: false,
          message: "Search term is required",
        });
      }

      const purchaseOrders = await purchaseOrderService.searchPurchaseOrders(
        searchTerm,
        parseInt(limit)
      );

      const updated = purchaseOrders.map((po) => ({
        ...po,
        attachment: getAttachmentUrl(po.attachment),
      }));

      res.json({
        success: true,
        data: { purchaseOrders: updated },
      });
    } catch (error) {
      logger.error("Search purchase orders error:", error);
      next(error);
    }
  }
}

module.exports = new PurchaseOrderController();
