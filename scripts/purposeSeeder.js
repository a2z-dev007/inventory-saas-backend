// seed/purposeSeeder.js
const mongoose = require("mongoose");
const Purpose = require("../models/PurposeModel");

const purposes = [
  { title: "Site Construction" },
  { title: "Interior Design Project" },
  { title: "Client Presentation Materials" },
  { title: "Office Renovation" },
  { title: "Machinery Maintenance" },
  { title: "Electrical Installation" },
  { title: "Civil Work Execution" },
  { title: "Structural Steel Fabrication" },
  { title: "Road & Drainage Work" },
  { title: "HVAC System Setup" },
  { title: "Plumbing Work" },
  { title: "Furniture Procurement" },
  { title: "Temporary Site Office" },
  { title: "Safety Equipment Purchase" },
  { title: "Survey & Site Analysis" },
  { title: "Consultant Material Request" },
  { title: "Demo & Sample Approval" },
  { title: "Client-Specific Customization" },
  { title: "Repair & Refurbishment" },
  { title: "General Inventory Refill" }
];

const seedPurposes = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/inventory_management");
    await Purpose.deleteMany();
    await Purpose.insertMany(purposes);
    console.log("✅ Purpose data seeded successfully.");
    process.exit();
  } catch (error) {
    console.error("❌ Error seeding purposes:", error);
    process.exit(1);
  }
};

seedPurposes();
