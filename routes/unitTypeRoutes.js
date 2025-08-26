const express = require("express");
const router = express.Router();
const unitTypeController = require("../controllers/unitTypeController");

router.post("/", unitTypeController.createUnitType);
router.get("/", unitTypeController.getUnitTypes);
router.get("/:id", unitTypeController.getUnitTypeById);
router.put("/:id", unitTypeController.updateUnitType);
router.delete("/:id", unitTypeController.deleteUnitType);

module.exports = router;
