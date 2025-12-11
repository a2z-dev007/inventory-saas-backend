const Sale = require("../models/Sale")
const Purchase = require("../models/Purchase")
const PurchaseOrder = require("../models/PurchaseOrder")
const Customer = require("../models/Customer")
const Vendor = require("../models/Vendor")

class ReportsService {
  /**
   * Get sales data formatted for client reports
   * @param {Object} options - Query options
   * @returns {Object} Sales data with frontend-compatible format
   */
  async getSalesReport(options) {
    const {
      page = 1,
      limit = 10,
      search,
      customer,
      startDate,
      endDate,
      sortBy = "saleDate",
      sortOrder = "desc",
      all = false,
    } = options

    const skip = all ? 0 : (page - 1) * limit
    const query = { isDeleted: false }

    // Customer filtering
    if (customer) {
      query.customerName = { $regex: customer, $options: "i" }
    }

    // Date range filter
    if (startDate || endDate) {
      query.saleDate = {}
      if (startDate) query.saleDate.$gte = new Date(startDate)
      if (endDate) query.saleDate.$lte = new Date(endDate)
    }

    // Search functionality
    if (search) {
      query.$or = [
        { invoiceNumber: { $regex: search, $options: "i" } },
        { customerName: { $regex: search, $options: "i" } },
        { ref_num: { $regex: search, $options: "i" } },
      ]
    }

    const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 }

    const [sales, total] = await Promise.all([
      Sale.find(query)
        .populate("createdBy", "name username")
        .populate("items.productId", "name")
        .sort(sort)
        .skip(skip)
        .limit(all ? 0 : limit)
        .lean(),
      Sale.countDocuments(query),
    ])

    // Transform sales data to match frontend expectations
    const transformedSales = sales.map(sale => ({
      _id: sale._id,
      ref_num: sale.ref_num || sale.invoiceNumber,
      customer: {
        _id: sale._id, // Using sale ID as fallback
        name: sale.customerName
      },
      vendor: {
        _id: sale._id, // Using sale ID as fallback
        name: "N/A" // Sales don't have vendors typically
      },
      items: sale.items.map(item => ({
        ...item,
        product: {
          name: item.productName || (item.productId?.name) || "Unknown Product"
        },
        quantity: item.quantity
      })),
      totalAmount: sale.total,
      createdAt: sale.createdAt,
      saleDate: sale.saleDate,
      status: sale.status,
      invoiceNumber: sale.invoiceNumber
    }))

