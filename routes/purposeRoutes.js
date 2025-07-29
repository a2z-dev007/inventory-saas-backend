// routes/purposeRoutes.js
const express = require("express");
const router = express.Router();
const purposeController = require("../controllers/purposeController");

router
  .route("/")
  .post(purposeController.createPurpose)
  .get(purposeController.getPurposes);

router
  .route("/:id")
  .get(purposeController.getSinglePurpose) // 👈 this is the new route
  .put(purposeController.updatePurpose) // ✅ added update route
  .delete(purposeController.deletePurpose);

module.exports = router;
