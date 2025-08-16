const Purchase = require("../models/Purchase")
const Product = require("../models/Product")
const {moveFileToRecycleBin} = require("../utils/fileMover")

class PurchaseService {
  /**
   * Get purchases with pagination and filters
   * @param {Object} options - Query options
   * @returns {Object} Purchases and pagination info
   */
  // async getPurchases(options) {
  //   const { page = 1, limit = 10, search, vendor, startDate, endDate, sortBy = "purchaseDate", sortOrder = "desc", all = false } = options

  //   const skip = all ? 0 : (page - 1) * limit

  //   // Build query
  //   const query = {}

  //   // Filter by vendor
  //   if (vendor) {
  //     query.vendor = { $regex: vendor, $options: "i" }
  //   }

  //   // Date range filter
  //   if (startDate || endDate) {
  //     query.purchaseDate = {}
  //     if (startDate) {
  //       query.purchaseDate.$gte = new Date(startDate)
  //     }
  //     if (endDate) {
  //       query.purchaseDate.$lte = new Date(endDate)
  //     }
  //   }

  //   // Search functionality
  //   if (search) {
  //     query.$or = [
  //       { receiptNumber: { $regex: search, $options: "i" } },
  //       { vendor: { $regex: search, $options: "i" } },
  //       { "items.productName": { $regex: search, $options: "i" } },
  //     ]
  //   }

  //   // Build sort object
  //   const sort = {}
  //   sort[sortBy] = sortOrder === "desc" ? -1 : 1

  //   // Execute query
  //   const purchases = await Purchase.find(query)
  //     .populate("createdBy", "name username")
  //     // .populate("relatedPO", "poNumber")
  //     .sort(sort)
  //     .skip(skip)
  //     .limit(all ? undefined : limit)
  //     .lean()

  //   const total = await Purchase.countDocuments(query)

  //   return {
  //     purchases,
  //     pagination: {
  //       page,
  //       limit,
  //       total,
  //       pages: Math.ceil(total / limit),
  //     },
  //   }
  // }

  async getPurchases(options) {
    const {
      page = 1,
      limit = 10,
      search,
      vendor,
      startDate,
      endDate,
      sortBy = "purchaseDate",
      sortOrder = "desc",
      all = false,
      isDeleted,
    } = options;
  
    const skip = all ? 0 : (page - 1) * limit;
    const query = {};
  
    // Handle isDeleted
    if (typeof isDeleted === "boolean") {
      query.isDeleted = isDeleted;
    } else {
      query.isDeleted = false;
    }
  
    // Filters
    if (vendor) {
      query.vendor = { $regex: vendor, $options: "i" };
    }
  
    if (startDate || endDate) {
      query.purchaseDate = {};
      if (startDate) query.purchaseDate.$gte = new Date(startDate);
      if (endDate) query.purchaseDate.$lte = new Date(endDate);
    }
  
    if (search) {
      query.$or = [
        { receiptNumber: { $regex: search, $options: "i" } },
        { vendor: { $regex: search, $options: "i" } },
        { "items.productName": { $regex: search, $options: "i" } },
      ];
    }
  
    const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };
  
    const [purchases, total] = await Promise.all([
      Purchase.find(query)
        .populate("createdBy", "name username")
        .sort(sort)
        .skip(skip)
        .limit(all ? 0 : limit)
        .lean(),
      Purchase.countDocuments(query),
    ]);
  
    return {
      purchases,
      pagination: {
        page,
        limit: all ? total : limit,
        total,
        pages: all ? 1 : Math.ceil(total / limit),
      },
    };
  }
  

  /**
   * Get purchase by ID
   * @param {string} purchaseId
   * @returns {Object} Purchase data
   */
  async getPurchaseById(purchaseId) {
    return await Purchase.findById(purchaseId)
      .populate("createdBy", "name username")
      // .populate("relatedPO", "poNumber")
      .lean()
  }

  /**
   * Create new purchase
   * @param {Object} purchaseData
   * @returns {Object} Created purchase
   */