    return {
      sales: transformedSales,
      pagination: {
        page,
        limit: all ? total : limit,
        total,
        pages: all ? 1 : Math.ceil(total / limit),
      },
    }
  }

  /**
   * Get purchases data formatted for supplier reports
   * @param {Object} options - Query options
   * @returns {Object} Purchases data with frontend-compatible format
   */
  async getPurchasesReport(options) {
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
    } = options

    const skip = all ? 0 : (page - 1) * limit
    const query = { isDeleted: false }

    // Vendor filtering
    if (vendor) {
      query.vendor = { $regex: vendor, $options: "i" }
    }

    // Date range filter
    if (startDate || endDate) {
      query.purchaseDate = {}
      if (startDate) query.purchaseDate.$gte = new Date(startDate)
      if (endDate) query.purchaseDate.$lte = new Date(endDate)
    }

    // Search functionality
    if (search) {
      query.$or = [
        { receiptNumber: { $regex: search, $options: "i" } },
        { vendor: { $regex: search, $options: "i" } },
        { ref_num: { $regex: search, $options: "i" } },
      ]
    }

    const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 }

    const [purchases, total] = await Promise.all([
      Purchase.find(query)
        .populate("createdBy", "name username")
        .populate("items.productId", "name")
        .sort(sort)
        .skip(skip)
        .limit(all ? 0 : limit)
        .lean(),
      Purchase.countDocuments(query),
    ])

    // Populate client data from Purchase Orders and transform data
    const transformedPurchases = await Promise.all(
      purchases.map(async (purchase) => {
        let clientData = { _id: purchase._id, name: "N/A" };
        
        // Get client data from Purchase Order if ref_num exists
        if (purchase.ref_num) {
          try {
            const purchaseOrder = await PurchaseOrder.findOne({ 
              ref_num: purchase.ref_num 
            }).select('customer customerName customerAddress').lean();
            
            if (purchaseOrder) {
              clientData = {
                _id: purchase._id,
                name: purchaseOrder.customerName || purchaseOrder.customer || "N/A"
              };
            }
          } catch (error) {
            console.error(`Error fetching PO data for ref_num ${purchase.ref_num}:`, error);
          }
        }

        return {
          _id: purchase._id,
          ref_num: purchase.ref_num || purchase.receiptNumber,
          vendor: {
            _id: purchase._id, // Using purchase ID as fallback
            name: purchase.vendor
          },
          customer: clientData,
          items: purchase.items.map(item => ({
            ...item,
            product: {
              name: item.productName || (item.productId?.name) || "Unknown Product"
            },
            quantity: item.quantity
          })),
          totalAmount: purchase.total,
          createdAt: purchase.createdAt,
          purchaseDate: purchase.purchaseDate,
          receiptNumber: purchase.receiptNumber
        };
      })
    )

    return {
      purchases: transformedPurchases,
      pagination: {
        page,
        limit: all ? total : limit,
        total,
        pages: all ? 1 : Math.ceil(total / limit),
      },
    }
  }

  /**
   * Get all suppliers for dropdown
   * @returns {Array} List of all active suppliers
   */
  async getAllSuppliers() {
    return await Vendor.find({ isActive: true })
      .select("_id name contact email")
      .sort({ name: 1 })
      .lean()
  }

  /**
   * Get all customers for dropdown
   * @returns {Array} List of all active customers
   */
  async getAllCustomers() {
    return await Customer.find({})
      .select("_id name contact email")
      .sort({ name: 1 })
      .lean()
  }

  /**
   * Get client-specific purchases report
   * @param {string} clientName - Client name to filter by
   * @param {Object} options - Query options
   * @returns {Object} Client purchases report
   */
  async getClientReport(clientName, options = {}) {
    const {
      startDate,
      endDate,
      page = 1,
      limit = 10,
      all = false,
    } = options

    const skip = all ? 0 : (page - 1) * limit

    // First, get all purchases
    const purchaseQuery = { isDeleted: false }

    // Date range filter
    if (startDate || endDate) {
      purchaseQuery.purchaseDate = {}
      if (startDate) purchaseQuery.purchaseDate.$gte = new Date(startDate)
      if (endDate) purchaseQuery.purchaseDate.$lte = new Date(endDate)
    }

    const [allPurchases, totalPurchases] = await Promise.all([
      Purchase.find(purchaseQuery)
        .populate("createdBy", "name username")
        .populate("items.productId", "name")
        .sort({ purchaseDate: -1 })
        .lean(),
      Purchase.countDocuments(purchaseQuery),
    ])

    // Filter purchases by client name using PurchaseOrder data
    const clientPurchases = []
    for (const purchase of allPurchases) {
      if (purchase.ref_num) {
        try {
          const purchaseOrder = await PurchaseOrder.findOne({ 
            ref_num: purchase.ref_num 
          }).select('customer customerName customerAddress').lean();
          
          if (purchaseOrder) {
            const customerName = purchaseOrder.customerName || purchaseOrder.customer || '';
            // Check if this purchase matches the client we're looking for
            if (customerName.toLowerCase().includes(clientName.toLowerCase())) {
              // Add client data to purchase
              purchase.customer = purchaseOrder.customer;
              purchase.customerName = purchaseOrder.customerName;
              purchase.customerAddress = purchaseOrder.customerAddress;
              clientPurchases.push(purchase);
            }
          }
        } catch (error) {
          console.error(`Error fetching PO data for ref_num ${purchase.ref_num}:`, error);
        }
      }
    }

    // Apply pagination to filtered results
    const total = clientPurchases.length;
    const paginatedPurchases = all ? clientPurchases : clientPurchases.slice(skip, skip + limit);

    // Transform data without summary
    const transformedPurchases = paginatedPurchases.map(purchase => ({
      _id: purchase._id,
      ref_num: purchase.ref_num || purchase.receiptNumber,
      vendor: {
        _id: purchase._id,
        name: purchase.vendor
      },
      customer: {
        _id: purchase._id,
        name: purchase.customerName || purchase.customer || "N/A"
      },
      items: purchase.items.map(item => ({
        product: {
          name: item.productName || (item.productId?.name) || "Unknown Product"
        },
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total
      })),
      totalAmount: purchase.total,
      createdAt: purchase.createdAt,
      purchaseDate: purchase.purchaseDate,
      receiptNumber: purchase.receiptNumber
    }))

    return {
      client: clientName,
      purchases: transformedPurchases,
      pagination: {
        page,
        limit: all ? total : limit,
        total,
        pages: all ? 1 : Math.ceil(total / limit),
      },
    }
  }

  /**
   * Get supplier-specific purchases report
   * @param {string} vendorName - Vendor name to filter by
   * @param {Object} options - Query options
   * @returns {Object} Supplier purchases report
   */
  async getSupplierReport(vendorName, options = {}) {
    const {
      startDate,
      endDate,
      page = 1,
      limit = 10,
      all = false,
    } = options

    const skip = all ? 0 : (page - 1) * limit
    const query = {
      vendor: { $regex: vendorName, $options: "i" },
      isDeleted: false
    }

    // Date range filter
    if (startDate || endDate) {
      query.purchaseDate = {}
      if (startDate) query.purchaseDate.$gte = new Date(startDate)
      if (endDate) query.purchaseDate.$lte = new Date(endDate)
    }

    const [purchases, total] = await Promise.all([
      Purchase.find(query)
        .populate("items.productId", "name")
        .sort({ purchaseDate: -1 })
        .skip(skip)
        .limit(all ? 0 : limit)
        .lean(),
      Purchase.countDocuments(query),
    ])

    // Transform data with client information from Purchase Orders (no summary)
    const transformedPurchases = await Promise.all(
      purchases.map(async (purchase) => {
        let clientData = { _id: purchase._id, name: "N/A" };
        
        // Get client data from Purchase Order if ref_num exists
        if (purchase.ref_num) {
          try {
            const purchaseOrder = await PurchaseOrder.findOne({ 
              ref_num: purchase.ref_num 
            }).select('customer customerName customerAddress').lean();
            
            if (purchaseOrder) {
              clientData = {
                _id: purchase._id,
                name: purchaseOrder.customerName || purchaseOrder.customer || "N/A"
              };
            }
          } catch (error) {
            console.error(`Error fetching PO data for ref_num ${purchase.ref_num}:`, error);
          }
        }

        return {
          _id: purchase._id,
          ref_num: purchase.ref_num || purchase.receiptNumber,
          vendor: {
            _id: purchase._id,
            name: purchase.vendor
          },
          customer: clientData,
          items: purchase.items.map(item => ({
            product: {
              name: item.productName || (item.productId?.name) || "Unknown Product"
            },
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total
          })),
          totalAmount: purchase.total,
          createdAt: purchase.createdAt,
          purchaseDate: purchase.purchaseDate,
          receiptNumber: purchase.receiptNumber
        };
      })
    )

    return {
      supplier: vendorName,
      purchases: transformedPurchases,
      pagination: {
        page,
        limit: all ? total : limit,
        total,
        pages: all ? 1 : Math.ceil(total / limit),
      },
    }
  }
}

module.exports = new ReportsService()