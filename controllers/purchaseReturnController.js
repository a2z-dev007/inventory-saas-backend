const purchaseReturnService = require("../services/purchaseReturnService")
const logger = require("../utils/logger")
const { validationResult } = require("express-validator")
const moment = require("moment")
const path = require("path")
const fs = require("fs");
const Counter = require("../models/Counter");
const PurchaseReturn = require("../models/PurchaseReturn");

async function generateReceiptNumber() {
    const dateStr = moment().format("YYMMDD"); // e.g. 250817
    const counterName = `PR-${dateStr}`;

    const counter = await Counter.findOneAndUpdate(
        { name: counterName, date: dateStr },
        { $inc: { seq: 1 }, $set: { date: dateStr } },
        { new: true, upsert: true }
    );

    const seq = String(counter.seq).padStart(2, "0"); // 2 digit sequence
    return `R-${dateStr}-${seq}`;
}

class PurchaseReturnController {
    async getPurchaseReturns(req, res, next) {
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
                sortBy: req.query.sortBy || "returnDate",
                sortOrder: req.query.sortOrder || "desc",
                all: req.query.all === 'true',
            }
            const result = await purchaseReturnService.getPurchaseReturns(options)
            const filteredReturns = result.returns.filter((pr) => pr.isDeleted === false);
            res.json({
                success: true,
                data: {
                    ...result,
                    returns: filteredReturns,
                },
            });
        } catch (error) {
            logger.error("Get purchase returns error:", error)
            next(error)
        }
    }

    async getPurchaseReturnById(req, res, next) {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    errors: errors.array(),
                })
            }
            const purchaseReturn = await purchaseReturnService.getPurchaseReturnById(req.params.id)
            if (!purchaseReturn) {
                return res.status(404).json({
                    success: false,
                    message: "Purchase Return not found",
                })
            }
            res.json({
                success: true,
                data: { purchaseReturn },
            })
        } catch (error) {
            logger.error("Get purchase return error:", error)
            next(error)
        }
    }

    async createPurchaseReturn(req, res, next) {
        // try {
        //     if (req.body.items && typeof req.body.items === "string") {
        //         try {
        //             req.body.items = JSON.parse(req.body.items);
        //         } catch (e) {
        //             return res.status(400).json({
        //                 success: false,
        //                 message: "Invalid items format. Must be a valid JSON array.",
        //             });
        //         }
        //     }
        //     const errors = validationResult(req);
        //     if (!errors.isEmpty()) {
        //         return res.status(400).json({
        //             success: false,
        //             message: errors.array()[0].msg,
        //             errors: errors.array(),
        //         });
        //     }
        //     const purchaseReturnData = {
        //         ...req.body,
        //         createdBy: req.user.id,
        //         remarks: req.body.remarks || "",
        //     };
        //     let purchaseReturn = await purchaseReturnService.createPurchaseReturn(purchaseReturnData);
        //     res.status(201).json({
        //         success: true,
        //         message: "Purchase Return created successfully",
        //         data: { purchaseReturn },
        //     });
        // } catch (error) {
        //     logger.error("Create purchase return error:", error);
        //     next(error);
        // }

        try {
            // Parse items if sent as a string
            if (req.body.items && typeof req.body.items === "string") {
                try {
                    req.body.items = JSON.parse(req.body.items);
                } catch (e) {
                    // Delete uploaded file if parsing fails
                    if (req.file) {
                        const filePath = path.join(__dirname, "../..", `/uploads/returns/${req.file.filename}`);
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
                    const filePath = path.join(__dirname, "../..", `/uploads/returns/${req.file.filename}`);
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
                invoiceFilePath = `/uploads/returns/${req.file.filename}`;
            }

            const purchaseData = {
                ...req.body,
                createdBy: req.user.id,
                invoiceFile: invoiceFilePath,
                remarks: req.body.remarks || "",
            };

            //  // Step 1: Create purchase
            let purchase = await purchaseReturnService.createPurchaseReturn(purchaseData);

            //  // Step 2: Generate receipt number only after purchase success
            //  const receiptNumber = await generateReceiptNumber();
            //  purchase.receiptNumber = receiptNumber;
            //  await purchase.save();


            // Update the corresponding PurchaseOrder
            if (purchase.ref_num) {
                const receiptNumber = await generateReceiptNumber();

                // Update PurchaseOrder and Purchase together
                await Promise.all([
                    // PurchaseOrder.updateOne(
                    //   { ref_num: purchase.ref_num },
                    //   { $set: { isPurchasedCreated: true } }
                    // ),
                    PurchaseReturn.updateOne(
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
            logger.info(`Purchase Return created: ${purchase.receiptNumber} by user ${req.user.username}`);

            res.status(201).json({
                success: true,
                message: "Purchase  Return created successfully",
                data: { purchase },
            });
        } catch (error) {
            logger.error("Create purchase Return error:", error);

            // Cleanup uploaded file on error
            if (req.file) {
                const filePath = path.join(__dirname, "../..", `/uploads/returns/${req.file.filename}`);
                fs.unlink(filePath, (err) => {
                    if (err) console.error("Error deleting file after exception:", err.message);
                });
            }

            if (error.code === 11000) {

                return res.status(400).json({
                    success: false,
                    message: "Purchased Return Already Created. Please Check (Recycle Bin or Cancelled or Purchase Return section.",
                });
            }

            next(error);
        }
    }

    async updatePurchaseReturn(req, res, next) {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    errors: errors.array(),
                })
            }
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
                remarks: req.body.remarks || "",
            }
            const purchaseReturn = await purchaseReturnService.updatePurchaseReturn(req.params.id, updateData)
            res.json({
                success: true,
                message: "Purchase Return updated successfully",
                data: { purchaseReturn },
            })
        } catch (error) {
            logger.error("Update purchase return error:", error)
            next(error)
        }
    }

    async deletePurchaseReturnFinal(req, res, next) {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    errors: errors.array(),
                })
            }
            const purchaseReturn = await purchaseReturnService.deletePurchaseReturnFinal(req.params.id)
            if (!purchaseReturn) {
                return res.status(404).json({
                    success: false,
                    message: "Purchase Return not found",
                })
            }
            res.json({
                success: true,
                message: "Purchase Return deleted successfully",
            })
        } catch (error) {
            logger.error("Delete purchase return error:", error)
            next(error)
        }
    }

    async deletePurchaseReturn(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    errors: errors.array(),
                });
            }
            const purchaseReturn = await purchaseReturnService.deletePurchaseReturn(req.params.id, req.user.id);
            if (!purchaseReturn) {
                return res.status(404).json({ success: false, message: "Purchase Return not found" });
            }
            res.json({
                success: true,
                message: "Purchase Return moved to recycle bin (soft deleted)",
            });
        } catch (error) {
            logger.error("Delete purchase return error:", error);
            next(error);
        }
    }

    async searchPurchaseReturns(req, res, next) {
        try {
            const { q: searchTerm, limit = 10 } = req.query
            if (!searchTerm) {
                return res.status(400).json({
                    success: false,
                    message: "Search term is required",
                })
            }
            const returns = await purchaseReturnService.searchPurchaseReturns(searchTerm, parseInt(limit))
            res.json({
                success: true,
                data: { returns },
            })
        } catch (error) {
            logger.error("Search purchase returns error:", error)
            next(error)
        }
    }

    async getDeletedPurchaseReturns(req, res, next) {
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
            const [total, returns] = await Promise.all([
                PurchaseReturn.countDocuments(query),
                PurchaseReturn.find(query)
                    .skip(skip)
                    .limit(Number(limit))
                    .sort({ createdAt: -1 })
                    .populate("createdBy", "username name"),
            ]);
            res.json({
                success: true,
                data: {
                    returns,
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


    async restorePurchase(req, res, next) {
        try {
            const purchase = await PurchaseReturn.findById(req.params.id);
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
                purchase.invoiceFile = moveFileFromRecycleBin(recycleBinPath, "returns", baseUrl);
            }


            // Un-delete
            purchase.isDeleted = false;
            purchase.deletedBy = undefined;
            purchase.deletedAt = undefined;

            await purchase.save();

            logger.info(`Purchase Return restored: ${purchase.receiptNumber} by ${req.user.username}`);

            res.json({
                success: true,
                message: "Purchase Return successfully restored from recycle bin",
            });
        } catch (error) {
            logger.error("Restore purchase error:", error);
            next(error);
        }
    }

}

module.exports = new PurchaseReturnController();
