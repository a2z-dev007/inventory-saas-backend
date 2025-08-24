const express = require("express");
const router = express.Router();
const purchaseReturnController = require("../controllers/purchaseReturnController");
const { protect, authorize } = require("../middleware/auth");
const {
    validatePurchase,
    validateId,
    validatePagination,
    validateDateRange,
} = require("../middleware/validation");
const createFileUploader = require("../utils/createFileUploader");

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
const uploadInvoice = createFileUploader({
    folder: "uploads/returns", // custom folder if needed
    fieldName: "invoiceFile", // match your frontend FormData
    maxSize: 10 * 1024 * 1024, // 10MB
});

router.use(protect);

router.get('/recycle-bin', purchaseReturnController.getDeletedPurchaseReturns);

router.get(
    "/",
    authorize("admin", "manager"),
    validatePagination,
    validateDateRange,
    purchaseReturnController.getPurchaseReturns
);

router.get(
    "/:id",
    authorize("admin", "manager"),
    validateId,
    purchaseReturnController.getPurchaseReturnById
);

router.post(
    "/",
    authorize("admin", "manager"),
    uploadInvoice,
    parseItemsMiddleware,
    validatePurchase,
    purchaseReturnController.createPurchaseReturn
);

router.put(
    "/:id",
    authorize("admin", "manager"),
    uploadInvoice,
    validateId,
    parseItemsMiddleware,
    validatePurchase,
    purchaseReturnController.updatePurchaseReturn
);

router.delete(
    "/:id",
    authorize("admin"),
    validateId,
    purchaseReturnController.deletePurchaseReturn
);

router.delete(
    "/final-delete/:id",
    authorize("admin"),
    validateId,
    purchaseReturnController.deletePurchaseReturnFinal
);

router.get(
    "/search",
    authorize("admin", "manager"),
    purchaseReturnController.searchPurchaseReturns
);

router.put(
    "/:id/restore",
    authorize("admin"),
    validateId,
    purchaseReturnController.restorePurchase
);

module.exports = router;
