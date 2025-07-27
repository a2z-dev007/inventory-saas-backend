const express = require("express");
const categoryController = require("../controllers/categoryController");



const { protect } = require("../middleware/auth");
const {
  validateCreateCategory
} = require("../middleware/validation")

const router = express.Router();
router
  .route("/")
  .get(protect, categoryController.getCategories)
  .post(protect, validateCreateCategory, categoryController.createCategory);

router
  .route("/:id")
  .get(protect, categoryController.getCategoryById)
  .put(protect, categoryController.updateCategory)
  .delete(protect, categoryController.deleteCategory);

module.exports = router;
