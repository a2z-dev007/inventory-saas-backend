const PurchaseReturn = require("../models/PurchaseReturn")
const Product = require("../models/Product")

class PurchaseReturnService {
    async getPurchaseReturns(options) {
        const {
            page = 1,
            limit = 10,
            search,
            vendor,
            startDate,
            endDate,
            sortBy = "returnDate",
            sortOrder = "desc",
            all = false,
            isDeleted,
        } = options;
        const skip = all ? 0 : (page - 1) * limit;
        const query = {};
        if (typeof isDeleted === "boolean") {
            query.isDeleted = isDeleted;
        } else {
            query.isDeleted = false;
        }
        if (vendor) {
            query.vendor = { $regex: vendor, $options: "i" };
        }
        if (startDate || endDate) {
            query.returnDate = {};
            if (startDate) query.returnDate.$gte = new Date(startDate);
            if (endDate) query.returnDate.$lte = new Date(endDate);
        }
        if (search) {
            query.$or = [
                { receiptNumber: { $regex: search, $options: "i" } },
                { vendor: { $regex: search, $options: "i" } },
                { "items.productName": { $regex: search, $options: "i" } },
            ];
        }
        const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };
        const [returns, total] = await Promise.all([
            PurchaseReturn.find(query)
                .populate("createdBy", "name username")
                .sort(sort)
                .skip(skip)
                .limit(all ? 0 : limit)
                .lean(),
            PurchaseReturn.countDocuments(query),
        ]);
        return {
            returns,
            pagination: {
                page,
                limit: all ? total : limit,
                total,
                pages: all ? 1 : Math.ceil(total / limit),
            },
        };
    }

    async getPurchaseReturnById(id) {
        return await PurchaseReturn.findById(id)
            .populate("createdBy", "name username")
            .lean();
    }

    async createPurchaseReturn(data) {
        const { items, ...otherData } = data;
        const processedItems = await this.processItems(items);
        const subtotal = processedItems.reduce((sum, item) => sum + item.total, 0);
        const total = subtotal;

        const purchaseReturn = new PurchaseReturn({
            ...otherData,
            items: processedItems,
            subtotal,
            total,
        });
        return await purchaseReturn.save();
    }

    async updatePurchaseReturn(id, data) {
        const { items, ...otherData } = data;
        let processedItems = [];
        let subtotal = 0;
        let total = 0;
        if (items) {
            processedItems = await this.processItems(items);
            subtotal = processedItems.reduce((sum, item) => sum + item.total, 0);
            total = subtotal;
        }
        const updatePayload = {
            ...otherData,
            ...(items && {
                items: processedItems,
                subtotal,
                total,
            }),
        };
        const purchaseReturn = await PurchaseReturn.findByIdAndUpdate(id, updatePayload, {
            new: true,
            runValidators: true,
        }).populate("createdBy", "name username");
        return purchaseReturn;
    }

    async deletePurchaseReturn(id, deletedBy) {
        const purchaseReturn = await PurchaseReturn.findByIdAndUpdate(
            id,
            {
                isDeleted: true,
                deletedBy,
                deletedAt: new Date(),
            },
            { new: true }
        );
        return purchaseReturn;
    }

    async deletePurchaseReturnFinal(id) {
        const purchaseReturn = await PurchaseReturn.findByIdAndDelete(id);
        return purchaseReturn;
    }

    async searchPurchaseReturns(searchTerm, limit = 10) {
        return await PurchaseReturn.find({
            $or: [
                { receiptNumber: { $regex: searchTerm, $options: "i" } },
                { vendor: { $regex: searchTerm, $options: "i" } },
                { "items.productName": { $regex: searchTerm, $options: "i" } },
            ],
        })
            .select("receiptNumber vendor returnDate total")
            .sort({ returnDate: -1 })
            .limit(limit)
            .lean();
    }

    async processItems(items) {
        const processedItems = [];
        for (const item of items) {
            const product = await Product.findById(item.productId).select("name");
            if (!product) {
                throw new Error(`Product with ID ${item.productId} not found`);
            }
            const total = item.quantity * item.unitPrice;
            processedItems.push({
                productId: item.productId,
                productName: product.name,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                unitType: item.unitType,
                total,
            });
            // Decrease stock for returned items
            await Product.findByIdAndUpdate(item.productId, {
                $inc: { currentStock: -item.quantity },
            });
        }
        return processedItems;
    }
}

module.exports = new PurchaseReturnService();
