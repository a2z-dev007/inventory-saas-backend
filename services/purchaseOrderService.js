const PurchaseOrder = require("../models/PurchaseOrder");
const Product = require("../models/Product");
const { getAttachmentUrl } = require("../utils/constants");
const { moveFileToRecycleBin } = require("../utils/fileMover");
const path = require("path");
const fs = require("fs");
const Purchase = require("../models/Purchase");
class PurchaseOrderService {
  /**
   * Get purchase orders with pagination and filters
   * @param {Object} options - Query options
   * @returns {Object} Purchase orders and pagination info
   */
 

  async getPurchaseOrders(options) {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      vendor,
      startDate,
      endDate,
      sortBy = "orderDate",
      sortOrder = "desc",
      all = false,
      isDeleted,
    } = options;
  
    const skip = all ? 0 : (page - 1) * limit;
    const query = {};
  
    // Deleted filter
    if (typeof isDeleted !== "undefined") {
      if (typeof isDeleted === "string") {
        query.isDeleted = isDeleted.toLowerCase() === "true";
      } else {
        query.isDeleted = Boolean(isDeleted);
      }
    }
  
    // Other filters
    if (status) query.status = status;
    if (vendor) query.vendor = { $regex: vendor, $options: "i" };
  
    if (startDate || endDate) {
      query.orderDate = {};
      if (startDate) query.orderDate.$gte = new Date(startDate);
      if (endDate) query.orderDate.$lte = new Date(endDate);
    }
  
    if (search) {
      query.$or = [
        { ref_num: { $regex: search, $options: "i" } },
        { poNumber: { $regex: search, $options: "i" } },
        { vendor: { $regex: search, $options: "i" } },
        { "items.productName": { $regex: search, $options: "i" } },
      ];
    }
  
    const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };
  
    // 1️⃣ Fetch purchase orders and total count
    const [purchaseOrders, total] = await Promise.all([
      PurchaseOrder.find(query)
        .populate("createdBy", "name username")
        .populate("approvedBy", "name username")
        .sort(sort)
        .skip(skip)
        .limit(all ? 0 : limit)
        .lean(),
      PurchaseOrder.countDocuments(query),
    ]);
  
    // If no purchase orders found, return early
    if (!purchaseOrders.length) {
      return {
        purchaseOrders: [],
        pagination: {
          page,
          limit: all ? total : limit,
          total,
          pages: all ? 1 : Math.ceil(total / limit),
        },
      };
    }
  
    // 2️⃣ Get all ref_nums from the fetched POs
    // const poRefNums = purchaseOrders.map(po => po.ref_num);
  
    // 3️⃣ Fetch purchases with matching ref_nums
    // const purchases = await Purchase.find({
    //   ref_num: { $in: poRefNums },
    //   isDeleted: false
    // }).select("ref_num").lean();
  
    // const purchaseRefSet = new Set(purchases.map(p => p.ref_num));
  
    // // 4️⃣ Attach `isPurchasedCreated` + format attachment
    const updatedPurchaseOrders = purchaseOrders.map((po) => ({
      ...po,
      attachment: po.attachment ? getAttachmentUrl(po.attachment) : null,
    }));
  
    return {
      purchaseOrders: updatedPurchaseOrders,
      pagination: {
        page,
        limit: all ? total : limit,
        total,
        pages: all ? 1 : Math.ceil(total / limit),
      },
    };
  }
  

  /**
   * Get purchase order by ID
   * @param {string} purchaseOrderId
   * @returns {Object} Purchase order data
   */
  async getPurchaseOrderByIdOrRefNum(identifier) {
    // Try to find by MongoDB ObjectId or by ref_num
    let purchaseOrder = null;
    if (/^[0-9a-fA-F]{24}$/.test(identifier)) {
      purchaseOrder = await PurchaseOrder.findById(identifier)
        .populate("createdBy", "name username")
        .populate("approvedBy", "name username")
        .lean();
    }
    if (!purchaseOrder) {
      purchaseOrder = await PurchaseOrder.findOne({ ref_num: identifier })
        .populate("createdBy", "name username")
        .populate("approvedBy", "name username")
        .lean();
    }
    return purchaseOrder;
  }

