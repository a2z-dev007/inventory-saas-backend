// services/purposeService.js
const Purpose = require("../models/PurposeModel");

exports.getPurposes = async (options) => {
  const {
    page = 1,
    limit = 10,
    search,
    startDate,
    endDate,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = options;

  const skip = (page - 1) * limit;

  // Build query
  const query = {};

  // Date range filter
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) {
      query.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      query.createdAt.$lte = new Date(endDate);
    }
  }

  // Search by title
  if (search) {
    query.title = { $regex: search, $options: "i" };
  }

  // Sort logic
  const sort = {};
  sort[sortBy] = sortOrder === "desc" ? -1 : 1;

  // Execute query
  const purposes = await Purpose.find(query)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Purpose.countDocuments(query);

  return {
    purposes,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};


exports.getSinglePurpose = async (id) => {
  const purpose = await Purpose.findById(id).lean();
  return purpose;
};

exports.updatePurpose = async (id, payload) => {
  const updated = await Purpose.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  }).lean();

  return updated;
};