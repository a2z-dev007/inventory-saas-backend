const UnitType = require("../models/unitTypeModel");

// Create
async function createUnitType(data) {
    return await UnitType.create(data);
}

// Get all (with pagination, search)
async function getUnitTypes({ page = 1, limit = 10, search = "", all = false }) {
    const query = search ? { title: { $regex: search, $options: "i" } } : {};

    if (all === "true" || all === true) {
        // Return all sorted alphabetically by title
        const unitTypes = await UnitType.find(query).sort({ title: 1 });
        return { unitTypes }; // no pagination object
    }

    // Default → paginated (sorted by latest created)
    const skip = (page - 1) * limit;

    const [unitTypes, total] = await Promise.all([
        UnitType.find(query).skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
        UnitType.countDocuments(query),
    ]);

    return {
        unitTypes,
        pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / limit),
        },
    };
}



// Get single
async function getUnitTypeById(id) {
    return await UnitType.findById(id);
}

// Update
async function updateUnitType(id, data) {
    return await UnitType.findByIdAndUpdate(id, data, { new: true });
}

// Delete
async function deleteUnitType(id) {
    return await UnitType.findByIdAndDelete(id);
}

module.exports = {
    createUnitType,
    getUnitTypes,
    getUnitTypeById,
    updateUnitType,
    deleteUnitType,
};