async getPurchaseOrders(options) {
  const {
    page = 1,
    limit = 10,
    search,
    status,
    vendor,
    startDate,
    endDate,
    sortBy = "orderDate",
    sortOrder = "desc",
    all = false,
    isDeleted,
  } = options;

  try {
    const skip = all ? 0 : (page - 1) * limit;
    const query = {};

    // Always force filter on isDeleted
    if (isDeleted === true || isDeleted === "true") {
      query.isDeleted = true;
    } else {
      query.isDeleted = { $ne: true }; // More robust way to exclude deleted items
    }

    // Enhanced Search with better field coverage
    if (search && search.trim()) {
      const searchRegex = { $regex: search.trim(), $options: "i" };
      query.$or = [
        { ref_num: searchRegex },
        { poNumber: searchRegex },
        { vendor: searchRegex },
        { status: searchRegex },
        { "items.productName": searchRegex },
        { "items.description": searchRegex },
        { notes: searchRegex },
        { description: searchRegex }
      ];
    }

    // Status filter - handle both single status and array of statuses
    if (status && status.trim()) {
      if (Array.isArray(status)) {
        query.status = { $in: status };
      } else {
        // Exact match for status
        query.status = status.trim();
      }
    }

    // Vendor filter - enhanced with partial matching
    if (vendor && vendor.trim()) {
      query.vendor = { $regex: vendor.trim(), $options: "i" };
    }

    // Enhanced Date Range filtering with proper date handling
    if (startDate || endDate) {
      query.orderDate = {};
      
      if (startDate) {
        try {
          const start = new Date(startDate);
          if (!isNaN(start.getTime())) {
            // Set to beginning of day
            start.setHours(0, 0, 0, 0);
            query.orderDate.$gte = start;
          }
        } catch (error) {
          console.warn('Invalid startDate format:', startDate);
        }
      }
      
      if (endDate) {
        try {
          const end = new Date(endDate);
          if (!isNaN(end.getTime())) {
            // Set to end of day
            end.setHours(23, 59, 59, 999);
            query.orderDate.$lte = end;
          }
        } catch (error) {
          console.warn('Invalid endDate format:', endDate);
        }
      }
    }

    // Enhanced sorting with fallback options
    const validSortFields = ['orderDate', 'poNumber', 'vendor', 'status', 'total', 'ref_num', 'createdAt'];
    const finalSortBy = validSortFields.includes(sortBy) ? sortBy : 'orderDate';
    const finalSortOrder = ['asc', 'desc'].includes(sortOrder) ? sortOrder : 'desc';
    
    const sort = { [finalSortBy]: finalSortOrder === "desc" ? -1 : 1 };
    
    // Add secondary sort for consistent ordering
    if (finalSortBy !== 'createdAt') {
      sort.createdAt = -1; // Always sort by creation date as secondary
    }

    // Debug logging
    console.log('Purchase Orders Query:', JSON.stringify(query, null, 2));
    console.log('Sort:', sort);

    // Enhanced aggregation pipeline for better performance and features
    const aggregationPipeline = [
      { $match: query },
      {
        $lookup: {
          from: "users",
          localField: "createdBy",
          foreignField: "_id",
          as: "createdBy",
          pipeline: [{ $project: { name: 1, username: 1 } }]
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "approvedBy",
          foreignField: "_id",
          as: "approvedBy",
          pipeline: [{ $project: { name: 1, username: 1 } }]
        }
      },
      {
        $addFields: {
          createdBy: { $arrayElemAt: ["$createdBy", 0] },
          approvedBy: { $arrayElemAt: ["$approvedBy", 0] },
          // Add computed fields for better sorting/filtering
          totalItems: { $size: { $ifNull: ["$items", []] } },
          hasAttachment: { $ne: ["$attachment", null] }
        }
      },
      { $sort: sort }
    ];

    // Get total count and paginated results
    const [countResult, purchaseOrders] = await Promise.all([
      PurchaseOrder.aggregate([
        ...aggregationPipeline,
        { $count: "total" }
      ]),
      PurchaseOrder.aggregate([
        ...aggregationPipeline,
        ...(all ? [] : [{ $skip: skip }, { $limit: limit }])
      ])
    ]);

    const total = countResult[0]?.total || 0;

    // Process attachments
    const updatedPurchaseOrders = purchaseOrders.map((po) => ({
      ...po,
      attachment: po.attachment ? getAttachmentUrl(po.attachment) : null,
      // Ensure consistent ID field
      id: po._id?.toString() || po.id
    }));

    // Enhanced pagination response
    const paginationData = {
      page: parseInt(page),
      limit: all ? total : parseInt(limit),
      total,
      pages: all ? 1 : Math.ceil(total / limit),
      hasNext: !all && page < Math.ceil(total / limit),
      hasPrev: !all && page > 1,
      startIndex: all ? 1 : ((page - 1) * limit) + 1,
      endIndex: all ? total : Math.min(page * limit, total)
    };

    return {
      purchaseOrders: updatedPurchaseOrders,
      pagination: paginationData,
      filters: {
        search: search || null,
        status: status || null,
        vendor: vendor || null,
        startDate: startDate || null,
        endDate: endDate || null,
        sortBy: finalSortBy,
        sortOrder: finalSortOrder
      }
    };

  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    throw new Error(`Failed to fetch purchase orders: ${error.message}`);
  }
}

  /**
   * Create new purchase order
   * @param {Object} purchaseOrderData
   * @returns {Object} Created purchase order
   */
  async createPurchaseOrder(purchaseOrderData) {
    const { items, ...otherData } = purchaseOrderData;

    // Process items to include product names and calculate totals
    const processedItems = await this.processItems(items);
    const subtotal = processedItems.reduce((sum, item) => sum + item.total, 0);
    const total = subtotal;

    const purchaseOrder = new PurchaseOrder({
      ...otherData,
      items: processedItems,
      subtotal,
      total,
    });

    return await purchaseOrder.save();
  }

  /**
   * Update purchase order
   * @param {string} purchaseOrderId
   * @param {Object} updateData
   * @returns {Object} Updated purchase order
   */
  async updatePurchaseOrderByIdOrRefNum(identifier, updateData) {
    // If items are being updated, process them
    if (updateData.items) {
      const processedItems = await this.processItems(updateData.items);
      updateData.items = processedItems;
      updateData.subtotal = processedItems.reduce(
        (sum, item) => sum + item.total,
        0
      );
      updateData.total = updateData.subtotal;
    }
    // Try to update by MongoDB ObjectId or by ref_num
    let purchaseOrder = null;
    if (/^[0-9a-fA-F]{24}$/.test(identifier)) {
      purchaseOrder = await PurchaseOrder.findByIdAndUpdate(
        identifier,
        updateData,
        {
          new: true,
          runValidators: true,
        }
      )
        .populate("createdBy", "name username")
        .populate("approvedBy", "name username");
    }
    if (!purchaseOrder) {
      purchaseOrder = await PurchaseOrder.findOneAndUpdate(
        { ref_num: identifier },
        updateData,
        {
          new: true,
          runValidators: true,
        }
      )
        .populate("createdBy", "name username")
        .populate("approvedBy", "name username");
    }
    return purchaseOrder;
  }

  /**
   * Delete purchase order (hard delete)
   * @param {string} purchaseOrderId
   * @param {string} deletedBy
   * @returns {Object} Deleted purchase order
   */

  async deletePurchaseOrderFinal(identifier, deletedBy) {
    // First find the purchase order to get attachment info
    let purchaseOrder = null;
    if (/^[0-9a-fA-F]{24}$/.test(identifier)) {
      purchaseOrder = await PurchaseOrder.findById(identifier);
    }
    if (!purchaseOrder) {
      purchaseOrder = await PurchaseOrder.findOne({ ref_num: identifier });
    }
  
    if (!purchaseOrder) {
      throw new Error("Purchase Order not found");
    }
  
    // If purchase order has an attachment, delete the file from recycle bin
    if (purchaseOrder.attachment) {
      const fileUrl = purchaseOrder.attachment; 
      const fileName = path.basename(fileUrl);
  
      // Points to recycle bin path
      const recycleFilePath = path.join(
        process.cwd(),
        "uploads",
        "recycle-bin",
        "purchase-orders",
        fileName
      );
  
      if (fs.existsSync(recycleFilePath)) {
        try {
          fs.unlinkSync(recycleFilePath);
          console.log("Deleted attachment:", recycleFilePath);
        } catch (err) {
          console.error("Error deleting attachment:", err.message);
        }
      }
    }
  
    // Now permanently delete the purchase order
    let deletedPO = null;
    if (/^[0-9a-fA-F]{24}$/.test(identifier)) {
      deletedPO = await PurchaseOrder.findByIdAndDelete(identifier);
    }
    if (!deletedPO) {
      deletedPO = await PurchaseOrder.findOneAndDelete({ ref_num: identifier });
    }
  
    return deletedPO;
  }

  // Soft delete send to recycle bin
  async deletePurchaseOrderByIdOrRefNum(identifier, deletedBy) {
    const purchaseOrder = await PurchaseOrder.findOne({
      $or: [{ _id: identifier }, { ref_num: identifier }],
    });

    if (!purchaseOrder) {
      throw new Error("Purchase Order not found");
    }

    // Move attachment to recycle bin if exists
    if (purchaseOrder.attachment) {
      const fileUrl = purchaseOrder.attachment; // full URL like http://localhost:8080/uploads/purchase-orders/file.pdf
      const fileName = path.basename(fileUrl);
      const currentFilePath = path.join(
        process.cwd(),
        "uploads",
        "purchase-orders",
        fileName
      );
      const recycleBinDir = path.join(
        process.cwd(),
        "uploads",
        "recycle-bin",
        "purchase-orders"
      );

      // Create recycle bin folder if not exists
      if (!fs.existsSync(recycleBinDir)) {
        fs.mkdirSync(recycleBinDir, { recursive: true });
      }

      // Move the file
      if (fs.existsSync(currentFilePath)) {
        const newFilePath = path.join(recycleBinDir, fileName);
        fs.renameSync(currentFilePath, newFilePath);
        purchaseOrder.attachment = `/uploads/recycle-bin/purchase-orders/${fileName}`;
      }
    }

    // Soft delete the purchase order
    purchaseOrder.isDeleted = true;
    await purchaseOrder.save();

    return { success: true, message: "Purchase order moved to recycle bin" };
  }

  /**
   * Search purchase orders
   * @param {string} searchTerm
   * @param {number} limit
   * @returns {Array} Purchase orders
   */
  async searchPurchaseOrders(searchTerm, limit = 10) {
    return await PurchaseOrder.find({
      $or: [
        { ref_num: { $regex: searchTerm, $options: "i" } },
        { poNumber: { $regex: searchTerm, $options: "i" } },
        { vendor: { $regex: searchTerm, $options: "i" } },
        { "items.productName": { $regex: searchTerm, $options: "i" } },
      ],
    })
      .select("ref_num poNumber vendor status orderDate total")
      .sort({ orderDate: -1 })
      .limit(limit)
      .lean();
  }

  /**
   * Process items to include product names and calculate totals
   * @param {Array} items
   * @returns {Array} Processed items
   */
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
    }

    return processedItems;
  }

  /**
   * Get purchase order statistics
   * @returns {Object} Statistics
   */
  async getPurchaseOrderStats() {
    const stats = await PurchaseOrder.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalValue: { $sum: "$total" },
        },
      },
    ]);

    const totalOrders = await PurchaseOrder.countDocuments();
    const totalValue = await PurchaseOrder.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$total" },
        },
      },
    ]);

    return {
      byStatus: stats,
      totalOrders,
      totalValue: totalValue[0]?.total || 0,
    };
  }

  /**
   * Get purchase orders by vendor
   * @param {string} vendor
   * @param {Object} options
   * @returns {Object} Purchase orders and pagination
   */
  async getPurchaseOrdersByVendor(vendor, options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = "orderDate",
      sortOrder = "desc",
    } = options;

    const skip = (page - 1) * limit;

    const query = { vendor: { $regex: vendor, $options: "i" } };

    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const purchaseOrders = await PurchaseOrder.find(query)
      .populate("createdBy", "name username")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await PurchaseOrder.countDocuments(query);

    return {
      purchaseOrders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // // restore purchaseOrder🧮
  // async restorePurchaseOrder(id) {
  //   const updated = await PurchaseOrder.findByIdAndUpdate(
  //     id,
  //     { isDeleted: false },
  //     { new: true }
  //   );
  //   return updated;
  // }
}

module.exports = new PurchaseOrderService();
