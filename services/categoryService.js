const Category = require("../models/ProductCategory")

class CategoryService {
  async getCategories({ page = 1, limit = 10, search = "", sortBy = "createdAt", sortOrder = "desc" }) {
    const skip = (page - 1) * limit
    const query = { isActive: true }

    if (search) {
      query.name = { $regex: search, $options: "i" }
    }

    const sort = {}
    sort[sortBy] = sortOrder === "desc" ? -1 : 1

    const categories = await Category.find(query).sort(sort).skip(skip).limit(limit).lean()
    const total = await Category.countDocuments(query)

    return {
      categories,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  }

  async getCategoryById(categoryId) {
    return await Category.findById(categoryId).lean()
  }

  async createCategory(data) {
    const category = new Category(data)
    await category.save()
    return category.toJSON()
  }

  async updateCategory(categoryId, data) {
    return await Category.findByIdAndUpdate(categoryId, data, { new: true, runValidators: true })
  }

  async deleteCategory(categoryId, deletedBy) {
    return await Category.findByIdAndUpdate(
      categoryId,
      { isActive: false, deletedAt: new Date(), deletedBy },
      { new: true },
    )
  }

  async isNameExists(name, excludeId = null) {
    const query = { name }
    if (excludeId) {
      query._id = { $ne: excludeId }
    }
    return !!(await Category.findOne(query))
  }
}

module.exports = new CategoryService()
