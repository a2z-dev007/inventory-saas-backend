const unitTypeService = require("../services/unitTypeService");

// Create
exports.createUnitType = async (req, res) => {
    try {
        const unitType = await unitTypeService.createUnitType(req.body);
        res.status(201).json({ success: true, data: unitType });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// Get all
exports.getUnitTypes = async (req, res) => {
    try {
        const { page, limit, search, all } = req.query;

        const result = await unitTypeService.getUnitTypes({ page, limit, search, all });
        res.json({ success: true, data: result });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get by ID
exports.getUnitTypeById = async (req, res) => {
    try {
        const unitType = await unitTypeService.getUnitTypeById(req.params.id);
        if (!unitType) return res.status(404).json({ success: false, message: "Not found" });
        res.json({ success: true, data: unitType });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Update
exports.updateUnitType = async (req, res) => {
    try {
        const unitType = await unitTypeService.updateUnitType(req.params.id, req.body);
        if (!unitType) return res.status(404).json({ success: false, message: "Not found" });
        res.json({ success: true, data: unitType });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// Delete
exports.deleteUnitType = async (req, res) => {
    try {
        const unitType = await unitTypeService.deleteUnitType(req.params.id);
        if (!unitType) return res.status(404).json({ success: false, message: "Not found" });
        res.json({ success: true, message: "Deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
