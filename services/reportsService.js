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

  /**
   * Get multi-supplier purchases report with optional client filtering
   * @param {Object} options - Query options including supplier and client IDs
   * @returns {Object} Multi-supplier purchases report
   */
  async getMultiSupplierReport(options = {}) {
    const {
      supplierIds,
      clientIds,
      startDate,
      endDate,
      page = 1,
      limit = 10,
      all = false,
    } = options

    const skip = all ? 0 : (page - 1) * limit

    // Get supplier names from IDs
    const suppliers = await Vendor.find({ _id: { $in: supplierIds } }).select('name').lean()
    const supplierNames = suppliers.map(s => s.name)

    const query = {
      vendor: { $in: supplierNames },
      isDeleted: false
    }

    // Date range filter
    if (startDate || endDate) {
      query.purchaseDate = {}
      if (startDate) query.purchaseDate.$gte = new Date(startDate)
      if (endDate) query.purchaseDate.$lte = new Date(endDate)
    }

    let [purchases, total] = await Promise.all([
      Purchase.find(query)
        .populate("items.productId", "name")
        .sort({ purchaseDate: -1 })
        .lean(),
      Purchase.countDocuments(query),
    ])

    // If client filtering is requested, filter by client IDs
    if (clientIds && clientIds.length > 0) {
      const clientNames = await Customer.find({ _id: { $in: clientIds } }).select('name').lean()
      const clientNamesList = clientNames.map(c => c.name.toLowerCase())

      const filteredPurchases = []
      for (const purchase of purchases) {
        if (purchase.ref_num) {
          try {
            const purchaseOrder = await PurchaseOrder.findOne({ 
              ref_num: purchase.ref_num 
            }).select('customer customerName').lean();
            
            if (purchaseOrder) {
              const customerName = (purchaseOrder.customerName || purchaseOrder.customer || '').toLowerCase()
              if (clientNamesList.some(clientName => customerName.includes(clientName))) {
                filteredPurchases.push(purchase)
              }
            }
          } catch (error) {
            console.error(`Error fetching PO data for ref_num ${purchase.ref_num}:`, error);
          }
        }
      }
      purchases = filteredPurchases
      total = purchases.length
    }

    // Apply pagination
    const paginatedPurchases = all ? purchases : purchases.slice(skip, skip + limit)

    // Transform data with client information from Purchase Orders
    const transformedPurchases = await Promise.all(
      paginatedPurchases.map(async (purchase) => {
        let clientData = { _id: purchase._id, name: "N/A" }
        let customerAddress = "N/A"
        
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
              }
              customerAddress = purchaseOrder.customerAddress || "N/A"
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
          customerName: clientData.name,
          customerAddress: customerAddress,
          items: purchase.items.map(item => ({
            productName: item.productName || (item.productId?.name) || "Unknown Product",
            product: {
              name: item.productName || (item.productId?.name) || "Unknown Product"
            },
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            unitType: item.unitType || '',
            total: item.total || (item.quantity * item.unitPrice),
            isCancelled: item.isCancelled || false,
            isReturn: item.isReturn || false,
            remarks: item.remarks || ''
          })),
          totalAmount: purchase.total,
          createdAt: purchase.createdAt,
          purchaseDate: purchase.purchaseDate,
          receiptNumber: purchase.receiptNumber,
          receivedBy: purchase.receivedBy || '',
          remarks: purchase.remarks || ''
        };
      })
    )

    return {
      suppliers: supplierNames,
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
   * Get multi-client purchases report with optional supplier filtering
   * @param {Object} options - Query options including client and supplier IDs
   * @returns {Object} Multi-client purchases report
   */
  async getMultiClientReport(options = {}) {
    const {
      clientIds,
      supplierIds,
      startDate,
      endDate,
      page = 1,
      limit = 10,
      all = false,
    } = options

    const skip = all ? 0 : (page - 1) * limit

    // Get client names from IDs
    const clients = await Customer.find({ _id: { $in: clientIds } }).select('name').lean()
    const clientNames = clients.map(c => c.name.toLowerCase())

    let query = { isDeleted: false }

    // Date range filter
    if (startDate || endDate) {
      query.purchaseDate = {}
      if (startDate) query.purchaseDate.$gte = new Date(startDate)
      if (endDate) query.purchaseDate.$lte = new Date(endDate)
    }

    // If supplier filtering is requested, add supplier filter
    if (supplierIds && supplierIds.length > 0) {
      const suppliers = await Vendor.find({ _id: { $in: supplierIds } }).select('name').lean()
      const supplierNames = suppliers.map(s => s.name)
      query.vendor = { $in: supplierNames }
    }

    let [allPurchases] = await Promise.all([
      Purchase.find(query)
        .populate("items.productId", "name")
        .sort({ purchaseDate: -1 })
        .lean(),
    ])

    // Filter purchases by client names using PurchaseOrder data
    const clientPurchases = []
    for (const purchase of allPurchases) {
      if (purchase.ref_num) {
        try {
          const purchaseOrder = await PurchaseOrder.findOne({ 
            ref_num: purchase.ref_num 
          }).select('customer customerName customerAddress').lean();
          
          if (purchaseOrder) {
            const customerName = (purchaseOrder.customerName || purchaseOrder.customer || '').toLowerCase()
            // Check if this purchase matches any of the clients we're looking for
            if (clientNames.some(clientName => customerName.includes(clientName))) {
              // Add client data to purchase
              purchase.customer = purchaseOrder.customer
              purchase.customerName = purchaseOrder.customerName
              purchase.customerAddress = purchaseOrder.customerAddress
              clientPurchases.push(purchase)
            }
          }
        } catch (error) {
          console.error(`Error fetching PO data for ref_num ${purchase.ref_num}:`, error);
        }
      }
    }

    // Apply pagination to filtered results
    const total = clientPurchases.length
    const paginatedPurchases = all ? clientPurchases : clientPurchases.slice(skip, skip + limit)

    // Transform data
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
      customerName: purchase.customerName || purchase.customer || "N/A",
      customerAddress: purchase.customerAddress || "N/A",
      items: purchase.items.map(item => ({
        productName: item.productName || (item.productId?.name) || "Unknown Product",
        product: {
          name: item.productName || (item.productId?.name) || "Unknown Product"
        },
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        unitType: item.unitType || '',
        total: item.total || (item.quantity * item.unitPrice),
        isCancelled: item.isCancelled || false,
        isReturn: item.isReturn || false,
        remarks: item.remarks || ''
      })),
      totalAmount: purchase.total,
      createdAt: purchase.createdAt,
      purchaseDate: purchase.purchaseDate,
      receiptNumber: purchase.receiptNumber,
      receivedBy: purchase.receivedBy || '',
      remarks: purchase.remarks || ''
    }))

    return {
      clients: clients.map(c => c.name),
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
   * Get clients that have purchases from specified suppliers
   * @param {Array} supplierIds - Array of supplier IDs
   * @returns {Object} List of clients for suppliers
   */
  async getClientsForSuppliers(supplierIds) {
    // Get supplier names from IDs
    const suppliers = await Vendor.find({ _id: { $in: supplierIds } }).select('name').lean()
    const supplierNames = suppliers.map(s => s.name)

    // Find purchases from these suppliers
    const purchases = await Purchase.find({
      vendor: { $in: supplierNames },
      isDeleted: false,
      ref_num: { $exists: true, $ne: null }
    }).select('ref_num').lean()

    const refNums = purchases.map(p => p.ref_num)

    // Get unique clients from purchase orders
    const purchaseOrders = await PurchaseOrder.find({
      ref_num: { $in: refNums }
    }).select('customer customerName').lean()

    // Extract unique client names and try to match with Customer collection
    const uniqueClientNames = [...new Set(
      purchaseOrders.map(po => po.customerName || po.customer).filter(Boolean)
    )]

    const clients = []
    for (const clientName of uniqueClientNames) {
      // Try to find matching customer in Customer collection
      const customer = await Customer.findOne({
        name: { $regex: clientName, $options: "i" }
      }).select('_id name').lean()

      if (customer) {
        clients.push(customer)
      } else {
        // If not found in Customer collection, create a temporary entry
        clients.push({
          _id: clientName.replace(/\s+/g, '_').toLowerCase(),
          name: clientName
        })
      }
    }

    return {
      clients: clients.sort((a, b) => a.name.localeCompare(b.name))
    }
  }

  /**
   * Get suppliers that have sold to specified clients
   * @param {Array} clientIds - Array of client IDs
   * @returns {Object} List of suppliers for clients
   */
  async getSuppliersForClients(clientIds) {
    // Get client names from IDs
    const clients = await Customer.find({ _id: { $in: clientIds } }).select('name').lean()
    const clientNames = clients.map(c => c.name.toLowerCase())

    // Find purchase orders for these clients
    const purchaseOrders = await PurchaseOrder.find({
      $or: [
        { customerName: { $in: clientNames.map(name => new RegExp(name, 'i')) } },
        { customer: { $in: clientNames.map(name => new RegExp(name, 'i')) } }
      ]
    }).select('ref_num').lean()

    const refNums = purchaseOrders.map(po => po.ref_num)

    // Find purchases with these ref_nums to get suppliers
    const purchases = await Purchase.find({
      ref_num: { $in: refNums },
      isDeleted: false
    }).select('vendor').lean()

    // Extract unique supplier names
    const uniqueSupplierNames = [...new Set(
      purchases.map(p => p.vendor).filter(Boolean)
    )]

    const suppliers = []
    for (const supplierName of uniqueSupplierNames) {
      // Try to find matching vendor in Vendor collection
      const vendor = await Vendor.findOne({
        name: { $regex: supplierName, $options: "i" }
      }).select('_id name').lean()

      if (vendor) {
        suppliers.push(vendor)
      } else {
        // If not found in Vendor collection, create a temporary entry
        suppliers.push({
          _id: supplierName.replace(/\s+/g, '_').toLowerCase(),
          name: supplierName
        })
      }
    }

    return {
      suppliers: suppliers.sort((a, b) => a.name.localeCompare(b.name))
    }
  }
}

module.exports = new ReportsService()