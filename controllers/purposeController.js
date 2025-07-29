// controllers/purposeController.js
const Purpose = require("../models/PurposeModel");
const purposeService = require("../services/purposeService");

exports.createPurpose = async (req, res) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: "Title is required" });
    }

    const purpose = await Purpose.create({ title });

    res.status(201).json({ success: true, data: purpose });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPurposes = async (req, res) => {
  try {
    const data = await purposeService.getPurposes(req.query);
    res.status(200).json({ success: true, ...data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deletePurpose = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Purpose.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Purpose not found" });
    }
    res.status(200).json({ success: true, message: "Purpose deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.getSinglePurpose = async (req, res) => {
  try {
    const { id } = req.params;
    const purpose = await purposeService.getSinglePurpose(id);

    if (!purpose) {
      return res.status(404).json({ success: false, message: "Purpose not found" });
    }

    res.status(200).json({ success: true, data: purpose });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updatePurpose = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    if (!title || title.trim() === "") {
      return res.status(400).json({ success: false, message: "Title is required" });
    }

    const updated = await purposeService.updatePurpose(id, { title });

    if (!updated) {
      return res.status(404).json({ success: false, message: "Purpose not found" });
    }

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};