// Create Purchase
async createPurchase(purchaseData) {
  const { items, ...otherData } = purchaseData;

  const processedItems = await this.processItems(items);

  // Subtotal (exclude cancelled + return items)
  const subtotal = processedItems
    .filter(item => !item.isCancelled && !item.isReturn)
    .reduce((sum, item) => sum + item.total, 0);

  // Cancelled tracking
  const cancelledAmount = processedItems
    .filter(item => item.isCancelled)
    .reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  const cancelledQty = processedItems
    .filter(item => item.isCancelled)
    .reduce((sum, item) => sum + item.quantity, 0);

  // Return tracking
  const returnItems = processedItems.filter(item => item.isReturn);
  const returnAmount = returnItems.reduce(
    (sum, item) => sum + (item.quantity * item.unitPrice),
    0
  );
  const returnQty = returnItems.reduce((sum, item) => sum + item.quantity, 0);

  // Final total = subtotal (already excludes return + cancelled)
  const total = subtotal;

  const purchase = new Purchase({
    ...otherData,
    items: processedItems,
    subtotal,
    total,
    cancelledAmount,
    cancelledQty,
    return: {
      items: returnItems,
      returnAmount,
      returnQty,
    },
  });

  return await purchase.save();
}

  

  /**
   * Update purchase
   * @param {string} purchaseId
   * @param {Object} updateData
   * @returns {Object} Updated purchase
   */
 // Update Purchase
async updatePurchase(purchaseId, updateData) {
  const { items, ...otherData } = updateData;

  let processedItems = [];
  let subtotal = 0;
  let total = 0;
  let cancelledAmount = 0;
  let cancelledQty = 0;
  let returnObj = { items: [], returnAmount: 0, returnQty: 0 };

  if (items) {
    processedItems = await this.processItems(items);

    subtotal = processedItems
      .filter(item => !item.isCancelled && !item.isReturn)
      .reduce((sum, item) => sum + item.total, 0);

    cancelledAmount = processedItems
      .filter(item => item.isCancelled)
      .reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

    cancelledQty = processedItems
      .filter(item => item.isCancelled)
      .reduce((sum, item) => sum + item.quantity, 0);

    const returnItems = processedItems.filter(item => item.isReturn);
    const returnAmount = returnItems.reduce(
      (sum, item) => sum + (item.quantity * item.unitPrice),
      0
    );
    const returnQty = returnItems.reduce((sum, item) => sum + item.quantity, 0);

    returnObj = {
      items: returnItems,
      returnAmount,
      returnQty,
    };

    // Final total = subtotal
    total = subtotal;
  }

  const updatePayload = {
    ...otherData,
    ...(items && {
      items: processedItems,
      subtotal,
      total,
      cancelledAmount,
      cancelledQty,
      return: returnObj,
    }),
  };

  const purchase = await Purchase.findByIdAndUpdate(purchaseId, updatePayload, {
    new: true,
    runValidators: true,
  }).populate("createdBy", "name username");

  return purchase;
}
  

  /**
   * Delete purchase (hard delete)
   * @param {string} purchaseId
   * @param {string} deletedBy
   * @returns {Object} Deleted purchase
   */
  // Hard delete
  // async deletePurchase(purchaseId, deletedBy) {
  //   const purchase = await Purchase.findByIdAndDelete(purchaseId);
  //   return purchase;
  // }

