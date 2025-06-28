const User = require("../models/User")

class UserService {
  /**
   * Get users with pagination and search
   * @param {Object} options - Query options
   * @returns {Object} Users and pagination info
   */
  async getUsers(options) {
    const { page = 1, limit = 10, search, role, sortBy = "createdAt", sortOrder = "desc" } = options

    const skip = (page - 1) * limit

    // Build query
    const query = { isActive: true }

    // Filter by role
    if (role) {
      query.role = role
    }

    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ]
    }

    // Build sort object
    const sort = {}
    sort[sortBy] = sortOrder === "desc" ? -1 : 1

    // Execute query
    const users = await User.find(query).select("-password").sort(sort).skip(skip).limit(limit).lean()

    const total = await User.countDocuments(query)

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  }

  /**
   * Get user by ID
   * @param {string} userId
   * @returns {Object} User data
   */
  async getUserById(userId) {
    return await User.findById(userId).select("-password").lean()
  }

  /**
   * Create new user
   * @param {Object} userData
   * @returns {Object} Created user
   */
  async createUser(userData) {
    const user = new User(userData)
    await user.save()
    return user.toJSON()
  }

  /**
   * Update user
   * @param {string} userId
   * @param {Object} updateData
   * @returns {Object} Updated user
   */
  async updateUser(userId, updateData) {
    // Remove password from update data if present
    const { password, ...safeUpdateData } = updateData

    const user = await User.findByIdAndUpdate(userId, safeUpdateData, { new: true, runValidators: true }).select(
      "-password",
    )

    return user
  }

  /**
   * Delete user (soft delete)
   * @param {string} userId
   * @param {string} deletedBy
   * @returns {Object} Deleted user
   */
  async deleteUser(userId, deletedBy) {
    const user = await User.findByIdAndUpdate(
      userId,
      {
        isActive: false,
        deletedBy,
        deletedAt: new Date(),
      },
      { new: true },
    ).select("-password")

    return user
  }

  /**
   * Toggle user status
   * @param {string} userId
   * @param {string} updatedBy
   * @returns {Object} Updated user
   */
  async toggleUserStatus(userId, updatedBy) {
    const user = await User.findById(userId)

    if (!user) {
      return null
    }

    user.isActive = !user.isActive
    user.updatedBy = updatedBy
    await user.save()

    return user.toJSON()
  }

  /**
   * Get user statistics
   * @returns {Object} User statistics
   */
  async getUserStats() {
    const stats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: {
            $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] },
          },
          inactiveUsers: {
            $sum: { $cond: [{ $eq: ["$isActive", false] }, 1, 0] },
          },
        },
      },
    ])

    const roleStats = await User.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
    ])

    const recentUsers = await User.find({ isActive: true }).select("-password").sort({ createdAt: -1 }).limit(5).lean()

    return {
      overview: stats[0] || { totalUsers: 0, activeUsers: 0, inactiveUsers: 0 },
      roleDistribution: roleStats,
      recentUsers,
    }
  }

  /**
   * Search users
   * @param {string} searchTerm
   * @param {number} limit
   * @returns {Array} Users
   */
  async searchUsers(searchTerm, limit = 10) {
    return await User.find({
      isActive: true,
      $or: [
        { name: { $regex: searchTerm, $options: "i" } },
        { username: { $regex: searchTerm, $options: "i" } },
        { email: { $regex: searchTerm, $options: "i" } },
      ],
    })
      .select("name username email role")
      .limit(limit)
      .lean()
  }

  /**
   * Get users by role
   * @param {string} role
   * @returns {Array} Users
   */
  async getUsersByRole(role) {
    return await User.find({ role, isActive: true }).select("-password").sort({ name: 1 }).lean()
  }

  /**
   * Update user last activity
   * @param {string} userId
   */
  async updateLastActivity(userId) {
    await User.findByIdAndUpdate(userId, {
      lastActivity: new Date(),
    })
  }

  /**
   * Check if username exists
   * @param {string} username
   * @param {string} excludeUserId
   * @returns {boolean}
   */
  async isUsernameExists(username, excludeUserId = null) {
    const query = { username }
    if (excludeUserId) {
      query._id = { $ne: excludeUserId }
    }

    const user = await User.findOne(query)
    return !!user
  }

  /**
   * Check if email exists
   * @param {string} email
   * @param {string} excludeUserId
   * @returns {boolean}
   */
  async isEmailExists(email, excludeUserId = null) {
    const query = { email }
    if (excludeUserId) {
      query._id = { $ne: excludeUserId }
    }

    const user = await User.findOne(query)
    return !!user
  }
}

module.exports = new UserService()
