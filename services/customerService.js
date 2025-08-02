const Customer = require("../models/Customer")
const Sale = require("../models/Sale")

class CustomerService {
  /**
   * Get customers with pagination and filters
   * @param {Object} options - Query options
   * @returns {Object} Customers and pagination info
   */
  async getCustomers(options) {
    const { page = 1, limit = 10, search, status, sortBy = "name", sortOrder = "asc", all = false } = options

    const skip = all ? 0 : (page - 1) * limit

    // Build query
    const query = {}

    // Filter by status
    if (status) {
      query.status = status
    }

    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
      ]
    }

    // Build sort object
    const sort = {}
    sort[sortBy] = sortOrder === "desc" ? -1 : 1

    // Execute query
    const customers = await Customer.find(query)
      .populate("createdBy", "name username")
      .sort(sort)
      .skip(skip)
      .limit(all ? undefined : limit)
      .lean()

    const total = await Customer.countDocuments(query)

    return {
      customers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  }

  /**
   * Get customer by ID
   * @param {string} customerId
   * @returns {Object} Customer data
   */
  async getCustomerById(customerId) {
    return await Customer.findById(customerId)
      .populate("createdBy", "name username")
      .lean()
  }

  /**
   * Create new customer
   * @param {Object} customerData
   * @returns {Object} Created customer
   */
  async createCustomer(customerData) {
    const customer = new Customer(customerData)
    return await customer.save()
  }

  /**
   * Update customer
   * @param {string} customerId
   * @param {Object} updateData
   * @returns {Object} Updated customer
   */
  async updateCustomer(customerId, updateData) {
    const customer = await Customer.findByIdAndUpdate(customerId, updateData, {
      new: true,
      runValidators: true,
    }).populate("createdBy", "name username")

    return customer
  }

  /**
   * Delete customer (soft delete)
   * @param {string} customerId
   * @param {string} deletedBy
   * @returns {Object} Deleted customer
   */
  async deleteCustomer(customerId, deletedBy) {
    const customer = await Customer.findByIdAndUpdate(
      customerId,
      {
        isDeleted: true,
        deletedBy,
        deletedAt: new Date(),
      },
      { new: true }
    )

    return customer
  }

  /**
   * Search customers
   * @param {string} searchTerm
   * @param {number} limit
   * @returns {Array} Customers
   */
  async searchCustomers(searchTerm, limit = 10) {
    return await Customer.find({
      $or: [
        { name: { $regex: searchTerm, $options: "i" } },
        { email: { $regex: searchTerm, $options: "i" } },
        { phone: { $regex: searchTerm, $options: "i" } },
        { company: { $regex: searchTerm, $options: "i" } },
      ],
    })
      .select("name email phone company status")
      .sort({ name: 1 })
      .limit(limit)
      .lean()
  }

  /**
   * Get customer sales history
   * @param {string} customerId
   * @param {Object} options
   * @returns {Object} Sales and pagination
   */
  async getCustomerSales(customerId, options = {}) {
    const { page = 1, limit = 10 } = options

    // First check if customer exists
    const customer = await Customer.findById(customerId)
    if (!customer) {
      return null
    }

    const skip = (page - 1) * limit

    const sales = await Sale.find({
      customerName: customer.name,
      isDeleted: { $ne: true },
    })
      .populate("createdBy", "name username")
      .sort({ saleDate: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    const total = await Sale.countDocuments({
      customerName: customer.name,
      isDeleted: { $ne: true },
    })

    return {
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
      },
      sales,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  }

  /**
   * Get customer statistics
   * @returns {Object} Statistics
   */
  async getCustomerStats() {
    const stats = await Customer.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ])

    const totalCustomers = await Customer.countDocuments()
    const activeCustomers = await Customer.countDocuments({ status: "active" })
    const inactiveCustomers = await Customer.countDocuments({ status: "inactive" })

    return {
      totalCustomers,
      activeCustomers,
      inactiveCustomers,
      byStatus: stats,
    }
  }

  /**
   * Get top customers by sales
   * @param {number} limit
   * @returns {Array} Top customers
   */
  async getTopCustomers(limit = 10) {
    const topCustomers = await Sale.aggregate([
      {
        $group: {
          _id: "$customerName",
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: "$total" },
          lastPurchase: { $max: "$saleDate" },
        },
      },
      {
        $sort: { totalRevenue: -1 },
      },
      {
        $limit: limit,
      },
    ])

    return topCustomers
  }

  /**
   * Get customer by email
   * @param {string} email
   * @returns {Object} Customer
   */
  async getCustomerByEmail(email) {
    return await Customer.findOne({ email }).lean()
  }

  /**
   * Get customers by company
   * @param {string} company
   * @param {Object} options
   * @returns {Object} Customers and pagination
   */
  async getCustomersByCompany(company, options = {}) {
    const { page = 1, limit = 10, sortBy = "name", sortOrder = "asc" } = options

    const skip = (page - 1) * limit

    const query = { company: { $regex: company, $options: "i" } }

    const sort = {}
    sort[sortBy] = sortOrder === "desc" ? -1 : 1

    const customers = await Customer.find(query)
      .populate("createdBy", "name username")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean()

    const total = await Customer.countDocuments(query)

    return {
      customers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  }
}

module.exports = new CustomerService() 