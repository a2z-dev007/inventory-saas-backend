const categoryService = require("../services/categoryService")
const logger = require("../utils/logger")
const { validationResult } = require("express-validator")

class CategoryController {
  async getCategories(req, res, next) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: "Validation failed", errors: errors.array() })
      }

      const options = {
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 10,
        search: req.query.search || "",
        sortBy: req.query.sortBy || "createdAt",
        sortOrder: req.query.sortOrder || "desc",
      }

      const result = await categoryService.getCategories(options)
      res.json({ success: true, data: result })
    } catch (error) {
      logger.error("Get categories error:", error)
      next(error)
    }
  }

  async getCategoryById(req, res, next) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: "Validation failed", errors: errors.array() })
      }

      const category = await categoryService.getCategoryById(req.params.id)
      if (!category) {
        return res.status(404).json({ success: false, message: "Category not found" })
      }

      res.json({ success: true, data: { category } })
    } catch (error) {
      logger.error("Get category error:", error)
      next(error)
    }
  }

  async createCategory(req, res, next) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: "Validation failed", errors: errors.array() })
      }

      const category = await categoryService.createCategory({ ...req.body, createdBy: req.user.id })

      logger.info(`Category created: ${category.name} by user ${req.user.username}`)
      res.status(201).json({ success: true, message: "Category created successfully", data: { category } })
    } catch (error) {
      logger.error("Create category error:", error)
      if (error.code === 11000) {
        return res.status(400).json({ success: false, message: "Category name already exists" })
      }
      next(error)
    }
  }

  async updateCategory(req, res, next) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: "Validation failed", errors: errors.array() })
      }

      const category = await categoryService.updateCategory(req.params.id, {
        ...req.body,
        updatedBy: req.user.id,
      })

      if (!category) {
        return res.status(404).json({ success: false, message: "Category not found" })
      }

      logger.info(`Category updated: ${category.name} by user ${req.user.username}`)
      res.json({ success: true, message: "Category updated successfully", data: { category } })
    } catch (error) {
      logger.error("Update category error:", error)
      next(error)
    }
  }

  async deleteCategory(req, res, next) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: "Validation failed", errors: errors.array() })
      }

      const category = await categoryService.deleteCategory(req.params.id, req.user.id)

      if (!category) {
        return res.status(404).json({ success: false, message: "Category not found" })
      }

      logger.info(`Category deleted: ${category.name} by user ${req.user.username}`)
      res.json({ success: true, message: "Category deleted successfully" })
    } catch (error) {
      logger.error("Delete category error:", error)
      next(error)
    }
  }
}

module.exports = new CategoryController()