// Soft delete 
  async deletePurchase(purchaseId, deletedBy) {
    const purchase = await Purchase.findByIdAndUpdate(
      purchaseId,
      {
        isDeleted: true,
        deletedBy,
        deletedAt: new Date(), // Optional: track when it was deleted
      },
      { new: true } // return the updated document
    );
    return purchase;
  }

  /**
   * Search purchases
   * @param {string} searchTerm
   * @param {number} limit
   * @returns {Array} Purchases
   */
  async searchPurchases(searchTerm, limit = 10) {
    return await Purchase.find({
      $or: [
        { receiptNumber: { $regex: searchTerm, $options: "i" } },
        { vendor: { $regex: searchTerm, $options: "i" } },
        { "items.productName": { $regex: searchTerm, $options: "i" } },
      ],
    })
      .select("receiptNumber vendor purchaseDate total")
      .sort({ purchaseDate: -1 })
      .limit(limit)
      .lean()
  }

  /**
   * Process items to include product names and calculate totals
   * @param {Array} items
   * @returns {Array} Processed items
   */
  // async processItems(items) {
  //   const processedItems = []

  //   for (const item of items) {
  //     const product = await Product.findById(item.productId).select("name")
  //     if (!product) {
  //       throw new Error(`Product with ID ${item.productId} not found`)
  //     }

  //     const total = item.quantity * item.unitPrice

  //     processedItems.push({
  //       productId: item.productId,
  //       productName: product.name,
  //       quantity: item.quantity,
  //       unitPrice: item.unitPrice,
  //       unitType: item.unitType,
  //       total,
  //     })

  //     // Update product stock
  //     await Product.findByIdAndUpdate(item.productId, {
  //       $inc: { currentStock: item.quantity },
  //     })
  //   }

  //   return processedItems
  // }

  async processItems(items) {
    const processedItems = [];
  
    for (const item of items) {
      const product = await Product.findById(item.productId).select("name");
      if (!product) {
        throw new Error(`Product with ID ${item.productId} not found`);
      }
  
      const isCancelled = item.isCancelled === true;
      const isReturn = item.isReturn === true;
  
      // Cancelled or return items contribute 0 to line total
      const total = (isCancelled || isReturn) ? 0 : item.quantity * item.unitPrice;
  
      processedItems.push({
        productId: item.productId,
        productName: product.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        unitType: item.unitType,
        isCancelled,
        isReturn,
        total,
      });
  
      // Stock updates
      if (!isCancelled && !isReturn) {
        // Normal purchase -> increase stock
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { currentStock: item.quantity },
        });
      } else if (isReturn) {
        // Return -> decrease stock
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { currentStock: -item.quantity },
        });
      }
    }
  
    return processedItems;
  }
  
  
  
  

  /**
   * Get purchase statistics
   * @returns {Object} Statistics
   */
  async getPurchaseStats() {
    const stats = await Purchase.aggregate([
      {
        $group: {
          _id: null,
          totalPurchases: { $sum: 1 },
          totalValue: { $sum: "$total" },
          averageValue: { $avg: "$total" },
        },
      },
    ])

    const totalPurchases = await Purchase.countDocuments()
    const totalValue = await Purchase.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$total" },
        },
      },
    ])

    return {
      totalPurchases,
      totalValue: totalValue[0]?.total || 0,
      averageValue: stats[0]?.averageValue || 0,
    }
  }

  /**
   * Get purchases by vendor
   * @param {string} vendor
   * @param {Object} options
   * @returns {Object} Purchases and pagination
   */
  async getPurchasesByVendor(vendor, options = {}) {
    const { page = 1, limit = 10, sortBy = "purchaseDate", sortOrder = "desc" } = options

    const skip = (page - 1) * limit

    const query = { vendor: { $regex: vendor, $options: "i" } }

    const sort = {}
    sort[sortBy] = sortOrder === "desc" ? -1 : 1

    const purchases = await Purchase.find(query)
      .populate("createdBy", "name username")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean()

    const total = await Purchase.countDocuments(query)

    return {
      purchases,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  }

  /**
   * Get daily purchase report
   * @param {Date} date
   * @returns {Object} Daily purchase data
   */
  async getDailyPurchaseReport(date) {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const purchases = await Purchase.find({
      purchaseDate: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    }).lean()

    const totalPurchases = purchases.length
    const totalSpent = purchases.reduce((sum, purchase) => sum + purchase.total, 0)
    const totalItems = purchases.reduce((sum, purchase) => sum + purchase.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0)

    return {
      date: date.toISOString().split('T')[0],
      totalPurchases,
      totalSpent,
      totalItems,
      purchases,
    }
  }


}

module.exports = new PurchaseService() 